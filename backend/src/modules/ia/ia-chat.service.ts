import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversacionIa, EjecucionHerramientaIa, MensajeIa, ResultadoMensajeIa } from '../../shared/entities';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { IaConfiguracionService } from './ia-configuracion.service';
import { ContextoConversacionIa, IaMotorService } from './ia-motor.service';
import { IaToolsService } from './tools/ia-tools.service';
import { ChatIaDto } from './dto/chat-ia.dto';

export interface FuenteCitada {
  documentoId: string;
  titulo: string;
  numeroDocumental: string | null;
  enlace: string;
}

export interface RespuestaChatIa {
  conversacionId: string;
  mensajeId: string | null;
  respuesta: string;
  fuentes: FuenteCitada[];
  error?: boolean;
  enMantenimiento?: boolean;
}

/** Orquestador del chat (secciones 3-4/9/49-51 del pedido). Sin
 * proveedor externo: delega en IaMotorService (motor de razonamiento
 * local, sin llamadas salientes) y se encarga de persistir la
 * conversacion/mensajes/ejecuciones de herramientas y de aplicar el
 * apagado de emergencia / modo mantenimiento. */
@Injectable()
export class IaChatService {
  constructor(
    @InjectRepository(ConversacionIa) private readonly conversacionRepo: Repository<ConversacionIa>,
    @InjectRepository(MensajeIa) private readonly mensajeRepo: Repository<MensajeIa>,
    @InjectRepository(EjecucionHerramientaIa) private readonly ejecucionRepo: Repository<EjecucionHerramientaIa>,
    private readonly configuracionService: IaConfiguracionService,
    private readonly motorService: IaMotorService,
    private readonly toolsService: IaToolsService,
  ) {}

  async chat(usuario: AuthenticatedUser, dto: ChatIaDto, ip: string | null, userAgent: string | null): Promise<RespuestaChatIa> {
    const config = await this.configuracionService.obtener();

    if (config.estado === 'INACTIVA') {
      throw new ServiceUnavailableException(`${config.nombre} está desactivado por el momento. Consultá con un administrador de Seguridad.`);
    }

    const conversacion = await this.obtenerOCrearConversacion(usuario, dto.conversacionId, ip, userAgent);

    if (config.estado === 'MANTENIMIENTO') {
      const respuesta = config.mensajeMantenimiento || `${config.nombre} está temporalmente fuera de servicio. Volvé a intentar en un rato.`;
      await this.mensajeRepo.save(this.mensajeRepo.create({ conversacionId: conversacion.id, rol: 'USUARIO', contenido: dto.mensaje }));
      const mensajeIa = await this.mensajeRepo.save(this.mensajeRepo.create({ conversacionId: conversacion.id, rol: 'IA', contenido: respuesta, resultado: 'BLOQUEADO' }));
      return { conversacionId: conversacion.id, mensajeId: mensajeIa.id, respuesta, fuentes: [], enMantenimiento: true };
    }

    await this.mensajeRepo.save(this.mensajeRepo.create({ conversacionId: conversacion.id, rol: 'USUARIO', contenido: dto.mensaje }));

    const modulosHabilitados = this.configuracionService.modulosHabilitados(config);
    const contextoPrevio: ContextoConversacionIa | null = conversacion.ultimoContextoJson ? JSON.parse(conversacion.ultimoContextoJson) : null;

    const inicio = Date.now();
    const resultado = await this.motorService.procesar(dto.mensaje, config, usuario, modulosHabilitados, contextoPrevio);
    const duracionMs = Date.now() - inicio;

    if (resultado.herramientaUsada) {
      const tool = this.toolsService.buscarPorNombre(resultado.herramientaUsada);
      await this.ejecucionRepo.save(
        this.ejecucionRepo.create({
          conversacionId: conversacion.id,
          usuarioId: usuario.id,
          herramienta: resultado.herramientaUsada,
          argumentosJson: JSON.stringify(resultado.argumentosUsados ?? {}),
          permisoEvaluado: tool?.permisoRequerido ?? null,
          resultado: resultado.resultadoHerramienta ?? 'ERROR',
          datosConsultadosResumen: resultado.resumenAuditoria,
          duracionMs,
        }),
      );
    }

    const resultadoMensaje: ResultadoMensajeIa = resultado.resultadoHerramienta === 'ERROR' ? 'ERROR' : resultado.resultadoHerramienta === 'DENEGADO' ? 'DENEGADO' : 'OK';
    const mensajeIa = await this.mensajeRepo.save(
      this.mensajeRepo.create({
        conversacionId: conversacion.id,
        rol: 'IA',
        contenido: resultado.contenidoRespuesta,
        duracionMs,
        fuentesJson: resultado.fuentes?.length ? JSON.stringify(resultado.fuentes) : null,
        resultado: resultadoMensaje,
      }),
    );

    await this.marcarActividad(conversacion, dto.mensaje, resultado.nuevoContexto);
    return { conversacionId: conversacion.id, mensajeId: mensajeIa.id, respuesta: resultado.contenidoRespuesta, fuentes: resultado.fuentes ?? [] };
  }

  private async obtenerOCrearConversacion(usuario: AuthenticatedUser, conversacionId: string | undefined, ip: string | null, userAgent: string | null): Promise<ConversacionIa> {
    if (conversacionId) {
      const existente = await this.conversacionRepo.findOne({ where: { id: conversacionId } });
      // Si el id no existe o pertenece a otro usuario, se abre una nueva en
      // silencio -- nunca se revela que una conversacion ajena existe (seccion 53).
      if (existente && existente.usuarioId === usuario.id) return existente;
    }
    return this.conversacionRepo.save(this.conversacionRepo.create({ usuarioId: usuario.id, ip, userAgent }));
  }

  private async marcarActividad(conversacion: ConversacionIa, primerMensaje: string, nuevoContexto: ContextoConversacionIa | null) {
    await this.conversacionRepo.update(conversacion.id, {
      ultimaActividadEn: new Date(),
      ultimoContextoJson: nuevoContexto ? JSON.stringify(nuevoContexto) : conversacion.ultimoContextoJson,
      ...(conversacion.titulo ? {} : { titulo: primerMensaje.slice(0, 80) }),
    });
  }
}
