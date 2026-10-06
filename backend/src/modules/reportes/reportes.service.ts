import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { instanteDelHecho } from '../../shared/utils/instante';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CrearReporteDto } from './dto/reporte.dto';

export const MAX_REPORTES_POR_HORA = 30;
const HORA_MS = 3_600_000;

export interface ContextoReporte {
  usuarioId: string;
  username: string;
  ip?: string | null;
  userAgent?: string | null;
}

/** Quita caracteres de control (menos salto de linea y tabulacion) y normaliza los saltos. */
export const limpiarTexto = (valor: unknown, max: number, multilinea: boolean): string => {
  let t = String(valor ?? '')
    .replace(/\r\n?/g, '\n')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
  if (!multilinea) t = t.replace(/\s+/g, ' ');
  return t.trim().slice(0, max);
};

/**
 * Guarda cada reporte como un archivo de texto plano en `backend/storage/reportes`
 * (o en REPORTES_DIR). El nombre lo arma el servidor: nada de lo que escribe la persona
 * llega a la ruta del archivo.
 */
@Injectable()
export class ReportesService {
  private readonly envios = new Map<string, number[]>();

  constructor(private readonly auditoria: AuditoriaService) {}

  carpeta(): string {
    return process.env.REPORTES_DIR || join(process.cwd(), 'storage', 'reportes');
  }

  private limitar(usuarioId: string, ahora: number) {
    const recientes = (this.envios.get(usuarioId) ?? []).filter((t) => ahora - t < HORA_MS);
    if (recientes.length >= MAX_REPORTES_POR_HORA) {
      throw new HttpException(`Se alcanzó el límite de ${MAX_REPORTES_POR_HORA} reportes por hora. Intente más tarde.`, HttpStatus.TOO_MANY_REQUESTS);
    }
    recientes.push(ahora);
    this.envios.set(usuarioId, recientes);
  }

  async crear(dto: CrearReporteDto, ctx: ContextoReporte, ahora: Date = new Date()) {
    const id = dto.id ?? randomUUID();
    await fs.mkdir(this.carpeta(), { recursive: true });

    // un reenvio de la cola sin conexion no debe duplicar el reporte
    if (dto.id) {
      const existente = (await fs.readdir(this.carpeta())).find((n) => n.endsWith(`_${id}.txt`));
      if (existente) return { id, archivo: existente, duplicado: true };
    }
    this.limitar(ctx.usuarioId, ahora.getTime());

    const escrito = instanteDelHecho(dto.ocurridoEn, ahora);
    const marca = escrito.toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 15); // 20261006_093000
    const archivo = `${marca}_${dto.tipo}_${id}.txt`;

    const lineas = [
      'SIGBO - REPORTE',
      `Id: ${id}`,
      `Tipo: ${dto.tipo}`,
      `Origen: ${dto.origen}`,
      `Escrito: ${escrito.toISOString()}`,
      `Recibido: ${ahora.toISOString()}`,
      `Usuario: ${limpiarTexto(ctx.username, 80, false)}`,
      `Pantalla: ${limpiarTexto(dto.pantalla, 120, false) || '-'}`,
      `Version: ${limpiarTexto(dto.version, 40, false) || '-'}`,
      `Dispositivo: ${limpiarTexto(dto.dispositivo, 160, false) || '-'}`,
      `Titulo: ${limpiarTexto(dto.titulo, 120, false) || '-'}`,
      '----------------------------------------',
      limpiarTexto(dto.mensaje, 4000, true),
      '',
    ];
    // 'wx': nunca pisa un archivo existente
    await fs.writeFile(join(this.carpeta(), archivo), lineas.join('\n'), { encoding: 'utf8', flag: 'wx' });

    await this.auditoria.registrar({
      usuarioId: ctx.usuarioId,
      accion: 'REPORTAR',
      recurso: 'sistema.reporte',
      recursoId: id,
      datosDespues: { tipo: dto.tipo, origen: dto.origen, archivo },
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    });
    return { id, archivo, duplicado: false };
  }
}
