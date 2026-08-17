import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ActividadAcademica,
  AsignacionGuardia,
  Bombero,
  CursoExternoCache,
  Equipo,
  Guardia,
  IdentidadInstitucional,
  InscripcionActividadAcademica,
  MarcacionAsistencia,
  MovimientoFinanciero,
  Parametro,
  Rango,
  Servicio,
  TipoBombero,
  Vehiculo,
  Articulo,
} from '../../../shared/entities';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { DocumentosService } from '../../documentos/documentos.service';
import { AiTool, ResultadoHerramientaIa } from './ia-tool.interface';
import {
  detectarIntent,
  ESTADO_BOMBERO_SINONIMOS,
  ESTADO_EQUIPO_SINONIMOS,
  ESTADO_VEHICULO_SINONIMOS,
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

const PALABRAS_VACIAS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'en', 'a', 'al', 'para', 'por', 'con', 'sin', 'sobre',
  'que', 'quien', 'quienes', 'como', 'cual', 'cuales', 'donde', 'cuando', 'hay', 'esta', 'estan', 'tiene', 'tienen',
  'me', 'te', 'se', 'su', 'sus', 'este', 'esta', 'ese', 'esa', 'snoopy', 'porfavor', 'favor', 'decime', 'dime',
  'buscar', 'busca', 'buscame', 'quiero', 'saber', 'informacion', 'info', 'dato', 'datos', 'y', 'o', 'pero',
  'es', 'son', 'del', 'mi', 'tu', 'nos', 'le', 'les', 'podes', 'puedes', 'decir', 'contame', 'muestrame',
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
 * comunes, no cualquier parafraseo (ver limitacion documentada). */
function extraerConsulta(mensajeOriginal: string, disparadores: RegExp[]): string {
  let texto = quitarAcentos(mensajeOriginal);
  for (const d of disparadores) texto = texto.replace(d, ' ');
  const palabras = texto
    .replace(/[¿?¡!.,;:]/g, ' ')
    .split(/\s+/)
    .filter((p) => p.length > 1 && !PALABRAS_VACIAS.has(normalizarPalabra(p)));
  return palabras.join(' ').trim();
}

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
      patrones: [/nombre.*(instituci|cuartel)/, /(direccion|telefono|contacto|sitio ?web|email).*(instituci|cuartel)/, /donde (estamos|queda|esta) el cuartel/, /informacion (de la|del) (instituci|cuartel)/],
      palabrasClave: ['institucion', 'cuartel', 'direccion', 'contacto', 'sede', 'sitioweb'],
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
      ],
      palabrasClave: ['bombero', 'bomberos', 'personal', 'rango', 'cargo', 'combatiente', 'combatientes', 'incorporado', 'incorporados', 'fundador', 'fundadores', 'honorario', 'voluntario'],
      extraerArgumentos: async (mensajeNormalizado, original) => {
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
        let query = '';
        if (Object.keys(filtros).length === 0) {
          query = extraerConsulta(original, [/quien es/gi, /datos de/gi, /informacion de/gi, /buscar?/gi, /bombero/gi, /personal/gi, /numero de/gi]);
          if (query) resumen.query = `Busqueda: "${query}"`;
        }

        return { intent, filtros, query, _resumen: resumen };
      },
      ejecutar: async (args) => {
        const filtros = (args.filtros as Record<string, unknown>) ?? {};
        const query = String(args.query ?? '').trim();
        const intent = (args.intent as string) ?? 'LISTAR';

        if (Object.keys(filtros).length === 0 && !query) {
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
      descripcion: 'La guardia de hoy: turno, horario y personal asignado.',
      moduloSlug: 'guardias',
      permisoRequerido: 'guardias:ver',
      patrones: [/quien.*(esta|anda).*guardia/, /guardia (de hoy|actual|de ahora)/, /guardia hoy/, /a que hora (termina|empieza|entra|sale)/],
      palabrasClave: ['guardia', 'turno', 'hoy'],
      extraerArgumentos: () => ({}),
      ejecutar: async () => {
        const hoy = new Date().toISOString().slice(0, 10);
        const guardias = await this.guardiaRepo.find({ where: { fecha: hoy } });
        if (guardias.length === 0) return sinResultados('guardias para hoy');
        const bloques: string[] = [];
        for (const g of guardias) {
          const asignaciones = await this.asignacionRepo.find({ where: { guardiaId: g.id } });
          const bomberoIds = asignaciones.map((a) => a.bomberoId);
          const bomberos = bomberoIds.length ? await this.bomberoRepo.find({ where: bomberoIds.map((id) => ({ id })) }) : [];
          const nombrePorId = new Map(bomberos.map((b) => [b.id, `${b.nombre} ${b.apellido} (${b.rango})`]));
          const personal = asignaciones.map((a) => `${nombrePorId.get(a.bomberoId) ?? a.bomberoId}${a.rol ? ` - ${a.rol}` : ''}`);
          bloques.push(`Turno ${g.turno} (${g.horaInicio} a ${g.horaFin}), estado ${g.estado}. Personal: ${personal.length ? personal.join(', ') : 'sin asignaciones cargadas'}`);
        }
        return { contenidoRespuesta: bloques.join('\n'), resumenAuditoria: 'Guardias -> guardia actual' };
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
        /guardias? (de |para |este )?fin de semana/, /quien(es)?.*(guardia|guardias).*(fin de semana|semana|mes)/,
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
      extraerArgumentos: (_n, original) => ({ query: extraerConsulta(original, [/donde (esta|encuentro|consigo)/gi, /buscar/gi, /muestrame/gi, /quiero ver/gi]) }),
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
      descripcion: 'Cuenta y resume los servicios/intervenciones registrados en un rango de fechas (por defecto el mes actual).',
      moduloSlug: 'servicios',
      permisoRequerido: 'servicios:ver',
      patrones: [/cuantos servicios/, /servicios (de este mes|del mes|de hoy)/, /estadisticas? de servicios/, /cuantas intervenciones/],
      palabrasClave: ['servicios', 'intervencion', 'intervenciones', 'emergencias', 'salidas'],
      extraerArgumentos: () => ({}),
      ejecutar: async () => {
        const ahora = new Date();
        const desde = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-01`;
        const hasta = ahora.toISOString().slice(0, 10);
        const servicios = await this.servicioRepo
          .createQueryBuilder('s')
          .where('s.fechaHoraAviso >= :desde AND s.fechaHoraAviso <= :hasta', { desde: `${desde}T00:00:00`, hasta: `${hasta}T23:59:59` })
          .getMany();
        if (servicios.length === 0) return sinResultados('servicios este mes');
        const porGravedad = new Map<string, number>();
        for (const s of servicios) porGravedad.set(s.gravedad ?? 'SIN_CLASIFICAR', (porGravedad.get(s.gravedad ?? 'SIN_CLASIFICAR') ?? 0) + 1);
        const resumen = [...porGravedad.entries()].map(([g, c]) => `${g}: ${c}`).join(', ');
        return { contenidoRespuesta: `Este mes hubo ${servicios.length} servicios. Por gravedad: ${resumen}.`, resumenAuditoria: `Servicios -> resumen ${desde} a ${hasta} (${servicios.length})` };
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
      ],
      palabrasClave: ['vehiculo', 'vehiculos', 'movil', 'moviles', 'camion', 'ambulancia'],
      extraerArgumentos: (mensajeNormalizado) => {
        const intent = detectarIntent(mensajeNormalizado);
        const filtros: Record<string, unknown> = {};
        const resumen: Record<string, string> = {};
        const estado = resolverSinonimo(mensajeNormalizado, ESTADO_VEHICULO_SINONIMOS);
        if (estado) {
          filtros.estado = estado;
          resumen.estado = `Estado: ${estado}`;
        }
        return { intent, filtros, _resumen: resumen };
      },
      ejecutar: async (args) => {
        const filtros = (args.filtros as Record<string, unknown>) ?? {};
        const intent = (args.intent as string) ?? 'LISTAR';
        const qb = this.vehiculoRepo.createQueryBuilder('v').orderBy('v.numeroInterno', 'ASC');
        if (filtros.estado) qb.andWhere('v.estado = :estado', { estado: filtros.estado });

        if (intent === 'CONTAR') {
          const total = await qb.getCount();
          const descripcion = filtros.estado ? `estado ${filtros.estado}` : 'todos los estados';
          return { contenidoRespuesta: `Hay ${total} vehiculos (${descripcion}).`, resumenAuditoria: `Vehiculos -> conteo (${descripcion}) = ${total}` };
        }

        const vehiculos = await qb.take(30).getMany();
        if (vehiculos.length === 0) return sinResultados('vehiculos');
        const lineas = vehiculos.map((v) => `${v.numeroInterno} - ${v.tipo}${v.marca ? ` ${v.marca}` : ''} - ${v.estado}${v.ubicacionActual ? ` - ${v.ubicacionActual}` : ''}`);
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
      patrones: [/donde esta el equipo/, /estado del equipo/, /buscar equipo/, /(que |cuales |cuant[oa]s )?equipos? (estan |hay )?(prestados?|disponibles?|en mantenimiento|danados?|de baja)/],
      palabrasClave: ['equipo', 'equipos', 'prestado', 'prestados'],
      extraerArgumentos: (mensajeNormalizado, original) => {
        const intent = detectarIntent(mensajeNormalizado);
        const filtros: Record<string, unknown> = {};
        const resumen: Record<string, string> = {};
        const estado = resolverSinonimo(mensajeNormalizado, ESTADO_EQUIPO_SINONIMOS);
        if (estado) {
          filtros.estado = estado;
          resumen.estado = `Estado: ${estado}`;
        }
        let query = '';
        if (!estado) {
          query = extraerConsulta(original, [/donde esta/gi, /estado del?/gi, /buscar/gi, /equipo/gi]);
          if (query) resumen.query = `Busqueda: "${query}"`;
        }
        return { intent, filtros, query, _resumen: resumen };
      },
      ejecutar: async (args) => {
        const filtros = (args.filtros as Record<string, unknown>) ?? {};
        const query = String(args.query ?? '').trim();
        const intent = (args.intent as string) ?? 'LISTAR';

        if (!filtros.estado && !query) {
          return { contenidoRespuesta: 'Decime el codigo, nombre o estado (prestado, disponible...) del equipo que buscas.', resumenAuditoria: 'Equipos -> consulta vacia' };
        }

        const qb = this.equipoRepo.createQueryBuilder('e');
        if (filtros.estado) qb.andWhere('e.estado = :estado', { estado: filtros.estado });
        if (query) qb.andWhere('(e.codigoInterno COLLATE Modern_Spanish_CI_AI LIKE :q OR e.nombre COLLATE Modern_Spanish_CI_AI LIKE :q)', { q: `%${query}%` });

        if (intent === 'CONTAR') {
          const total = await qb.getCount();
          const descripcion = filtros.estado ? `estado ${filtros.estado}` : `"${query}"`;
          return { contenidoRespuesta: `Hay ${total} equipos con ${descripcion}.`, resumenAuditoria: `Equipos -> conteo (${descripcion}) = ${total}` };
        }

        const equipos = await qb.take(20).getMany();
        if (equipos.length === 0) return sinResultados('equipos');
        const lineas = equipos.map((e) => `${e.codigoInterno} - ${e.nombre} - ${e.estado}${e.ubicacion ? ` - Ubicacion: ${e.ubicacion}` : ' - Sin ubicacion registrada'}`);
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
      patrones: [/que cursos/, /cursos nuevos/, /capacitacion(es)? (disponibles|nuevas)/, /\boba\b/, /academia/, /(cuant[oa]s|quienes) participaron (de|en)/],
      palabrasClave: ['curso', 'cursos', 'capacitacion', 'capacitaciones', 'academia', 'taller', 'oba'],
      extraerArgumentos: (mensajeNormalizado, original) => {
        const esParticipacion = /participaron (de|en)/.test(mensajeNormalizado);
        if (!esParticipacion) return { modo: 'listado' };
        const nombreCurso = extraerConsulta(original, [/cuant[oa]s/gi, /quienes/gi, /participaron/gi, /de la/gi, /de el/gi, /del/gi, /en la/gi, /en el/gi, /de\b/gi, /en\b/gi]);
        return { modo: 'participacion', nombreCurso, intent: detectarIntent(mensajeNormalizado), _resumen: { nombreCurso: `Curso: "${nombreCurso}"` } };
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
        const [actividades, cursosExternos] = await Promise.all([
          this.actividadRepo
            .createQueryBuilder('a')
            .where("a.estado IN ('PLANIFICADA', 'ABIERTA', 'EN_CURSO')")
            .orderBy('a.fechaInicio', 'ASC')
            .take(10)
            .getMany(),
          this.cursoExternoRepo.find({ order: { titulo: 'ASC' }, take: 8 }),
        ]);

        if (actividades.length === 0 && cursosExternos.length === 0) return sinResultados('actividades academicas ni cursos de OBA');

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
      extraerArgumentos: (_n, original) => ({ query: extraerConsulta(original, [/stock de/gi, /cuanto hay de/gi, /hay/gi, /en deposito/gi, /deposito/gi]) }),
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
