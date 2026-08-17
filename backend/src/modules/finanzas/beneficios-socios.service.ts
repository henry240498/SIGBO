import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmbitoBeneficioSocio, AplicacionBeneficio, BeneficioSocio, Parametro, SocioProtector } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateBeneficioSocioDto, UpdateBeneficioSocioDto } from './dto/beneficio-socio.dto';

/** Descuentos para Socios Protectores (seccion 11 del pedido). Aplica
 * a todo socio con estado activo -- no hay asignacion 1 a 1
 * socio<->beneficio. El calculo NUNCA modifica el precio base de la
 * actividad/servicio relacionado; cada aplicacion queda auditada en
 * AplicacionBeneficio (secciones 12-13). */
@Injectable()
export class BeneficiosSociosService {
  constructor(
    @InjectRepository(BeneficioSocio) private readonly repo: Repository<BeneficioSocio>,
    @InjectRepository(AplicacionBeneficio) private readonly aplicacionRepo: Repository<AplicacionBeneficio>,
    @InjectRepository(SocioProtector) private readonly socioRepo: Repository<SocioProtector>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(filtros: { estado?: string; ambito?: string }) {
    const qb = this.repo.createQueryBuilder('b').orderBy('b.nombre', 'ASC');
    if (filtros.estado) qb.andWhere('b.estado = :estado', { estado: filtros.estado });
    if (filtros.ambito) qb.andWhere('b.ambito = :ambito', { ambito: filtros.ambito });
    return qb.getMany();
  }

  async findOne(id: string) {
    const beneficio = await this.repo.findOne({ where: { id } });
    if (!beneficio) throw new NotFoundException(`Beneficio ${id} no encontrado`);
    return beneficio;
  }

  async create(dto: CreateBeneficioSocioDto, actorId: string, ip?: string) {
    if (!dto.porcentajeDescuento && !dto.montoFijoDescuento) {
      throw new BadRequestException('Debe indicarse un porcentaje o un monto fijo de descuento');
    }

    const beneficio = await this.repo.save(
      this.repo.create({
        nombre: dto.nombre,
        tipoId: dto.tipoId,
        porcentajeDescuento: dto.porcentajeDescuento ?? null,
        montoFijoDescuento: dto.montoFijoDescuento ?? null,
        ambito: dto.ambito as AmbitoBeneficioSocio,
        actividadAcademicaId: dto.actividadAcademicaId ?? null,
        tipoServicioId: dto.tipoServicioId ?? null,
        fechaInicio: dto.fechaInicio,
        fechaFin: dto.fechaFin ?? null,
        condiciones: dto.condiciones ?? null,
        observaciones: dto.observaciones ?? null,
        creadoPor: actorId,
      }),
    );

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'finanzas.beneficios_socios',
      recursoId: beneficio.id,
      datosDespues: beneficio,
      ip: ip ?? null,
    });
    return beneficio;
  }

  async update(id: string, dto: UpdateBeneficioSocioDto, actorId: string, ip?: string) {
    const anterior = await this.findOne(id);

    await this.repo.update(id, {
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.tipoId !== undefined ? { tipoId: dto.tipoId } : {}),
      ...(dto.porcentajeDescuento !== undefined ? { porcentajeDescuento: dto.porcentajeDescuento } : {}),
      ...(dto.montoFijoDescuento !== undefined ? { montoFijoDescuento: dto.montoFijoDescuento } : {}),
      ...(dto.ambito ? { ambito: dto.ambito as AmbitoBeneficioSocio } : {}),
      ...(dto.actividadAcademicaId !== undefined ? { actividadAcademicaId: dto.actividadAcademicaId } : {}),
      ...(dto.tipoServicioId !== undefined ? { tipoServicioId: dto.tipoServicioId } : {}),
      ...(dto.fechaInicio !== undefined ? { fechaInicio: dto.fechaInicio } : {}),
      ...(dto.fechaFin !== undefined ? { fechaFin: dto.fechaFin } : {}),
      ...(dto.condiciones !== undefined ? { condiciones: dto.condiciones } : {}),
      ...(dto.observaciones !== undefined ? { observaciones: dto.observaciones } : {}),
      ...(dto.estado ? { estado: dto.estado as any } : {}),
      actualizadoPor: actorId,
    });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'EDITAR',
      recurso: 'finanzas.beneficios_socios',
      recursoId: id,
      datosAntes: anterior,
      ip: ip ?? null,
    });
    return this.findOne(id);
  }

  private calcular(beneficio: BeneficioSocio, montoBase: number) {
    const porPorcentaje = beneficio.porcentajeDescuento ? (montoBase * beneficio.porcentajeDescuento) / 100 : 0;
    const porMontoFijo = beneficio.montoFijoDescuento ?? 0;
    const descuento = Math.min(Math.max(porPorcentaje, porMontoFijo), montoBase);
    return { descuentoAplicado: descuento, montoFinal: montoBase - descuento };
  }

  /** Busca el beneficio activo mas especifico para un socio+ambito (y,
   * si aplica, una actividad puntual). Prioriza el beneficio ligado a
   * la actividad exacta sobre uno general del mismo ambito. Devuelve
   * null si el socio no esta activo o no hay beneficio aplicable --
   * nunca asume que corresponde un descuento (seccion 13 del pedido). */
  async buscarAplicable(socioProtectorId: string, ambito: AmbitoBeneficioSocio, referenciaEspecificaId?: string | null): Promise<BeneficioSocio | null> {
    const socio = await this.socioRepo.findOne({ where: { id: socioProtectorId } });
    if (!socio) return null;
    const estadoSocio = await this.parametroRepo.findOne({ where: { id: socio.estadoId } });
    if (!estadoSocio || estadoSocio.nombreNormalizado !== 'activo') return null;

    const hoy = new Date().toISOString().slice(0, 10);
    const qb = this.repo
      .createQueryBuilder('b')
      .where('b.estado = :estado', { estado: 'ACTIVO' })
      .andWhere('(b.ambito = :ambito OR b.ambito = :general)', { ambito, general: 'GENERAL' })
      .andWhere('b.fechaInicio <= :hoy', { hoy })
      .andWhere('(b.fechaFin IS NULL OR b.fechaFin >= :hoy)', { hoy });

    const candidatos = await qb.getMany();
    if (candidatos.length === 0) return null;

    const especifico = referenciaEspecificaId
      ? candidatos.find((b) => b.ambito === ambito && b.actividadAcademicaId === referenciaEspecificaId)
      : undefined;
    if (especifico) return especifico;

    const delAmbitoSinReferencia = candidatos.find((b) => b.ambito === ambito && !b.actividadAcademicaId);
    if (delAmbitoSinReferencia) return delAmbitoSinReferencia;

    return candidatos.find((b) => b.ambito === 'GENERAL') ?? null;
  }

  /** Calcula y registra la aplicacion de un beneficio ya identificado --
   * usado por la integracion con Academia y por el endpoint manual de
   * calculo/aplicacion. */
  async aplicar(beneficio: BeneficioSocio, socioProtectorId: string, referenciaId: string | null, montoBase: number, actorId: string | null) {
    const { descuentoAplicado, montoFinal } = this.calcular(beneficio, montoBase);

    const aplicacion = await this.aplicacionRepo.save(
      this.aplicacionRepo.create({
        beneficioId: beneficio.id,
        socioProtectorId,
        ambito: beneficio.ambito,
        referenciaId: referenciaId ?? null,
        montoBase,
        descuentoAplicado,
        montoFinal,
        aplicadoEn: new Date(),
        aplicadoPor: actorId,
      }),
    );

    if (actorId) {
      await this.auditoriaService.registrar({
        usuarioId: actorId,
        accion: 'APLICAR_BENEFICIO',
        recurso: 'finanzas.aplicaciones_beneficio',
        recursoId: aplicacion.id,
        datosDespues: aplicacion,
      });
    }

    return aplicacion;
  }

  /** Simulacion pura sin registrar nada -- para mostrar el descuento en
   * el frontend antes de confirmar una inscripcion/compra. */
  async simular(socioProtectorId: string, ambito: AmbitoBeneficioSocio, montoBase: number, referenciaId?: string) {
    const beneficio = await this.buscarAplicable(socioProtectorId, ambito, referenciaId);
    if (!beneficio) return { beneficio: null, descuentoAplicado: 0, montoFinal: montoBase };
    const { descuentoAplicado, montoFinal } = this.calcular(beneficio, montoBase);
    return { beneficio, descuentoAplicado, montoFinal };
  }

  aplicacionesDe(socioProtectorId: string) {
    return this.aplicacionRepo.find({ where: { socioProtectorId }, order: { aplicadoEn: 'DESC' } });
  }
}
