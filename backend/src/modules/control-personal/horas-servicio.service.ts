import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Between, DataSource } from 'typeorm';
import { AsignacionGuardia, Bombero, Guardia, LimiteHorasServicio } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { FijarLimitesHorasDto } from './dto/control-personal.dto';
import { LimitesHoras, ResumenHoras, Tramo, resumirHoras, tramoDeAsignacion } from './horas.util';
import { ContextoPersonal } from './vencimientos.service';

const ESTADOS_GUARDIA_QUE_NO_CUENTAN = ['CANCELADA', 'ANULADA'];
const ASIGNACIONES_QUE_NO_CUENTAN = ['REEMPLAZADO', 'AUSENTE'];
const MAX_RANGO_DIAS = 366;

@Injectable()
export class HorasServicioService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
  ) {}

  async limitesActivos(): Promise<LimiteHorasServicio | null> {
    return (await this.dataSource.getRepository(LimiteHorasServicio).findOne({ where: { activo: true } })) ?? null;
  }

  /** Reemplaza los limites vigentes: el anterior queda inactivo (historial), no se pisa. */
  async fijarLimites(dto: FijarLimitesHorasDto, ctx: ContextoPersonal) {
    const repo = this.dataSource.getRepository(LimiteHorasServicio);
    const anterior = await this.limitesActivos();
    if (anterior) {
      anterior.activo = false;
      await repo.save(anterior);
    }
    const nuevo = await repo.save(
      repo.create({
        horasMaximasPeriodo: dto.horasMaximasPeriodo,
        periodoDias: dto.periodoDias,
        descansoMinimoHoras: dto.descansoMinimoHoras,
        activo: true,
        creadoPor: ctx.usuarioId,
      }),
    );
    await this.auditoria.registrar({
      usuarioId: ctx.usuarioId,
      accion: 'FIJAR_LIMITES',
      recurso: 'operaciones.limites_horas_servicio',
      recursoId: nuevo.id,
      datosAntes: anterior
        ? { horasMaximasPeriodo: anterior.horasMaximasPeriodo, periodoDias: anterior.periodoDias, descansoMinimoHoras: anterior.descansoMinimoHoras }
        : undefined,
      datosDespues: { ...dto },
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    });
    return nuevo;
  }

  /** Horas de servicio por bombero entre dos fechas (AAAA-MM-DD), evaluadas contra los limites vigentes. */
  async resumen(desde: string, hasta: string, bomberoId?: string) {
    const d = Date.parse(`${desde}T00:00:00Z`);
    const h = Date.parse(`${hasta}T00:00:00Z`);
    if (!Number.isFinite(d) || !Number.isFinite(h) || h < d) throw new BadRequestException('Rango de fechas invalido.');
    if ((h - d) / 86_400_000 > MAX_RANGO_DIAS) throw new BadRequestException(`El rango no puede superar ${MAX_RANGO_DIAS} dias.`);

    const limites = await this.limitesActivos();
    const guardias = (await this.dataSource.getRepository(Guardia).find({ where: { fecha: Between(desde, hasta) } })).filter(
      (g) => !ESTADOS_GUARDIA_QUE_NO_CUENTAN.includes(g.estado),
    );

    const porBombero = new Map<string, Tramo[]>();
    const asignaciones = this.dataSource.getRepository(AsignacionGuardia);
    for (const g of guardias) {
      const filas = (await asignaciones.find({ where: { guardiaId: g.id } })).filter(
        (a) => !ASIGNACIONES_QUE_NO_CUENTAN.includes(a.estado) && (!bomberoId || a.bomberoId === bomberoId),
      );
      for (const a of filas) {
        const lista = porBombero.get(a.bomberoId) ?? [];
        lista.push(tramoDeAsignacion(g, a));
        porBombero.set(a.bomberoId, lista);
      }
    }

    const limitesCalculo: LimitesHoras | null = limites
      ? { horasMaximasPeriodo: limites.horasMaximasPeriodo, periodoDias: limites.periodoDias, descansoMinimoHoras: limites.descansoMinimoHoras }
      : null;

    const bomberos = this.dataSource.getRepository(Bombero);
    const filas: Array<ResumenHoras & { nombre: string }> = [];
    for (const [id, tramos] of porBombero) {
      const b = await bomberos.findOne({ where: { id } });
      filas.push({ ...resumirHoras(id, tramos, limitesCalculo), nombre: b ? `${b.apellido}, ${b.nombre}` : 'Sin ficha' });
    }
    filas.sort((a, b) => b.totalHoras - a.totalHoras || a.nombre.localeCompare(b.nombre));

    return {
      desde,
      hasta,
      limites: limites
        ? { horasMaximasPeriodo: limites.horasMaximasPeriodo, periodoDias: limites.periodoDias, descansoMinimoHoras: limites.descansoMinimoHoras }
        : null,
      conAlertas: filas.filter((f) => f.excedeLimite || f.violacionesDescanso.length > 0).length,
      bomberos: filas,
    };
  }
}
