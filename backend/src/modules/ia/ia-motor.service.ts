import { Injectable } from '@nestjs/common';
import { ConfiguracionIa } from '../../shared/entities';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { AiTool, ResultadoHerramientaIa } from './tools/ia-tool.interface';
import { IaToolsService, SIN_PERMISO } from './tools/ia-tools.service';

export interface ContextoConversacionIa {
  herramienta: string;
  argumentos: Record<string, unknown>;
}

export interface RespuestaMotorIa {
  contenidoRespuesta: string;
  fuentes?: ResultadoHerramientaIa['fuentes'];
  herramientaUsada: string | null;
  argumentosUsados: Record<string, unknown> | null;
  resultadoHerramienta: 'PERMITIDO' | 'DENEGADO' | 'ERROR' | null;
  resumenAuditoria: string | null;
  nuevoContexto: ContextoConversacionIa | null;
}

const MARCADORES_SEGUIMIENTO = [/^y\s/, /^ y /, /tambien/, /ademas/, /y (a que hora|quien|cuando|donde|cuanto)/];

const PATRONES_RIESGO_GRAVE = [/quiero morir/, /no quiero vivir/, /hacerme dano/, /lastimarme/, /suicid/, /no aguanto mas/];
const PATRONES_ANIMO = [
  /me siento (\w+\s+){0,2}(mal|triste|bajoneado|angustiado|estresado|agotado|agobiado)/,
  /estoy (\w+\s+){0,2}(mal|triste|cansado|agotado|agobiado|bajoneado|angustiado|estresado|con mucha presion)/,
  /dia (dificil|pesado|horrible)/,
  /no doy mas/,
];
const PATRONES_SALUDO = [/^(hola|buenas|buen dia|buenas tardes|buenas noches|hey|que tal|holis)\b/];
const PATRONES_DESPEDIDA = [/^(chau|adios|nos vemos|hasta luego|bye|hasta la proxima)\b/];
const PATRONES_AGRADECIMIENTO = [/gracias/, /te lo agradezco/, /muy amable/];
const PATRONES_AYUDA = [/que (podes|puedes) hacer/, /^ayuda$/, /en que me (ayudas|podes ayudar)/, /que sabes hacer/, /para que servis/];
const PATRONES_MODIFICACION = [
  /(cambia|cambiar|modifica|modificar|actualiza|actualizar|edita|editar)\b.*(rango|permiso|usuario|documento|guardia|servicio|equipo|vehiculo|personal|bombero|cargo|contrasena|password)/,
  /(elimina|eliminar|borra|borrar|da(le)? de baja)\b.*(usuario|documento|guardia|servicio|equipo|vehiculo|personal|bombero|registro)/,
  /(aprueba|aprobar|autoriza|autorizar|firma|firmar)\b.*(documento|gasto|orden|pago)/,
  /(crea|crear|agrega|agregar|registra|registrar)\b.*(usuario|permiso|rol)/,
  /(bloquea|bloquear|desbloquea|desbloquear)\b.*(usuario|cuenta)/,
];

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function coincideAlguno(texto: string, patrones: RegExp[]): boolean {
  return patrones.some((p) => p.test(texto));
}

/** Motor de razonamiento LOCAL de Snoopy: sin llamadas salientes, sin
 * agente externo, sin "tokens" (pivote de arquitectura pedido por la
 * institucion). Reconoce intencion por patrones/palabras clave en
 * espanol, ejecuta como MAXIMO una herramienta de la lista blanca por
 * turno y arma la respuesta con plantillas ajustadas al tono configurado.
 * Es deterministico: mismo mensaje, mismos permisos -> misma respuesta.
 * No entiende parafraseo arbitrario -- cubre las formas de pregunta mas
 * comunes en espanol para cada tema, documentado como limitacion real. */
@Injectable()
export class IaMotorService {
  constructor(private readonly toolsService: IaToolsService) {}

  async procesar(
    mensajeOriginal: string,
    config: ConfiguracionIa,
    usuario: AuthenticatedUser,
    modulosHabilitados: string[],
    contextoPrevio: ContextoConversacionIa | null,
  ): Promise<RespuestaMotorIa> {
    const mensaje = normalizar(mensajeOriginal);
    const sinRespuesta: RespuestaMotorIa = { contenidoRespuesta: '', fuentes: undefined, herramientaUsada: null, argumentosUsados: null, resultadoHerramienta: null, resumenAuditoria: null, nuevoContexto: contextoPrevio };

    // Prioridad maxima: senales de riesgo grave -- nunca compite con nada mas.
    if (coincideAlguno(mensaje, PATRONES_RIESGO_GRAVE)) {
      return {
        ...sinRespuesta,
        contenidoRespuesta:
          'Lo que me contas suena realmente serio, y quiero que sepas que no estas solo/a. No soy la persona indicada para acompañarte en esto -- por favor buscá ayuda humana profesional ahora mismo: hablá con alguien de confianza, con un superior o con una linea de atencion en crisis de tu zona. Si sentis que es una emergencia, comunicate con los servicios de emergencia de inmediato.',
      };
    }

    if (coincideAlguno(mensaje, PATRONES_ANIMO)) {
      return {
        ...sinRespuesta,
        contenidoRespuesta: `Lamento que estes pasando por eso. No soy psicologo ni puedo darte un consejo profesional, pero podes contarme si queres desahogarte, y si sentis que necesitas ayuda de verdad, no dudes en hablar con alguien de confianza.${config.permiteEmojis ? ' 💙' : ''}`,
      };
    }

    if (coincideAlguno(mensaje, PATRONES_MODIFICACION)) {
      return {
        ...sinRespuesta,
        contenidoRespuesta: 'No puedo modificar, crear ni eliminar registros institucionales -- esa accion debe hacerse desde el modulo correspondiente por un usuario autorizado. Si necesitas ayuda para encontrar donde hacerlo, decime que queres modificar y te oriento.',
      };
    }

    if (coincideAlguno(mensaje, PATRONES_SALUDO)) {
      return { ...sinRespuesta, contenidoRespuesta: config.saludo ? this.aplicarTono(config.saludo, config) : this.aplicarTono(`Hola ${usuario.username}, en que puedo ayudarte?`, config) };
    }

    if (coincideAlguno(mensaje, PATRONES_DESPEDIDA)) {
      return { ...sinRespuesta, contenidoRespuesta: this.aplicarTono('Nos vemos! Cualquier cosa, aca estoy.', config) };
    }

    if (coincideAlguno(mensaje, PATRONES_AGRADECIMIENTO)) {
      return { ...sinRespuesta, contenidoRespuesta: this.aplicarTono('De nada, para eso estoy.', config) };
    }

    const herramientasDisponibles = this.toolsService.herramientasDisponibles(usuario, modulosHabilitados);

    if (coincideAlguno(mensaje, PATRONES_AYUDA)) {
      return { ...sinRespuesta, contenidoRespuesta: this.mensajeAyuda(config, herramientasDisponibles) };
    }

    // Reconoce la intencion sobre TODAS las herramientas habilitadas por la
    // institucion, no solo las que el usuario puede usar -- si pregunto algo
    // claro pero no tiene permiso, quiere el mensaje explicito de "no tenes
    // permiso" (seccion 10), no un generico "no entendi tu consulta".
    const herramientasDelModulo = this.toolsService.herramientasDelModulo(modulosHabilitados);
    let herramienta = this.elegirHerramienta(mensaje, herramientasDelModulo);
    let argumentos: Record<string, unknown> | null = null;

    if (herramienta) {
      argumentos = herramienta.extraerArgumentos(mensaje, mensajeOriginal);
    } else if (contextoPrevio && coincideAlguno(mensaje, MARCADORES_SEGUIMIENTO)) {
      // Pregunta de seguimiento (seccion 51): sin match propio, pero hay
      // contexto previo y el mensaje "suena" a continuacion de esa consulta.
      herramienta = this.toolsService.buscarPorNombre(contextoPrevio.herramienta) ?? null;
      argumentos = contextoPrevio.argumentos;
    }

    if (!herramienta || !argumentos) {
      return { ...sinRespuesta, contenidoRespuesta: this.mensajeNoEntendido(config, herramientasDisponibles) };
    }

    if (!this.toolsService.autorizada(herramienta, usuario, modulosHabilitados)) {
      return {
        ...sinRespuesta,
        contenidoRespuesta: SIN_PERMISO.contenidoRespuesta,
        herramientaUsada: herramienta.nombre,
        argumentosUsados: argumentos,
        resultadoHerramienta: 'DENEGADO',
        resumenAuditoria: SIN_PERMISO.resumenAuditoria,
      };
    }

    try {
      const resultado = await herramienta.ejecutar(argumentos, usuario);
      return {
        contenidoRespuesta: resultado.contenidoRespuesta,
        fuentes: resultado.fuentes,
        herramientaUsada: herramienta.nombre,
        argumentosUsados: argumentos,
        resultadoHerramienta: 'PERMITIDO',
        resumenAuditoria: resultado.resumenAuditoria,
        nuevoContexto: { herramienta: herramienta.nombre, argumentos },
      };
    } catch (error) {
      return {
        contenidoRespuesta: 'Tuve un problema para consultar esa informacion. Probá de nuevo en un momento.',
        herramientaUsada: herramienta.nombre,
        argumentosUsados: argumentos,
        resultadoHerramienta: 'ERROR',
        resumenAuditoria: (error as Error).message?.slice(0, 290) ?? 'Error desconocido',
        nuevoContexto: contextoPrevio,
      };
    }
  }

  /** Puntaje por patron (peso alto) y por palabra clave (peso bajo); gana
   * la herramienta con mas puntos por encima del umbral minimo. El umbral
   * es 2 (no 1) a proposito: una sola palabra clave generica compartida
   * con una frase no relacionada (ej. "hoy" en un mensaje que no es sobre
   * guardias) no alcanza para disparar una herramienta por si sola --
   * hace falta un patron especifico o dos palabras clave coincidentes. */
  private elegirHerramienta(mensaje: string, herramientas: AiTool[]): AiTool | null {
    let mejor: AiTool | null = null;
    let mejorPuntaje = 0;
    for (const tool of herramientas) {
      let puntaje = 0;
      for (const patron of tool.patrones) if (patron.test(mensaje)) puntaje += 10;
      for (const palabra of tool.palabrasClave) if (mensaje.includes(palabra)) puntaje += 1;
      if (puntaje > mejorPuntaje) {
        mejorPuntaje = puntaje;
        mejor = tool;
      }
    }
    return mejorPuntaje >= 2 ? mejor : null;
  }

  private mensajeAyuda(config: ConfiguracionIa, herramientas: AiTool[]): string {
    if (herramientas.length === 0) {
      return this.aplicarTono('Todavia no tengo ningun tema habilitado para vos. Consulta con un administrador de Seguridad.', config);
    }
    const temas = [...new Set(herramientas.map((t) => t.moduloSlug))];
    return this.aplicarTono(`Puedo ayudarte a consultar informacion de: ${temas.join(', ')}. Tambien podemos charlar de otras cosas. ¿Que necesitas?`, config);
  }

  private mensajeNoEntendido(config: ConfiguracionIa, herramientas: AiTool[]): string {
    if (herramientas.length === 0) {
      return this.aplicarTono('No encontre informacion registrada sobre eso en SIGBO.', config);
    }
    const temas = [...new Set(herramientas.map((t) => t.moduloSlug))].slice(0, 6);
    return this.aplicarTono(`No entendi bien tu consulta. Puedo ayudarte con informacion de: ${temas.join(', ')}. ¿Podes reformularla?`, config);
  }

  private aplicarTono(texto: string, config: ConfiguracionIa): string {
    if (config.permiteEmojis === false) return texto.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
    return texto;
  }
}
