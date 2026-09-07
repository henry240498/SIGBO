import { Injectable } from '@nestjs/common';
import { ConfiguracionIa } from '../../shared/entities';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { OllamaService } from './ollama/ollama.service';
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
  /** Modelo local de Ollama que ayudo a redactar `contenidoRespuesta`,
   * si alguno -- null en el 100% de las respuestas mientras Ollama este
   * apagado (seccion 18 del pedido de integracion, auditoria). */
  modeloUtilizado: string | null;
}

// Preguntas de seguimiento con posesivo ("¿cual es SU rango?", "¿y SUS
// certificaciones?") en vez del conector "y" (Estabilizacion, seccion 2,
// bug real detectado en vivo): "buscar bombero BC-61" -> "¿cual es su
// rango?" caia en "no entendi" porque ningun marcador de seguimiento
// matcheaba y el patron generico de get_personal exige un nombre/codigo que
// esta segunda pregunta no repite. Solo importa cuando YA hay contexto
// previo (esPosibleSeguimiento exige contextoPrevio ademas de esto), asi
// que ampliar la lista no afecta mensajes sueltos sin conversacion activa.
const MARCADORES_SEGUIMIENTO = [
  /^y\s/, /^ y /, /tambien/, /ademas/, /y (a que hora|quien|cuando|donde|cuanto)/,
  /^(cual|cuales)\s+(es|son)\s+(su|sus)\b/, /^su\s/, /^sus\s/,
];

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
/** "Cuantos anios tenes", "que edad tenes": pregunta de personaje, no una
 * busqueda de una tercera persona -- misma logica que PATRONES_IDENTIDAD. */
const PATRONES_EDAD = [/cuant[oa]s? anos (tenes|tienes)/, /que edad (tenes|tienes)/, /cuando (naciste|te crearon|te activaron)/];
/** Reacciones de confusion, siempre como mensaje COMPLETO (nunca como
 * substring): alguien que no entendio la respuesta anterior escribe "Que",
 * "Como", "Eh" -- sin esto, ese mensaje corto y sin contenido quedaba
 * expuesto a que elegirHerramienta() no matchee nada y, con Ollama activo,
 * a que sugirierHerramienta() le adivine (mal) una herramienta a un
 * mensaje que no tiene ninguna intencion real detras. Se resuelve ANTES
 * de llegar a esa sugerencia, no despues. */
const PATRONES_CONFUSION = [
  // normalizar() ya saco los signos de puntuacion antes de esto -- "¿Que?"
  // llega aca como "que", por eso no hace falta una variante con "?".
  /^que$/, /^como$/, /^eh$/, /^ah$/, /^perdon$/, /^disculpa$/,
  /^que dijiste$/, /^no entendi$/, /^no te entendi$/, /^que cosa$/, /^como asi$/, /^en serio$/, /^enserio$/,
];
// (le|les|lo|los|la|las)? despues de cada verbo: formas coloquiales con
// pronombre atado ("cambiaLE el rango", "borraLO", "aprobaLE") no matcheaban
// -- el \b original exigia un limite de palabra justo despues del verbo
// base, y "cambiale" no lo tiene ahi (sigue en "le", ambos caracteres de
// palabra). Bug real de seguridad detectado en vivo: "cambiale el rango a
// BC-61 a Comandante" no disparaba este bloque y caia en get_personal, que
// por suerte no encontraba coincidencia -- pero la red de seguridad en si
// no estaba actuando, dependia de que la busqueda fallara por accidente.
//
// Prioridad 6 de la correccion post-auditoria: la lista de verbos/sustantivos
// tenia huecos reales -- "rechazar"/"asignar" no estaban en NINGUN grupo, y
// el grupo de creacion solo cubria (usuario|permiso|rol), no servicio/
// guardia/vehiculo/equipo/bombero/documento. Se comparte UNA lista de
// entidades institucionales entre todos los grupos de verbos en vez de que
// cada uno mantenga su propia lista parcial (misma logica de "familia" que
// DISPARADORES_SOLICITUD en ia-tools.service.ts). "poner...como" (ej.
// "ponelo como fuera de servicio") se cubre aparte porque "poner" es
// irregular -- su imperativo con clitico no sigue el patron regular de los
// verbos en -ar (no es "ponale", es "ponle"/"ponelo").
const ENTIDADES_INSTITUCIONALES = 'rango|permiso|usuario|documento|guardia|guardias|servicio|equipo|vehiculo|personal|bombero|cargo|contrasena|password|rol|cuenta|turno|asistencia|finanzas|deposito|articulo|curso|actividad|registro';
// Codigo institucional suelto (BC-61, REGA-5, E-1): referirse a un registro
// puntual por su codigo, sin decir la palabra de la categoria, es tan valido
// como decir "el bombero" o "el vehiculo" -- "Rechaza la solicitud de BC-61"
// no menciona "bombero" en ningun lado.
const PATRON_CODIGO_INSTITUCIONAL = '[a-z]{1,5}-\\d+';
// "aproba(le)"/"denega(le)" (Estabilizacion, seccion 5): el voseo rioplatense/
// paraguayo NO aplica el cambio de raiz de los verbos irregulares en el
// imperativo -- "aprobar" es o->ue en tu-forma ("aprueba") pero el
// imperativo de vos es regular ("aproba"/"aprobá"). Sin la raiz regular,
// "aprobale"/"denegale" no matcheaban ni "aprueba" ni "aprobar" como
// substring (bug real: pedido explicito de probar "aprobale" que no
// coincidia con ningun verbo de la lista).
const VERBOS_CAMBIO_ESTADO = 'cambia|cambiar|modifica|modificar|actualiza|actualizar|edita|editar|pon|pone|ponelo|ponlo|ponele|ponla';
const VERBOS_ELIMINACION = 'elimina|eliminar|borra|borrar|quita|quitar|saca|sacar|da(le)? de baja';
const VERBOS_DECISION = 'aprueba|aproba|aprobar|rechaza|rechazar|autoriza|autorizar|deniega|denega|denegar|firma|firmar';
const VERBOS_CREACION = 'crea|crear|agrega|agregar|registra|registrar|asigna|asignar|reasigna|reasignar|inscribe|inscribir|inscribi';
const VERBOS_ACCESO = 'bloquea|bloquear|desbloquea|desbloquear';
const TODOS_LOS_VERBOS = `${VERBOS_CAMBIO_ESTADO}|${VERBOS_ELIMINACION}|${VERBOS_DECISION}|${VERBOS_CREACION}|${VERBOS_ACCESO}`;
// "inscribime" (Estabilizacion, seccion 5, bug real detectado en vivo): el
// grupo de cliticos original solo cubria le/les/lo/los/la/las (objeto de
// 3ra persona). "me"/"nos" son cliticos de 1ra persona igual de comunes en
// pedidos coloquiales ("inscribime", "avisame") y sin ellos el \b que sigue
// al grupo nunca se cumple a mitad de palabra -- "inscribi" + "me" quedaba
// sin matchear ningun patron.
const CLITICOS = 'le|les|lo|los|la|las|me|nos';

const PATRONES_MODIFICACION = [
  new RegExp(`(${VERBOS_CAMBIO_ESTADO})(${CLITICOS})?\\b.*(${ENTIDADES_INSTITUCIONALES})`),
  new RegExp(`(${VERBOS_ELIMINACION})(${CLITICOS})?\\b.*(${ENTIDADES_INSTITUCIONALES})`),
  // "propuesta" (Estabilizacion, seccion 5, bug real): "aprobale la
  // propuesta de mejora numero 3" y "firma la aprobacion de la propuesta"
  // no matcheaban -- ENTIDADES_INSTITUCIONALES no incluye "propuesta" (las
  // PropuestaMejoraIa son un concepto real del modulo de IA) y la lista
  // extra de VERBOS_DECISION solo tenia gasto/orden/pago/solicitud.
  new RegExp(`(${VERBOS_DECISION})(${CLITICOS})?\\b.*(${ENTIDADES_INSTITUCIONALES}|gasto|orden|pago|solicitud|propuesta)`),
  new RegExp(`(${VERBOS_CREACION})(${CLITICOS})?\\b.*(${ENTIDADES_INSTITUCIONALES})`),
  new RegExp(`(${VERBOS_ACCESO})(${CLITICOS})?\\b.*(usuario|cuenta)`),
  // Cualquier verbo de esta familia seguido de un codigo institucional
  // puntual, tenga o no una palabra de categoria explicita al lado (ej.
  // "Rechaza la solicitud de BC-61", "Asigna a BC-61 a la guardia de mañana").
  new RegExp(`(${TODOS_LOS_VERBOS})(${CLITICOS})?\\b.*\\b${PATRON_CODIGO_INSTITUCIONAL}\\b`),
  // Verbo + clitico SIN ningun objeto explicito (Estabilizacion, seccion 5,
  // pedido explicito de probar "rechazalo" suelto): un pedido tipo
  // "-lo/-la/-le" sin nombrar la categoria ni el codigo igual significa
  // "hacele esto a lo que ya estabamos hablando" -- el clitico es
  // obligatorio aca (a diferencia de los patrones de arriba) y el mensaje
  // se ancla al inicio para no disparar sobre una mencion incidental en
  // medio de una frase mas larga sin relacion.
  new RegExp(`^(${TODOS_LOS_VERBOS})(${CLITICOS})\\b`),
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
 * marcar explicitamente "esto no cambio".
 *
 * `query` (Prioridad 2 de la correccion post-auditoria) es la EXCEPCION
 * deliberada a ese spread simple: es el sujeto puntual de una busqueda por
 * nombre/codigo ("bc-61", "rega-5"), no un filtro mas. Antes, un spread
 * simple dejaba que el `query` del mensaje nuevo pisara siempre al previo
 * -- "Buscar bombero BC-61" -> "¿Y su rango?" perdia "bc-61" por completo
 * porque "rango" (que sobrevivia como unica palabra libre de esa segunda
 * pregunta) lo reemplazaba, y la busqueda quedaba reducida a "rango" sin
 * encontrar a nadie (bug real detectado en vivo). Ahora el `query` del
 * mensaje nuevo solo reemplaza al previo si vino con contenido real -- las
 * herramientas (get_personal/get_vehiculos/get_equipos) ya se encargan de
 * NO devolver ningun `query` cuando lo unico que sobrevive es una palabra
 * de atributo ("rango", "año", "responsable"), justamente para que este
 * fallback conserve el sujeto original en esos casos. */
function fusionarArgumentos(previo: Record<string, unknown>, nuevo: Record<string, unknown>): Record<string, unknown> {
  const filtrosPrevios = (previo?.filtros as Record<string, unknown>) ?? {};
  const filtrosNuevos = (nuevo?.filtros as Record<string, unknown>) ?? {};
  const resumenPrevio = (previo?._resumen as Record<string, string>) ?? {};
  const resumenNuevo = (nuevo?._resumen as Record<string, string>) ?? {};
  const queryNuevo = typeof nuevo.query === 'string' ? nuevo.query.trim() : '';
  return {
    ...previo,
    ...nuevo,
    filtros: { ...filtrosPrevios, ...filtrosNuevos },
    _resumen: { ...resumenPrevio, ...resumenNuevo },
    // "¿y activos?" no repite "cuantos", pero tampoco cambio de tipo de
    // pregunta -- si el mensaje nuevo no trae su propia intencion
    // explicita, se hereda la de la consulta anterior en vez de perderla.
    intent: nuevo.intent ?? previo.intent,
    ...('query' in previo || 'query' in nuevo ? { query: queryNuevo || previo.query || '' } : {}),
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
  constructor(
    private readonly toolsService: IaToolsService,
    private readonly ollamaService: OllamaService,
  ) {}

  async procesar(
    mensajeOriginal: string,
    config: ConfiguracionIa,
    usuario: AuthenticatedUser,
    modulosHabilitados: string[],
    contextoPrevio: ContextoConversacionIa | null,
  ): Promise<RespuestaMotorIa> {
    const mensaje = normalizar(mensajeOriginal);
    const sinRespuesta: RespuestaMotorIa = { contenidoRespuesta: '', fuentes: undefined, herramientaUsada: null, argumentosUsados: null, resultadoHerramienta: null, resumenAuditoria: null, nuevoContexto: contextoPrevio, modeloUtilizado: null };

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
    // nuevoContexto: null (no sinRespuesta.nuevoContexto) en identidad/edad:
    // son una desviacion real de tema, no un contenido sobre el que se pueda
    // seguir preguntando con un tool. Sin este corte, una pregunta de
    // seguimiento como "¿y que dia fue eso?" reactivaba, varios turnos
    // despues, el contexto de una consulta de datos completamente distinta y
    // ya vieja (bug real detectado en vivo: goteaba un conteo de vehiculos
    // de turnos atras como respuesta a una pregunta sobre la fecha de
    // activacion de Snoopy).
    if (coincideAlguno(mensaje, PATRONES_IDENTIDAD)) {
      return { ...sinRespuesta, nuevoContexto: null, contenidoRespuesta: this.mensajeIdentidad(config) };
    }

    if (coincideAlguno(mensaje, PATRONES_EDAD)) {
      return { ...sinRespuesta, nuevoContexto: null, contenidoRespuesta: this.aplicarTono('No tengo edad como las personas -- soy un programa. Si te sirve como respuesta, naci el dia que se activo SIGBO en este cuartel.', config) };
    }

    if (coincideAlguno(mensaje, PATRONES_DESPEDIDA)) {
      return { ...sinRespuesta, contenidoRespuesta: this.aplicarTono('Nos vemos! Cualquier cosa, aca estoy.', config) };
    }

    if (coincideAlguno(mensaje, PATRONES_AGRADECIMIENTO)) {
      return { ...sinRespuesta, contenidoRespuesta: this.aplicarTono('De nada, para eso estoy.', config) };
    }

    const herramientasDisponibles = this.toolsService.herramientasDisponibles(usuario, modulosHabilitados);

    // Reacciones de confusion ("Que", "Como", "Eh"): siempre ANTES de
    // intentar reconocer una herramienta o de pedirle a Ollama que
    // sugiera una -- un mensaje de una sola palabra sin contenido real
    // detras no tiene una intencion que adivinar (seccion detectada en
    // vivo: Ollama llegaba a sugerir get_guardia_actual para un simple
    // "Que", una herramienta sin ninguna relacion).
    // nuevoContexto: null -- misma razon que identidad/edad arriba: confusion
    // ("Que", "Como") es una senal de que el hilo anterior se rompio, no de
    // que haya que seguir construyendo sobre el. Arrastrarlo es lo que
    // permitia que un "y ..." posterior reactivara una consulta vieja y no
    // relacionada.
    if (coincideAlguno(mensaje, PATRONES_CONFUSION)) {
      return { ...sinRespuesta, nuevoContexto: null, contenidoRespuesta: this.mensajeConfusion(config, herramientasDisponibles) };
    }

    if (coincideAlguno(mensaje, PATRONES_AYUDA)) {
      return { ...sinRespuesta, nuevoContexto: null, contenidoRespuesta: this.mensajeAyuda(config, herramientasDisponibles) };
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

    let herramienta: AiTool | null = null;
    let argumentos: Record<string, unknown> | null = null;

    // Prioridad 3 de la correccion post-auditoria: "¿quien es el/la <rol>?"
    // justo despues de consultar una guardia no es una busqueda nueva de
    // persona -- es una pregunta sobre ESA guardia ("¿quien es el oficial a
    // cargo?" despues de "¿quien esta de guardia?"). El patron generico de
    // get_personal (/quien es\b/) siempre gana la carrera de puntaje contra
    // cualquier patron nuevo en get_guardia_actual (empatan en 10, y
    // get_personal se evalua primero en `todas()`) -- por eso se resuelve
    // ACA, antes de que elegirHerramienta() tenga oportunidad de decidir.
    // Solo se activa con contexto de guardia RECIENTE (seccion 3 del pedido:
    // "no quiero que Snoopy arrastre contexto indefinidamente") -- sin ese
    // contexto puntual, el mensaje sigue el camino normal de siempre.
    const matchRolGuardia = mensaje.match(/quien (es|era|sera)( el| la)? ([a-z]+)/);
    const esContextoGuardia = !!contextoPrevio && (contextoPrevio.herramienta === 'get_guardia_actual' || contextoPrevio.herramienta === 'get_guardias');
    if (matchRolGuardia && esContextoGuardia) {
      const herramientaGuardia = this.toolsService.buscarPorNombre('get_guardia_actual') ?? null;
      if (herramientaGuardia) {
        herramienta = herramientaGuardia;
        argumentos = { ...contextoPrevio!.argumentos, rolBuscado: matchRolGuardia[3] };
      }
    }

    // Estabilizacion (seccion 4): "¿y qué grupo/turno es?" sobre una guardia
    // ya consultada -- "grupo" no es un campo propio (verificado contra el
    // modelo real antes de escribir esto: Guardia no tiene columna "grupo",
    // solo `turno`), asi que se responde con el turno real en vez de
    // inventar un concepto nuevo. Mismo criterio de contexto reciente que
    // el caso de "quien es el rol" de arriba.
    if (!herramienta && /que (turno|grupo) es/.test(mensaje) && esContextoGuardia) {
      const herramientaGuardia = this.toolsService.buscarPorNombre('get_guardia_actual') ?? null;
      if (herramientaGuardia) {
        herramienta = herramientaGuardia;
        argumentos = { ...contextoPrevio!.argumentos, modoTurno: true };
      }
    }

    if (herramienta) {
      // Ya resuelto por el caso especial de "quien es el <rol>" de arriba --
      // `argumentos` viene armado con el contexto de la guardia, no hay que
      // volver a extraerlo del mensaje.
    } else if ((herramienta = this.elegirHerramienta(mensaje, herramientasDelModulo))) {
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

    // Ollama como respaldo (seccion 4 del pedido de integracion): solo si
    // el reconocimiento por patrones no encontro NADA. La lista de
    // candidatos es la misma `herramientasDelModulo` que ya usa el
    // reconocimiento por patrones (habilitadas por la institucion, sin
    // filtrar todavia por permiso del usuario) -- asi una sugerencia de
    // Ollama sobre un tema sin permiso sigue cayendo en el mensaje
    // explicito de "no autorizado" mas abajo, nunca en "no entendi".
    // sugerirHerramienta() ya valida que la respuesta sea EXACTAMENTE uno
    // de los nombres de la lista; cualquier otra cosa se descarta sola.
    // Ademas de PATRONES_CONFUSION (que cubre las reacciones cortas mas
    // comunes), esta es una segunda red de seguridad general: un mensaje
    // de una o dos palabras casi no tiene contenido semantico para que ni
    // siquiera un modelo grande elija bien -- no vale la pena arriesgarse
    // a una sugerencia mala por una frase que probablemente ni siquiera
    // estaba en PATRONES_CONFUSION todavia.
    const tieneContenidoSuficiente = mensaje.split(' ').filter(Boolean).length >= 3 || mensaje.length >= 12;

    if (!herramienta && !esPosibleSeguimiento && config.ollamaHabilitado && tieneContenidoSuficiente) {
      const nombreSugerido = await this.ollamaService.sugerirHerramienta(config, mensajeOriginal, herramientasDelModulo.map((t) => t.nombre));
      if (nombreSugerido) {
        const herramientaSugerida = this.toolsService.buscarPorNombre(nombreSugerido);
        // No basta con que Ollama devuelva un nombre de la lista blanca: eso
        // solo prueba que no alucino un nombre inexistente, no que el
        // mensaje tenga relacion real con esa herramienta (bug real
        // detectado en vivo: para "no, que dia se activo SIGBO" -- cero
        // coincidencia de patron o palabra clave con get_personal -- Ollama
        // igual sugirio get_personal, y "activo" matcheo el sinonimo de
        // estado ACTIVO, devolviendo una respuesta de personal totalmente
        // ajena a la pregunta). Ollama solo puede inclinar la balanza hacia
        // un tema que el mensaje ya toca minimamente (aunque sea con una sola
        // palabra clave, por debajo del umbral de 2 de elegirHerramienta),
        // nunca inventar un tema de la nada.
        if (herramientaSugerida && this.tieneRelacionMinima(mensaje, herramientaSugerida)) {
          herramienta = herramientaSugerida;
          argumentos = await herramienta.extraerArgumentos(mensaje, mensajeOriginal);
        }
      }
    }

    if (!herramienta || !argumentos) {
      // nuevoContexto: null -- no entendido tambien corta el hilo (misma
      // razon que identidad/edad/confusion mas arriba): si no se entendio
      // esta pregunta, la siguiente no deberia heredar en silencio el tema de
      // la ULTIMA que si se entendio, que puede ser de varios turnos atras.
      return { ...sinRespuesta, nuevoContexto: null, contenidoRespuesta: this.mensajeNoEntendido(config, herramientasDisponibles) };
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

      // Ollama reformula (seccion 12 del pedido): SOLO recibe el texto que
      // el tool ya redacto y ya paso por autorizacion -- nunca el mensaje
      // original del usuario (mitigacion de prompt injection, seccion 17).
      // Si esta apagado, no disponible o tarda de mas, reformular() ya
      // devuelve el texto sin tocar -- no hace falta un try/catch aca.
      let contenidoFinal = resultado.contenidoRespuesta;
      let modeloUtilizado: string | null = null;
      if (config.ollamaHabilitado) {
        const reformulado = await this.ollamaService.reformular(config, resultado.contenidoRespuesta);
        contenidoFinal = reformulado.texto;
        modeloUtilizado = reformulado.modeloUsado;
      }

      return {
        contenidoRespuesta: prefijoInterpretacion + contenidoFinal,
        fuentes: resultado.fuentes,
        herramientaUsada: herramienta.nombre,
        argumentosUsados: argumentos,
        resultadoHerramienta: 'PERMITIDO',
        resumenAuditoria: resultado.resumenAuditoria,
        nuevoContexto: { herramienta: herramienta.nombre, argumentos },
        modeloUtilizado,
      };
    } catch (error) {
      return {
        contenidoRespuesta: 'Tuve un problema para consultar esa informacion. Probá de nuevo en un momento.',
        herramientaUsada: herramienta.nombre,
        argumentosUsados: argumentos,
        resultadoHerramienta: 'ERROR',
        resumenAuditoria: (error as Error).message?.slice(0, 290) ?? 'Error desconocido',
        nuevoContexto: contextoPrevio,
        modeloUtilizado: null,
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

  /** Chequeo de cordura para la sugerencia de Ollama (ver comentario en el
   * llamador): el mensaje tiene que tocar la herramienta sugerida con AL
   * MENOS una palabra clave o un patron, aunque no alcance el umbral de 2 de
   * elegirHerramienta(). Ollama ayuda a interpretar un fraseo raro de un
   * tema que el mensaje ya menciona -- no elige un tema de la nada. */
  private tieneRelacionMinima(mensaje: string, tool: AiTool): boolean {
    if (tool.patrones.some((p) => p.test(mensaje))) return true;
    return tool.palabrasClave.some((palabra) => mensaje.includes(palabra));
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

  /** Distinto de mensajeNoEntendido(): esto es una reaccion del USUARIO a
   * algo que la IA ya dijo ("Que", "Como"), no una consulta nueva sin
   * reconocer. Se disculpa por la confusion en vez de listar temas como si
   * fuera la primera vez que habla con el usuario. */
  private mensajeConfusion(config: ConfiguracionIa, herramientas: AiTool[]): string {
    if (herramientas.length === 0) {
      return this.aplicarTono('Perdon, no me expliqué bien. ¿Podés repetir tu pregunta de otra forma?', config);
    }
    const temas = [...new Set(herramientas.map((t) => t.moduloSlug))].slice(0, 6);
    return this.aplicarTono(`Perdon, no me expliqué bien. ¿Podés reformular tu pregunta? Puedo ayudarte con: ${temas.join(', ')}.`, config);
  }

  private aplicarTono(texto: string, config: ConfiguracionIa): string {
    if (config.permiteEmojis === false) return texto.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
    return texto;
  }
}
