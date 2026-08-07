import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AsignacionPermisoDirecto,
  AsignacionPermisoRol,
  AsignacionRol,
  Permiso,
} from '../../shared/entities';

@Injectable()
export class PolicyEngineService {
  constructor(
    @InjectRepository(AsignacionRol) private readonly asignacionRolRepo: Repository<AsignacionRol>,
    @InjectRepository(AsignacionPermisoRol)
    private readonly asignacionPermisoRolRepo: Repository<AsignacionPermisoRol>,
    @InjectRepository(AsignacionPermisoDirecto)
    private readonly asignacionPermisoDirectoRepo: Repository<AsignacionPermisoDirecto>,
    @InjectRepository(Permiso) private readonly permisoRepo: Repository<Permiso>,
  ) {}

  /**
   * Calcula el conjunto efectivo de permisos de un usuario: union de permisos
   * de todos sus roles vigentes, mas los permisos directos concedidos,
   * menos los permisos directos denegados explicitamente (concedido = false).
   */
  async getPermisosEfectivos(usuarioId: string): Promise<string[]> {
    const ahora = new Date();

    const asignacionesRol = await this.asignacionRolRepo.find({ where: { usuarioId } });
    const rolesVigentes = asignacionesRol
      .filter((a) => !a.fechaExpiracion || a.fechaExpiracion > ahora)
      .map((a) => a.rolId);

    const permisoMap = new Map<string, Permiso>();

    if (rolesVigentes.length > 0) {
      const asignacionesPermisoRol = await this.asignacionPermisoRolRepo
        .createQueryBuilder('apr')
        .where('apr.rolId IN (:...roles)', { roles: rolesVigentes })
        .getMany();

      const permisoIds = [...new Set(asignacionesPermisoRol.map((a) => a.permisoId))];
      if (permisoIds.length > 0) {
        const permisos = await this.permisoRepo
          .createQueryBuilder('p')
          .where('p.id IN (:...ids)', { ids: permisoIds })
          .getMany();
        permisos.forEach((p) => permisoMap.set(p.id, p));
      }
    }

    const directos = await this.asignacionPermisoDirectoRepo.find({ where: { usuarioId } });
    const directoIds = directos.map((d) => d.permisoId);
    if (directoIds.length > 0) {
      const permisosDirectos = await this.permisoRepo
        .createQueryBuilder('p')
        .where('p.id IN (:...ids)', { ids: directoIds })
        .getMany();
      const permisosDirectosMap = new Map(permisosDirectos.map((p) => [p.id, p]));

      for (const directo of directos) {
        const permiso = permisosDirectosMap.get(directo.permisoId);
        if (!permiso) continue;
        if (directo.concedido) {
          permisoMap.set(permiso.id, permiso);
        } else {
          permisoMap.delete(permiso.id);
        }
      }
    }

    return Array.from(permisoMap.values()).map((p) => p.nombre);
  }
}
