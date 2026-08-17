import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcuerdoAporte, SocioProtector } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateAcuerdoAporteDto, UpdateAcuerdoAporteDto } from './dto/acuerdo-aporte.dto';

/** Lo que un Socio Protector SE COMPROMETIO a aportar (seccion 4 del
 * pedido). Distinto y desacoplado de finanzas.Aporte: cambiar un
 * acuerdo nunca reescribe los pagos ya registrados contra el. */
@Injectable()
export class AcuerdosAporteService {
  constructor(
    @InjectRepository(AcuerdoAporte) private readonly repo: Repository<AcuerdoAporte>,
    @InjectRepository(SocioProtector) private readonly socioRepo: Repository<SocioProtector>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(filtros: { socioProtectorId?: string; estado?: string }) {
    const qb = this.repo.createQueryBuilder('a').orderBy('a.fechaInicio', 'DESC');
    if (filtros.socioProtectorId) qb.andWhere('a.socioProtectorId = :socioProtectorId', { socioProtectorId: filtros.socioProtectorId });
    if (filtros.estado) qb.andWhere('a.estado = :estado', { estado: filtros.estado });
    return qb.getMany();
  }

  async findOne(id: string) {
    const acuerdo = await this.repo.findOne({ where: { id } });
    if (!acuerdo) throw new NotFoundException(`Acuerdo de aporte ${id} no encontrado`);
    return acuerdo;
  }

  async create(dto: CreateAcuerdoAporteDto, actorId: string, ip?: string) {
    const socio = await this.socioRepo.findOne({ where: { id: dto.socioProtectorId } });
    if (!socio) throw new NotFoundException(`Socio Protector ${dto.socioProtectorId} no encontrado`);

    const acuerdo = await this.repo.save(
      this.repo.create({
        socioProtectorId: dto.socioProtectorId,
        montoAcordado: dto.montoAcordado,
        moneda: dto.moneda ?? 'PYG',
        periodicidadId: dto.periodicidadId,
        fechaInicio: dto.fechaInicio,
        fechaFin: dto.fechaFin ?? null,
        medioPagoPreferidoId: dto.medioPagoPreferidoId ?? null,
        observaciones: dto.observaciones ?? null,
        creadoPor: actorId,
      }),
    );

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'finanzas.acuerdos_aporte',
      recursoId: acuerdo.id,
      datosDespues: acuerdo,
      ip: ip ?? null,
    });
    return acuerdo;
  }

  async update(id: string, dto: UpdateAcuerdoAporteDto, actorId: string, ip?: string) {
    const anterior = await this.findOne(id);

    await this.repo.update(id, {
      ...(dto.montoAcordado !== undefined ? { montoAcordado: dto.montoAcordado } : {}),
      ...(dto.moneda !== undefined ? { moneda: dto.moneda } : {}),
      ...(dto.periodicidadId !== undefined ? { periodicidadId: dto.periodicidadId } : {}),
      ...(dto.fechaInicio !== undefined ? { fechaInicio: dto.fechaInicio } : {}),
      ...(dto.fechaFin !== undefined ? { fechaFin: dto.fechaFin } : {}),
      ...(dto.medioPagoPreferidoId !== undefined ? { medioPagoPreferidoId: dto.medioPagoPreferidoId } : {}),
      ...(dto.observaciones !== undefined ? { observaciones: dto.observaciones } : {}),
      ...(dto.estado ? { estado: dto.estado as any } : {}),
      actualizadoPor: actorId,
    });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'EDITAR',
      recurso: 'finanzas.acuerdos_aporte',
      recursoId: id,
      datosAntes: anterior,
      ip: ip ?? null,
    });
    return this.findOne(id);
  }
}
