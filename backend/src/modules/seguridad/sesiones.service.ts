import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sesion, Usuario } from '../../shared/entities';

@Injectable()
export class SesionesService {
  constructor(
    @InjectRepository(Sesion) private readonly sesionRepo: Repository<Sesion>,
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async findActivas() {
    const sesiones = await this.sesionRepo
      .createQueryBuilder('s')
      .where('s.activa = :activa', { activa: true })
      .andWhere('(s.fechaExpiracion IS NULL OR s.fechaExpiracion > :ahora)', { ahora: new Date() })
      .orderBy('s.fechaUltimaActividad', 'DESC')
      .getMany();

    const usuarioIds = [...new Set(sesiones.map((s) => s.usuarioId))];
    const usuarios = usuarioIds.length
      ? await this.usuarioRepo
          .createQueryBuilder('u')
          .where('u.id IN (:...ids)', { ids: usuarioIds })
          .getMany()
      : [];
    const usuarioMap = new Map(usuarios.map((u) => [u.id, u]));

    return sesiones.map((s) => ({
      id: s.id,
      usuarioId: s.usuarioId,
      username: usuarioMap.get(s.usuarioId)?.username ?? null,
      email: usuarioMap.get(s.usuarioId)?.email ?? null,
      ip: s.ip,
      userAgent: s.userAgent,
      dispositivo: s.dispositivo,
      fechaInicio: s.fechaInicio,
      fechaUltimaActividad: s.fechaUltimaActividad,
    }));
  }

  findByUsuario(usuarioId: string) {
    return this.sesionRepo.createQueryBuilder('s')
      .select(['s.id','s.ip','s.userAgent','s.dispositivo','s.fechaInicio','s.fechaExpiracion','s.fechaUltimaActividad'])
      .where('s.usuarioId = :usuarioId',{usuarioId}).andWhere('s.activa = :activa',{activa:true})
      .andWhere('(s.fechaExpiracion IS NULL OR s.fechaExpiracion > :ahora)',{ahora:new Date()})
      .orderBy('s.fechaUltimaActividad','DESC').getMany();
  }

  async cerrarPropia(id:string,usuarioId:string):Promise<Sesion>{
    const sesion=await this.sesionRepo.findOne({where:{id,usuarioId,activa:true}});
    if(!sesion)throw new NotFoundException('Sesion activa no encontrada');
    await this.sesionRepo.update({id,usuarioId},{activa:false});return sesion;
  }

  countConectadosAhora(): Promise<number> {
    return this.sesionRepo
      .createQueryBuilder('s')
      .select('COUNT(DISTINCT s.usuarioId)', 'total')
      .where('s.activa = :activa', { activa: true })
      .andWhere('(s.fechaExpiracion IS NULL OR s.fechaExpiracion > :ahora)', { ahora: new Date() })
      .getRawOne()
      .then((r) => Number(r?.total ?? 0));
  }

  countActivas(): Promise<number> {
    return this.sesionRepo.count({ where: { activa: true } });
  }

  async cerrar(id: string): Promise<Sesion> {
    const sesion = await this.sesionRepo.findOne({ where: { id } });
    if (!sesion) throw new NotFoundException(`Sesion ${id} no encontrada`);
    await this.sesionRepo.update(id, { activa: false });
    return sesion;
  }

  async cerrarTodas(usuarioId: string): Promise<number> {
    const result = await this.sesionRepo.update({ usuarioId, activa: true }, { activa: false });
    return result.affected ?? 0;
  }
}
