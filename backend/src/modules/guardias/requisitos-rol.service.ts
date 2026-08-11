import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequisitoRolGuardia } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateRequisitoRolDto } from './dto/create-requisito-rol.dto';

@Injectable()
export class RequisitosRolService {
  constructor(
    @InjectRepository(RequisitoRolGuardia) private readonly repo: Repository<RequisitoRolGuardia>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(rol?: string) {
    return this.repo.find({ where: rol ? { rol } : undefined, order: { rol: 'ASC' } });
  }

  async create(dto: CreateRequisitoRolDto, actorId: string, ip?: string) {
    const requisito = await this.repo.save(
      this.repo.create({
        rol: dto.rol,
        cargoIdRequerido: dto.cargoIdRequerido ?? null,
        rangoIdRequerido: dto.rangoIdRequerido ?? null,
        tipoBomberoIdRequerido: dto.tipoBomberoIdRequerido ?? null,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'operaciones.requisitos_rol_guardia',
      recursoId: requisito.id,
      datosDespues: requisito,
      ip: ip ?? null,
    });
    return requisito;
  }

  async toggleActivo(id: string, activo: boolean, actorId: string, ip?: string) {
    const requisito = await this.repo.findOne({ where: { id } });
    if (!requisito) throw new NotFoundException(`Requisito ${id} no encontrado`);
    await this.repo.update(id, { activo });
    const actualizado = await this.repo.findOne({ where: { id } });
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'EDITAR',
      recurso: 'operaciones.requisitos_rol_guardia',
      recursoId: id,
      datosAntes: requisito,
      datosDespues: actualizado,
      ip: ip ?? null,
    });
    return actualizado;
  }

  async remove(id: string, actorId: string, ip?: string) {
    const requisito = await this.repo.findOne({ where: { id } });
    if (!requisito) throw new NotFoundException(`Requisito ${id} no encontrado`);
    await this.repo.remove(requisito);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ELIMINAR',
      recurso: 'operaciones.requisitos_rol_guardia',
      recursoId: id,
      datosAntes: requisito,
      ip: ip ?? null,
    });
    return { eliminado: true };
  }
}
