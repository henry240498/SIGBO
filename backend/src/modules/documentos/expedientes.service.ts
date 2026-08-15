import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento, Expediente } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateExpedienteDto, UpdateExpedienteDto } from './dto/expediente.dto';

/** Agrupador de documentos ordenados cronologicamente (seccion 23). */
@Injectable()
export class ExpedientesService {
  constructor(
    @InjectRepository(Expediente) private readonly repo: Repository<Expediente>,
    @InjectRepository(Documento) private readonly documentoRepo: Repository<Documento>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(estado?: string) {
    const qb = this.repo.createQueryBuilder('e').orderBy('e.creadoEn', 'DESC');
    if (estado) qb.andWhere('e.estado = :estado', { estado });
    return qb.getMany();
  }

  async findOne(id: string) {
    const expediente = await this.repo.findOne({ where: { id } });
    if (!expediente) throw new NotFoundException(`Expediente ${id} no encontrado`);
    return expediente;
  }

  documentos(expedienteId: string) {
    return this.documentoRepo.find({ where: { expedienteId }, order: { ordenEnExpediente: 'ASC', creadoEn: 'ASC' } });
  }

  async create(dto: CreateExpedienteDto, actorId: string, ip?: string) {
    const existente = await this.repo.findOne({ where: { numero: dto.numero } });
    if (existente) throw new ConflictException(`Ya existe un expediente con el numero ${dto.numero}`);

    const expediente = await this.repo.save(this.repo.create({ numero: dto.numero, titulo: dto.titulo, descripcion: dto.descripcion ?? null, creadoPor: actorId }));
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'documentos.expedientes',
      recursoId: expediente.id,
      datosDespues: expediente,
      ip: ip ?? null,
    });
    return expediente;
  }

  async update(id: string, dto: UpdateExpedienteDto, actorId: string, ip?: string) {
    const antes = await this.findOne(id);
    await this.repo.update(id, {
      ...(dto.titulo !== undefined ? { titulo: dto.titulo } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado as any } : {}),
    });
    const despues = await this.findOne(id);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'EDITAR',
      recurso: 'documentos.expedientes',
      recursoId: id,
      datosAntes: antes,
      datosDespues: despues,
      ip: ip ?? null,
    });
    return despues;
  }
}
