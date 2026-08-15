import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversacionIa, EjecucionHerramientaIa, MensajeIa } from '../../shared/entities';
import { AuthenticatedUser } from '../auth/types/authenticated-user';

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
  ) {}

  misConversaciones(usuarioId: string) {
    return this.conversacionRepo.find({ where: { usuarioId }, order: { ultimaActividadEn: 'DESC' }, take: 50 });
  }

  todasLasConversaciones(filtros: { usuarioId?: string; desde?: string; hasta?: string }) {
    const qb = this.conversacionRepo.createQueryBuilder('c').orderBy('c.ultimaActividadEn', 'DESC').take(100);
    if (filtros.usuarioId) qb.andWhere('c.usuarioId = :usuarioId', { usuarioId: filtros.usuarioId });
    if (filtros.desde) qb.andWhere('c.iniciadaEn >= :desde', { desde: filtros.desde });
    if (filtros.hasta) qb.andWhere('c.iniciadaEn <= :hasta', { hasta: filtros.hasta });
    return qb.getMany();
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
