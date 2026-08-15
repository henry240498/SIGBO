import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfiguracionIa, ConversacionIa, EjecucionHerramientaIa, EstadoConfiguracionIa, HistorialConfiguracionIa, MensajeIa, PropuestaMejoraIa } from '../../shared/entities';
import { borrarImagenSiExiste, guardarImagen } from '../../shared/utils/almacenamiento';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CambiarEstadoIaDto, EliminarIaDto, SeleccionarAvatarPredefinidoDto, UpdateConfiguracionIaDto } from './dto/configuracion-ia.dto';

export const CARPETA_AVATAR_IA = 'ia-avatar';

const MODULOS_POR_DEFECTO = ['personal', 'organizacion', 'guardias', 'asistencia', 'servicios', 'vehiculos', 'equipos', 'academia', 'deposito', 'finanzas', 'documentos'];

/** Configuracion del asistente (fila unica, patron ya usado por
 * AparienciaService/OrdenGuardiaConfiguracionService): nunca inserta,
 * siempre actualiza la fila existente. Cada cambio deja rastro completo
 * antes/despues en HistorialConfiguracionIa (seccion 38 del pedido) via
 * AuditoriaService ademas, para que aparezca junto al resto de la
 * actividad de Seguridad (seccion 55). */
@Injectable()
export class IaConfiguracionService {
  constructor(
    @InjectRepository(ConfiguracionIa) private readonly repo: Repository<ConfiguracionIa>,
    @InjectRepository(HistorialConfiguracionIa) private readonly historialRepo: Repository<HistorialConfiguracionIa>,
    @InjectRepository(ConversacionIa) private readonly conversacionRepo: Repository<ConversacionIa>,
    @InjectRepository(MensajeIa) private readonly mensajeRepo: Repository<MensajeIa>,
    @InjectRepository(EjecucionHerramientaIa) private readonly ejecucionRepo: Repository<EjecucionHerramientaIa>,
    @InjectRepository(PropuestaMejoraIa) private readonly propuestaRepo: Repository<PropuestaMejoraIa>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async obtener(): Promise<ConfiguracionIa> {
    const [fila] = await this.repo.find({ take: 1 });
    if (fila) return fila;
    // Solo pasa en una BD nueva sin la fila sembrada por la migracion 057.
    return this.repo.save(this.repo.create({ modulosHabilitadosJson: JSON.stringify(MODULOS_POR_DEFECTO) }));
  }

  modulosHabilitados(config: ConfiguracionIa): string[] {
    try {
      const valores = JSON.parse(config.modulosHabilitadosJson);
      return Array.isArray(valores) ? valores : [];
    } catch {
      return [];
    }
  }

  historial(configuracionId: string) {
    return this.historialRepo.find({ where: { configuracionId }, order: { creadoEn: 'DESC' }, take: 50 });
  }

  private async registrarCambio(anterior: ConfiguracionIa, nuevo: ConfiguracionIa, actorId: string, ip: string | null, motivo?: string) {
    await this.historialRepo.save(
      this.historialRepo.create({
        configuracionId: anterior.id,
        valorAnteriorJson: JSON.stringify(anterior),
        valorNuevoJson: JSON.stringify(nuevo),
        motivo: motivo ?? null,
        usuarioId: actorId,
        ip,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CAMBIAR_CONFIGURACION',
      recurso: 'ia.configuraciones',
      recursoId: anterior.id,
      datosAntes: anterior,
      datosDespues: nuevo,
      metadata: { motivo: motivo ?? null },
      ip,
    });
  }

  async actualizar(dto: UpdateConfiguracionIaDto, actorId: string, ip: string | null): Promise<ConfiguracionIa> {
    const actual = await this.obtener();
    await this.repo.update(actual.id, {
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.personaje !== undefined ? { personaje: dto.personaje } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
      ...(dto.personalidad !== undefined ? { personalidad: dto.personalidad } : {}),
      ...(dto.saludo !== undefined ? { saludo: dto.saludo } : {}),
      ...(dto.formalidad !== undefined ? { formalidad: dto.formalidad as any } : {}),
      ...(dto.permiteEmojis !== undefined ? { permiteEmojis: dto.permiteEmojis } : {}),
      ...(dto.instruccionesInstitucionales !== undefined ? { instruccionesInstitucionales: dto.instruccionesInstitucionales } : {}),
      ...(dto.limiteActivo !== undefined ? { limiteActivo: dto.limiteActivo } : {}),
      ...(dto.limiteConsultasMinuto !== undefined ? { limiteConsultasMinuto: dto.limiteConsultasMinuto } : {}),
      ...(dto.limiteConsultasHora !== undefined ? { limiteConsultasHora: dto.limiteConsultasHora } : {}),
      ...(dto.modulosHabilitados !== undefined ? { modulosHabilitadosJson: JSON.stringify(dto.modulosHabilitados) } : {}),
      actualizadoPor: actorId,
    });
    const nuevo = await this.obtener();
    await this.registrarCambio(actual, nuevo, actorId, ip, dto.motivo);
    return nuevo;
  }

  async cambiarEstado(dto: CambiarEstadoIaDto, actorId: string, ip: string | null): Promise<ConfiguracionIa> {
    const actual = await this.obtener();
    await this.repo.update(actual.id, {
      estado: dto.estado as EstadoConfiguracionIa,
      motivoDesactivacion: dto.estado === 'INACTIVA' ? dto.motivo ?? null : actual.motivoDesactivacion,
      mensajeMantenimiento: dto.estado === 'MANTENIMIENTO' ? dto.mensajeMantenimiento ?? actual.mensajeMantenimiento : actual.mensajeMantenimiento,
      actualizadoPor: actorId,
    });
    const nuevo = await this.obtener();
    await this.registrarCambio(actual, nuevo, actorId, ip, dto.motivo ?? `Cambio de estado a ${dto.estado}`);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: dto.estado === 'INACTIVA' ? 'DESACTIVAR_IA' : dto.estado === 'MANTENIMIENTO' ? 'MANTENIMIENTO_IA' : 'ACTIVAR_IA',
      recurso: 'ia.configuraciones',
      recursoId: actual.id,
      metadata: { motivo: dto.motivo ?? null },
      ip,
    });
    return nuevo;
  }

  /** Borrado definitivo de toda existencia de la IA (funcionalidad pedida
   * explicitamente por la institucion): exige escribir la palabra "DELETE"
   * (verificado aca, nunca solo en el frontend) y, ANTES de borrar
   * cualquier fila, deja un unico registro permanente en
   * seguridad.log_auditoria con el volcado completo de todo lo que hizo
   * la IA desde su creacion -- conversaciones, mensajes, ejecuciones de
   * herramientas, historial de configuracion y propuestas de mejora.
   * seguridad.log_auditoria no se toca por esta operacion: sigue siendo,
   * como en el resto de SIGBO, el registro inmutable que sobrevive al
   * borrado de los datos operativos. Tras el borrado, `obtener()` vuelve
   * a sembrar una fila de configuracion por defecto la proxima vez que
   * alguien la necesite -- "eliminar" no dejar roto el modulo, deja el
   * modulo en blanco, como si nunca se hubiera configurado. */
  async eliminarDefinitivamente(dto: EliminarIaDto, actorId: string, ip: string | null): Promise<{ eliminado: true; resumen: Record<string, number> }> {
    if (dto.confirmacion !== 'DELETE') {
      throw new BadRequestException('Para eliminar la IA definitivamente hay que escribir exactamente la palabra DELETE.');
    }

    const config = await this.obtener();
    const [conversaciones, mensajes, ejecuciones, historial, propuestas] = await Promise.all([
      this.conversacionRepo.find(),
      this.mensajeRepo.find(),
      this.ejecucionRepo.find(),
      this.historialRepo.find(),
      this.propuestaRepo.find(),
    ]);

    const resumen = {
      conversaciones: conversaciones.length,
      mensajes: mensajes.length,
      ejecucionesHerramientas: ejecuciones.length,
      cambiosDeConfiguracion: historial.length,
      propuestasDeMejora: propuestas.length,
    };

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ELIMINAR_IA_DEFINITIVAMENTE',
      recurso: 'ia.configuraciones',
      recursoId: config.id,
      datosAntes: { configuracion: config, conversaciones, mensajes, ejecuciones, historial, propuestas },
      metadata: { resumen, motivo: dto.motivo ?? null, creadaEl: config.creadoEn, eliminadaEl: new Date() },
      ip,
    });

    await this.ejecucionRepo.createQueryBuilder().delete().from(EjecucionHerramientaIa).execute();
    await this.mensajeRepo.createQueryBuilder().delete().from(MensajeIa).execute();
    await this.conversacionRepo.createQueryBuilder().delete().from(ConversacionIa).execute();
    await this.historialRepo.createQueryBuilder().delete().from(HistorialConfiguracionIa).execute();
    await this.propuestaRepo.createQueryBuilder().delete().from(PropuestaMejoraIa).execute();
    await this.repo.createQueryBuilder().delete().from(ConfiguracionIa).execute();

    return { eliminado: true, resumen };
  }

  /** Avatar como archivo subido -- limpia el avatar predefinido (son
   * mutuamente excluyentes, el que se elige de ultimo gana). */
  async actualizarAvatar(file: Express.Multer.File, actorId: string, ip: string | null): Promise<ConfiguracionIa> {
    const actual = await this.obtener();
    const anteriorUrl = actual.avatarUrl;
    const nuevaUrl = await guardarImagen(file, CARPETA_AVATAR_IA);
    await this.repo.update(actual.id, { avatarUrl: nuevaUrl, avatarEmoji: null, avatarColorFondo: null, actualizadoPor: actorId });
    await borrarImagenSiExiste(anteriorUrl, CARPETA_AVATAR_IA);
    const nuevo = await this.obtener();
    await this.registrarCambio(actual, nuevo, actorId, ip, 'Cambio de avatar (imagen subida)');
    return nuevo;
  }

  /** Avatar predefinido (emoji + color): no depende de ningun archivo,
   * se renderiza al instante en el frontend -- limpia el avatar de imagen
   * subida si habia uno, y borra el archivo huerfano del disco. */
  async seleccionarAvatarPredefinido(dto: SeleccionarAvatarPredefinidoDto, actorId: string, ip: string | null): Promise<ConfiguracionIa> {
    const actual = await this.obtener();
    const anteriorUrl = actual.avatarUrl;
    await this.repo.update(actual.id, { avatarEmoji: dto.emoji, avatarColorFondo: dto.colorFondo, avatarUrl: null, actualizadoPor: actorId });
    if (anteriorUrl) await borrarImagenSiExiste(anteriorUrl, CARPETA_AVATAR_IA);
    const nuevo = await this.obtener();
    await this.registrarCambio(actual, nuevo, actorId, ip, 'Cambio de avatar (predefinido)');
    return nuevo;
  }
}
