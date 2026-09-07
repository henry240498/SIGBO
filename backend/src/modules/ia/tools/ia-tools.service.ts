import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ActividadAcademica,
  AsignacionGuardia,
  Bombero,
  CursoExternoCache,
  Equipo,
  Feriado,
  Guardia,
  IdentidadInstitucional,
  InscripcionActividadAcademica,
  MarcacionAsistencia,
  MovimientoFinanciero,
  Parametro,
  Rango,
  Servicio,
  TipoBombero,
  TipoServicio,
  Usuario,
  Vehiculo,
  Articulo,
} from '../../../shared/entities';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { DocumentosService } from '../../documentos/documentos.service';
import { AiTool, ResultadoHerramientaIa } from './ia-tool.interface';
import {
  detectarIntent,
  DISPARADORES_SOLICITUD,
  ESTADO_BOMBERO_SINONIMOS,
  ESTADO_EQUIPO_SINONIMOS,
  ESTADO_VEHICULO_SINONIMOS,
  resolverFechaRelativa,
  resolverSinonimo,
  resolverTipoBombero,
} from './ia-nlu.util';

export const SIN_PERMISO: ResultadoHerramientaIa = {
  contenidoRespuesta: 'No puedo mostrarte esa informacion porque no tenes permisos suficientes para acceder a esos datos.',
  resumenAuditoria: 'Denegado por falta de permiso',
};

function sinResultados(que: string): ResultadoHerramientaIa {
  return { contenidoRespuesta: `No encontre registros de ${que} con esos datos. No tengo esa informacion cargada en SIGBO.`, resumenAuditoria: `Sin resultados (${que})` };
}

// "cuanto/cuanta/cuantos/cuantas" faltaban en esta lista pese a que el resto
// de la familia de interrogativos (que/quien/como/cual/donde/cuando) ya
// estaba -- bug real detectado en vivo: "cuantos bomberos hay" no trae
// ningun filtro estructurado (ni tipo ni estado), y sin CONTAR/LISTAR
// detectado por un filtro, extraerConsulta() dejaba "cuantos" como si fuera
// un nombre a buscar, devolviendo "Hay 0 bomberos que cumplen: Busqueda:
// 'cuantos'" en vez de responder la pregunta real.
const PALABRAS_VACIAS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'en', 'a', 'al', 'para', 'por', 'con', 'sin', 'sobre',
  'que', 'quien', 'quienes', 'como', 'cual', 'cuales', 'donde', 'cuando', 'cuanto', 'cuanta', 'cuantos', 'cuantas', 'hay', 'esta', 'estan', 'tiene', 'tienen',
  'me', 'te', 'se', 'su', 'sus', 'este', 'esta', 'ese', 'esa', 'snoopy', 'porfavor', 'favor', 'decime', 'dime',
  'buscar', 'busca', 'buscame', 'quiero', 'saber', 'informacion', 'info', 'dato', 'datos', 'y', 'o', 'pero',
  'es', 'son', 'del', 'mi', 'tu', 'nos', 'le', 'les', 'podes', 'puedes', 'decir', 'contame', 'muestrame',
  // 'dame' (Estabilizacion, seccion 4/6, bug real detectado en vivo): el
  // disparador compuesto "dame (el|los|la|las) detalle(s)?..." nunca llega
  // a matchear porque el disparador mas simple "detalle(s)? de(l)?" (que va
  // ANTES en la lista de DISPARADORES_SOLICITUD) ya se come "detalle de" y
  // deja "dame" huerfano -- "dame el detalle de los moviles" quedaba
  // buscando literalmente "dame" como si fuera parte del vehiculo, 0
  // resultados pese a haber un movil real. Se lo trata como relleno generico
  // aca, igual que "buscar"/"quiero"/"saber" ya lo son.
  'dame',
]);

/** Saca tildes preservando mayusculas -- los disparadores de extraerConsulta
 * estan escritos sin tilde ("numero de", "informacion de"); sin esto,
 * "número de bombero BC-61" no reconoce "numero de" como disparador (la
 * tilde no matchea) y "número" queda pegado a la consulta, rompiendo la
 * busqueda (termina buscando "numero BC-61" en vez de "BC-61"). */
function quitarAcentos(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Extrae la "consulta libre" de un mensaje: saca las palabras disparadoras
 * dadas y las palabras vacias, conserva el resto (con mayusculas
 * originales -- puede ser un nombre propio). Motor deterministico, no una
 * comprension real del lenguaje: cubre las variantes de fraseo mas
 * comunes, no cualquier parafraseo (ver limitacion documentada).
 *
 * `palabrasAtributo` (Prioridad 2/3 de la correccion post-auditoria):
 * palabras que nombran un ATRIBUTO del sujeto ya establecido en una
 * conversacion ("rango", "año"), no una busqueda nueva -- si se filtran
 * tambien, un seguimiento como "¿y su rango?" despues de "Buscar BC-61"
 * deja la consulta vacia en vez de "rango", y `fusionarArgumentos` (ver
 * ia-motor.service.ts) conserva el sujeto original en vez de perderlo. */
function extraerConsulta(mensajeOriginal: string, disparadores: RegExp[], palabrasAtributo?: Set<string>): string {
  let texto = quitarAcentos(mensajeOriginal);
  for (const d of disparadores) texto = texto.replace(d, ' ');
  const palabras = texto
    .replace(/[¿?¡!.,;:]/g, ' ')
    .split(/\s+/)
    .filter((p) => {
      if (p.length <= 1) return false;
      const norm = normalizarPalabra(p);
      if (PALABRAS_VACIAS.has(norm)) return false;
      if (palabrasAtributo?.has(norm)) return false;
      return true;
    });
  return palabras.join(' ').trim();
}

// Formas plurales incluidas explicitamente -- quitarAcentos()/normalizarPalabra()
// solo sacan tildes y pasan a minusculas, no depluralizan. Sin "anos" (bug
// real detectado en vivo tras agregar solo el singular "ano"): "cuantos
// años tiene el movil" dejaba "anos" (plural) como si fuera parte de la
// busqueda libre, filtrando el vehiculo a 0 resultados en vez de caer en
// la respuesta de antiguedad.
// Para "entre el 1 y el 15 de agosto" (Estabilizacion, seccion 8) -- indice
// 0 = enero, coincide con Date.getMonth().
const MESES_ESPANOL = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const PALABRAS_ATRIBUTO_PERSONAL = new Set(['rango', 'rangos', 'cargo', 'cargos', 'edad', 'edades', 'numero', 'numeros', 'tipo', 'tipos']);
const PALABRAS_ATRIBUTO_VEHICULO = new Set(['ano', 'anos', 'anio', 'anios', 'antiguedad', 'estado', 'estados', 'tipo', 'tipos', 'marca', 'marcas', 'modelo', 'modelos', 'kilometraje', 'ubicacion', 'ubicaciones']);
const PALABRAS_ATRIBUTO_EQUIPO = new Set(['responsable', 'responsables', 'encargado', 'encargados', 'estado', 'estados', 'ubicacion', 'ubicaciones']);

function normalizarPalabra(p: string): string {
  return p
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Registro y ejecucion de las herramientas controladas de Snoopy
 * (secciones 12/45 del pedido): lista blanca fija, cada una verifica
 * permiso ANTES de tocar un repositorio y devuelve solo campos ya
 * minimizados (nunca cedula/telefono/direccion/datos medicos -- seccion
 * 43). Ninguna herramienta modifica datos: todas usan `find`/
 * `createQueryBuilder` de solo lectura. `patrones`/`palabrasClave` son lo
 * que IaMotorService usa para decidir, sin ningun proveedor externo, cual
 * herramienta corresponde a un mensaje en espanol. */
@Injectable()
export class IaToolsService {
  constructor(
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(Guardia) private readonly guardiaRepo: Repository<Guardia>,
    @InjectRepository(AsignacionGuardia) private readonly asignacionRepo: Repository<AsignacionGuardia>,
    @InjectRepository(Servicio) private readonly servicioRepo: Repository<Servicio>,
    @InjectRepository(Vehiculo) private readonly vehiculoRepo: Repository<Vehiculo>,
    @InjectRepository(Equipo) private readonly equipoRepo: Repository<Equipo>,
    @InjectRepository(MarcacionAsistencia) private readonly marcacionRepo: Repository<MarcacionAsistencia>,
    @InjectRepository(ActividadAcademica) private readonly actividadRepo: Repository<ActividadAcademica>,
    @InjectRepository(CursoExternoCache) private readonly cursoExternoRepo: Repository<CursoExternoCache>,
    @InjectRepository(MovimientoFinanciero) private readonly movimientoRepo: Repository<MovimientoFinanciero>,
    @InjectRepository(Articulo) private readonly articuloRepo: Repository<Articulo>,
    @InjectRepository(IdentidadInstitucional) private readonly identidadRepo: Repository<IdentidadInstitucional>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
    @InjectRepository(Rango) private readonly rangoRepo: Repository<Rango>,
    @InjectRepository(TipoBombero) private readonly tipoBomberoRepo: Repository<TipoBombero>,
    @InjectRepository(InscripcionActividadAcademica) private readonly inscripcionRepo: Repository<InscripcionActividadAcademica>,
    @InjectRepository(Feriado) private readonly feriadoRepo: Repository<Feriado>,
    @InjectRepository(TipoServicio) private readonly tipoServicioRepo: Repository<TipoServicio>,
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    private readonly documentosService: DocumentosService,
  ) {}

  private tieneAcceso(usuario: AuthenticatedUser, tool: AiTool): boolean {
    if (!tool.permisoRequerido) return true;
    return usuario.permisos.includes(tool.permisoRequerido);
  }

  /** Herramientas que el usuario podria llegar a usar en esta conversacion:
   * permiso del usuario Y modulo habilitado institucionalmente (seccion 35). */
  herramientasDisponibles(usuario: AuthenticatedUser, modulosHabilitados: string[]): AiTool[] {
    return this.todas().filter((t) => modulosHabilitados.includes(t.moduloSlug) && this.tieneAcceso(usuario, t));
  }

  /** Solo el filtro institucional, SIN el permiso del usuario -- se usa
   * para reconocer la intencion del mensaje (seccion 10: si preguntaste
   * algo claro pero no tenes permiso, la respuesta debe ser "no tenes
   * permiso", no un generico "no entendi"). La autorizacion real se
   * vuelve a verificar antes de ejecutar nada (`autorizada()`). */
  herramientasDelModulo(modulosHabilitados: string[]): AiTool[] {
    return this.todas().filter((t) => modulosHabilitados.includes(t.moduloSlug));
  }

  buscarPorNombre(nombre: string): AiTool | undefined {
    return this.todas().find((t) => t.nombre === nombre);
  }

  /** Verificacion en profundidad: aunque `herramientasDisponibles` ya
   * filtro por permiso al construir la lista candidata, la ejecucion
   * vuelve a verificar (seccion 65: "no confiar en el frontend" aplica
   * igual de fuerte a un filtro previo hecho por el propio backend). */
  autorizada(tool: AiTool, usuario: AuthenticatedUser, modulosHabilitados: string[]): boolean {
    return modulosHabilitados.includes(tool.moduloSlug) && this.tieneAcceso(usuario, tool);
  }

  todas(): AiTool[] {
    return [
      this.getInstitucion(),
      this.getPersonal(),
      this.getGuardiaActual(),
      this.getGuardias(),
      this.getDocumentos(),
      this.getServicios(),
      this.getVehiculos(),
      this.getEquipos(),
      this.getAsistencia(),
      this.getAcademia(),
      this.getMisCursosAcademia(),
      this.getFinanzas(),
      this.getDeposito(),
    ];
  }

  /* ------------------------------------------------------------ */

  private getInstitucion(): AiTool {
    return {
      nombre: 'get_institucion',
      descripcion: 'Nombre y datos de contacto publicos de la institucion (cuartel).',
      moduloSlug: 'organizacion',
      permisoRequerido: null,
      patrones: [
        /nombre.*(instituci|cuartel)/, /(direccion|telefono|contacto|sitio ?web|email).*(instituci|cuartel)/, /donde (estamos|queda|esta) el cuartel/,
        // "info del cuartel" (abreviado, sin "informacion" completa) no
        // matcheaba -- hallazgo real de la auditoria de consolidacion.
        /(informacion|info) (de la|del|sobre (la|el)) (instituci|cuartel)/,
      ],
      palabrasClave: ['institucion', 'cuartel', 'direccion', 'contacto', 'sede', 'sitioweb', 'info'],
      extraerArgumentos: () => ({}),
      ejecutar: async () => {
        const [identidad] = await this.identidadRepo.find({ take: 1 });
        if (!identidad) return sinResultados('la institucion');
        const partes = [`Nombre: ${identidad.nombreInstitucion}`];
        if (identidad.mostrarDireccion && identidad.direccion) partes.push(`Direccion: ${identidad.direccion}`);
        if (identidad.mostrarTelefono && identidad.telefono) partes.push(`Telefono: ${identidad.telefono}`);
        if (identidad.mostrarEmail && identidad.email) partes.push(`Email: ${identidad.email}`);
        if (identidad.mostrarSitioWeb && identidad.sitioWeb) partes.push(`Sitio web: ${identidad.sitioWeb}`);
        return { contenidoRespuesta: partes.join('\n'), resumenAuditoria: 'Identidad institucional' };
      },
    };
  }

  private getPersonal(): AiTool {
    return {
      nombre: 'get_personal',
      descripcion: 'Busca, cuenta o lista personal (bomberos) por nombre, numero de bombero, tipo de bombero, estado, rango o si hace guardias.',
      moduloSlug: 'personal',
      permisoRequerido: 'personal:ver',
      patrones: [
        /quien es\b/, /datos de\b/, /buscar? (bombero|personal)/, /numero de bombero/, /informacion de(l)? bombero/,
        /cuant[oa]s (bomberos?|combatientes?|incorporados?|voluntarios?|fundadores?|honorarios?)/,
        /(bomberos?|combatientes?|incorporados?|fundadores?) (activos?|suspendidos?|retirados?|de licencia)/,
        /hac(e|en) guardias?/,
        // Codigos de tipo de bombero sueltos (seccion 12 del pedido: "¿Cuantos
        // BC tenemos?" debe reconocerse igual que "combatientes", sin la
        // palabra completa) -- \b\b evita falsos positivos con palabras que
        // solo contienen esas letras de casualidad.
        /\b(bcf|bvaf|bva|bc|bi|bh|bj)\b/,
        // Superlativo (Estabilizacion, seccion 7): "quien tiene mas
        // antiguedad" -- conecta personal.bomberos.antiguedad, una columna
        // real ya calculada por la base (verificado antes de usarla).
        /quien tiene mas antiguedad/, /(bombero|persona) con mas antiguedad/,
      ],
      palabrasClave: ['bombero', 'bomberos', 'personal', 'rango', 'cargo', 'combatiente', 'combatientes', 'incorporado', 'incorporados', 'fundador', 'fundadores', 'honorario', 'voluntario', 'antiguedad'],
      extraerArgumentos: async (mensajeNormalizado, original) => {
        if (/mas antiguedad/.test(mensajeNormalizado)) return { superlativoAntiguedad: true };

        const intent = detectarIntent(mensajeNormalizado);
        const filtros: Record<string, unknown> = {};
        const resumen: Record<string, string> = {};

        const tipo = await resolverTipoBombero(mensajeNormalizado, this.tipoBomberoRepo);
        if (tipo) {
          filtros.tipoBomberoId = tipo.id;
          resumen.tipoBomberoId = `Tipo: ${tipo.nombre} (${tipo.prefijo})`;
        }

        const estado = resolverSinonimo(mensajeNormalizado, ESTADO_BOMBERO_SINONIMOS);
        if (estado) {
          filtros.estado = estado;
          resumen.estado = `Estado: ${estado}`;
        }

        if (/hac(e|en) guardias?/.test(mensajeNormalizado)) {
          filtros.realizaGuardias = true;
          resumen.realizaGuardias = 'Hace guardias: si';
        }

        // Busqueda libre por nombre/codigo -- solo si NO se detecto ningun
        // filtro estructurado, para no mezclar "combatientes activos" (dos
        // filtros) con una busqueda de texto que no viene al caso.
        // DISPARADORES_SOLICITUD (Prioridad 4): "detalle de", "dame el
        // detalle de", "mostrame", etc. son la MISMA familia de pedido que
        // "buscar"/"informacion de" -- antes solo esta ultima estaba
        // cubierta y "detalle del bombero BC-61" quedaba con "detalle"
        // pegado a la busqueda, sin encontrar a nadie.
        // PALABRAS_ATRIBUTO_PERSONAL (Prioridad 2/3): si lo unico que queda
        // es una palabra de atributo ("rango", "cargo"), no es una busqueda
        // nueva -- es una pregunta sobre la persona ya establecida en el
        // contexto (fusionarArgumentos en ia-motor conserva el sujeto
        // previo cuando esta consulta vuelve vacia).
        let query = '';
        if (Object.keys(filtros).length === 0) {
          query = extraerConsulta(
            original,
            [...DISPARADORES_SOLICITUD, /quien es/gi, /datos de/gi, /buscar?/gi, /bombero/gi, /personal/gi, /numero de/gi],
            PALABRAS_ATRIBUTO_PERSONAL,
          );
          if (query) resumen.query = `Busqueda: "${query}"`;
        }

        return { intent, filtros, query, _resumen: resumen };
      },
      ejecutar: async (args) => {
        if (args.superlativoAntiguedad) {
          const bombero = await this.bomberoRepo.createQueryBuilder('b').where("b.estado != 'FALLECIDO'").andWhere('b.antiguedad IS NOT NULL').orderBy('b.antiguedad', 'DESC').getOne();
          if (!bombero) return { contenidoRespuesta: 'No tengo datos suficientes para determinarlo.', resumenAuditoria: 'Personal -> superlativo (mas antiguedad) sin datos' };
          return {
            contenidoRespuesta: `${bombero.numeroBombero} - ${bombero.nombre} ${bombero.apellido} tiene la mayor antigüedad: ${bombero.antiguedad} años.`,
            resumenAuditoria: `Personal -> superlativo (mas antiguedad) = ${bombero.numeroBombero} (${bombero.antiguedad})`,
          };
        }

        const filtros = (args.filtros as Record<string, unknown>) ?? {};
        const query = String(args.query ?? '').trim();
        const intent = (args.intent as string) ?? 'LISTAR';

        // intent !== 'CONTAR': un conteo sin filtro ("cuantos bomberos hay")
        // es una pregunta completa y valida por si sola -- la respuesta es
        // el total. Solo LISTAR/DETALLE sin ningun criterio se queda corto
        // (bug real detectado en vivo, ligado al de PALABRAS_VACIAS arriba:
        // antes de agregar "cuantos" a esa lista, esta guarda ni siquiera
        // se activaba porque "cuantos" quedaba como query -- al arreglar
        // eso, "cuantos bomberos hay" pasaba a caer aca y pedir mas datos
        // en vez de responder el total).
        if (intent !== 'CONTAR' && Object.keys(filtros).length === 0 && !query) {
          return { contenidoRespuesta: 'Decime el nombre, numero de bombero, tipo (combatiente, incorporado...) o estado que buscas.', resumenAuditoria: 'Personal -> consulta vacia' };
        }

        const qb = this.bomberoRepo.createQueryBuilder('b').where('b.estado != :fallecido', { fallecido: 'FALLECIDO' });
        if (filtros.tipoBomberoId) qb.andWhere('b.tipoBomberoId = :tipoBomberoId', { tipoBomberoId: filtros.tipoBomberoId });
        if (filtros.estado) qb.andWhere('b.estado = :estadoFiltro', { estadoFiltro: filtros.estado });
        if (filtros.realizaGuardias) qb.andWhere('b.realizaGuardias = 1');

        if (query) {
          // "Henry Martinez" son dos palabras que caen en columnas distintas
          // (nombre="HENRY WALTER", apellido="MARTINEZ CACERES") -- cada
          // palabra debe matchear alguna columna, todas son obligatorias.
          // COLLATE ..._CI_AI: la base es Modern_Spanish_CI_AS (sensible a
          // tildes) -- sin esto no encuentra "MARTINEZ" buscando "Martinez".
          const palabras = query.split(/\s+/).filter((p: string) => p.length > 0);
          palabras.forEach((palabra: string, i: number) => {
            qb.andWhere(
              `(b.nombre COLLATE Modern_Spanish_CI_AI LIKE :q${i} OR b.apellido COLLATE Modern_Spanish_CI_AI LIKE :q${i} OR b.numeroBombero COLLATE Modern_Spanish_CI_AI LIKE :q${i})`,
              { [`q${i}`]: `%${palabra}%` },
            );
          });
        }

        if (intent === 'CONTAR') {
          const total = await qb.getCount();
          const resumen = (args._resumen as Record<string, string>) ?? {};
          const descripcionFiltro = Object.values(resumen).join(', ') || 'todos los bomberos';
          return { contenidoRespuesta: `Hay ${total} bomberos que cumplen: ${descripcionFiltro}.`, resumenAuditoria: `Personal -> conteo (${descripcionFiltro}) = ${total}` };
        }

        const total = await qb.getCount();
        const bomberos = await qb.take(8).getMany();
        if (bomberos.length === 0) return sinResultados('personal');
        const lineas = bomberos.map((b) => `${b.numeroBombero} - ${b.nombre} ${b.apellido} - ${b.rango}${b.cargo ? ` (${b.cargo})` : ''} - ${b.estado}`);
        const nota = total > bomberos.length ? `\n(mostrando ${bomberos.length} de ${total})` : '';
        return { contenidoRespuesta: lineas.join('\n') + nota, resumenAuditoria: `Personal -> listado (${total} resultados)` };
      },
    };
  }

  private getGuardiaActual(): AiTool {
    return {
      nombre: 'get_guardia_actual',
      descripcion: 'La guardia de un dia puntual (hoy por defecto, o la fecha/dia de semana que se pregunte): turno, horario y personal asignado.',
      moduloSlug: 'guardias',
      permisoRequerido: 'guardias:ver',
      patrones: [
        /quien.*(esta|estuvo|estara|anda).*guardia/,
        /guardia (de hoy|actual|de ahora|de manana|de ayer|de anteayer|de pasado manana)/,
        /guardia hoy/,
        /guardia (el|del?|para el|este) (lunes|martes|miercoles|jueves|viernes|sabado|domingo)/,
        /quien.*guardia.*(hoy|manana|pasado manana|ayer|anteayer|lunes|martes|miercoles|jueves|viernes|sabado|domingo)/,
        /a que hora (termina|empieza|entra|sale)/,
        // "¿Quién estará el sábado?" (sin la palabra "guardia" -- hallazgo
        // real de la prueba post-correccion: la pregunta puntual de "Prioridad
        // 1" del pedido no siempre menciona "guardia" explicitamente, se
        // sobreentiende del tema de la conversacion).
        /quien (esta|estuvo|estara|anda)( el| la)? (hoy|manana|pasado manana|ayer|anteayer|lunes|martes|miercoles|jueves|viernes|sabado|domingo)/,
        // "Próxima guardia"/"siguiente guardia" (Estabilizacion, seccion 2):
        // distinto de una fecha puntual -- busca la guardia mas cercana a
        // partir de hoy, sea cual sea la fecha real (no asume que es manana).
        /(proxima|siguiente) guardia/,
      ],
      palabrasClave: ['guardia', 'turno', 'hoy', 'manana', 'ayer', 'anteayer', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo', 'proxima', 'siguiente'],
      // Prioridad 1 (critica) de la correccion post-auditoria: antes esta
      // herramienta no tenia NINGUN argumento (siempre consultaba "hoy" sin
      // importar lo que se preguntara) -- "¿Y mañana?" devolvia la guardia
      // de hoy, una respuesta que suena valida y no lo es. Devuelve {} (sin
      // la clave `fecha`) cuando el mensaje no menciona ninguna referencia
      // temporal -- asi un seguimiento que tampoco menciona fecha nueva NO
      // resetea a hoy la fecha ya establecida en el contexto (fusionarArgumentos
      // en ia-motor solo pisa `fecha` cuando el mensaje nuevo trae una).
      extraerArgumentos: (mensajeNormalizado) => {
        if (/(proxima|siguiente) guardia/.test(mensajeNormalizado)) return { proximaGuardia: true };
        const resuelta = resolverFechaRelativa(mensajeNormalizado);
        return resuelta ? { fecha: resuelta.fecha, etiqueta: resuelta.etiqueta } : {};
      },
      ejecutar: async (args) => {
        const hoyLocal = new Date();
        const fechaHoy = `${hoyLocal.getFullYear()}-${String(hoyLocal.getMonth() + 1).padStart(2, '0')}-${String(hoyLocal.getDate()).padStart(2, '0')}`;
        // rolBuscado (Prioridad 3): solo lo arma ia-motor.service.ts cuando
        // "¿quien es el/la <rol>?" sigue a una guardia recien consultada --
        // filtra el personal ya obtenido por rol en vez de listar todo.
        const rolBuscado = args.rolBuscado ? String(args.rolBuscado).trim() : null;
        // modoTurno (Estabilizacion, seccion 4): "¿y qué turno/grupo es?"
        // sobre la guardia ya consultada -- responde solo el turno, no todo
        // el bloque de personal de nuevo.
        const modoTurno = !!args.modoTurno;

        let fecha: string;
        let etiqueta: string;
        if (args.proximaGuardia) {
          // No asume que es "mañana" -- busca la guardia real mas cercana a
          // partir de hoy (podria ser hoy mismo si todavia no paso, o varios
          // dias despues si hay un hueco en el calendario).
          const proxima = await this.guardiaRepo.createQueryBuilder('g').where('g.fecha >= :hoy', { hoy: fechaHoy }).orderBy('g.fecha', 'ASC').getOne();
          if (!proxima) {
            return { contenidoRespuesta: 'No encuentro ninguna guardia programada a partir de hoy.', resumenAuditoria: 'Guardias -> proxima guardia sin resultados' };
          }
          fecha = proxima.fecha;
          etiqueta = fecha === fechaHoy ? 'hoy' : `el ${fecha}`;
        } else {
          fecha = String(args.fecha ?? fechaHoy);
          etiqueta = args.fecha ? String(args.etiqueta ?? fecha) : 'hoy';
        }

        // createQueryBuilder, no repo.find({where:{fecha}}) -- ese find()
        // con un string plano contra una columna 'date' via TypeORM+mssql no
        // matcheaba NUNCA (bug real detectado en vivo: existian guardias
        // reales para hoy y esto devolvia "no encontre" igual).
        const guardias = await this.guardiaRepo.createQueryBuilder('g').where('g.fecha = :fecha', { fecha }).getMany();
        if (guardias.length === 0) {
          // No inventar una guardia si no existe (seccion "Prioridad 1" del
          // pedido de correccion) -- y si la fecha es un feriado real
          // cargado en organizacion.feriados, se lo menciona: es un dato
          // real conectable, no una suposicion.
          const feriado = await this.feriadoRepo.findOne({ where: { fecha, activo: true } });
          const notaFeriado = feriado ? ` (${feriado.nombre})` : '';
          return {
            contenidoRespuesta: `No encuentro una guardia registrada para ${etiqueta}${notaFeriado}.`,
            resumenAuditoria: `Guardias -> guardia puntual (${etiqueta} = ${fecha}) sin resultados`,
          };
        }

        const bloques: string[] = [];
        let encontroRol = false;
        for (const g of guardias) {
          const asignaciones = await this.asignacionRepo.find({ where: { guardiaId: g.id } });
          const bomberoIds = asignaciones.map((a) => a.bomberoId);
          const bomberos = bomberoIds.length ? await this.bomberoRepo.find({ where: bomberoIds.map((id) => ({ id })) }) : [];
          const nombrePorId = new Map(bomberos.map((b) => [b.id, `${b.nombre} ${b.apellido} (${b.rango})`]));

          if (rolBuscado) {
            const coincidencias = asignaciones.filter((a) => (a.rol ?? '').toLowerCase().includes(rolBuscado.toLowerCase()));
            if (coincidencias.length > 0) {
              encontroRol = true;
              bloques.push(...coincidencias.map((a) => `${a.rol}: ${nombrePorId.get(a.bomberoId) ?? a.bomberoId}`));
            }
            continue;
          }

          if (modoTurno) {
            // "Grupo" no es un campo propio de Guardia (verificado contra el
            // modelo real antes de responder esto) -- se contesta con el
            // turno, que es el dato real mas cercano a lo preguntado.
            bloques.push(`Turno ${g.turno} (${g.horaInicio} a ${g.horaFin}).`);
            continue;
          }

          const personal = asignaciones.map((a) => `${nombrePorId.get(a.bomberoId) ?? a.bomberoId}${a.rol ? ` - ${a.rol}` : ''}`);
          bloques.push(`Turno ${g.turno} (${g.horaInicio} a ${g.horaFin}), estado ${g.estado}. Personal: ${personal.length ? personal.join(', ') : 'sin asignaciones cargadas'}`);
        }

        if (rolBuscado && !encontroRol) {
          return {
            contenidoRespuesta: `No encontré a nadie con el rol "${rolBuscado}" en la guardia de ${etiqueta}.`,
            resumenAuditoria: `Guardias -> rol "${rolBuscado}" sin coincidencias (${fecha})`,
          };
        }

        // Prefijo con la fecha SOLO cuando no es "hoy" (Prioridad 1: la
        // respuesta tiene que dejar clara la fecha a la que corresponde,
        // "porque la respuesta parece valida" aunque sea de otro dia --
        // para "hoy" se mantiene el formato de siempre, sin prefijo).
        const prefijo = etiqueta === 'hoy' || rolBuscado ? '' : `Guardia correspondiente a ${etiqueta}:\n`;
        return {
          contenidoRespuesta: prefijo + bloques.join('\n'),
          resumenAuditoria: `Guardias -> guardia puntual (${etiqueta} = ${fecha})${rolBuscado ? ` rol "${rolBuscado}"` : ''}`,
        };
      },
    };
  }

  private getGuardias(): AiTool {
    return {
      nombre: 'get_guardias',
      descripcion: 'Guardias programadas en un periodo (semana, fin de semana o mes) -- lista turnos o, si se pregunta "quienes", el personal asignado.',
      moduloSlug: 'guardias',
      permisoRequerido: 'guardias:ver',
      patrones: [
        /guardias? (de|para) (esta semana|los proximos|el mes)/, /guardias? del mes/, /proximas guardias/, /calendario de guardias/, /que guardias hay/,
        /guardias? (de |del |para |este )?fin de semana/, /quien(es)?.*(guardia|guardias).*(fin de semana|semana|mes)/,
      ],
      palabrasClave: ['guardias', 'calendario', 'semana', 'proximas', 'programadas', 'finde'],
      extraerArgumentos: (mensajeNormalizado) => {
        const filtros: Record<string, unknown> = {};
        const resumen: Record<string, string> = {};
        const hoy = new Date();

        let desde: Date;
        let hasta: Date;
        if (/fin de semana/.test(mensajeNormalizado)) {
          const dia = hoy.getDay(); // 0=domingo .. 6=sabado
          if (dia === 6 || dia === 0) {
            desde = new Date(hoy);
            hasta = dia === 6 ? new Date(hoy.getTime() + 86400000) : new Date(hoy);
          } else {
            desde = new Date(hoy.getTime() + (6 - dia) * 86400000);
            hasta = new Date(desde.getTime() + 86400000);
          }
          resumen.periodo = 'Periodo: este fin de semana';
        } else if (/(del mes|este mes|el mes)/.test(mensajeNormalizado)) {
          desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
          hasta = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
          resumen.periodo = 'Periodo: este mes';
        } else {
          desde = hoy;
          hasta = new Date(hoy.getTime() + 7 * 86400000);
          resumen.periodo = 'Periodo: proximos 7 dias';
        }
        filtros.desde = desde.toISOString().slice(0, 10);
        filtros.hasta = hasta.toISOString().slice(0, 10);

        const mostrarPersonas = /quien(es)?\b/.test(mensajeNormalizado) || /(personal|bomberos) (de|en) guardia/.test(mensajeNormalizado);
        if (mostrarPersonas) {
          filtros.mostrarPersonas = true;
          resumen.mostrarPersonas = 'Mostrar: personal asignado';
        }

        return { intent: mostrarPersonas ? 'LISTAR' : detectarIntent(mensajeNormalizado), filtros, _resumen: resumen };
      },
      ejecutar: async (args) => {
        const filtros = (args.filtros as Record<string, unknown>) ?? {};
        const desde = String(filtros.desde ?? new Date().toISOString().slice(0, 10));
        const hasta = String(filtros.hasta ?? desde);
        const mostrarPersonas = !!filtros.mostrarPersonas;
        const intent = (args.intent as string) ?? 'LISTAR';

        const guardias = await this.guardiaRepo
          .createQueryBuilder('g')
          .where('g.fecha >= :desde AND g.fecha <= :hasta', { desde, hasta })
          .orderBy('g.fecha', 'ASC')
          .take(60)
          .getMany();
        if (guardias.length === 0) return sinResultados(`guardias entre ${desde} y ${hasta}`);

        if (intent === 'CONTAR' && !mostrarPersonas) {
          return { contenidoRespuesta: `Hay ${guardias.length} guardias programadas entre ${desde} y ${hasta}.`, resumenAuditoria: `Guardias -> conteo ${desde} a ${hasta} = ${guardias.length}` };
        }

        if (mostrarPersonas) {
          const guardiaIds = guardias.map((g) => g.id);
          const asignaciones = guardiaIds.length ? await this.asignacionRepo.createQueryBuilder('a').where('a.guardiaId IN (:...ids)', { ids: guardiaIds }).getMany() : [];
          const bomberoIds = [...new Set(asignaciones.map((a) => a.bomberoId))];
          const bomberos = bomberoIds.length ? await this.bomberoRepo.createQueryBuilder('b').where('b.id IN (:...ids)', { ids: bomberoIds }).getMany() : [];
          const nombrePorId = new Map(bomberos.map((b) => [b.id, `${b.nombre} ${b.apellido} (${b.numeroBombero})`]));
          const asignacionesPorGuardia = new Map<string, string[]>();
          for (const a of asignaciones) {
            const lista = asignacionesPorGuardia.get(a.guardiaId) ?? [];
            lista.push(nombrePorId.get(a.bomberoId) ?? a.bomberoId);
            asignacionesPorGuardia.set(a.guardiaId, lista);
          }
          if (asignaciones.length === 0) return sinResultados(`personal asignado a guardias entre ${desde} y ${hasta}`);
          const bloques = guardias.map((g) => {
            const personal = asignacionesPorGuardia.get(g.id) ?? [];
            return personal.length ? `${g.fecha} (Turno ${g.turno}): ${personal.join(', ')}` : null;
          }).filter((b): b is string => !!b);
          return { contenidoRespuesta: bloques.join('\n'), resumenAuditoria: `Guardias -> personal asignado ${desde} a ${hasta}` };
        }

        const lineas = guardias.map((g) => `${g.fecha} - Turno ${g.turno} (${g.horaInicio}-${g.horaFin}) - ${g.estado}`);
        return { contenidoRespuesta: lineas.join('\n'), resumenAuditoria: `Guardias -> listado ${desde} a ${hasta}` };
      },
    };
  }

  private getDocumentos(): AiTool {
    return {
      nombre: 'get_documentos',
      descripcion: 'Busca documentos institucionales (reglamentos, resoluciones, manuales, protocolos) disponibles para consulta.',
      moduloSlug: 'documentos',
      permisoRequerido: 'documentos:ver',
      patrones: [/reglamento/, /resolucion/, /manual/, /protocolo/, /normativa/, /donde (esta|encuentro|consigo) el (reglamento|documento|manual|protocolo)/, /buscar documento/],
      palabrasClave: ['documento', 'documentos', 'reglamento', 'resolucion', 'manual', 'protocolo', 'normativa'],
      extraerArgumentos: (_n, original) => ({ query: extraerConsulta(original, [...DISPARADORES_SOLICITUD, /donde (esta|encuentro|consigo)/gi, /buscar/gi, /quiero ver/gi]) }),
      ejecutar: async (args, usuario) => {
        const query = String(args.query ?? '').trim();
        if (!query) return { contenidoRespuesta: 'Decime que documento, reglamento o resolucion estas buscando.', resumenAuditoria: 'Documentos -> consulta vacia' };
        const documentos = await this.documentosService.buscarParaIa(query, usuario.permisos);
        if (documentos.length === 0) {
          return { contenidoRespuesta: 'No encontre ningun documento disponible con ese criterio. No tengo esa informacion cargada en SIGBO.', resumenAuditoria: `Documentos -> busqueda "${query}" sin resultados` };
        }
        const fuentes = documentos.map((d) => ({ documentoId: d.id, titulo: d.titulo, numeroDocumental: d.numeroDocumental, enlace: `/dashboard/documentos/${d.id}` }));
        const lineas = documentos.map((d) => `${d.numeroDocumental ? `${d.numeroDocumental} - ` : ''}${d.titulo}`);
        return {
          contenidoRespuesta: `Encontre estos documentos:\n${lineas.join('\n')}`,
          resumenAuditoria: `Documentos -> busqueda "${query}" (${documentos.length} resultados)`,
          fuentes,
        };
      },
    };
  }

  private getServicios(): AiTool {
    return {
      nombre: 'get_servicios',
      descripcion: 'Cuenta y resume los servicios/intervenciones registrados en un rango de fechas (un dia puntual si se menciona, o el mes actual por defecto).',
      moduloSlug: 'servicios',
      permisoRequerido: 'servicios:ver',
      patrones: [
        /cuantos servicios/, /servicios (de este mes|del mes|de hoy|de ayer|de anteayer)/, /estadisticas? de servicios/, /cuantas intervenciones/,
        // "Que servicios hubo/tuvimos/hay" (Estabilizacion, seccion 8): forma
        // tan natural como "cuantos servicios" pero sin la palabra "cuantos"
        // -- bug real detectado en vivo, "¿Que servicios hubo ayer?" (ejemplo
        // explicito del pedido) no matcheaba ningun patron propio y quedaba
        // en 1 solo punto de palabra clave ("servicios"), por debajo del
        // umbral de 2 de elegirHerramienta().
        /(que|cuales) servicios (hubo|tuvimos|hay|hubieron)/,
        // Estabilizacion, seccion 8: ultimo servicio / rango explicito / tipo.
        /(ultimo|mas reciente) servicio/, /servicio mas reciente/,
        // "hubo" opcional (Estabilizacion, seccion 8, bug real): el ejemplo
        // exacto del pedido es "¿Que servicios hubo entre el 1 y el 15 de
        // agosto?" -- con "hubo" en el medio, "servicios entre" ya no son
        // palabras contiguas y el patron original nunca matcheaba.
        /servicios (hubo )?entre el? \d{1,2}.*\d{1,2} de \w+/,
        /cuant[oa]s (incendios|rescates|accidentes)/,
      ],
      palabrasClave: ['servicios', 'intervencion', 'intervenciones', 'emergencias', 'salidas', 'ultimo', 'reciente', 'incendio', 'incendios'],
      // Prioridad 5 de la correccion post-auditoria: antes SIEMPRE calculaba
      // "este mes" sin importar la pregunta -- "¿que servicios tuvimos
      // ayer?" hubiera respondido sobre el mes entero etiquetado como si
      // fuera la respuesta a "ayer". Reusa el mismo resolverFechaRelativa
      // de get_guardia_actual para un dia puntual; sin fecha explicita seguir
      // sin cambios (mes actual, igual que siempre).
      //
      // Estabilizacion, seccion 8: "ultimo servicio"/"mas reciente" (modo
      // aparte, no es un resumen sino un detalle puntual), rango explicito
      // "entre el X y el Y de <mes>" (parser propio, distinto de
      // resolverFechaRelativa porque es un RANGO, no un dia), y tipo real
      // ("cuantos incendios hubo" -> se resuelve contra
      // servicios.tipos_servicio.nombre, nunca contra un texto inventado --
      // si el tipo preguntado no existe en el catalogo real, se responde
      // honestamente que no hay datos, no se inventa un numero).
      extraerArgumentos: async (mensajeNormalizado, original) => {
        if (/(ultimo|mas reciente) servicio|servicio mas reciente/.test(mensajeNormalizado)) return { modo: 'ultimo' };

        const matchRango = mensajeNormalizado.match(/entre el? (\d{1,2})\s*(?:y|al?)\s*(?:el )?(\d{1,2}) de (\w+)/);
        if (matchRango) {
          const mes = MESES_ESPANOL.indexOf(matchRango[3]);
          if (mes >= 0) {
            const anioActual = new Date().getFullYear();
            const diaDesde = String(matchRango[1]).padStart(2, '0');
            const diaHasta = String(matchRango[2]).padStart(2, '0');
            const mesStr = String(mes + 1).padStart(2, '0');
            return {
              desde: `${anioActual}-${mesStr}-${diaDesde}`,
              hasta: `${anioActual}-${mesStr}-${diaHasta}`,
              etiqueta: `entre el ${matchRango[1]} y el ${matchRango[2]} de ${matchRango[3]}`,
            };
          }
        }

        const resuelta = resolverFechaRelativa(mensajeNormalizado);
        // Si ya se resolvio un dia puntual ("hoy", "ayer", ...), el texto
        // sobrante NO se interpreta como un tipo de servicio (Estabilizacion,
        // seccion 8, bug real detectado en vivo): "cuantos servicios hubo
        // hoy" dejaba "hoy" como si fuera un tipo buscado, y como ningun tipo
        // real se llama "hoy", pisaba la fecha ya resuelta con un falso
        // "no tengo un tipo de servicio registrado como 'hoy'". Ninguno de
        // los casos pedidos combina tipo + fecha relativa en la misma
        // pregunta, asi que priorizar la fecha resuelta es seguro.
        if (resuelta) return { desde: resuelta.fecha, hasta: resuelta.fecha, etiqueta: resuelta.etiqueta };

        // Tipo real de servicio (ej. "incendios"), solo si sobrevive algo
        // despues de sacar las palabras genericas de esta consulta.
        const query = extraerConsulta(original, [...DISPARADORES_SOLICITUD, /cuant[oa]s/gi, /servicios?/gi, /intervenciones?/gi, /hubo/gi, /este mes/gi, /del mes/gi]);
        if (query) {
          // Coincidencia por palabra (AND), no por substring exacto
          // (Estabilizacion, seccion 8, bug real): PALABRAS_VACIAS le saca
          // "de" a la consulta libre, pero el unico tipo real cargado se
          // llama "Comunicacion DE otras ocurrencias" -- un LIKE con el
          // texto contiguo sin "de" nunca matchea contra un nombre que SI
          // tiene "de" en el medio. Igual criterio que la busqueda
          // multi-palabra de get_vehiculos/get_equipos.
          const palabras = query.split(/\s+/).filter((p) => p.length > 0);
          const qbTipo = this.tipoServicioRepo.createQueryBuilder('t');
          palabras.forEach((palabra, i) => qbTipo.andWhere(`t.nombre COLLATE Modern_Spanish_CI_AI LIKE :tq${i}`, { [`tq${i}`]: `%${palabra}%` }));
          const tipo = await qbTipo.getOne();
          if (tipo) return { tipoServicioId: tipo.id, tipoNombre: tipo.nombre };
          // El tipo preguntado no existe en el catalogo real -- se marca
          // explicitamente para responder "no tengo esa informacion" en vez
          // de ejecutar sin filtro y mostrar el total general por error.
          return { tipoInexistente: query };
        }
        return {};
      },
      ejecutar: async (args) => {
        if (args.tipoInexistente) {
          return { contenidoRespuesta: `No tengo un tipo de servicio registrado como "${args.tipoInexistente}". No tengo esa informacion cargada en SIGBO.`, resumenAuditoria: `Servicios -> tipo "${args.tipoInexistente}" inexistente` };
        }

        if (args.modo === 'ultimo') {
          const ultimo = await this.servicioRepo.createQueryBuilder('s').orderBy('s.fechaHoraAviso', 'DESC').getOne();
          if (!ultimo) return sinResultados('servicios');
          const fechaTexto = new Date(ultimo.fechaHoraAviso).toLocaleString('es-PY');
          return {
            contenidoRespuesta: `El último servicio fue el ${fechaTexto} en ${ultimo.direccion}${ultimo.ciudad ? `, ${ultimo.ciudad}` : ''} -- gravedad ${ultimo.gravedad ?? 'sin clasificar'}, estado ${ultimo.estado}.`,
            resumenAuditoria: `Servicios -> ultimo servicio (${ultimo.numeroServicio})`,
          };
        }

        const ahora = new Date();
        const desdeDefault = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-01`;
        const hastaDefault = ahora.toISOString().slice(0, 10);
        const desde = String(args.desde ?? desdeDefault);
        const hasta = String(args.hasta ?? hastaDefault);
        const etiqueta = args.etiqueta ? String(args.etiqueta) : 'este mes';
        const qb = this.servicioRepo.createQueryBuilder('s').where('s.fechaHoraAviso >= :desde AND s.fechaHoraAviso <= :hasta', { desde: `${desde}T00:00:00`, hasta: `${hasta}T23:59:59` });
        if (args.tipoServicioId) qb.andWhere('s.tipoServicioId = :tipoServicioId', { tipoServicioId: args.tipoServicioId });
        const servicios = await qb.getMany();
        const etiquetaConTipo = args.tipoNombre ? `${etiqueta} (${args.tipoNombre})` : etiqueta;
        if (servicios.length === 0) return sinResultados(`servicios ${etiquetaConTipo}`);
        const porGravedad = new Map<string, number>();
        for (const s of servicios) porGravedad.set(s.gravedad ?? 'SIN_CLASIFICAR', (porGravedad.get(s.gravedad ?? 'SIN_CLASIFICAR') ?? 0) + 1);
        const resumen = [...porGravedad.entries()].map(([g, c]) => `${g}: ${c}`).join(', ');
        const introduccion = etiqueta === 'este mes' ? 'Este mes' : `Para ${etiqueta}`;
        const notaTipo = args.tipoNombre ? ` de tipo "${args.tipoNombre}"` : '';
        return { contenidoRespuesta: `${introduccion} hubo ${servicios.length} servicios${notaTipo}. Por gravedad: ${resumen}.`, resumenAuditoria: `Servicios -> resumen ${desde} a ${hasta} (${servicios.length})` };
      },
    };
  }

  private getVehiculos(): AiTool {
    return {
      nombre: 'get_vehiculos',
      descripcion: 'Lista o cuenta vehiculos/moviles filtrando por estado (disponible, fuera de servicio, en mantenimiento, de baja).',
      moduloSlug: 'vehiculos',
      permisoRequerido: 'vehiculos:ver',
      patrones: [
        /(que|cuales) (moviles|vehiculos) (estan|hay) disponibles/, /estado de(l)? (movil|vehiculo)/, /moviles disponibles/, /vehiculos disponibles/,
        /(moviles|vehiculos) fuera de servicio/, /(moviles|vehiculos) en mantenimiento/, /cuant[oa]s (moviles|vehiculos)/,
        // Busqueda por alias (Cierre de Snoopy, seccion 2): "que movil es
        // Murita", "donde esta el movil Murita" -- mencionan "movil" pero no
        // ninguno de los disparadores genericos (sabes/detalle/etc), asi que
        // necesitan su propio patron. "buscar vehiculo" -- mismo criterio
        // que /buscar? (bombero|personal)/ de get_personal, faltaba el
        // equivalente para vehiculos.
        /que (movil|vehiculo) es/, /donde esta (el |la )?(movil|vehiculo)/, /buscar (movil|vehiculo)/,
        // Antiguedad de una unidad puntual ("cuantos anos tiene el movil",
        // "de que ano es ese vehiculo") -- distinta de "cuantos vehiculos hay":
        // sin un patron propio, el peso de "movil"/"vehiculo" como palabra
        // clave sola (+1) no llega al umbral de elegirHerramienta() y la
        // pregunta quedaba sin reconocer salvo por seguimiento/Ollama.
        /cuant[oa]s anos tiene (el|ese|un|los) (movil|moviles|vehiculo|vehiculos)/,
        /(que edad|antiguedad) tiene (el|ese|un) (movil|vehiculo)/,
        /de que ano es (el|ese|un) (movil|vehiculo)/,
        // Busqueda por nombre/codigo puntual (Prioridad 5 de la correccion
        // post-auditoria: get_vehiculos no tenia forma de buscar un
        // vehiculo especifico por nombre, asimetria real contra
        // get_personal/get_equipos/get_deposito que si la tienen). "sabes"
        // agregado en Estabilizacion (seccion 10): "¿Que sabes del movil
        // REGA 5?" es un ejemplo explicito del pedido y no matcheaba porque
        // la lista original no incluia el verbo "saber".
        /(detalle|detalles|informacion|datos|mostrame|muestrame|sabes).*(movil|vehiculo)/,
        // Busqueda por codigo suelto, SIN la palabra "movil"/"vehiculo"
        // (Estabilizacion, seccion 10, ejemplo explicito del pedido: "¿Que
        // sabes de REGA 5?"). Misma convencion que PATRON_CODIGO_INSTITUCIONAL
        // en ia-motor.service.ts: letras + numero, con o sin guion/espacio.
        /(que sabes de|detalle(s)? de(l)?|informacion (de(l)?|sobre)|mostrame|muestrame|decime (sobre|de))\s+(el |la )?[a-z]{2,8}[\s-]\d{1,4}\b/,
        // Superlativos (Estabilizacion, seccion 7): comparacion real entre
        // TODOS los vehiculos, no de uno puntual -- distinto de ANTIGUEDAD.
        /(cual|que movil|que vehiculo).*(mas|menos) (antigu|kilometr|km|nuevo|nueva)/,
        /movil mas (antigu|nuevo)/, /vehiculo mas (antigu|nuevo)/,
      ],
      palabrasClave: ['vehiculo', 'vehiculos', 'movil', 'moviles', 'camion', 'ambulancia', 'antiguo', 'kilometraje', 'kilometros'],
      extraerArgumentos: (mensajeNormalizado, original) => {
        // Superlativos primero: comparten vocabulario con ANTIGUEDAD
        // ("años", "antiguedad") pero son una pregunta distinta (el extremo
        // entre TODOS los vehiculos, no de una unidad puntual).
        let superlativo: { campo: 'anio' | 'kilometrajeActual'; orden: 'ASC' | 'DESC'; etiqueta: string } | null = null;
        if (/mas (kilometr|km)/.test(mensajeNormalizado)) superlativo = { campo: 'kilometrajeActual', orden: 'DESC', etiqueta: 'con más kilometraje' };
        else if (/menos (kilometr|km)/.test(mensajeNormalizado)) superlativo = { campo: 'kilometrajeActual', orden: 'ASC', etiqueta: 'con menos kilometraje' };
        else if (/mas antigu/.test(mensajeNormalizado)) superlativo = { campo: 'anio', orden: 'ASC', etiqueta: 'más antiguo' };
        else if (/menos antigu|mas nuev/.test(mensajeNormalizado)) superlativo = { campo: 'anio', orden: 'DESC', etiqueta: 'más nuevo' };
        if (superlativo) return { superlativo };

        const intent = detectarIntent(mensajeNormalizado);
        const filtros: Record<string, unknown> = {};
        const resumen: Record<string, string> = {};
        const estado = resolverSinonimo(mensajeNormalizado, ESTADO_VEHICULO_SINONIMOS);
        if (estado) {
          filtros.estado = estado;
          resumen.estado = `Estado: ${estado}`;
        }
        // Igual criterio que get_personal: PALABRAS_ATRIBUTO_VEHICULO evita
        // que "¿y que año tiene?" (seguimiento sobre un vehiculo ya
        // buscado) se interprete como una busqueda nueva por la palabra
        // "año" -- fusionarArgumentos en ia-motor conserva el vehiculo del
        // contexto cuando esta consulta vuelve vacia.
        let query = '';
        if (!estado) {
          query = extraerConsulta(original, [...DISPARADORES_SOLICITUD, /movil(es)?/gi, /vehiculo(s)?/gi, /buscar/gi], PALABRAS_ATRIBUTO_VEHICULO);
          if (query) resumen.query = `Busqueda: "${query}"`;
        }
        return { intent, filtros, query, _resumen: resumen };
      },
      ejecutar: async (args) => {
        if (args.superlativo) {
          const { campo, orden, etiqueta } = args.superlativo as { campo: 'anio' | 'kilometrajeActual'; orden: 'ASC' | 'DESC'; etiqueta: string };
          const vehiculos = await this.vehiculoRepo.createQueryBuilder('v').where(`v.${campo} IS NOT NULL`).orderBy(`v.${campo}`, orden).getMany();
          if (vehiculos.length === 0) return { contenidoRespuesta: 'No tengo datos suficientes para determinarlo.', resumenAuditoria: `Vehiculos -> superlativo (${etiqueta}) sin datos` };
          const v = vehiculos[0];
          const valorTexto = campo === 'anio' ? `del año ${v.anio}` : `con ${v.kilometrajeActual} km`;
          return { contenidoRespuesta: `El vehículo ${etiqueta} es ${v.numeroInterno} (${valorTexto}).`, resumenAuditoria: `Vehiculos -> superlativo (${etiqueta}) = ${v.numeroInterno}` };
        }

        const filtros = (args.filtros as Record<string, unknown>) ?? {};
        const query = String(args.query ?? '').trim();
        const intent = (args.intent as string) ?? 'LISTAR';
        const qb = this.vehiculoRepo.createQueryBuilder('v').orderBy('v.numeroInterno', 'ASC');
        if (filtros.estado) qb.andWhere('v.estado = :estado', { estado: filtros.estado });
        if (query) {
          const palabras = query.split(/\s+/).filter((p: string) => p.length > 0);
          palabras.forEach((palabra: string, i: number) => {
            qb.andWhere(
              // "alias" (migracion 075, fase de cierre): "Murita" ahora
              // resuelve contra un campo real, no un texto adivinado.
              `(v.numeroInterno COLLATE Modern_Spanish_CI_AI LIKE :q${i} OR v.alias COLLATE Modern_Spanish_CI_AI LIKE :q${i} OR v.tipo COLLATE Modern_Spanish_CI_AI LIKE :q${i} OR v.marca COLLATE Modern_Spanish_CI_AI LIKE :q${i})`,
              { [`q${i}`]: `%${palabra}%` },
            );
          });
        }

        // "Cuantos anos tiene el movil" (bug real detectado en vivo, seccion
        // de adenda): antes esto caia en CONTAR por la palabra suelta
        // "cuantos" y devolvia el total de vehiculos, sin relacion con lo
        // preguntado. La pregunta SI tiene una respuesta real -- vehiculos.anio
        // existe -- pero solo tiene sentido sobre UNA unidad puntual: si hay
        // mas de una, se pregunta cual en vez de adivinar (misma logica que
        // detectarAmbiguedad en ia-motor).
        if (intent === 'ANTIGUEDAD') {
          const vehiculos = await qb.getMany();
          if (vehiculos.length === 0) return sinResultados('vehiculos');
          if (vehiculos.length > 1) {
            const unidades = vehiculos.map((v) => v.numeroInterno).join(', ');
            return { contenidoRespuesta: `Tengo mas de un movil registrado (${unidades}). ¿De cual queres saber la antiguedad?`, resumenAuditoria: 'Vehiculos -> antiguedad (ambiguo, mas de una unidad)' };
          }
          const v = vehiculos[0];
          const etiquetaVehiculo = v.alias ? `${v.numeroInterno} (${v.alias})` : v.numeroInterno;
          if (!v.anio) return { contenidoRespuesta: `No tengo el año registrado para ${etiquetaVehiculo}.`, resumenAuditoria: `Vehiculos -> antiguedad ${v.numeroInterno} (sin dato)` };
          const antiguedad = new Date().getFullYear() - v.anio;
          return { contenidoRespuesta: `${etiquetaVehiculo} es del año ${v.anio}, tiene ${antiguedad} años.`, resumenAuditoria: `Vehiculos -> antiguedad ${v.numeroInterno} = ${antiguedad} anios (${v.anio})` };
        }

        if (intent === 'CONTAR') {
          const total = await qb.getCount();
          const plural = total === 1 ? 'vehiculo' : 'vehiculos';
          // "todos los estados" reformulado por un LLM se lee como "distribuido
          // en cada estado" en vez de "sin filtrar por estado" -- se evita la
          // ambiguedad de origen en vez de confiar en que la reformulacion la
          // resuelva bien.
          const contenidoRespuesta = filtros.estado
            ? `Hay ${total} ${plural} en estado ${filtros.estado}.`
            : `Hay ${total} ${plural} registrados en total.`;
          const descripcionAuditoria = filtros.estado ? `estado ${filtros.estado}` : 'sin filtro de estado';
          return { contenidoRespuesta, resumenAuditoria: `Vehiculos -> conteo (${descripcionAuditoria}) = ${total}` };
        }

        const vehiculos = await qb.take(30).getMany();
        if (vehiculos.length === 0) return sinResultados('vehiculos');
        const lineas = vehiculos.map((v) => `${v.numeroInterno}${v.alias ? ` (${v.alias})` : ''} - ${v.tipo}${v.marca ? ` ${v.marca}` : ''} - ${v.estado}${v.ubicacionActual ? ` - ${v.ubicacionActual}` : ''}`);
        return { contenidoRespuesta: lineas.join('\n'), resumenAuditoria: `Vehiculos -> listado (${vehiculos.length})` };
      },
    };
  }

  private getEquipos(): AiTool {
    return {
      nombre: 'get_equipos',
      descripcion: 'Busca equipos por codigo/nombre, o lista/cuenta por estado (prestado, disponible, en mantenimiento, danado, de baja).',
      moduloSlug: 'equipos',
      permisoRequerido: 'equipos:ver',
      patrones: [
        /donde esta el equipo/, /estado del equipo/, /buscar equipo/, /(que |cuales |cuant[oa]s )?equipos? (estan |hay )?(prestados?|disponibles?|en mantenimiento|danados?|de baja)/,
        // "¿Quién tiene ese equipo?" (Prioridad 5, conecta equipos.responsable_id
        // -- dato real, no inventado, ver comentario en ejecutar()).
        /quien tiene (el|ese|este) equipo/, /quien (lo tiene|esta a cargo del equipo)/,
        // Superlativo (Estabilizacion, seccion 7): equipo mas antiguo por
        // fecha de compra real -- si no esta cargada, se responde "no tengo
        // datos suficientes", nunca se inventa.
        /equipo mas (antigu|viejo)/,
      ],
      palabrasClave: ['equipo', 'equipos', 'prestado', 'prestados', 'antiguo'],
      extraerArgumentos: (mensajeNormalizado, original) => {
        if (/equipo mas (antigu|viejo)/.test(mensajeNormalizado)) return { superlativoAntiguedad: true };

        const intent = detectarIntent(mensajeNormalizado);
        const filtros: Record<string, unknown> = {};
        const resumen: Record<string, string> = {};
        const estado = resolverSinonimo(mensajeNormalizado, ESTADO_EQUIPO_SINONIMOS);
        if (estado) {
          filtros.estado = estado;
          resumen.estado = `Estado: ${estado}`;
        }
        // PALABRAS_ATRIBUTO_EQUIPO: "¿quién tiene ese equipo?" sobre un
        // equipo ya buscado no es una busqueda nueva -- fusionarArgumentos
        // en ia-motor conserva el equipo del contexto cuando esta consulta
        // vuelve vacia (mismo criterio que personal/vehiculos).
        let query = '';
        if (!estado) {
          query = extraerConsulta(original, [...DISPARADORES_SOLICITUD, /donde esta/gi, /estado del?/gi, /buscar/gi, /equipo(s)?/gi, /quien (lo )?tiene/gi], PALABRAS_ATRIBUTO_EQUIPO);
          if (query) resumen.query = `Busqueda: "${query}"`;
        }
        return { intent, filtros, query, _resumen: resumen };
      },
      ejecutar: async (args) => {
        if (args.superlativoAntiguedad) {
          const equipos = await this.equipoRepo.createQueryBuilder('e').where('e.fechaCompra IS NOT NULL').orderBy('e.fechaCompra', 'ASC').getMany();
          if (equipos.length === 0) return { contenidoRespuesta: 'No tengo datos suficientes para determinarlo.', resumenAuditoria: 'Equipos -> superlativo (mas antiguo) sin datos' };
          const e = equipos[0];
          return { contenidoRespuesta: `El equipo más antiguo es ${e.codigoInterno} - ${e.nombre} (comprado el ${e.fechaCompra}).`, resumenAuditoria: `Equipos -> superlativo (mas antiguo) = ${e.codigoInterno}` };
        }

        const filtros = (args.filtros as Record<string, unknown>) ?? {};
        const query = String(args.query ?? '').trim();
        const intent = (args.intent as string) ?? 'LISTAR';

        // intent !== 'CONTAR': mismo criterio que get_personal (ver
        // comentario ahi) -- "cuantos equipos hay" sin filtro es una
        // pregunta completa (el total), no le falta informacion.
        if (intent !== 'CONTAR' && !filtros.estado && !query) {
          return { contenidoRespuesta: 'Decime el codigo, nombre o estado (prestado, disponible...) del equipo que buscas.', resumenAuditoria: 'Equipos -> consulta vacia' };
        }

        const qb = this.equipoRepo.createQueryBuilder('e');
        if (filtros.estado) qb.andWhere('e.estado = :estado', { estado: filtros.estado });
        if (query) qb.andWhere('(e.codigoInterno COLLATE Modern_Spanish_CI_AI LIKE :q OR e.nombre COLLATE Modern_Spanish_CI_AI LIKE :q)', { q: `%${query}%` });

        if (intent === 'CONTAR') {
          const total = await qb.getCount();
          const descripcion = filtros.estado ? `estado ${filtros.estado}` : query ? `"${query}"` : 'sin filtro';
          const contenidoRespuesta = filtros.estado || query ? `Hay ${total} equipos con ${descripcion}.` : `Hay ${total} equipos registrados en total.`;
          return { contenidoRespuesta, resumenAuditoria: `Equipos -> conteo (${descripcion}) = ${total}` };
        }

        const equipos = await qb.take(20).getMany();
        if (equipos.length === 0) return sinResultados('equipos');
        // Responsable (Prioridad 5): equipos.equipos.responsable_id es un
        // campo real -- se conecta a Bombero para responder "¿quién tiene
        // ese equipo?" en vez de dejarlo sin cubrir. No se inventa nada: si
        // no hay responsable cargado, la linea simplemente no lo menciona.
        const responsableIds = [...new Set(equipos.map((e) => e.responsableId).filter((id): id is string => !!id))];
        const responsables = responsableIds.length ? await this.bomberoRepo.createQueryBuilder('b').where('b.id IN (:...ids)', { ids: responsableIds }).getMany() : [];
        const nombreResponsablePorId = new Map(responsables.map((b) => [b.id, `${b.nombre} ${b.apellido}`]));
        const lineas = equipos.map((e) => {
          const responsable = e.responsableId ? nombreResponsablePorId.get(e.responsableId) : null;
          return `${e.codigoInterno} - ${e.nombre} - ${e.estado}${e.ubicacion ? ` - Ubicacion: ${e.ubicacion}` : ' - Sin ubicacion registrada'}${responsable ? ` - Responsable: ${responsable}` : ''}`;
        });
        return { contenidoRespuesta: lineas.join('\n'), resumenAuditoria: `Equipos -> listado (${equipos.length})` };
      },
    };
  }

  private getAsistencia(): AiTool {
    return {
      nombre: 'get_asistencia',
      descripcion: 'Consulta las marcaciones de asistencia recientes de un bombero por su numero de bombero.',
      moduloSlug: 'asistencia',
      permisoRequerido: 'asistencia:ver',
      patrones: [/asistencia de/, /marcaciones de/, /quien (asistio|marco)/],
      palabrasClave: ['asistencia', 'marcacion', 'marcaciones', 'presente'],
      extraerArgumentos: (_n, original) => ({ numeroBombero: extraerConsulta(original, [/asistencia de/gi, /marcaciones de/gi]) }),
      ejecutar: async (args) => {
        const numero = String(args.numeroBombero ?? '').trim();
        if (!numero) return { contenidoRespuesta: 'Decime el numero de bombero para consultar su asistencia.', resumenAuditoria: 'Asistencia -> consulta vacia' };
        const bombero = await this.bomberoRepo.findOne({ where: { numeroBombero: numero } });
        if (!bombero) return sinResultados('ese numero de bombero');
        const marcaciones = await this.marcacionRepo.find({ where: { bomberoId: bombero.id }, order: { timestampMarcacion: 'DESC' }, take: 10 });
        if (marcaciones.length === 0) return sinResultados(`marcaciones de ${numero}`);
        const lineas = marcaciones.map((m) => `${new Date(m.timestampMarcacion).toLocaleString('es-PY')} - ${m.tipoMarcacion} (${m.metodo})`);
        return { contenidoRespuesta: lineas.join('\n'), resumenAuditoria: `Asistencia -> marcaciones de ${numero}` };
      },
    };
  }

  private getAcademia(): AiTool {
    return {
      nombre: 'get_academia',
      descripcion: 'Actividades academicas internas (cursos, capacitaciones, talleres), cursos externos de OBA, o cuantos participaron de un curso puntual.',
      moduloSlug: 'academia',
      permisoRequerido: 'academia:ver',
      patrones: [
        // Lookahead negativo (Cierre de Snoopy, seccion 1, bug real
        // detectado en vivo): sin el, "que cursos" matcheaba TAMBIEN "que
        // cursos tengo"/"que cursos termine" -- empataba en puntaje contra
        // get_mis_cursos_academia y, al evaluarse primero en `todas()`,
        // ganaba la carrera y exigia `academia:ver` (el permiso del modulo
        // completo) para una pregunta que es pura y exclusivamente
        // autoservicio. Los verbos excluidos son EXACTAMENTE los que
        // reconoce get_mis_cursos_academia, nada mas.
        /que cursos(?! (tengo|termine|hice|complete|realice))/, /cursos nuevos/, /capacitacion(es)? (disponibles|nuevas)/, /\boba\b/, /academia/, /(cuant[oa]s|quienes) participaron (de|en)/,
      ],
      // "Mis cursos"/"que capacitaciones hice"/"que certificaciones tengo"
      // (Cierre de Snoopy, seccion 1) vive en get_mis_cursos_academia, una
      // herramienta separada con su propio permiso (academia:ver_propio) --
      // NO aca. Antes vivia en este mismo tool (Estabilizacion, seccion 9),
      // pero quedaba estructuralmente bloqueada para cualquiera sin
      // academia:ver (el permiso de ESTE tool completo), que es exactamente
      // el caso que motivo el pedido de autoservicio.
      palabrasClave: ['curso', 'cursos', 'capacitacion', 'capacitaciones', 'academia', 'taller', 'oba', 'certificaciones', 'certificacion'],
      extraerArgumentos: (mensajeNormalizado, original) => {
        const esParticipacion = /participaron (de|en)/.test(mensajeNormalizado);
        if (esParticipacion) {
          const nombreCurso = extraerConsulta(original, [/cuant[oa]s/gi, /quienes/gi, /participaron/gi, /de la/gi, /de el/gi, /del/gi, /en la/gi, /en el/gi, /de\b/gi, /en\b/gi]);
          return { modo: 'participacion', nombreCurso, intent: detectarIntent(mensajeNormalizado), _resumen: { nombreCurso: `Curso: "${nombreCurso}"` } };
        }
        // Prioridad 5 de la correccion post-auditoria: antes el modo
        // "listado" ignoraba TODO el contenido del mensaje y devolvia
        // siempre el listado completo -- "cursos de vuelo espacial"
        // respondia lo mismo que "que cursos hay disponibles", sin
        // aclarar que ese curso puntual no existe. Si despues de sacar las
        // palabras genericas ("cursos", "disponibles", "nuevas"...) queda
        // contenido real, se filtra por nombre; si no queda nada (la
        // pregunta generica de siempre), se sigue devolviendo todo, sin
        // regresion.
        const query = extraerConsulta(original, [...DISPARADORES_SOLICITUD, /cursos?/gi, /capacitacion(es)?/gi, /actividad(es)?/gi, /academia/gi, /disponibles?/gi, /nuevas?/gi, /hay/gi]);
        return { modo: 'listado', query, _resumen: query ? { query: `Busqueda: "${query}"` } : {} };
      },
      ejecutar: async (args) => {
        if (args.modo === 'participacion') {
          const nombreCurso = String(args.nombreCurso ?? '').trim();
          if (!nombreCurso) return { contenidoRespuesta: 'Decime el nombre del curso o actividad que queres consultar.', resumenAuditoria: 'Academia -> consulta de participacion vacia' };
          const actividad = await this.actividadRepo
            .createQueryBuilder('a')
            .where('a.nombre COLLATE Modern_Spanish_CI_AI LIKE :q', { q: `%${nombreCurso}%` })
            .orderBy('a.fechaInicio', 'DESC')
            .getOne();
          if (!actividad) return sinResultados(`una actividad academica llamada "${nombreCurso}"`);
          const total = await this.inscripcionRepo.createQueryBuilder('i').where('i.actividadId = :id', { id: actividad.id }).getCount();
          return {
            contenidoRespuesta: `${total} personas participaron de "${actividad.nombre}" (${actividad.fechaInicio} a ${actividad.fechaFin}).`,
            resumenAuditoria: `Academia -> participacion "${actividad.nombre}" = ${total}`,
          };
        }
        const query = String(args.query ?? '').trim();
        const actividadesQb = this.actividadRepo.createQueryBuilder('a').where("a.estado IN ('PLANIFICADA', 'ABIERTA', 'EN_CURSO')").orderBy('a.fechaInicio', 'ASC').take(10);
        if (query) actividadesQb.andWhere('a.nombre COLLATE Modern_Spanish_CI_AI LIKE :q', { q: `%${query}%` });
        const cursosExternosQb = query
          ? this.cursoExternoRepo.createQueryBuilder('c').where('c.titulo COLLATE Modern_Spanish_CI_AI LIKE :q', { q: `%${query}%` }).orderBy('c.titulo', 'ASC').take(8)
          : null;
        const [actividades, cursosExternos] = await Promise.all([
          actividadesQb.getMany(),
          cursosExternosQb ? cursosExternosQb.getMany() : this.cursoExternoRepo.find({ order: { titulo: 'ASC' }, take: 8 }),
        ]);

        if (actividades.length === 0 && cursosExternos.length === 0) {
          return sinResultados(query ? `actividades ni cursos relacionados con "${query}"` : 'actividades academicas ni cursos de OBA');
        }

        const bloques: string[] = [];
        if (actividades.length > 0) {
          bloques.push('Actividades internas de SIGBO:');
          bloques.push(...actividades.map((a) => `- ${a.nombre} (${a.fechaInicio} a ${a.fechaFin}, ${a.estado}${a.lugar ? `, ${a.lugar}` : ''}${a.cupo ? `, cupo ${a.cupo}` : ''})`));
        }
        if (cursosExternos.length > 0) {
          bloques.push('\nCursos publicos disponibles en OBA (plataforma externa, https://oba.thinkific.com) -- son una sugerencia, para hacerlos hay que registrarse por cuenta propia en https://oba.thinkific.com/users/sign_in:');
          bloques.push(...cursosExternos.map((c) => `- ${c.titulo}${c.categoria ? ` (${c.categoria})` : ''} - ${c.url}`));
        }

        return { contenidoRespuesta: bloques.join('\n'), resumenAuditoria: `Academia -> ${actividades.length} actividades internas, ${cursosExternos.length} cursos OBA` };
      },
    };
  }

  /** Autoservicio (Cierre de Snoopy, seccion 1): un bombero sin
   * `academia:ver` (el modulo completo) puede preguntar por SU PROPIA
   * formacion sin que eso implique acceso al modulo entero. Herramienta
   * separada de `getAcademia()` a proposito, con su propio permiso
   * (`academia:ver_propio`, migracion 074) -- NO una excepcion que
   * salte el sistema de permisos, un permiso mas, chequeado igual que
   * cualquier otro. Estructuralmente segura: `ejecutar` recibe `usuario`
   * (la sesion autenticada real) y NUNCA un argumento que identifique a
   * otra persona -- no hay ningun `bomberoId`/`numeroBombero` en
   * `extraerArgumentos`, asi que no hay forma de que esta herramienta
   * devuelva el historial de otro bombero por texto del mensaje. Para
   * consultar a un tercero segue existiendo `academia:ver` (getAcademia)
   * o `personal:ver`, con su propio permiso de verdad. */
  private getMisCursosAcademia(): AiTool {
    return {
      nombre: 'get_mis_cursos_academia',
      descripcion: 'Cursos, capacitaciones y certificaciones del propio usuario autenticado -- nunca de otra persona.',
      moduloSlug: 'academia',
      permisoRequerido: 'academia:ver_propio',
      patrones: [
        /que (capacitaciones|cursos|certificaciones) (hice|tengo|complete|realice)/, /mis (cursos|capacitaciones|certificaciones)/,
        /cuando (hice|complete|fue) mi (ultimo|ultima) (curso|capacitacion)/,
        /tengo (alguna )?certificacion(es)? (vigente|vigentes)?/,
      ],
      palabrasClave: ['certificaciones', 'certificacion'],
      extraerArgumentos: (mensajeNormalizado) => ({
        modo: /cuando (hice|complete|fue) mi (ultimo|ultima)/.test(mensajeNormalizado) ? 'ultimo' : 'listado',
      }),
      ejecutar: async (args, usuario) => {
        // Usuario.bomberoId (real, existente) vincula la sesion autenticada
        // con su registro de personal. Si no hay vinculo (ej. una cuenta
        // administrativa sin ficha de personal), se responde honestamente
        // en vez de listar de otra persona por error.
        const usuarioRow = await this.usuarioRepo.findOne({ where: { id: usuario.id } });
        if (!usuarioRow?.bomberoId) {
          return { contenidoRespuesta: 'Tu usuario no está vinculado a una ficha de personal, así que no puedo consultar tus cursos.', resumenAuditoria: 'Academia -> mis cursos (usuario sin bombero vinculado)' };
        }
        const qb = this.inscripcionRepo.createQueryBuilder('i').where('i.bomberoId = :id', { id: usuarioRow.bomberoId }).orderBy('i.fechaInscripcion', 'DESC');
        if (args.modo === 'ultimo') qb.take(1);
        const inscripciones = await qb.getMany();
        if (inscripciones.length === 0) return sinResultados('cursos o capacitaciones a tu nombre');
        const actividadIds = inscripciones.map((i) => i.actividadId);
        const actividades = await this.actividadRepo.createQueryBuilder('a').where('a.id IN (:...ids)', { ids: actividadIds }).getMany();
        const actividadPorId = new Map(actividades.map((a) => [a.id, a]));
        const lineas = inscripciones.map((i) => {
          const a = actividadPorId.get(i.actividadId);
          return `${a?.nombre ?? 'Actividad'} - Estado: ${i.estado}${a ? ` (${a.fechaInicio} a ${a.fechaFin})` : ''}`;
        });
        const resumenAuditoria = `Academia -> mis cursos, modo ${args.modo} (${inscripciones.length})`;
        return { contenidoRespuesta: lineas.join('\n'), resumenAuditoria };
      },
    };
  }

  private getFinanzas(): AiTool {
    return {
      nombre: 'get_finanzas',
      descripcion: 'Resume ingresos y egresos por categoria en un periodo (por defecto el mes actual).',
      moduloSlug: 'finanzas',
      permisoRequerido: 'finanzas:ver',
      patrones: [/cuanto (gastamos|se gasto)/, /gasto(s)? de/, /ingresos de/, /balance/, /finanzas/],
      palabrasClave: ['gasto', 'gastos', 'ingreso', 'ingresos', 'finanzas', 'presupuesto', 'caja'],
      extraerArgumentos: () => ({}),
      ejecutar: async () => {
        const ahora = new Date();
        const desde = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-01`;
        const hasta = ahora.toISOString().slice(0, 10);
        const movimientos = await this.movimientoRepo
          .createQueryBuilder('m')
          .where('m.fecha >= :desde AND m.fecha <= :hasta', { desde, hasta })
          .andWhere("m.estado = 'REGISTRADO'")
          .getMany();
        if (movimientos.length === 0) return sinResultados('movimientos financieros este mes');

        const categoriaIds = [...new Set(movimientos.map((m) => m.categoriaEgresoId ?? m.tipoIngresoId).filter((id): id is string => !!id))];
        const categorias = categoriaIds.length ? await this.parametroRepo.find({ where: categoriaIds.map((id) => ({ id })) }) : [];
        const nombrePorId = new Map(categorias.map((c) => [c.id, c.nombre]));

        const totales = new Map<string, number>();
        let totalIngresos = 0;
        let totalEgresos = 0;
        for (const m of movimientos) {
          const importe = Number(m.importe);
          if (m.tipo === 'INGRESO') totalIngresos += importe;
          else totalEgresos += importe;
          const categoriaNombre = nombrePorId.get(m.categoriaEgresoId ?? m.tipoIngresoId ?? '') ?? 'Sin categoria';
          const clave = `${m.tipo} - ${categoriaNombre}`;
          totales.set(clave, (totales.get(clave) ?? 0) + importe);
        }
        const lineas = [...totales.entries()].map(([clave, total]) => `${clave}: ${total.toLocaleString('es-PY')} PYG`);
        return {
          contenidoRespuesta: `Este mes (${desde} a ${hasta}): ingresos ${totalIngresos.toLocaleString('es-PY')} PYG, egresos ${totalEgresos.toLocaleString('es-PY')} PYG.\nPor categoria:\n${lineas.join('\n')}`,
          resumenAuditoria: `Finanzas -> resumen ${desde} a ${hasta}`,
        };
      },
    };
  }

  private getDeposito(): AiTool {
    return {
      nombre: 'get_deposito',
      descripcion: 'Busca articulos de deposito por nombre o codigo, devuelve stock actual.',
      moduloSlug: 'deposito',
      permisoRequerido: 'deposito:ver',
      patrones: [/stock de/, /hay .* en deposito/, /cuanto hay de/, /\bdeposito\b/],
      palabrasClave: ['stock', 'deposito', 'articulo', 'articulos', 'insumo', 'insumos'],
      extraerArgumentos: (_n, original) => ({ query: extraerConsulta(original, [...DISPARADORES_SOLICITUD, /stock de/gi, /cuanto hay de/gi, /hay/gi, /en deposito/gi, /deposito/gi]) }),
      ejecutar: async (args) => {
        const query = String(args.query ?? '').trim();
        if (!query) return { contenidoRespuesta: 'Decime el nombre o codigo del articulo que buscas en Deposito.', resumenAuditoria: 'Deposito -> consulta vacia' };
        const articulos = await this.articuloRepo
          .createQueryBuilder('a')
          .where('(a.nombre COLLATE Modern_Spanish_CI_AI LIKE :q OR a.codigo COLLATE Modern_Spanish_CI_AI LIKE :q) AND a.estado = :estado', { q: `%${query}%`, estado: 'ACTIVO' })
          .take(8)
          .getMany();
        if (articulos.length === 0) return sinResultados('articulos de deposito');
        const lineas = articulos.map((a) => `${a.codigo} - ${a.nombre} - Stock: ${a.stockActual}${Number(a.stockActual) <= Number(a.stockMinimo) ? ' (BAJO STOCK MINIMO)' : ''}`);
        return { contenidoRespuesta: lineas.join('\n'), resumenAuditoria: `Deposito -> busqueda "${query}" (${articulos.length})` };
      },
    };
  }
}
