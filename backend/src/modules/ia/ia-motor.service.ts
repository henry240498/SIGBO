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
/** Preguntas sobre la IA misma, no sobre una tercera persona -- "quien es"
 * sin nombre despues es autoreferencial (si hubiera un nombre, ej. "quien
 * es Henry Martinez", el patron no matchea por el anclado $ y sigue de
 * largo hasta get_personal, que es donde corresponde). */
const PATRONES_IDENTIDAD = [
  /^quien (sos|eres)$/,
  /^quien (sos|eres) vos$/,
  /^quien es$/,
  /^quien era$/,
  /^que (sos|eres)$/,
  /quien (te crees|se cree) que (sos|eres|es)/,
  /(tu historia|tu origen|de donde (sos|venis|eres))/,
  /contame (tu historia|sobre vos|quien sos|de vos)/,
];
const PATRONES_AGRADECIMIENTO = [/gracias/, /te lo agradezco/, /muy amable/];
const PATRONES_AYUDA = [/que (podes|puedes) hacer/, /^ayuda$/, /en que me (ayudas|podes ayudar)/, /que sabes hacer/, /para que servis/];
const PATRONES_MODIFICACION = [
  /(cambia|cambiar|modifica|modificar|actualiza|actualizar|edita|editar)\b.*(rango|permiso|usuario|documento|guardia|servicio|equipo|vehiculo|personal|bombero|cargo|contrasena|password)/,
  /(elimina|eliminar|borra|borrar|da(le)? de baja)\b.*(usuario|documento|guardia|servicio|equipo|vehiculo|personal|bombero|registro)/,
  /(aprueba|aprobar|autoriza|autorizar|firma|firmar)\b.*(documento|gasto|orden|pago)/,
  /(crea|crear|agrega|agregar|registra|registrar)\b.*(usuario|permiso|rol)/,
  /(bloquea|bloquear|desbloquea|desbloquear)\b.*(usuario|cuenta)/,
];

/** Terminos de estado que existen en mas de un modulo con significados
 * distintos (seccion 13) -- si el mensaje queda reducido a uno de estos
 * despues de sacar las palabras de pregunta genericas, hay que preguntar
 * a que modulo se refiere en vez de adivinar. */
const PALABRAS_ESTADO_AMBIGUAS = new Set(['activos', 'activo', 'activas', 'activa', 'disponibles', 'disponible']);
const MODULOS_CON_ESTADO_AMBIGUO = ['personal', 'vehiculos', 'equipos'];
const PATRONES_LIMPIEZA_AMBIGUEDAD = [/^cuant[oa]s\b/, /^que\b/, /\btenemos\b/, /\bhay\b/, /^los\b/, /^las\b/, /^y\b/];

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    // Los signos de apertura en espanol (¿¡) rompen los patrones anclados al
    // inicio del mensaje (^y\s, ^cuant[oa]s, etc.): "¿y activos?" arranca
    // con "¿", no con "y", y esos patrones nunca matchean si no se sacan
    // antes. Se sacan TODOS los signos, no solo los de apertura, para que
    // "che, activos?" tambien limpie bien el final.
    .replace(/[¿?¡!.,;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function coincideAlguno(texto: string, patrones: RegExp[]): boolean {
  return patrones.some((p) => p.test(texto));
}

/** Fusiona los argumentos de una pregunta de seguimiento sobre los de la
 * consulta anterior (secciones 12/23): las claves de `filtros` (y de
 * `_resumen`, su descripcion legible por la misma clave) que el mensaje
 * nuevo SI detecto pisan a las previas, las que no detecto se mantienen.
 * Los tools upgradeados solo incluyen las claves que efectivamente
 * reconocieron -- por eso un spread simple alcanza, sin necesidad de
 * marcar explicitamente "esto no cambio". */
function fusionarArgumentos(previo: Record<string, unknown>, nuevo: Record<string, unknown>): Record<string, unknown> {
  const filtrosPrevios = (previo?.filtros as Record<string, unknown>) ?? {};
  const filtrosNuevos = (nuevo?.filtros as Record<string, unknown>) ?? {};
  const resumenPrevio = (previo?._resumen as Record<string, string>) ?? {};
  const resumenNuevo = (nuevo?._resumen as Record<string, string>) ?? {};
  return {
    ...previo,
    ...nuevo,
    filtros: { ...filtrosPrevios, ...filtrosNuevos },
    _resumen: { ...resumenPrevio, ...resumenNuevo },
    // "¿y activos?" no repite "cuantos", pero tampoco cambio de tipo de
    // pregunta -- si el mensaje nuevo no trae su propia intencion
    // explicita, se hereda la de la consulta anterior en vez de perderla.
    intent: nuevo.intent ?? previo.intent,
  };
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

    // "Quien sos", "quien es (vos)", "quien se cree que es", "tu historia":
    // preguntas sobre la IA misma, no una busqueda de una tercera persona
    // -- se resuelven ANTES de llegar a get_personal (que interpretaria
    // "quien es" como el inicio de una busqueda de un bombero y quedaria
    // esperando un nombre que nunca llega).
    if (coincideAlguno(mensaje, PATRONES_IDENTIDAD)) {
      return { ...sinRespuesta, contenidoRespuesta: this.mensajeIdentidad(config) };
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
    const esPosibleSeguimiento = !!contextoPrevio && coincideAlguno(mensaje, MARCADORES_SEGUIMIENTO);

    // Desambiguacion (seccion 13): un termino de estado suelto ("activos",
    // "disponibles"), sin ninguna palabra propia de un modulo especifico,
    // puede referirse a mas de un tema -- preguntar en vez de adivinar.
    // Nunca se dispara sobre una pregunta de seguimiento ("¿y activos?"):
    // ahi ya sabemos el tema por el contexto previo, no hay nada que
    // desambiguar.
    if (!esPosibleSeguimiento) {
      const preguntaAmbiguedad = this.detectarAmbiguedad(mensaje, herramientasDelModulo);
      if (preguntaAmbiguedad) {
        return { ...sinRespuesta, contenidoRespuesta: this.aplicarTono(preguntaAmbiguedad, config) };
      }
    }

    let herramienta = this.elegirHerramienta(mensaje, herramientasDelModulo);
    let argumentos: Record<string, unknown> | null = null;

    if (herramienta) {
      argumentos = await herramienta.extraerArgumentos(mensaje, mensajeOriginal);
    } else if (esPosibleSeguimiento) {
      // Pregunta de seguimiento (seccion 51): sin match propio, pero hay
      // contexto previo y el mensaje "suena" a continuacion de esa consulta.
      // No se repite ciegamente la consulta anterior: se vuelve a extraer lo
      // que el mensaje nuevo aporta (ej. "y activos" -> estado=ACTIVO) y se
      // fusiona sobre los filtros previos (seccion 12/23) -- asi "¿y
      // activos?" despues de "¿cuantos BC tenemos?" responde BC + activos,
      // no solo BC de nuevo ni solo activos sin el tipo.
      const herramientaPrevia = this.toolsService.buscarPorNombre(contextoPrevio.herramienta) ?? null;
      if (herramientaPrevia) {
        herramienta = herramientaPrevia;
        const nuevosArgumentos = await herramienta.extraerArgumentos(mensaje, mensajeOriginal);
        argumentos = fusionarArgumentos(contextoPrevio.argumentos, nuevosArgumentos);
      }
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
      const prefijoInterpretacion = config.explicarInterpretacion ? this.explicarInterpretacion(herramienta, argumentos) : '';
      return {
        contenidoRespuesta: prefijoInterpretacion + resultado.contenidoRespuesta,
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

  /** Seccion 13 del pedido: no adivinar cuando un termino de estado solo
   * ("activos", "disponibles") puede referirse a mas de un modulo
   * habilitado. Solo dispara si el mensaje, sacando las palabras de
   * pregunta genericas ("cuantos", "que", "tenemos", "hay"), queda
   * reducido a UNA palabra de esa lista -- si trae cualquier otra palabra
   * (ej. "bombero", "vehiculo") ya no es ambiguo, se resuelve normal. */
  private detectarAmbiguedad(mensaje: string, herramientas: AiTool[]): string | null {
    // Sacar signos ANTES de aplicar los patrones anclados al inicio
    // (^cuant[oa]s, ^que...): "¿cuantos" no matchea /^cuant[oa]s/ porque el
    // string arranca con "¿", no con "c".
    let texto = mensaje.replace(/[¿?¡!.,;:]/g, ' ').replace(/\s+/g, ' ').trim();
    for (const p of PATRONES_LIMPIEZA_AMBIGUEDAD) texto = texto.replace(p, ' ');
    texto = texto.replace(/\s+/g, ' ').trim();
    if (!PALABRAS_ESTADO_AMBIGUAS.has(texto)) return null;

    const modulosQueUsanEsteEstado = herramientas.filter((t) => MODULOS_CON_ESTADO_AMBIGUO.includes(t.moduloSlug));
    const slugsDisponibles = [...new Set(modulosQueUsanEsteEstado.map((t) => t.moduloSlug))];
    if (slugsDisponibles.length <= 1) return null;

    return `¿Te referís a ${slugsDisponibles.join(', ')}? Decime el tema y te respondo.`;
  }

  /** Seccion 25 del pedido: cuando esta activo en la configuracion, antepone
   * como se interpreto la consulta. Solo las herramientas actualizadas al
   * nuevo formato devuelven `_resumen` en sus argumentos -- las que todavia
   * no lo tienen simplemente no muestran esta linea (no rompe nada). */
  private explicarInterpretacion(herramienta: AiTool, argumentos: Record<string, unknown>): string {
    const resumen = argumentos._resumen as Record<string, string> | undefined;
    const partes = resumen ? Object.values(resumen) : [];
    if (partes.length === 0) return '';
    const intent = (argumentos.intent as string | undefined) ?? 'CONSULTAR';
    return `Interpreté tu consulta como: ${intent} en ${herramienta.moduloSlug} — ${partes.join(', ')}.\n\n`;
  }

  /** Autopresentacion (seccion "quien sos"/"tu historia"): usa lo que la
   * institucion configuro (descripcion, o el saludo si no hay descripcion)
   * -- nunca un texto fijo en el codigo, porque nada del backend debe
   * asumir el nombre/personaje "Snoopy" (es un valor de configuracion, no
   * una constante). Solo si la institucion no configuro nada cae a un
   * texto generico minimo. */
  private mensajeIdentidad(config: ConfiguracionIa): string {
    if (config.descripcion) return this.aplicarTono(config.descripcion, config);
    if (config.saludo) return this.aplicarTono(config.saludo, config);
    const personaje = config.personaje ? ` (${config.personaje})` : '';
    return this.aplicarTono(`Soy ${config.nombre}${personaje}, el asistente de consulta de SIGBO. Puedo ayudarte a buscar informacion dentro del sistema.`, config);
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
