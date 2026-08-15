import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProveedorDeposito } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateProveedorDepositoDto, UpdateProveedorDepositoDto } from './dto/proveedor-deposito.dto';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(ProveedorDeposito) private readonly proveedorRepo: Repository<ProveedorDeposito>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(q?: string, estado?: string) {
    const qb = this.proveedorRepo.createQueryBuilder('p').orderBy('p.razonSocial', 'ASC');
    if (q) qb.andWhere('(p.razonSocial LIKE :q OR p.nombreComercial LIKE :q OR p.ruc LIKE :q)', { q: `%${q}%` });
    if (estado) qb.andWhere('p.estado = :estado', { estado });
    return qb.getMany();
  }

  async findOne(id: string) {
    const proveedor = await this.proveedorRepo.findOne({ where: { id } });
    if (!proveedor) throw new NotFoundException(`Proveedor ${id} no encontrado`);
    return proveedor;
  }

  private async verificarRucDuplicado(ruc: string | undefined, idExcluido?: string) {
    if (!ruc) return;
    const existente = await this.proveedorRepo.findOne({ where: { ruc } });
    if (existente && existente.id !== idExcluido) {
      throw new ConflictException(`Ya existe un proveedor registrado con el RUC ${ruc}`);
    }
  }

  async create(dto: CreateProveedorDepositoDto, actorId: string, ip?: string) {
    await this.verificarRucDuplicado(dto.ruc);
    const proveedor = await this.proveedorRepo.save(
      this.proveedorRepo.create({
        razonSocial: dto.razonSocial,
        nombreComercial: dto.nombreComercial ?? null,
        ruc: dto.ruc ?? null,
        direccion: dto.direccion ?? null,
        telefono: dto.telefono ?? null,
        email: dto.email ?? null,
        contacto: dto.contacto ?? null,
        observaciones: dto.observaciones ?? null,
        creadoPor: actorId,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'deposito.proveedores',
      recursoId: proveedor.id,
      datosDespues: proveedor,
      ip: ip ?? null,
    });
    return proveedor;
  }

  async update(id: string, dto: UpdateProveedorDepositoDto, actorId: string, ip?: string) {
    const antes = await this.findOne(id);
    if (dto.ruc !== undefined) await this.verificarRucDuplicado(dto.ruc, id);
    await this.proveedorRepo.update(id, {
      ...(dto.razonSocial !== undefined ? { razonSocial: dto.razonSocial } : {}),
      ...(dto.nombreComercial !== undefined ? { nombreComercial: dto.nombreComercial } : {}),
      ...(dto.ruc !== undefined ? { ruc: dto.ruc } : {}),
      ...(dto.direccion !== undefined ? { direccion: dto.direccion } : {}),
      ...(dto.telefono !== undefined ? { telefono: dto.telefono } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.contacto !== undefined ? { contacto: dto.contacto } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado as any } : {}),
      ...(dto.observaciones !== undefined ? { observaciones: dto.observaciones } : {}),
      actualizadoPor: actorId,
    });
    const despues = await this.findOne(id);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'EDITAR',
      recurso: 'deposito.proveedores',
      recursoId: id,
      datosAntes: antes,
      datosDespues: despues,
      ip: ip ?? null,
    });
    return despues;
  }
}
