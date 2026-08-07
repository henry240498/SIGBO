import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permiso, Rol, Usuario } from '../../shared/entities';
import { SesionesService } from './sesiones.service';
import { AuditoriaService } from './auditoria.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>,
    @InjectRepository(Permiso) private readonly permisoRepo: Repository<Permiso>,
    private readonly sesionesService: SesionesService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async obtener() {
    const ahora = new Date();

    const [
      totalUsuarios,
      activos,
      inactivos,
      bloqueadosPorEstado,
      bloqueadosPorFecha,
      totalRoles,
      totalPermisos,
      conectadosAhora,
      sesionesActivas,
      ultimosAccesos,
      conIntentosFallidos,
      auditoriaReciente,
    ] = await Promise.all([
      this.usuarioRepo.count(),
      this.usuarioRepo.count({ where: { estado: 'ACTIVO' } }),
      this.usuarioRepo.count({ where: { estado: 'INACTIVO' } }),
      this.usuarioRepo.count({ where: { estado: 'BLOQUEADO' } }),
      this.usuarioRepo
        .createQueryBuilder('u')
        .where('u.bloqueadoHasta IS NOT NULL AND u.bloqueadoHasta > :ahora', { ahora })
        .getCount(),
      this.rolRepo.count(),
      this.permisoRepo.count(),
      this.sesionesService.countConectadosAhora(),
      this.sesionesService.countActivas(),
      this.usuarioRepo.find({
        where: {},
        select: ['id', 'username', 'email', 'ultimoAcceso', 'ipUltimoAcceso'],
        order: { ultimoAcceso: 'DESC' },
        take: 10,
      }),
      this.usuarioRepo
        .createQueryBuilder('u')
        .where('u.intentosFallidos > 0')
        .select(['u.id', 'u.username', 'u.email', 'u.intentosFallidos', 'u.bloqueadoHasta'])
        .orderBy('u.intentosFallidos', 'DESC')
        .limit(10)
        .getMany(),
      this.auditoriaService.findRecientes(10),
    ]);

    return {
      usuarios: {
        total: totalUsuarios,
        activos,
        inactivos,
        bloqueados: bloqueadosPorEstado + bloqueadosPorFecha,
        conectadosAhora,
      },
      roles: { total: totalRoles },
      permisos: { total: totalPermisos },
      sesiones: { activas: sesionesActivas },
      ultimosAccesos: ultimosAccesos.filter((u) => u.ultimoAcceso !== null),
      alertas: conIntentosFallidos,
      auditoriaReciente,
    };
  }
}
