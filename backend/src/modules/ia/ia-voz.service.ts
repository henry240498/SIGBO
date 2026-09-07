import { BadRequestException, ForbiddenException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversacionIa, MensajeIa } from '../../shared/entities';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { IaConfiguracionService } from './ia-configuracion.service';
import { PiperService } from './piper/piper.service';
import { WhisperService } from './whisper/whisper.service';

/** Orquesta voz alrededor del NUCLEO de Snoopy que ya existe -- nunca lo
 * reemplaza ni lo duplica (seccion 2 del pedido de voz: "ambos modos deben
 * utilizar exactamente el mismo nucleo... no duplicar la logica de
 * consulta para voz"). `transcribir()` solo convierte audio a texto: el
 * texto resultante lo manda el FRONTEND al mismo `POST /ia/chat` de
 * siempre, con las mismas verificaciones de autenticacion/autorizacion/
 * permisos/auditoria que un mensaje escrito (seccion 10, regla absoluta).
 * `hablar()` solo lee en voz alta un mensaje que Snoopy YA dijo y que YA
 * quedo guardado -- nunca texto libre que un cliente HTTP quiera hacerle
 * "decir" a la mascota institucional. */
@Injectable()
export class IaVozService {
  constructor(
    @InjectRepository(MensajeIa) private readonly mensajeRepo: Repository<MensajeIa>,
    @InjectRepository(ConversacionIa) private readonly conversacionRepo: Repository<ConversacionIa>,
    private readonly configuracionService: IaConfiguracionService,
    private readonly whisperService: WhisperService,
    private readonly piperService: PiperService,
  ) {}

  async transcribir(audioBuffer: Buffer): Promise<{ texto: string }> {
    const config = await this.configuracionService.obtener();
    if (!config.vozHabilitada || !config.entradaVozHabilitada) {
      throw new ServiceUnavailableException('La entrada por voz no está habilitada.');
    }
    const resultado = await this.whisperService.transcribir(config, audioBuffer);
    if (!resultado.ok || !resultado.texto) {
      throw new ServiceUnavailableException(resultado.error ?? 'No se pudo transcribir el audio. Podés seguir escribiendo.');
    }
    return { texto: resultado.texto };
  }

  /** `mensajeId`, no texto libre (ver comentario de clase): busca el
   * mensaje, confirma que sea de Snoopy (rol IA) y que pertenezca a una
   * conversacion del usuario que pide la voz -- mismo chequeo de
   * propiedad que `IaConversacionesService.mensajesDe`, para que nadie
   * pueda escuchar (ni disparar la sintesis de) un mensaje de otra
   * persona via este endpoint. */
  async hablar(mensajeId: string, usuario: AuthenticatedUser): Promise<Buffer> {
    const config = await this.configuracionService.obtener();
    if (!config.vozHabilitada || !config.respuestaVozHabilitada) {
      throw new ServiceUnavailableException('La respuesta por voz no está habilitada.');
    }

    const mensaje = await this.mensajeRepo.findOne({ where: { id: mensajeId } });
    if (!mensaje) throw new NotFoundException('Mensaje no encontrado.');
    if (mensaje.rol !== 'IA') throw new BadRequestException('Solo se puede sintetizar un mensaje de Snoopy.');

    const conversacion = await this.conversacionRepo.findOne({ where: { id: mensaje.conversacionId } });
    if (!conversacion || conversacion.usuarioId !== usuario.id) {
      throw new ForbiddenException('No tenés permiso para escuchar este mensaje.');
    }

    const resultado = await this.piperService.sintetizar(config, mensaje.contenido);
    if (!resultado.ok || !resultado.audioWav) {
      throw new ServiceUnavailableException(resultado.error ?? 'No se pudo generar el audio. Podés leer la respuesta en texto.');
    }
    return resultado.audioWav;
  }
}
