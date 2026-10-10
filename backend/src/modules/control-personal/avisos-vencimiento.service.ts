import { ConflictException, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AvisoVencimiento } from '../../shared/entities';
import { TelegramService } from '../notificaciones/telegram.service';
import { Vencimiento, VencimientosService } from './vencimientos.service';

/** Dias antes del vencimiento en que se avisa (y -1 = ya vencido). */
export const UMBRALES_AVISO = [30, 15, 7, 3, 0] as const;
const INTERVALO_MS = 6 * 3_600_000;
const MAX_LINEAS = 40;

/** Primer umbral que ya se alcanzo: 20 dias restantes -> 30; 5 -> 7; 0 -> 0; vencido -> -1. */
export function umbralDe(diasRestantes: number): number {
  if (diasRestantes < 0) return -1;
  return [...UMBRALES_AVISO].reverse().find((u) => diasRestantes <= u) ?? UMBRALES_AVISO[0];
}

export const claveDeAviso = (v: Vencimiento, umbral: number) => `${v.origen}|${v.bomberoId}|${v.descripcion}|${v.fecha}|${umbral}`.slice(0, 200);

/** Texto del aviso: nombres, que vence y cuando. Nunca incluye datos medicos (se excluyen antes). */
export function redactarAviso(items: Vencimiento[]): string {
  const orden = [...items].sort((a, b) => a.diasRestantes - b.diasRestantes);
  const lineas = orden.slice(0, MAX_LINEAS).map((v) => {
    const cuando = v.diasRestantes < 0 ? `VENCIO hace ${-v.diasRestantes} d` : v.diasRestantes === 0 ? 'VENCE HOY' : `vence en ${v.diasRestantes} d`;
    return `- ${v.bombero}: ${v.descripcion} (${cuando}, ${v.fecha})`;
  });
  const resto = orden.length > MAX_LINEAS ? `\n... y ${orden.length - MAX_LINEAS} mas (ver Control del personal).` : '';
  return `VENCIMIENTOS DEL PERSONAL\n${lineas.join('\n')}${resto}`;
}

/**
 * Aviso por Telegram de lo que esta por vencer (opt-in: sin Telegram configurado no hace nada).
 * Cada vencimiento se avisa una vez por umbral (30, 15, 7, 3 dias, el dia, y una vez vencido).
 * Si el envio falla no se anota nada, asi que se reintenta en la proxima pasada.
 */
@Injectable()
export class AvisosVencimientoService implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger('AvisosVencimiento');
  private temporizador: NodeJS.Timeout | null = null;
  private inicial: NodeJS.Timeout | null = null;
  private ocupado = false;
  private ultima: { en: Date; enviados: number; motivo: string | null; error: string | null } | null = null;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly vencimientos: VencimientosService,
    private readonly telegram: TelegramService,
  ) {}

  onModuleInit() {
    if (process.env.AVISOS_VENCIMIENTO === 'off' || process.env.NODE_ENV === 'test') return;
    this.inicial = setTimeout(() => void this.ejecutarSeguro(), 60_000);
    this.temporizador = setInterval(() => void this.ejecutarSeguro(), INTERVALO_MS);
    this.inicial.unref();
    this.temporizador.unref();
  }

  onModuleDestroy() {
    if (this.inicial) clearTimeout(this.inicial);
    if (this.temporizador) clearInterval(this.temporizador);
  }

  private async ejecutarSeguro() {
    if (this.ocupado) return;
    this.ocupado = true;
    try {
      const r = await this.ejecutar();
      this.ultima = { en: new Date(), enviados: r.enviados, motivo: r.motivo ?? null, error: null };
      if (r.enviados > 0) this.log.log(`Aviso de vencimientos enviado (${r.enviados}).`);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'error';
      this.ultima = { en: new Date(), enviados: 0, motivo: null, error: mensaje };
      this.log.warn(`No se pudo revisar los vencimientos: ${mensaje}`);
    } finally {
      this.ocupado = false;
    }
  }

  /** Lo que muestra Sistema › Tareas. */
  estado() {
    return {
      programado: this.temporizador !== null,
      intervaloHoras: INTERVALO_MS / 3_600_000,
      ocupado: this.ocupado,
      telegramConfigurado: this.telegram.habilitado(),
      ultimaEjecucion: this.ultima?.en ?? null,
      ultimosEnviados: this.ultima?.enviados ?? null,
      ultimoMotivo: this.ultima?.motivo ?? null,
      ultimoError: this.ultima?.error ?? null,
    };
  }

  /** "Ejecutar ahora" desde Sistema › Tareas. */
  async ejecutarAhora(): Promise<{ enviados: number; motivo?: string }> {
    if (this.ocupado) throw new ConflictException('La revisión de vencimientos ya está corriendo.');
    this.ocupado = true;
    try {
      const r = await this.ejecutar();
      this.ultima = { en: new Date(), enviados: r.enviados, motivo: r.motivo ?? null, error: null };
      return r;
    } catch (error) {
      this.ultima = { en: new Date(), enviados: 0, motivo: null, error: error instanceof Error ? error.message : 'error' };
      throw error;
    } finally {
      this.ocupado = false;
    }
  }

  async ejecutar(ahora: Date = new Date()): Promise<{ enviados: number; motivo?: string }> {
    if (!this.telegram.habilitado()) return { enviados: 0, motivo: 'Telegram no configurado' };
    // Lo medico NO sale por un canal externo.
    const todos = await this.vencimientos.vencimientos(UMBRALES_AVISO[0], { incluirMedicas: false, hoy: ahora });
    if (todos.length === 0) return { enviados: 0 };

    const repo = this.dataSource.getRepository(AvisoVencimiento);
    const nuevos: Array<{ v: Vencimiento; clave: string }> = [];
    for (const v of todos) {
      const clave = claveDeAviso(v, umbralDe(v.diasRestantes));
      if (!(await repo.findOne({ where: { clave } }))) nuevos.push({ v, clave });
    }
    if (nuevos.length === 0) return { enviados: 0 };

    const enviado = await this.telegram.enviar(redactarAviso(nuevos.map((n) => n.v)));
    if (!enviado) return { enviados: 0, motivo: 'Telegram no acepto el mensaje; se reintenta' };
    for (const n of nuevos) await repo.save(repo.create({ clave: n.clave, avisadoEn: ahora }));
    return { enviados: nuevos.length };
  }
}
