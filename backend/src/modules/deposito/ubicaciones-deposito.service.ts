import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UbicacionDeposito } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateUbicacionDepositoDto, UpdateUbicacionDepositoDto } from './dto/ubicacion-deposito.dto';

@Injectable()
export class UbicacionesDepositoService {
  constructor(
    @InjectRepository(UbicacionDeposito) private readonly ubicacionRepo: Repository<UbicacionDeposito>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(q?: string, tipoUbicacionId?: string, estado?: string) {
    const qb = this.ubicacionRepo.createQueryBuilder('u');
    if (q) qb.andWhere('(u.nombre LIKE :q OR u.codigo LIKE :q)', { q: `%${q}%` });
    if (tipoUbicacionId) qb.andWhere('u.tipoUbicacionId = :tipoUbicacionId', { tipoUbicacionId });
    if (estado) qb.andWhere('u.estado = :estado', { estado });
    qb.orderBy('u.nombre', 'ASC');
    return qb.getMany();
  }

  async findOne(id: string) {
    const ubicacion = await this.ubicacionRepo.findOne({ where: { id } });
    if (!ubicacion) throw new NotFoundException(`Ubicacion ${id} no encontrada`);
    return ubicacion;
  }

  async create(dto: CreateUbicacionDepositoDto, actorId: string, ip?: string) {
    if (dto.padreId) await this.findOne(dto.padreId);
    const ubicacion = await this.ubicacionRepo.save(
      this.ubicacionRepo.create({
        codigo: dto.codigo ?? null,
        nombre: dto.nombre,
        tipoUbicacionId: dto.tipoUbicacionId,
        padreId: dto.padreId ?? null,
        cuartelId: dto.cuartelId ?? null,
        estado: (dto.estado as any) ?? 'ACTIVA',
        creadoPor: actorId,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'deposito.ubicaciones',
      recursoId: ubicacion.id,
      datosDespues: ubicacion,
      ip: ip ?? null,
    });
    return ubicacion;
  }

  async update(id: string, dto: UpdateUbicacionDepositoDto, actorId: string, ip?: string) {
    const antes = await this.findOne(id);
    if (dto.padreId) {
      if (dto.padreId === id) throw new ConflictException('Una ubicacion no puede ser su propia ubicacion padre');
      await this.findOne(dto.padreId);
    }
    await this.ubicacionRepo.update(id, {
      ...(dto.codigo !== undefined ? { codigo: dto.codigo } : {}),
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.tipoUbicacionId !== undefined ? { tipoUbicacionId: dto.tipoUbicacionId } : {}),
      ...(dto.padreId !== undefined ? { padreId: dto.padreId } : {}),
      ...(dto.cuartelId !== undefined ? { cuartelId: dto.cuartelId } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado as any } : {}),
      actualizadoPor: actorId,
    });
    const despues = await this.findOne(id);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'EDITAR',
      recurso: 'deposito.ubicaciones',
      recursoId: id,
      datosAntes: antes,
      datosDespues: despues,
      ip: ip ?? null,
    });
    return despues;
  }

  async remove(id: string, actorId: string, ip?: string) {
    const ubicacion = await this.findOne(id);
    await this.ubicacionRepo.remove(ubicacion);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ELIMINAR',
      recurso: 'deposito.ubicaciones',
      recursoId: id,
      datosAntes: ubicacion,
      ip: ip ?? null,
    });
    return { eliminado: true };
  }
}
