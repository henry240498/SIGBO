import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InspeccionPrevencion, PuntoRiesgo, ResultadoInspeccion } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { RegistrarInspeccionDto } from './dto/prevencion.dto';

export interface ContextoPrevencion {
  usuarioId: string;
  ip?: string | null;
  userAgent?: string | null;
}

const soloFecha = (v: unknown) => String(v).slice(0, 10);
const hoyLocal = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dias = (hasta: string, desde: string) => Math.round((Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / 86_400_000);

/** Clave para saber si dos inspecciones son del mismo establecimiento. */
const claveDe = (i: Pick<InspeccionPrevencion, 'puntoRiesgoId' | 'establecimiento'>) =>
  i.puntoRiesgoId ?? `nombre:${i.establecimiento.trim().toLowerCase()}`;

@Injectable()
export class PrevencionService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
  ) {}

  async registrar(dto: RegistrarInspeccionDto, ctx: ContextoPrevencion, hoy = hoyLocal()) {
    const fecha = soloFecha(dto.fecha);
    if (fecha > hoy) throw new BadRequestException('La fecha de la inspeccion no puede ser futura.');

    const tieneCertificado = !!dto.certificadoNumero || !!dto.certificadoVence;
    if (dto.resultado === 'APROBADO') {
      if (!dto.certificadoNumero || !dto.certificadoVence) {
        throw new BadRequestException('Una inspeccion APROBADA exige numero y vencimiento del certificado.');
      }
      if (soloFecha(dto.certificadoVence) <= fecha) throw new BadRequestException('El certificado debe vencer despues de la inspeccion.');
    } else if (tieneCertificado) {
      throw new BadRequestException('Solo una inspeccion APROBADA puede llevar certificado.');
    }

    if (dto.puntoRiesgoId) {
      const p = await this.dataSource.getRepository(PuntoRiesgo).findOne({ where: { id: dto.puntoRiesgoId } });
      if (!p) throw new NotFoundException('Punto de riesgo no encontrado');
    }
    const repo = this.dataSource.getRepository(InspeccionPrevencion);
    if (dto.certificadoNumero && (await repo.findOne({ where: { certificadoNumero: dto.certificadoNumero } }))) {
      throw new ConflictException(`El certificado ${dto.certificadoNumero} ya fue emitido.`);
    }

    const i = await repo.save(
      repo.create({
        puntoRiesgoId: dto.puntoRiesgoId ?? null,
        establecimiento: dto.establecimiento,
        direccion: dto.direccion,
        fecha,
        inspectorId: ctx.usuarioId,
        resultado: dto.resultado,
        observaciones: dto.observaciones ?? null,
        certificadoNumero: dto.certificadoNumero ?? null,
        certificadoVence: dto.certificadoVence ? soloFecha(dto.certificadoVence) : null,
      }),
    );
    await this.auditoria.registrar({
      usuarioId: ctx.usuarioId,
      accion: 'REGISTRAR_INSPECCION',
      recurso: 'servicios.inspeccion_prevencion',
      recursoId: i.id,
      datosDespues: { establecimiento: i.establecimiento, resultado: i.resultado, certificadoNumero: i.certificadoNumero },
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    });
    return i;
  }

  async listar(filtros: { resultado?: ResultadoInspeccion; limite?: number }) {
    return this.dataSource.getRepository(InspeccionPrevencion).find({
      where: filtros.resultado ? { resultado: filtros.resultado } : {},
      order: { fecha: 'DESC' },
      take: Math.min(Math.max(filtros.limite || 100, 1), 500),
    });
  }

  /**
   * Estado actual de cada establecimiento segun su ULTIMA inspeccion:
   * certificado vigente / por vencer / vencido, o pendiente de regularizar si la
   * ultima inspeccion no fue aprobada.
   */
  async estadoActual(diasAviso: number, hoy = hoyLocal()) {
    const todas = await this.dataSource.getRepository(InspeccionPrevencion).find({ order: { fecha: 'DESC' } });
    const ultimas = new Map<string, InspeccionPrevencion>();
    for (const i of todas) {
      const k = claveDe(i);
      const previa = ultimas.get(k);
      if (!previa || i.fecha > previa.fecha || (i.fecha === previa.fecha && new Date(i.creadoEn) > new Date(previa.creadoEn))) ultimas.set(k, i);
    }
    const filas = [...ultimas.values()].map((i) => {
      if (i.resultado !== 'APROBADO' || !i.certificadoVence) {
        return { establecimiento: i.establecimiento, direccion: i.direccion, estado: 'PENDIENTE' as const, ultimaInspeccion: i.fecha, resultado: i.resultado, certificadoNumero: null, certificadoVence: null, diasRestantes: null };
      }
      const restantes = dias(soloFecha(i.certificadoVence), hoy);
      const estado = restantes < 0 ? ('VENCIDO' as const) : restantes <= diasAviso ? ('POR_VENCER' as const) : ('VIGENTE' as const);
      return { establecimiento: i.establecimiento, direccion: i.direccion, estado, ultimaInspeccion: i.fecha, resultado: i.resultado, certificadoNumero: i.certificadoNumero, certificadoVence: soloFecha(i.certificadoVence), diasRestantes: restantes };
    });
    const orden = { VENCIDO: 0, PENDIENTE: 1, POR_VENCER: 2, VIGENTE: 3 } as const;
    return filas.sort((a, b) => orden[a.estado] - orden[b.estado] || a.establecimiento.localeCompare(b.establecimiento));
  }
}
