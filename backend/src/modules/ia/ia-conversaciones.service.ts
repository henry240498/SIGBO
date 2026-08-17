import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversacionIa, EjecucionHerramientaIa, MensajeIa, Usuario } from '../../shared/entities';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { AuditoriaService } from '../seguridad/auditoria.service';

/** Lectura de conversaciones (seccion 6-7 del pedido): un usuario comun
 * solo ve las suyas; ver conversaciones ajenas exige
 * `inteligencia:ver_conversaciones` (seccion 53, "no mostrar
 * conversaciones privadas a usuarios comunes"). El controller decide con
 * que permisos llama a `deUsuario` vs `todas`, este servicio nunca decide
 * autorizacion por su cuenta salvo el chequeo de propiedad en `mensajesDe`. */
@Injectable()
export class IaConversacionesService {
  constructor(
    @InjectRepository(ConversacionIa) private readonly conversacionRepo: Repository<ConversacionIa>,
    @InjectRepository(MensajeIa) private readonly mensajeRepo: Repository<MensajeIa>,
    @InjectRepository(EjecucionHerramientaIa) private readonly ejecucionRepo: Repository<EjecucionHerramientaIa>,
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  misConversaciones(usuarioId: string) {
    return this.conversacionRepo.find({ where: { usuarioId }, order: { ultimaActividadEn: 'DESC' }, take: 50 });
  }

  /** El panel admin necesita mostrar QUIEN tuvo cada conversacion, no un
   * GUID crudo -- se resuelve el username en un segundo query en memoria
   * (mismo patron que SociosProtectoresService/InscripcionesAcademiaService:
   * sin relaciones TypeORM, join explicito). */
  async todasLasConversaciones(filtros: { usuarioId?: string; desde?: string; hasta?: string }) {
    const qb = this.conversacionRepo.createQueryBuilder('c').orderBy('c.ultimaActividadEn', 'DESC').take(100);
    if (filtros.usuarioId) qb.andWhere('c.usuarioId = :usuarioId', { usuarioId: filtros.usuarioId });
    if (filtros.desde) qb.andWhere('c.iniciadaEn >= :desde', { desde: filtros.desde });
    if (filtros.hasta) qb.andWhere('c.iniciadaEn <= :hasta', { hasta: filtros.hasta });
    const conversaciones = await qb.getMany();
    if (conversaciones.length === 0) return [];

    const usuarioIds = [...new Set(conversaciones.map((c) => c.usuarioId))];
    const usuarios = await this.usuarioRepo.createQueryBuilder('u').where('u.id IN (:...ids)', { ids: usuarioIds }).getMany();
    const usuarioPorId = new Map(usuarios.map((u) => [u.id, u]));

    return conversaciones.map((c) => ({
      ...c,
      usuarioUsername: usuarioPorId.get(c.usuarioId)?.username ?? null,
      usuarioEmail: usuarioPorId.get(c.usuarioId)?.email ?? null,
    }));
  }

  /** Borrado administrativo (no autoborrado de nadie mas que Seguridad con
   * `inteligencia:eliminar_conversaciones'). ia.mensajes cascadea solo por
   * FK; ia.ejecuciones_herramientas NO (su FK a conversacion_id no tiene
   * ON DELETE CASCADE, y mensaje_id casi siempre queda NULL en la practica
   * -- ver IaChatService.chat, nunca lo completa) -- hay que borrarlas a
   * mano antes o el DELETE de la conversacion falla por conflicto de FK. */
  async eliminar(id: string, actorId: string, ip: string | null) {
    const conversacion = await this.conversacionRepo.findOne({ where: { id } });
    if (!conversacion) throw new NotFoundException(`Conversacion ${id} no encontrada`);

    await this.conversacionRepo.manager.transaction(async (manager) => {
      await manager.delete(EjecucionHerramientaIa, { conversacionId: id });
      await manager.delete(ConversacionIa, { id });
    });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ELIMINAR_CONVERSACION',
      recurso: 'ia.conversaciones',
      recursoId: id,
      datosAntes: conversacion,
      ip,
    });
  }

  async mensajesDe(conversacionId: string, usuario: AuthenticatedUser) {
    const conversacion = await this.conversacionRepo.findOne({ where: { id: conversacionId } });
    if (!conversacion) throw new NotFoundException(`Conversacion ${conversacionId} no encontrada`);
    const puedeVerTodas = usuario.permisos.includes('inteligencia:ver_conversaciones');
    if (conversacion.usuarioId !== usuario.id && !puedeVerTodas) {
      throw new ForbiddenException('No tenés permiso para ver esta conversación');
    }
    const mensajes = await this.mensajeRepo.find({ where: { conversacionId }, order: { creadoEn: 'ASC' } });
    return { conversacion, mensajes };
  }

  ejecucionesDe(conversacionId: string) {
    return this.ejecucionRepo.find({ where: { conversacionId }, order: { creadoEn: 'ASC' } });
  }
}
