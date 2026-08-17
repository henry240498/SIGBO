import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcuerdoAporte, Aporte, Parametro, SocioProtector } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { MovimientosFinancierosService } from './movimientos-financieros.service';
import { AnularAporteDto, RegistrarAporteDto } from './dto/aporte.dto';

/** Lo que un Socio Protector EFECTIVAMENTE pago (seccion 5 del
 * pedido: "el monto acordado NO es el monto real"). Cada aporte
 * registra un ingreso real en finanzas.movimientos_financieros --
 * nunca se crea un ledger paralelo. */
@Injectable()
export class AportesService {
  constructor(
    @InjectRepository(Aporte) private readonly repo: Repository<Aporte>,
    @InjectRepository(SocioProtector) private readonly socioRepo: Repository<SocioProtector>,
    @InjectRepository(AcuerdoAporte) private readonly acuerdoRepo: Repository<AcuerdoAporte>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
    private readonly movimientosService: MovimientosFinancierosService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(filtros: { socioProtectorId?: string; acuerdoAporteId?: string; esExtraordinario?: boolean; estado?: string; desde?: string; hasta?: string }) {
    const qb = this.repo.createQueryBuilder('a').orderBy('a.fecha', 'DESC').addOrderBy('a.creadoEn', 'DESC');
    if (filtros.socioProtectorId) qb.andWhere('a.socioProtectorId = :socioProtectorId', { socioProtectorId: filtros.socioProtectorId });
    if (filtros.acuerdoAporteId) qb.andWhere('a.acuerdoAporteId = :acuerdoAporteId', { acuerdoAporteId: filtros.acuerdoAporteId });
    if (filtros.esExtraordinario !== undefined) qb.andWhere('a.esExtraordinario = :esExtraordinario', { esExtraordinario: filtros.esExtraordinario });
    if (filtros.estado) qb.andWhere('a.estado = :estado', { estado: filtros.estado });
    if (filtros.desde) qb.andWhere('a.fecha >= :desde', { desde: filtros.desde });
    if (filtros.hasta) qb.andWhere('a.fecha <= :hasta', { hasta: filtros.hasta });
    return qb.getMany();
  }

  async findOne(id: string) {
    const aporte = await this.repo.findOne({ where: { id } });
    if (!aporte) throw new NotFoundException(`Aporte ${id} no encontrado`);
    return aporte;
  }

  async registrar(dto: RegistrarAporteDto, actorId: string, ip?: string) {
    const socio = await this.socioRepo.findOne({ where: { id: dto.socioProtectorId } });
    if (!socio) throw new NotFoundException(`Socio Protector ${dto.socioProtectorId} no encontrado`);

    let acuerdo: AcuerdoAporte | null = null;
    if (dto.acuerdoAporteId) {
      acuerdo = await this.acuerdoRepo.findOne({ where: { id: dto.acuerdoAporteId } });
      if (!acuerdo) throw new NotFoundException(`Acuerdo de aporte ${dto.acuerdoAporteId} no encontrado`);
      if (acuerdo.socioProtectorId !== dto.socioProtectorId) {
        throw new BadRequestException('El acuerdo de aporte indicado no pertenece a este Socio Protector');
      }
    }

    const tipoIngresoAportes = await this.parametroRepo.findOne({ where: { tipo: 'TIPO_INGRESO_FINANZAS', nombreNormalizado: 'aportes' } });
    if (!tipoIngresoAportes) throw new NotFoundException("Parametro 'Aportes' (tipo TIPO_INGRESO_FINANZAS) no encontrado");

    const nombreSocio = socio.tipoPersona === 'JURIDICA' ? socio.razonSocial : `${socio.nombre ?? ''} ${socio.apellido ?? ''}`.trim();
    const etiquetaPeriodo = dto.esExtraordinario ? 'extraordinario' : dto.periodoCorrespondiente ?? 'sin periodo';
    const concepto = dto.concepto?.trim() || `Aporte de ${nombreSocio || socio.codigo} (${etiquetaPeriodo})`;

    const aporte = await this.repo.save(
      this.repo.create({
        socioProtectorId: dto.socioProtectorId,
        acuerdoAporteId: dto.acuerdoAporteId ?? null,
        esExtraordinario: dto.esExtraordinario ?? false,
        fecha: dto.fecha,
        hora: dto.hora ?? null,
        monto: dto.monto,
        moneda: dto.moneda ?? 'PYG',
        periodoCorrespondiente: dto.periodoCorrespondiente ?? null,
        concepto,
        medioPagoId: dto.medioPagoId ?? null,
        numeroComprobante: dto.numeroComprobante ?? null,
        cajaId: dto.cajaId ?? null,
        cuentaBancariaId: dto.cuentaBancariaId ?? null,
        archivoUrl: dto.archivoUrl ?? null,
        observaciones: dto.observaciones ?? null,
        creadoPor: actorId,
      }),
    );

    const movimiento = await this.movimientosService.registrar(
      {
        tipo: 'INGRESO',
        fecha: dto.fecha,
        tipoIngresoId: tipoIngresoAportes.id,
        concepto,
        importe: dto.monto,
        cajaId: dto.cajaId,
        cuentaBancariaId: dto.cuentaBancariaId,
        socioProtectorId: dto.socioProtectorId,
        aporteId: aporte.id,
        observacion: `Aporte de Socio Protector ${socio.codigo}${dto.periodoCorrespondiente ? ` -- periodo ${dto.periodoCorrespondiente}` : ''}`,
      },
      actorId,
      ip,
    );

    await this.repo.update(aporte.id, { movimientoFinancieroId: movimiento.id });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'REGISTRAR',
      recurso: 'finanzas.aportes',
      recursoId: aporte.id,
      datosDespues: { ...aporte, movimientoFinancieroId: movimiento.id },
      ip: ip ?? null,
    });

    return this.findOne(aporte.id);
  }

  async anular(id: string, dto: AnularAporteDto, actorId: string, ip?: string) {
    const aporte = await this.findOne(id);
    if (aporte.estado === 'ANULADO') throw new BadRequestException('Este aporte ya esta anulado');

    const motivo = await this.parametroRepo.findOne({ where: { id: dto.motivoAnulacionId } });
    if (!motivo) throw new NotFoundException(`Motivo de anulacion ${dto.motivoAnulacionId} no encontrado`);

    if (aporte.movimientoFinancieroId) {
      await this.movimientosService.anular(
        aporte.movimientoFinancieroId,
        { motivoAnulacionId: dto.motivoAnulacionId, motivoAnulacionDetalle: dto.motivoAnulacionDetalle },
        actorId,
        ip,
      );
    }

    await this.repo.update(id, {
      estado: 'ANULADO',
      anuladoPor: actorId,
      fechaAnulacion: new Date(),
      motivoAnulacion: dto.motivoAnulacionDetalle ? `${motivo.nombre}: ${dto.motivoAnulacionDetalle}` : motivo.nombre,
    });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ANULAR',
      recurso: 'finanzas.aportes',
      recursoId: id,
      datosAntes: aporte,
      datosDespues: { estado: 'ANULADO', motivo: motivo.nombre },
      ip: ip ?? null,
    });

    return this.findOne(id);
  }
}
