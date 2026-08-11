'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { cargarVehiculos } from '@/lib/vehiculos';

type TipoComunicacion = 'OTRAS_OCURRENCIAS' | 'INCENDIO';
type Valores = Record<string, any>;
type EstadoComunicacion = 'BORRADOR' | 'PENDIENTE_REVISION' | 'OBSERVADO' | 'FINALIZADA' | 'ANULADO' | null;

interface PersonalCatalogo {
  id: string;
  etiqueta: string;
}

interface ComunicacionApi {
  id: string;
  tipo: TipoComunicacion;
  estado: EstadoComunicacion;
  formulario: Valores;
  servicio?: { numeroServicio?: string };
}

const STORAGE_KEY = 'sigbo-servicio-borrador-v3';
/** Lista de respaldo usada mientras se carga (o si falla) la consulta real
 * a Moviles/Vehiculos -- ver el efecto que llama cargarVehiculos() mas abajo. */
const MOVILES_BASE = ['Rega II', 'Rega V', 'Rega VI', 'Rega VII', 'Rega VIII', 'Cobra IX'];
const ROLES_NOMINA = ['SCI', ...Array.from({ length: 20 }, (_, index) => `B${index + 1}`), 'RO1', 'RO2'];
const TIPOS_CONTEO = [
  { codigo: 'ILESO', etiqueta: 'Ilesos' },
  { codigo: 'HERIDO', etiqueta: 'Heridos' },
  { codigo: 'FALLECIDO', etiqueta: 'Fallecidos' },
  { codigo: 'ANIMAL', etiqueta: 'Animal' },
  { codigo: 'OTRO', etiqueta: 'Otro' },
];

const hoy = () => new Date().toISOString().slice(0, 10);
const horaActual = () => new Date().toTimeString().slice(0, 5);
const texto = (valor: unknown) => (typeof valor === 'string' ? valor : '');
const arreglo = <T,>(valor: unknown): T[] => (Array.isArray(valor) ? valor as T[] : []);
const enteroNoNegativo = (valor: unknown) => /^\d+$/.test(String(valor ?? ''));
const decimalNoNegativo = (valor: unknown) => {
  if (valor === '' || valor === null || valor === undefined) return true;
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0;
};

function filasConteo(valor?: unknown) {
  const anterior = valor && !Array.isArray(valor) && typeof valor === 'object' ? valor as Record<string, Valores> : {};
  const lista = arreglo<Valores>(valor);
  return TIPOS_CONTEO.map(({ codigo, etiqueta }) => {
    const legado = anterior[codigo] ?? anterior[etiqueta] ?? anterior[etiqueta.slice(0, -1)] ?? {};
    const actual = lista.find((fila) => fila.tipo === codigo || fila.tipo === etiqueta || fila.tipo === etiqueta.slice(0, -1)) ?? legado;
    return {
      tipo: codigo,
      seleccionado: Boolean(actual.seleccionado),
      otroDescripcion: texto(actual.otroDescripcion ?? actual.descripcion),
      cantidad: actual.cantidad ?? '',
      datos: texto(actual.datos),
    };
  });
}

function filasMoviles(valor?: unknown, moviles: string[] = MOVILES_BASE) {
  const existentes = arreglo<Valores>(valor);
  const usados = new Set<string>();
  const normalizar = (fila: Valores, indice: number) => {
    const movilId = texto(fila.movilId ?? fila.movil) || `Móvil ${indice + 1}`;
    usados.add(movilId);
    return {
      id: fila.id ?? `movil-${indice}-${movilId}`,
      movilId,
      seleccionado: Boolean(fila.seleccionado),
      chofer: texto(fila.chofer ?? fila.choferTexto),
      choferPersonaId: texto(fila.choferPersonaId),
      horaSalida: texto(fila.horaSalida ?? fila.salida),
      horaEnBase: texto(fila.horaEnBase ?? fila.enBase),
      kilometrajeInicial: fila.kilometrajeInicial ?? fila.kmInicial ?? '',
      kilometrajeFinal: fila.kilometrajeFinal ?? fila.kmFinal ?? '',
    };
  };
  const iniciales = existentes.map(normalizar);
  return [...iniciales, ...moviles.filter((movil) => !usados.has(movil)).map((movil, index) => ({
    id: `base-${index}-${movil}`,
    movilId: movil,
    seleccionado: false,
    chofer: '',
    choferPersonaId: '',
    horaSalida: '',
    horaEnBase: '',
    kilometrajeInicial: '',
    kilometrajeFinal: '',
  }))];
}

function filasNomina(valor?: unknown) {
  const porCodigo: Record<string, Valores> = {};
  if (Array.isArray(valor)) {
    arreglo<Valores>(valor).forEach((fila) => { if (texto(fila.rolCodigo)) porCodigo[texto(fila.rolCodigo)] = fila; });
  } else if (valor && typeof valor === 'object') {
    Object.entries(valor as Record<string, unknown>).forEach(([rolCodigo, nombreManual]) => {
      porCodigo[rolCodigo] = { rolCodigo, nombreManual: texto(nombreManual) };
    });
  }
  return ROLES_NOMINA.map((rolCodigo) => ({
    id: porCodigo[rolCodigo]?.id ?? `nomina-${rolCodigo}`,
    rolCodigo,
    personaId: texto(porCodigo[rolCodigo]?.personaId),
    nombreManual: texto(porCodigo[rolCodigo]?.nombreManual),
  }));
}

function nuevoFormulario(): Valores {
  return {
    fecha: hoy(),
    denuncia: horaActual(),
    salida: '',
    enBase: '',
    denunciante: '',
    telefono: '',
    recibidoPor: '',
    recibidoPorPersonaId: '',
    localidad: '',
    barrio: '',
    direccion: '',
    comandante: '',
    comandanteIncidentePersonaId: '',
    guardias: [],
    categorias: [],
    accidenteTipo: [],
    accidenteOtroDescripcion: '',
    accidentePresenta: [],
    accidenteAfectados: filasConteo(),
    animalTipos: [],
    animalOtroDescripcion: '',
    animalEspecie: '',
    animalesEstado: { ilesos: '', heridos: '', fallecidos: '', enfermos: '' },
    lesiones: [],
    transportados: filasConteo(),
    rescateTipos: [],
    rescateOtroDescripcion: '',
    rescatados: filasConteo(),
    coberturaMotivo: '',
    otrosTipos: [],
    otroServicio: '',
    incendioTipo: [],
    incendioOtroDescripcion: '',
    combustibles: [],
    combustibleOtroDescripcion: '',
    aguaLitros: '',
    espumaLitros: '',
    pqsKilogramos: '',
    usoHerramientasManuales: false,
    otroRecursoExtincion: false,
    otroRecursoExtincionDescripcion: '',
    causas: {
      antropica: { seleccionada: false, descripcion: '' },
      accidental: { seleccionada: false, descripcion: '' },
      natural: { seleccionada: false, descripcion: '' },
    },
    magnitud: '',
    superficieAfectada: { valor: '', unidad: 'METROS_CUADRADOS' },
    tacticas: [],
    propiedad: '',
    lugarDescripcion: '',
    lugarPersonaId: '',
    estructura: '',
    estructuraOtroDescripcion: '',
    seguridad: [],
    vehiculosIncendio: [],
    electrico: [],
    electricoOtroDescripcion: '',
    matpelOnu: '',
    matpelDescripcion: '',
    facturaActiva: false,
    facturaNumero: '',
    facturaMonto: '',
    falsaAlarma: false,
    tareas: '',
    datosInteres: '',
    personas: [],
    vehiculosInvolucrados: [],
    instituciones: [],
    resumenPersonas: {
      involucrados: { ilesos: '', heridos: '', fallecidos: '' },
      rescatados: { ilesos: '', heridos: '', fallecidos: '' },
      transportados: { ilesos: '', heridos: '', fallecidos: '' },
    },
    movilesDespachados: filasMoviles(),
    sinDespachoJustificacion: '',
    problemasActivos: false,
    problemas: [],
    otroProblema: '',
    descripcionEscena: '',
    croquis: { formato: null, datos: '' },
    croquisActivo: false,
    nomina: filasNomina(),
    firmaOficial: '',
    firmaEstadistica: '',
  };
}

function normalizarFormulario(origen: Valores | undefined): Valores {
  const base = nuevoFormulario();
  const datos = origen ?? {};
  const causasLegado = arreglo<string>(datos.causaTipos);
  const causas = datos.causas && typeof datos.causas === 'object' ? datos.causas : {};
  const croquisLegado = typeof datos.croquis === 'string'
    ? { formato: datos.croquis ? 'PNG' : null, datos: datos.croquis }
    : { ...base.croquis, ...(datos.croquis ?? {}) };
  return {
    ...base,
    ...datos,
    coberturaMotivo: texto(datos.coberturaMotivo ?? datos.cobertura),
    accidenteAfectados: filasConteo(datos.accidenteAfectados),
    transportados: filasConteo(datos.transportados),
    rescatados: filasConteo(datos.rescatados),
    animalesEstado: { ...base.animalesEstado, ...(datos.animalesEstado ?? {}) },
    causas: {
      antropica: { seleccionada: Boolean(causas.antropica?.seleccionada ?? causasLegado.includes('Antrópicas')), descripcion: texto(causas.antropica?.descripcion ?? datos.causaAntropica) },
      accidental: { seleccionada: Boolean(causas.accidental?.seleccionada ?? causasLegado.includes('Accidentales')), descripcion: texto(causas.accidental?.descripcion ?? datos.causaAccidental) },
      natural: { seleccionada: Boolean(causas.natural?.seleccionada ?? causasLegado.includes('Naturales')), descripcion: texto(causas.natural?.descripcion ?? datos.causaNatural) },
    },
    superficieAfectada: {
      valor: datos.superficieAfectada?.valor ?? datos.superficie ?? '',
      unidad: texto(datos.superficieAfectada?.unidad ?? datos.unidadSuperficie) || 'METROS_CUADRADOS',
    },
    personas: arreglo<Valores>(datos.personas ?? datos.personasInvolucradas).map((fila, index) => ({
      id: fila.id ?? fila.idLocal ?? `persona-${index}-${Date.now()}`,
      nombresApellidos: texto(fila.nombresApellidos ?? fila.nombre),
      ci: texto(fila.ci),
      sexo: texto(fila.sexo),
      edad: fila.edad ?? '',
      direccion: texto(fila.direccion),
    })),
    vehiculosInvolucrados: arreglo<Valores>(datos.vehiculosInvolucrados).map((fila, index) => ({ id: fila.id ?? `vehiculo-${index}-${Date.now()}`, orden: fila.orden ?? index + 1, ...fila })),
    vehiculosIncendio: arreglo<Valores>(datos.vehiculosIncendio).map((fila, index) => ({ id: fila.id ?? `vehiculo-incendio-${index}-${Date.now()}`, orden: fila.orden ?? index + 1, ...fila })),
    instituciones: arreglo<Valores>(datos.instituciones ?? datos.institucionesApoyo).map((fila, index) => ({
      id: fila.id ?? `institucion-${index}-${Date.now()}`,
      tipoRegistro: texto(fila.tipoRegistro ?? fila.tipo) || 'INSTITUCION',
      tipoCatalogo: texto(fila.tipoCatalogo),
      nombreDescripcion: texto(fila.nombreDescripcion ?? fila.nombre),
      aCargo: texto(fila.aCargo),
      movil: texto(fila.movil),
    })),
    resumenPersonas: { ...base.resumenPersonas, ...(datos.resumenPersonas ?? {}) },
    movilesDespachados: filasMoviles(datos.movilesDespachados),
    guardias: Array.isArray(datos.guardias) ? datos.guardias : texto(datos.guardias).split(/[,;\n]/).map((valor) => valor.trim()).filter(Boolean),
    nomina: filasNomina(datos.nomina),
    croquis: croquisLegado,
  };
}

function duracionMinutos(salida: string, enBase: string) {
  if (!salida || !enBase) return null;
  const [horaSalida, minutoSalida] = salida.split(':').map(Number);
  const [horaBase, minutoBase] = enBase.split(':').map(Number);
  let total = horaBase * 60 + minutoBase - horaSalida * 60 - minutoSalida;
  if (total < 0) total += 24 * 60;
  return total;
}

function formatoDuracion(minutos: number | null) {
  if (minutos === null) return '';
  return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
}

function serializarFormulario(datos: Valores, duracion: number | null): Valores {
  const personas = arreglo<Valores>(datos.personas).map(({ id, ...persona }, index) => ({ idLocal: String(index + 1), ...persona }));
  return {
    ...datos,
    // Alias estables: el backend actual usa las claves cortas y el registro
    // conserva también el modelo funcional de la especificación.
    fechaServicio: datos.fecha,
    horaDenuncia: datos.denuncia,
    horaSalidaGeneral: datos.salida,
    horaEnBaseGeneral: datos.enBase,
    tiempoTotalMinutos: duracion,
    denuncianteNombre: datos.denunciante,
    denuncianteTelefono: datos.telefono,
    barrioCompania: datos.barrio,
    comandanteIncidente: datos.comandante,
    tareasEjecutadas: datos.tareas,
    facturaMontoTotal: datos.facturaMonto,
    personasInvolucradas: personas,
    institucionesApoyo: datos.instituciones,
    vehiculosInvolucrados: arreglo<Valores>(datos.vehiculosInvolucrados).map((fila, index) => ({ ...fila, orden: index + 1 })),
    vehiculosIncendio: arreglo<Valores>(datos.vehiculosIncendio).map((fila, index) => ({ ...fila, orden: index + 1 })),
    movilesDespachados: arreglo<Valores>(datos.movilesDespachados).map((fila) => ({
      ...fila,
      movil: fila.movilId,
      salida: fila.horaSalida,
      enBase: fila.horaEnBase,
      kmInicial: fila.kilometrajeInicial,
      kmFinal: fila.kilometrajeFinal,
      kilometrajeRecorrido: fila.kilometrajeInicial !== '' && fila.kilometrajeFinal !== ''
        ? Number(fila.kilometrajeFinal) - Number(fila.kilometrajeInicial)
        : null,
    })),
  };
}

function validarFinalizacion(tipo: TipoComunicacion, datos: Valores): { mensajes: string[]; paso: number } {
  const mensajes: string[] = [];
  let paso = 1;
  const agregar = (mensaje: string, numeroPaso: number) => { mensajes.push(mensaje); paso = Math.min(paso, numeroPaso); };
  if (!texto(datos.fecha)) agregar('Indique la fecha del servicio.', 1);
  if (!texto(datos.denuncia)) agregar('Indique la hora de denuncia.', 1);
  if (!texto(datos.salida)) agregar('Indique la hora general de salida.', 1);
  if (!texto(datos.enBase)) agregar('Indique la hora general de regreso a base.', 1);
  if (!texto(datos.recibidoPor)) agregar('Indique quién recibió la denuncia.', 1);
  if (!texto(datos.localidad) && !texto(datos.barrio) && !texto(datos.direccion)) agregar('Indique localidad, barrio/compañía o dirección.', 1);
  if (!texto(datos.comandante)) agregar('Indique el comandante de incidente.', 1);
  const categorias = tipo === 'INCENDIO' ? arreglo(datos.incendioTipo) : arreglo(datos.categorias);
  if (!categorias.length) agregar('Seleccione al menos una categoría o tipo de ocurrencia.', 2);
  const validarOtro = (activo: boolean, descripcion: unknown, nombre: string) => {
    if (activo && !texto(descripcion).trim()) agregar(`Describa la opción “Otro” en ${nombre}.`, 2);
  };
  validarOtro(arreglo<string>(datos.accidenteTipo).includes('Otro'), datos.accidenteOtroDescripcion, 'tipo de accidente');
  validarOtro(arreglo<string>(datos.animalTipos).includes('Otro'), datos.animalOtroDescripcion, 'tipo de animal');
  validarOtro(arreglo<string>(datos.rescateTipos).includes('Otro'), datos.rescateOtroDescripcion, 'tipo de rescate');
  validarOtro(arreglo<string>(datos.otrosTipos).includes('Otro'), datos.otroServicio, 'otros servicios');
  validarOtro(arreglo<string>(datos.incendioTipo).includes('Otro'), datos.incendioOtroDescripcion, 'tipo de incendio');
  validarOtro(arreglo<string>(datos.combustibles).includes('Otro'), datos.combustibleOtroDescripcion, 'combustibles');
  validarOtro(arreglo<string>(datos.electrico).includes('Otro'), datos.electricoOtroDescripcion, 'descripción eléctrica');
  validarOtro(datos.estructura === 'Otro', datos.estructuraOtroDescripcion, 'estructura');
  validarOtro(Boolean(datos.otroRecursoExtincion), datos.otroRecursoExtincionDescripcion, 'recursos de extinción');
  validarOtro(arreglo<string>(datos.problemas).includes('Otro'), datos.otroProblema, 'problemas');
  [
    ['accidenteAfectados', 'afectados'],
    ['transportados', 'transportados'],
    ['rescatados', 'rescatados'],
  ].forEach(([campo, nombre]) => {
    arreglo<Valores>(datos[campo]).filter((fila) => fila.seleccionado).forEach((fila) => {
      if (!enteroNoNegativo(fila.cantidad)) agregar(`Ingrese una cantidad entera no negativa para ${nombre}.`, 2);
      if (fila.tipo === 'OTRO' && !texto(fila.otroDescripcion).trim()) agregar(`Describa “Otro” en ${nombre}.`, 2);
    });
  });
  ['aguaLitros', 'espumaLitros', 'pqsKilogramos', 'facturaMonto'].forEach((campo) => {
    if (!decimalNoNegativo(datos[campo])) agregar('Los importes y recursos deben ser valores no negativos.', 2);
  });
  if (datos.facturaActiva && (!texto(datos.facturaNumero) || datos.facturaMonto === '')) agregar('Complete número e importe de la factura.', 3);
  const moviles = arreglo<Valores>(datos.movilesDespachados).filter((movil) => movil.seleccionado);
  if (!moviles.length && !texto(datos.sinDespachoJustificacion)) agregar('Despache un móvil o justifique por qué no hubo despacho.', 3);
  const nombresMoviles = new Set<string>();
  arreglo<Valores>(datos.movilesDespachados).forEach((movil) => {
    const nombre = texto(movil.movilId).trim().toLocaleLowerCase();
    if (nombre && nombresMoviles.has(nombre)) agregar('No repita el mismo móvil en la comunicación.', 3);
    if (nombre) nombresMoviles.add(nombre);
  });
  moviles.forEach((movil) => {
    if (!texto(movil.movilId) || !texto(movil.chofer) || !texto(movil.horaSalida) || !texto(movil.horaEnBase)) agregar('Cada móvil despachado requiere móvil, chofer, salida y regreso.', 3);
    if (!decimalNoNegativo(movil.kilometrajeInicial) || !decimalNoNegativo(movil.kilometrajeFinal)) agregar('El kilometraje no puede ser negativo.', 3);
    if (movil.kilometrajeInicial !== '' && movil.kilometrajeFinal !== '' && Number(movil.kilometrajeFinal) < Number(movil.kilometrajeInicial)) agregar('El kilometraje final no puede ser menor al inicial.', 3);
  });
  if (!texto(datos.tareas) && !datos.falsaAlarma) agregar('Describa las tareas ejecutadas o marque falsa alarma.', 3);
  if (tipo === 'INCENDIO' && datos.superficieAfectada?.valor !== '' && !datos.superficieAfectada?.unidad) agregar('Seleccione la unidad de la superficie afectada.', 2);
  return { mensajes: [...new Set(mensajes)], paso };
}

export default function NuevoServicioPage() {
  const [tipo, setTipo] = useState<TipoComunicacion>('OTRAS_OCURRENCIAS');
  const [datos, setDatos] = useState<Valores>(() => nuevoFormulario());
  const [paso, setPaso] = useState(1);
  const [id, setId] = useState<string | null>(null);
  const [numero, setNumero] = useState('');
  const [estado, setEstado] = useState<EstadoComunicacion>(null);
  const [hidratado, setHidratado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState('Preparando borrador local…');
  const [errores, setErrores] = useState<string[]>([]);
  const [personal, setPersonal] = useState<PersonalCatalogo[]>([]);
  const [imprimirTodo, setImprimirTodo] = useState(false);
  const [descargandoPdf, setDescargandoPdf] = useState(false);
  const datosRef = useRef(datos);

  const soloLectura = estado === 'FINALIZADA' || estado === 'ANULADO';
  const minutos = useMemo(() => duracionMinutos(texto(datos.salida), texto(datos.enBase)), [datos.salida, datos.enBase]);
  const cruzaMedianoche = Boolean(datos.salida && datos.enBase && datos.enBase < datos.salida);
  const seleccionado = (opcion: string) => arreglo<string>(datos.categorias).includes(opcion);

  useEffect(() => { datosRef.current = datos; }, [datos]);

  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      const params = new URLSearchParams(window.location.search);
      const idSolicitado = params.get('id');
      let local: { id?: string | null; tipo?: TipoComunicacion; datos?: Valores } | null = null;
      try { local = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { localStorage.removeItem(STORAGE_KEY); }
      if (idSolicitado) {
        if (local?.id === idSolicitado && local.datos) {
          setTipo(local.tipo ?? 'OTRAS_OCURRENCIAS');
          setDatos(normalizarFormulario(local.datos));
          setId(idSolicitado);
          setAviso('Borrador local recuperado; verificando versión del sistema…');
        }
        try {
          const respuesta = await apiFetch(`/servicios/comunicaciones/${encodeURIComponent(idSolicitado)}`);
          const cuerpo = await respuesta.json().catch(() => ({}));
          if (!respuesta.ok) throw new Error(Array.isArray(cuerpo.message) ? cuerpo.message.join(', ') : cuerpo.message || 'No se pudo abrir la comunicación.');
          if (!cancelado) {
            const comunicacion = cuerpo as ComunicacionApi;
            setTipo(comunicacion.tipo);
            setDatos(normalizarFormulario(comunicacion.formulario));
            setId(comunicacion.id);
            setNumero(comunicacion.servicio?.numeroServicio ?? '');
            setEstado(comunicacion.estado);
            setAviso(comunicacion.estado === 'FINALIZADA' || comunicacion.estado === 'ANULADO' ? 'Registro de solo lectura.' : 'Comunicación cargada desde el sistema.');
          }
        } catch (error) {
          if (!cancelado && !local?.datos) setAviso(`No se pudo cargar el registro: ${error instanceof Error ? error.message : 'sin conexión.'}`);
        }
      } else if (local?.datos) {
        setTipo(local.tipo ?? 'OTRAS_OCURRENCIAS');
        setDatos(normalizarFormulario(local.datos));
        setId(local.id ?? null);
        setAviso('Borrador local recuperado.');
      } else {
        setAviso('Autoguardado local activo.');
      }
      if (!cancelado) setHidratado(true);
    };
    void cargar();
    return () => { cancelado = true; };
  }, []);

  useEffect(() => {
    if (!hidratado || soloLectura) return;
    const temporizador = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, tipo, datos }));
    }, 500);
    return () => window.clearTimeout(temporizador);
  }, [datos, tipo, id, hidratado, soloLectura]);

  useEffect(() => {
    let cancelado = false;
    void apiFetch('/servicios/comunicaciones/catalogos').then(async (respuesta) => {
      if (!respuesta.ok) return;
      const catalogos = await respuesta.json() as Valores;
      const filas = arreglo<Valores>(catalogos.personal);
      if (!cancelado) setPersonal(filas.map((fila) => ({
        id: texto(fila.id),
        etiqueta: [texto(fila.codigo), texto(fila.nombre)].filter(Boolean).join(' · '),
      })).filter((fila) => fila.etiqueta));
    }).catch(() => undefined);
    return () => { cancelado = true; };
  }, []);

  /** Reemplaza la lista de respaldo MOVILES_BASE por la flota real en cuanto
   * carga, sin perder lo que el usuario ya haya completado en el borrador
   * (filasMoviles conserva las filas existentes por movilId). */
  useEffect(() => {
    let cancelado = false;
    cargarVehiculos().then((lista) => {
      const nombres = lista.filter((v) => v.estado !== 'BAJA').map((v) => v.numeroInterno);
      if (cancelado || nombres.length === 0) return;
      setDatos((anterior) => ({ ...anterior, movilesDespachados: filasMoviles(anterior.movilesDespachados, nombres) }));
    }).catch(() => undefined);
    return () => { cancelado = true; };
  }, []);

  const set = (campo: string, valor: unknown) => setDatos((anterior) => ({ ...anterior, [campo]: valor }));
  const actualizarFila = (campo: string, filaId: string | number, clave: string, valor: unknown) => {
    set(campo, arreglo<Valores>(datos[campo]).map((fila) => fila.id === filaId ? { ...fila, [clave]: valor } : fila));
  };
  const agregarFila = (campo: string, fila: Valores) => set(campo, [...arreglo<Valores>(datos[campo]), { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...fila }]);
  const quitarFila = (campo: string, filaId: string | number) => set(campo, arreglo<Valores>(datos[campo]).filter((fila) => fila.id !== filaId));

  const guardarLocal = (idLocal = id) => localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: idLocal, tipo, datos: datosRef.current }));

  const guardar = async (finalizar = false) => {
    if (soloLectura || guardando) return;
    if (finalizar) {
      const validacion = validarFinalizacion(tipo, datos);
      if (validacion.mensajes.length) {
        setErrores(validacion.mensajes);
        setPaso(validacion.paso);
        setAviso('Revise los campos indicados antes de finalizar.');
        return;
      }
      if (!window.confirm('¿Desea validar y finalizar esta comunicación? Luego quedará bloqueada para edición ordinaria.')) return;
    }
    setGuardando(true);
    setErrores([]);
    guardarLocal();
    try {
      const formulario = serializarFormulario(datos, minutos);
      const respuesta = await apiFetch(id ? `/servicios/comunicaciones/${encodeURIComponent(id)}` : '/servicios/comunicaciones', {
        method: id ? 'PATCH' : 'POST',
        body: JSON.stringify({ tipo, formulario }),
      });
      const cuerpo = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) throw new Error(Array.isArray(cuerpo.message) ? cuerpo.message.join(', ') : cuerpo.message || 'No se pudo guardar la comunicación.');
      const nuevoId = texto(cuerpo.id) || id;
      if (!nuevoId) throw new Error('El servidor no devolvió el identificador de la comunicación.');
      setId(nuevoId);
      setNumero(texto(cuerpo.servicio?.numeroServicio) || numero);
      setEstado(cuerpo.estado ?? 'BORRADOR');
      guardarLocal(nuevoId);
      if (finalizar) {
        const finalizacion = await apiFetch(`/servicios/comunicaciones/${encodeURIComponent(nuevoId)}/finalizar`, { method: 'POST' });
        const final = await finalizacion.json().catch(() => ({}));
        if (!finalizacion.ok) throw new Error(Array.isArray(final.message) ? final.message.join(', ') : final.message || 'El borrador fue guardado, pero no se pudo finalizar.');
        setEstado(final.estado ?? 'FINALIZADA');
        setNumero(texto(final.servicio?.numeroServicio) || numero);
        localStorage.removeItem(STORAGE_KEY);
        setAviso(`Comunicación ${texto(final.servicio?.numeroServicio) || numero || ''} finalizada correctamente.`);
      } else {
        setAviso('Borrador guardado en el sistema y en este dispositivo.');
      }
    } catch (error) {
      guardarLocal();
      setAviso(`El borrador sigue protegido localmente. ${error instanceof Error ? error.message : 'No hay conexión con el API.'}`);
    } finally {
      setGuardando(false);
    }
  };

  const imprimir = () => {
    setImprimirTodo(true);
    window.setTimeout(() => window.print(), 60);
    window.onafterprint = () => setImprimirTodo(false);
  };

  const descargarPdf = async () => {
    if (!id || descargandoPdf) {
      if (!id) setAviso('Guarde la comunicación antes de exportarla a PDF.');
      return;
    }
    setDescargandoPdf(true);
    try {
      const respuesta = await apiFetch(`/servicios/comunicaciones/${encodeURIComponent(id)}/exportar/pdf`);
      if (!respuesta.ok) {
        const cuerpo = await respuesta.json().catch(() => ({}));
        throw new Error(Array.isArray(cuerpo.message) ? cuerpo.message.join(', ') : cuerpo.message || 'No se pudo generar el PDF.');
      }
      const archivo = await respuesta.blob();
      const url = window.URL.createObjectURL(archivo);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `${numero || 'comunicacion-servicio'}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
      setAviso('PDF generado correctamente.');
    } catch (error) {
      setAviso(error instanceof Error ? error.message : 'No se pudo generar el PDF.');
    } finally {
      setDescargandoPdf(false);
    }
  };

  const mostrarPaso = (numeroPaso: number) => imprimirTodo || paso === numeroPaso;
  const estadoLegible = estado ? estado.replaceAll('_', ' ') : 'NUEVO';

  return <div className={`service-form ${imprimirTodo ? 'service-printing' : ''}`}>
    <div className="service-topline">
      <Link href="/dashboard/servicios">← Servicios</Link>
      <span aria-live="polite">{aviso}</span>
    </div>
    <section className="service-heading">
      <div>
        <div className="topbar-eyebrow">Comunicación de servicios · uso interno</div>
        <h2>{numero ? `Comunicación ${numero}` : 'Nueva comunicación'}</h2>
        <p>No válido como informe. {cruzaMedianoche ? 'El regreso se contabiliza al día siguiente.' : 'Los borradores se conservan aun con conectividad inestable.'}</p>
      </div>
      <div className="service-actions service-actions-main">
        <span className={`service-status status-${estadoLegible.toLowerCase().replaceAll(' ', '-')}`}>{estadoLegible}</span>
        <button type="button" className="service-secondary" onClick={imprimir}>Imprimir</button>
        {id && <button type="button" className="service-secondary" disabled={descargandoPdf} onClick={() => void descargarPdf()}>{descargandoPdf ? 'Generando PDF…' : 'Descargar PDF'}</button>}
        {!soloLectura && <><button type="button" className="btn-primary" disabled={guardando} onClick={() => void guardar()}>{guardando ? 'Guardando…' : 'Guardar borrador'}</button><button type="button" className="btn-primary service-final" disabled={guardando} onClick={() => void guardar(true)}>Validar y finalizar</button></>}
      </div>
    </section>

    {errores.length > 0 && <div className="service-validation" role="alert"><strong>Faltan datos para finalizar</strong><ul>{errores.map((error) => <li key={error}>{error}</li>)}</ul></div>}
    {soloLectura && <div className="service-readonly" role="status">Esta comunicación está {estadoLegible.toLowerCase()} y se muestra en modo consulta.</div>}

    <div className="service-steps" aria-label="Etapas de la comunicación">
      {['Datos básicos', 'Ocurrencia', 'Recursos y apoyo', 'Conformidad'].map((etiqueta, indice) => <button type="button" key={etiqueta} className={paso === indice + 1 ? 'active' : ''} aria-current={paso === indice + 1 ? 'step' : undefined} onClick={() => setPaso(indice + 1)}><b>0{indice + 1}</b>{etiqueta}</button>)}
    </div>

    {mostrarPaso(1) && <section className="card service-section" data-print-section="01">
      <Section numero="01" titulo="Datos básicos" texto="Datos recibidos, tiempos y ubicación de la comunicación." />
      <div className="service-type" role="group" aria-label="Tipo de comunicación">
        <button type="button" disabled={soloLectura} className={tipo === 'OTRAS_OCURRENCIAS' ? 'active' : ''} onClick={() => setTipo('OTRAS_OCURRENCIAS')}><b>Otras ocurrencias</b><small>Accidente, animales, transporte, rescate, cobertura u otro servicio.</small></button>
        <button type="button" disabled={soloLectura} className={tipo === 'INCENDIO' ? 'active' : ''} onClick={() => setTipo('INCENDIO')}><b>Incendio</b><small>Estructural, forestal, vehicular, eléctrico, MAT-PEL u otro.</small></button>
      </div>
      <div className="service-grid three">
        <Field etiqueta="N.º de comunicación"><input className="input-field" value={numero} readOnly placeholder="Se asigna al guardar" /></Field>
        <Field etiqueta="Fecha"><input className="input-field" disabled={soloLectura} type="date" value={datos.fecha} onChange={(evento) => set('fecha', evento.target.value)} /></Field>
        <Field etiqueta="Hora de denuncia"><input className="input-field" disabled={soloLectura} type="time" value={datos.denuncia} onChange={(evento) => set('denuncia', evento.target.value)} /></Field>
        <Field etiqueta="Salida general"><input className="input-field" disabled={soloLectura} type="time" value={datos.salida} onChange={(evento) => set('salida', evento.target.value)} /></Field>
        <Field etiqueta="En base general"><input className="input-field" disabled={soloLectura} type="time" value={datos.enBase} onChange={(evento) => set('enBase', evento.target.value)} /></Field>
        <Field etiqueta="Tiempo total"><input className="input-field" value={formatoDuracion(minutos)} readOnly placeholder="Calculado automáticamente" /></Field>
      </div>
      {cruzaMedianoche && <p className="service-hint">El horario de regreso es anterior al de salida; se calculó como regreso del día siguiente.</p>}
      <div className="service-grid two">
        <Field etiqueta="Denunciante"><input className="input-field" disabled={soloLectura} value={datos.denunciante} onChange={(evento) => set('denunciante', evento.target.value)} /></Field>
        <Field etiqueta="Teléfono"><input className="input-field" disabled={soloLectura} type="tel" value={datos.telefono} onChange={(evento) => set('telefono', evento.target.value)} placeholder="Ej. 0981 123 456" /></Field>
        <PersonaInput etiqueta="Recibido por" valor={datos.recibidoPor} personal={personal} disabled={soloLectura} onChange={(valor, personaId) => { set('recibidoPor', valor); set('recibidoPorPersonaId', personaId); }} />
        <Field etiqueta="Localidad"><input className="input-field" disabled={soloLectura} value={datos.localidad} onChange={(evento) => set('localidad', evento.target.value)} /></Field>
        <Field etiqueta="Barrio / Cía."><input className="input-field" disabled={soloLectura} value={datos.barrio} onChange={(evento) => set('barrio', evento.target.value)} /></Field>
        <Field etiqueta="Dirección o referencia"><input className="input-field" disabled={soloLectura} value={datos.direccion} onChange={(evento) => set('direccion', evento.target.value)} /></Field>
        <PersonaInput etiqueta="Comandante de incidente" valor={datos.comandante} personal={personal} disabled={soloLectura} onChange={(valor, personaId) => { set('comandante', valor); set('comandanteIncidentePersonaId', personaId); }} />
        <Field etiqueta="Guardias relacionadas"><input className="input-field" disabled={soloLectura} value={arreglo<string>(datos.guardias).join(', ')} onChange={(evento) => set('guardias', evento.target.value.split(/[,;\n]/).map((valor) => valor.trim()).filter(Boolean))} placeholder="Separar personas con coma" /></Field>
      </div>
      {!imprimirTodo && <button type="button" className="btn-primary" disabled={soloLectura} onClick={() => setPaso(2)}>Continuar →</button>}
    </section>}

    {mostrarPaso(2) && <section className="card service-section" data-print-section="02">
      <Section numero="02" titulo={tipo === 'INCENDIO' ? 'Incendio' : 'Qué ocurrió'} texto="Las secciones se revelan cuando son relevantes y conservan sus datos si se ocultan temporalmente." />
      {tipo === 'OTRAS_OCURRENCIAS'
        ? <OtrasOcurrencias datos={datos} soloLectura={soloLectura} seleccionado={seleccionado} set={set} />
        : <Incendio datos={datos} soloLectura={soloLectura} set={set} actualizarFila={actualizarFila} agregarFila={agregarFila} quitarFila={quitarFila} personas={arreglo<Valores>(datos.personas)} />}
      {!imprimirTodo && <button type="button" className="btn-primary" disabled={soloLectura} onClick={() => setPaso(3)}>Continuar →</button>}
    </section>}

    {mostrarPaso(3) && <section className="card service-section" data-print-section="03">
      <Section numero="03" titulo="Recursos, personas y apoyo" texto="Agregue filas sólo si participaron en el servicio. Las tablas no están limitadas por el formato en papel." />
      <Toggle etiqueta="¿Se emitió factura?" valor={Boolean(datos.facturaActiva)} disabled={soloLectura} onChange={(valor) => set('facturaActiva', valor)} />
      {datos.facturaActiva && <div className="service-grid two"><Field etiqueta="Número de factura"><input className="input-field" disabled={soloLectura} value={datos.facturaNumero} onChange={(evento) => set('facturaNumero', evento.target.value)} /></Field><Field etiqueta="Monto total (PYG)"><input className="input-field" disabled={soloLectura} min="0" step="0.01" type="number" value={datos.facturaMonto} onChange={(evento) => set('facturaMonto', evento.target.value)} /></Field></div>}
      <EditableTable titulo="Personas involucradas o afectadas" filas={arreglo<Valores>(datos.personas)} disabled={soloLectura} columnas={[
        { clave: 'nombresApellidos', etiqueta: 'Nombres y apellidos' }, { clave: 'ci', etiqueta: 'CI' }, { clave: 'sexo', etiqueta: 'Sexo', tipo: 'select', opciones: ['No especificado', 'Femenino', 'Masculino', 'Otro'] }, { clave: 'edad', etiqueta: 'Edad', tipo: 'number', min: 0 }, { clave: 'direccion', etiqueta: 'Dirección' },
      ]} agregar={() => agregarFila('personas', { nombresApellidos: '', ci: '', sexo: 'No especificado', edad: '', direccion: '' })} actualizar={(filaId, clave, valor) => actualizarFila('personas', filaId, clave, valor)} quitar={(filaId) => quitarFila('personas', filaId)} />
      {tipo === 'OTRAS_OCURRENCIAS' && <EditableTable titulo="Vehículos involucrados" filas={arreglo<Valores>(datos.vehiculosInvolucrados)} disabled={soloLectura} columnas={[
        { clave: 'marca', etiqueta: 'Marca' }, { clave: 'modelo', etiqueta: 'Modelo' }, { clave: 'color', etiqueta: 'Color' }, { clave: 'matricula', etiqueta: 'Matrícula' }, { clave: 'choferTexto', etiqueta: 'Chofer' },
      ]} agregar={() => agregarFila('vehiculosInvolucrados', { marca: '', modelo: '', color: '', matricula: '', choferTexto: '' })} actualizar={(filaId, clave, valor) => actualizarFila('vehiculosInvolucrados', filaId, clave, valor)} quitar={(filaId) => quitarFila('vehiculosInvolucrados', filaId)} />}
      <Instituciones datos={datos} soloLectura={soloLectura} set={set} actualizarFila={actualizarFila} agregarFila={agregarFila} quitarFila={quitarFila} />
      {tipo === 'INCENDIO' && <ResumenPersonas datos={datos} soloLectura={soloLectura} set={set} />}
      <MovilesDespachados filas={arreglo<Valores>(datos.movilesDespachados)} disabled={soloLectura} actualizar={actualizarFila} agregar={() => agregarFila('movilesDespachados', { movilId: '', seleccionado: false, chofer: '', choferPersonaId: '', horaSalida: '', horaEnBase: '', kilometrajeInicial: '', kilometrajeFinal: '' })} quitar={(filaId) => quitarFila('movilesDespachados', filaId)} />
      <Field etiqueta="Justificación si no hubo despacho"><textarea className="input-field" disabled={soloLectura} rows={2} value={datos.sinDespachoJustificacion} onChange={(evento) => set('sinDespachoJustificacion', evento.target.value)} placeholder="Obligatoria al finalizar si no se selecciona ningún móvil" /></Field>
      <Toggle etiqueta="¿Hubo problemas durante el servicio?" valor={Boolean(datos.problemasActivos)} disabled={soloLectura} onChange={(valor) => set('problemasActivos', valor)} />
      {datos.problemasActivos && <><Checks etiqueta="Problemas presentes o evidentes" opciones={['Retrasos en la notificación', 'Escasez de personal o equipos', 'Falta de información precisa', 'Descoordinación con otras instituciones', 'Curiosos o multitudes', 'Fallas en el equipo', 'Fatiga del personal', 'Otro']} valor={arreglo<string>(datos.problemas)} disabled={soloLectura} onChange={(valor) => set('problemas', valor)} />{arreglo<string>(datos.problemas).includes('Otro') && <Field etiqueta="Otro problema"><input className="input-field" disabled={soloLectura} value={datos.otroProblema} onChange={(evento) => set('otroProblema', evento.target.value)} /></Field>}</>}
      <div className="service-grid two">
        <Field etiqueta="Tareas ejecutadas"><textarea className="input-field" disabled={soloLectura} rows={5} value={datos.tareas} onChange={(evento) => set('tareas', evento.target.value)} /></Field>
        <Field etiqueta="Datos de interés"><textarea className="input-field" disabled={soloLectura} rows={5} value={datos.datosInteres} onChange={(evento) => set('datosInteres', evento.target.value)} /></Field>
        <Field etiqueta="Descripción de la escena"><textarea className="input-field" disabled={soloLectura} rows={4} value={datos.descripcionEscena} onChange={(evento) => set('descripcionEscena', evento.target.value)} /></Field>
        <div className="service-choice"><span>Situación y croquis</span><label><input disabled={soloLectura} type="checkbox" checked={Boolean(datos.falsaAlarma)} onChange={(evento) => set('falsaAlarma', evento.target.checked)} /> Falsa alarma</label><label><input disabled={soloLectura} type="checkbox" checked={Boolean(datos.croquisActivo)} onChange={(evento) => set('croquisActivo', evento.target.checked)} /> Agregar croquis o mapa</label></div>
      </div>
      {datos.croquisActivo && <Croquis valor={datos.croquis} disabled={soloLectura} onChange={(valor) => set('croquis', valor)} />}
      {!imprimirTodo && <button type="button" className="btn-primary" disabled={soloLectura} onClick={() => setPaso(4)}>Revisar y conformar →</button>}
    </section>}

    {mostrarPaso(4) && <section className="card service-section" data-print-section="04">
      <Section numero="04" titulo="Nómina y conformidad" texto="Personal participante, firmas internas y revisión final de la comunicación." />
      <Nomina filas={arreglo<Valores>(datos.nomina)} disabled={soloLectura} actualizar={(filaId, clave, valor) => actualizarFila('nomina', filaId, clave, valor)} />
      <div className="service-grid two"><PersonaInput etiqueta="Oficial a cargo" valor={datos.firmaOficial} personal={personal} disabled={soloLectura} onChange={(valor) => set('firmaOficial', valor)} /><PersonaInput etiqueta="Dpto. de Estadística" valor={datos.firmaEstadistica} personal={personal} disabled={soloLectura} onChange={(valor) => set('firmaEstadistica', valor)} /></div>
      <div className="service-review"><strong>Resumen para validar</strong><span>{tipo === 'INCENDIO' ? arreglo<string>(datos.incendioTipo).join(', ') || 'Sin tipo seleccionado' : arreglo<string>(datos.categorias).join(', ') || 'Sin categoría seleccionada'}</span><span>{arreglo<Valores>(datos.movilesDespachados).filter((movil) => movil.seleccionado).length} móvil(es) despachado(s)</span><span>{formatoDuracion(minutos) ? `Tiempo total: ${formatoDuracion(minutos)}` : 'Tiempo total pendiente'}</span></div>
      {!imprimirTodo && !soloLectura && <div className="service-actions"><button type="button" className="btn-primary" disabled={guardando} onClick={() => void guardar()}>{guardando ? 'Guardando…' : 'Guardar borrador'}</button><button type="button" className="btn-primary service-final" disabled={guardando} onClick={() => void guardar(true)}>Validar y finalizar</button></div>}
    </section>}
  </div>;
}

function Section({ numero, titulo, texto: descripcion }: { numero: string; titulo: string; texto: string }) {
  return <div className="service-section-title"><span>{numero}</span><div><h3>{titulo}</h3><p>{descripcion}</p></div></div>;
}

function Field({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return <div className="service-field"><label>{etiqueta}</label>{children}</div>;
}

function PersonaInput({ etiqueta, valor, personal, disabled, onChange }: { etiqueta: string; valor: string; personal: PersonalCatalogo[]; disabled?: boolean; onChange: (valor: string, personaId: string) => void }) {
  const listaId = `personal-${etiqueta.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return <Field etiqueta={etiqueta}><input className="input-field" list={listaId} disabled={disabled} value={valor} onChange={(evento) => { const siguiente = evento.target.value; onChange(siguiente, personal.find((persona) => persona.etiqueta === siguiente)?.id ?? ''); }} placeholder={personal.length ? 'Busque por código o nombre' : 'Ingrese nombre o código'} /><datalist id={listaId}>{personal.map((persona) => <option key={persona.id} value={persona.etiqueta} />)}</datalist></Field>;
}

function Toggle({ etiqueta, valor, disabled, onChange }: { etiqueta: string; valor: boolean; disabled?: boolean; onChange: (valor: boolean) => void }) {
  return <label className="service-toggle"><input type="checkbox" disabled={disabled} checked={valor} onChange={(evento) => onChange(evento.target.checked)} /><span>{etiqueta}</span></label>;
}

function Checks({ etiqueta, opciones, valor, disabled, onChange }: { etiqueta: string; opciones: string[]; valor: string[]; disabled?: boolean; onChange: (valor: string[]) => void }) {
  const alternar = (opcion: string) => onChange(valor.includes(opcion) ? valor.filter((item) => item !== opcion) : [...valor, opcion]);
  return <div className="service-choice"><span>{etiqueta}</span><div>{opciones.map((opcion) => <label key={opcion}><input type="checkbox" disabled={disabled} checked={valor.includes(opcion)} onChange={() => alternar(opcion)} /> {opcion}</label>)}</div></div>;
}

function Bloque({ children }: { children: ReactNode }) { return <div className="service-subsection">{children}</div>; }

function Conteos({ titulo, filas, disabled, onChange }: { titulo: string; filas: Valores[]; disabled?: boolean; onChange: (filas: Valores[]) => void }) {
  const actualizar = (tipo: string, cambio: Valores) => onChange(filas.map((fila) => fila.tipo === tipo ? { ...fila, ...cambio } : fila));
  return <div className="service-table-wrap"><div className="service-table-title">{titulo}</div><div className="service-table-scroll"><table><thead><tr><th>Tipo</th><th>Incluir</th><th>Cantidad</th><th>Datos / detalle</th></tr></thead><tbody>{TIPOS_CONTEO.map(({ codigo, etiqueta }) => {
    const fila = filas.find((item) => item.tipo === codigo) ?? { tipo: codigo, seleccionado: false, cantidad: '', datos: '', otroDescripcion: '' };
    return <tr key={codigo}><td>{etiqueta}</td><td><input aria-label={`Incluir ${etiqueta}`} disabled={disabled} type="checkbox" checked={Boolean(fila.seleccionado)} onChange={(evento) => actualizar(codigo, { seleccionado: evento.target.checked })} /></td><td><input className="input-field" disabled={disabled || !fila.seleccionado} min="0" step="1" type="number" value={fila.cantidad ?? ''} onChange={(evento) => actualizar(codigo, { cantidad: evento.target.value })} /></td><td>{codigo === 'OTRO' ? <input className="input-field" disabled={disabled || !fila.seleccionado} value={fila.otroDescripcion ?? ''} onChange={(evento) => actualizar(codigo, { otroDescripcion: evento.target.value })} placeholder="Descripción obligatoria" /> : <input className="input-field" disabled={disabled || !fila.seleccionado} value={fila.datos ?? ''} onChange={(evento) => actualizar(codigo, { datos: evento.target.value })} placeholder="Detalle relevante" />}</td></tr>;
  })}</tbody></table></div></div>;
}

function OtrasOcurrencias({ datos, soloLectura, seleccionado, set }: { datos: Valores; soloLectura: boolean; seleccionado: (opcion: string) => boolean; set: (campo: string, valor: unknown) => void }) {
  return <>
    <Checks etiqueta="¿Qué ocurrió o qué servicio se realizó?" opciones={['Accidente', 'Animales', 'Transporte', 'Rescate', 'Cobertura', 'Otro servicio']} valor={arreglo<string>(datos.categorias)} disabled={soloLectura} onChange={(valor) => set('categorias', valor)} />
    {seleccionado('Accidente') && <Bloque><Checks etiqueta="Tipo de accidente" opciones={['Choque', 'Arrollamiento', 'Vuelco', 'Caída', 'Otro']} valor={arreglo<string>(datos.accidenteTipo)} disabled={soloLectura} onChange={(valor) => set('accidenteTipo', valor)} />{arreglo<string>(datos.accidenteTipo).includes('Otro') && <Field etiqueta="Otro tipo de accidente"><input className="input-field" disabled={soloLectura} value={datos.accidenteOtroDescripcion} onChange={(evento) => set('accidenteOtroDescripcion', evento.target.value)} /></Field>}<Checks etiqueta="Qué presenta" opciones={['Daños materiales', 'Heridos', 'Atrapados', 'Incendio', 'MAT-PEL']} valor={arreglo<string>(datos.accidentePresenta)} disabled={soloLectura} onChange={(valor) => set('accidentePresenta', valor)} /><Conteos titulo="Afectados" filas={arreglo<Valores>(datos.accidenteAfectados)} disabled={soloLectura} onChange={(valor) => set('accidenteAfectados', valor)} /></Bloque>}
    {seleccionado('Animales') && <Bloque><Checks etiqueta="Tipo de animal" opciones={['Mamíferos', 'Aves', 'Reptiles', 'Otro']} valor={arreglo<string>(datos.animalTipos)} disabled={soloLectura} onChange={(valor) => set('animalTipos', valor)} />{arreglo<string>(datos.animalTipos).includes('Otro') && <Field etiqueta="Otro tipo de animal"><input className="input-field" disabled={soloLectura} value={datos.animalOtroDescripcion} onChange={(evento) => set('animalOtroDescripcion', evento.target.value)} /></Field>}<div className="service-grid two"><Field etiqueta="Especie"><input className="input-field" disabled={soloLectura} value={datos.animalEspecie} onChange={(evento) => set('animalEspecie', evento.target.value)} /></Field><AnimalEstados valor={datos.animalesEstado} disabled={soloLectura} onChange={(valor) => set('animalesEstado', valor)} /></div></Bloque>}
    {seleccionado('Transporte') && <Bloque><Checks etiqueta="Lesiones" opciones={['Hemorragia', 'Dificultad respiratoria', 'Fractura', 'Quemadura', 'PCR']} valor={arreglo<string>(datos.lesiones)} disabled={soloLectura} onChange={(valor) => set('lesiones', valor)} /><Conteos titulo="Transportados" filas={arreglo<Valores>(datos.transportados)} disabled={soloLectura} onChange={(valor) => set('transportados', valor)} /></Bloque>}
    {seleccionado('Rescate') && <Bloque><Checks etiqueta="Tipo de rescate" opciones={['Accidente', 'Vertical', 'Vivienda', 'Acuático', 'Otro']} valor={arreglo<string>(datos.rescateTipos)} disabled={soloLectura} onChange={(valor) => set('rescateTipos', valor)} />{arreglo<string>(datos.rescateTipos).includes('Otro') && <Field etiqueta="Otro tipo de rescate"><input className="input-field" disabled={soloLectura} value={datos.rescateOtroDescripcion} onChange={(evento) => set('rescateOtroDescripcion', evento.target.value)} /></Field>}<Conteos titulo="Rescatados" filas={arreglo<Valores>(datos.rescatados)} disabled={soloLectura} onChange={(valor) => set('rescatados', valor)} /></Bloque>}
    {seleccionado('Cobertura') && <Field etiqueta="Motivo de cobertura"><textarea className="input-field" disabled={soloLectura} rows={3} value={datos.coberturaMotivo} onChange={(evento) => set('coberturaMotivo', evento.target.value)} /></Field>}
    {seleccionado('Otro servicio') && <Bloque><Checks etiqueta="Tipo de otro servicio" opciones={['Despeje de calzada', 'Remolque / Acoplado', 'Charla', 'Colecta', 'Juramento', 'Asistencia a enfermo', 'Otro']} valor={arreglo<string>(datos.otrosTipos)} disabled={soloLectura} onChange={(valor) => set('otrosTipos', valor)} />{arreglo<string>(datos.otrosTipos).includes('Otro') && <Field etiqueta="Otro servicio"><input className="input-field" disabled={soloLectura} value={datos.otroServicio} onChange={(evento) => set('otroServicio', evento.target.value)} /></Field>}</Bloque>}
    <Toggle etiqueta="Falsa alarma" valor={Boolean(datos.falsaAlarma)} disabled={soloLectura} onChange={(valor) => set('falsaAlarma', valor)} />
  </>;
}

function AnimalEstados({ valor, disabled, onChange }: { valor: Valores; disabled?: boolean; onChange: (valor: Valores) => void }) {
  return <Field etiqueta="Estado y cantidad"><div className="animal-state-grid">{[['ilesos', 'Ilesos'], ['heridos', 'Heridos'], ['fallecidos', 'Fallecidos'], ['enfermos', 'Enfermos']].map(([clave, etiqueta]) => <label key={clave}>{etiqueta}<input className="input-field" disabled={disabled} min="0" step="1" type="number" value={valor?.[clave] ?? ''} onChange={(evento) => onChange({ ...valor, [clave]: evento.target.value })} /></label>)}</div></Field>;
}

function Incendio({ datos, soloLectura, set, actualizarFila, agregarFila, quitarFila, personas }: { datos: Valores; soloLectura: boolean; set: (campo: string, valor: unknown) => void; actualizarFila: (campo: string, filaId: string | number, clave: string, valor: unknown) => void; agregarFila: (campo: string, fila: Valores) => void; quitarFila: (campo: string, filaId: string | number) => void; personas: Valores[] }) {
  const incendios = arreglo<string>(datos.incendioTipo);
  const causas = datos.causas as Valores;
  const actualizarCausa = (clave: string, cambio: Valores) => set('causas', { ...causas, [clave]: { ...causas?.[clave], ...cambio } });
  return <>
    <Checks etiqueta="Tipo de incendio" opciones={['Estructural', 'Forestal Pastizal', 'Forestal Bosque', 'Vehicular', 'Basural', 'Eléctrico', 'MAT-PEL', 'Otro']} valor={incendios} disabled={soloLectura} onChange={(valor) => set('incendioTipo', valor)} />
    {incendios.includes('Otro') && <Field etiqueta="Otro tipo de incendio"><input className="input-field" disabled={soloLectura} value={datos.incendioOtroDescripcion} onChange={(evento) => set('incendioOtroDescripcion', evento.target.value)} /></Field>}
    <Checks etiqueta="Combustibles" opciones={['Materiales sólidos', 'Líquidos inflamables', 'Gases inflamables', 'Productos químicos', 'Grasas y aceites', 'Biomasa', 'Polímeros', 'Neumáticos', 'Residuos', 'Otro']} valor={arreglo<string>(datos.combustibles)} disabled={soloLectura} onChange={(valor) => set('combustibles', valor)} />
    {arreglo<string>(datos.combustibles).includes('Otro') && <Field etiqueta="Otro combustible"><input className="input-field" disabled={soloLectura} value={datos.combustibleOtroDescripcion} onChange={(evento) => set('combustibleOtroDescripcion', evento.target.value)} /></Field>}
    <Bloque><div className="service-subtitle">Recursos de extinción</div><div className="service-grid three"><Field etiqueta="Agua (litros)"><input className="input-field" disabled={soloLectura} min="0" step="0.01" type="number" value={datos.aguaLitros} onChange={(evento) => set('aguaLitros', evento.target.value)} /></Field><Field etiqueta="Espuma (litros)"><input className="input-field" disabled={soloLectura} min="0" step="0.01" type="number" value={datos.espumaLitros} onChange={(evento) => set('espumaLitros', evento.target.value)} /></Field><Field etiqueta="PQS (kilogramos)"><input className="input-field" disabled={soloLectura} min="0" step="0.01" type="number" value={datos.pqsKilogramos} onChange={(evento) => set('pqsKilogramos', evento.target.value)} /></Field></div><div className="service-inline-toggles"><Toggle etiqueta="Herramientas manuales" valor={Boolean(datos.usoHerramientasManuales)} disabled={soloLectura} onChange={(valor) => set('usoHerramientasManuales', valor)} /><Toggle etiqueta="Otro recurso" valor={Boolean(datos.otroRecursoExtincion)} disabled={soloLectura} onChange={(valor) => set('otroRecursoExtincion', valor)} /></div>{datos.otroRecursoExtincion && <Field etiqueta="Descripción del otro recurso"><input className="input-field" disabled={soloLectura} value={datos.otroRecursoExtincionDescripcion} onChange={(evento) => set('otroRecursoExtincionDescripcion', evento.target.value)} /></Field>}</Bloque>
    <Bloque><div className="service-subtitle">Causas, especificar</div><div className="service-grid three">{[['antropica', 'Antrópicas'], ['accidental', 'Accidentales'], ['natural', 'Naturales']].map(([clave, etiqueta]) => <div className="service-cause" key={clave}><Toggle etiqueta={etiqueta} valor={Boolean(causas?.[clave]?.seleccionada)} disabled={soloLectura} onChange={(valor) => actualizarCausa(clave, { seleccionada: valor })} />{causas?.[clave]?.seleccionada && <input className="input-field" disabled={soloLectura} value={causas?.[clave]?.descripcion ?? ''} onChange={(evento) => actualizarCausa(clave, { descripcion: evento.target.value })} placeholder="Especificar hipótesis" />}</div>)}</div></Bloque>
    <div className="service-grid three"><Field etiqueta="Magnitud"><select className="input-field" disabled={soloLectura} value={datos.magnitud} onChange={(evento) => set('magnitud', evento.target.value)}><option value="">Seleccione</option>{['Principio', 'Pequeña', 'Mediana', 'Grande', 'Emergencia general'].map((opcion) => <option key={opcion}>{opcion}</option>)}</select></Field><Field etiqueta="Superficie afectada"><input className="input-field" disabled={soloLectura} min="0" step="0.01" type="number" value={datos.superficieAfectada?.valor ?? ''} onChange={(evento) => set('superficieAfectada', { ...datos.superficieAfectada, valor: evento.target.value })} /></Field><Field etiqueta="Unidad"><select className="input-field" disabled={soloLectura} value={datos.superficieAfectada?.unidad ?? 'METROS_CUADRADOS'} onChange={(evento) => set('superficieAfectada', { ...datos.superficieAfectada, unidad: evento.target.value })}><option value="METROS_CUADRADOS">m²</option><option value="HECTAREAS">Hectáreas</option></select></Field></div>
    {incendios.some((valor) => valor.startsWith('Forestal')) && <Checks etiqueta="Táctica / método forestal" opciones={['Ataque directo', 'Ataque indirecto', 'Contrafuego', 'Quema controlada', 'Quema de ensanche']} valor={arreglo<string>(datos.tacticas)} disabled={soloLectura} onChange={(valor) => set('tacticas', valor)} />}
    <Bloque><div className="service-subtitle">Lugar</div><div className="service-grid three"><Field etiqueta="Propiedad"><select className="input-field" disabled={soloLectura} value={datos.propiedad} onChange={(evento) => set('propiedad', evento.target.value)}><option value="">Seleccione</option><option>Pública</option><option>Privada</option><option>Desconocida</option></select></Field><Field etiqueta="Descripción"><input className="input-field" disabled={soloLectura} value={datos.lugarDescripcion} onChange={(evento) => set('lugarDescripcion', evento.target.value)} /></Field><Field etiqueta="Propietario / D.º"><select className="input-field" disabled={soloLectura} value={datos.lugarPersonaId} onChange={(evento) => set('lugarPersonaId', evento.target.value)}><option value="">Sin vincular</option>{personas.map((persona, indice) => <option value={persona.id} key={persona.id}>D{indice + 1} · {persona.nombresApellidos || 'Sin nombre'}</option>)}</select></Field></div></Bloque>
    {incendios.includes('Estructural') && <Bloque><Field etiqueta="Estructura"><select className="input-field" disabled={soloLectura} value={datos.estructura} onChange={(evento) => set('estructura', evento.target.value)}><option value="">Seleccione</option>{['Residencial', 'Comercial', 'Industrial', 'Institucional', 'Otro'].map((opcion) => <option key={opcion}>{opcion}</option>)}</select></Field>{datos.estructura === 'Otro' && <Field etiqueta="Otra estructura"><input className="input-field" disabled={soloLectura} value={datos.estructuraOtroDescripcion} onChange={(evento) => set('estructuraOtroDescripcion', evento.target.value)} /></Field>}<Checks etiqueta="Seguridad" opciones={['Extintores', 'Rociadores', 'Alarmas y detectores', 'Hidrantes y mangas', 'Salidas de emergencia']} valor={arreglo<string>(datos.seguridad)} disabled={soloLectura} onChange={(valor) => set('seguridad', valor)} /></Bloque>}
    {incendios.includes('Vehicular') && <EditableTable titulo="Vehículos afectados por el incendio" filas={arreglo<Valores>(datos.vehiculosIncendio)} disabled={soloLectura} columnas={[{ clave: 'marca', etiqueta: 'Marca' }, { clave: 'modelo', etiqueta: 'Modelo' }, { clave: 'combustion', etiqueta: 'Combustión' }, { clave: 'matricula', etiqueta: 'Matrícula' }, { clave: 'choferTexto', etiqueta: 'Chofer' }]} agregar={() => agregarFila('vehiculosIncendio', { marca: '', modelo: '', combustion: '', matricula: '', choferTexto: '', choferPersonaId: '' })} actualizar={(filaId, clave, valor) => actualizarFila('vehiculosIncendio', filaId, clave, valor)} quitar={(filaId) => quitarFila('vehiculosIncendio', filaId)} />}
    {incendios.includes('Eléctrico') && <><Checks etiqueta="Descripción eléctrica" opciones={['Transformador', 'Tablero', 'Instalación eléctrica', 'Otro']} valor={arreglo<string>(datos.electrico)} disabled={soloLectura} onChange={(valor) => set('electrico', valor)} />{arreglo<string>(datos.electrico).includes('Otro') && <Field etiqueta="Otra descripción eléctrica"><input className="input-field" disabled={soloLectura} value={datos.electricoOtroDescripcion} onChange={(evento) => set('electricoOtroDescripcion', evento.target.value)} /></Field>}</>}
    {incendios.includes('MAT-PEL') && <div className="service-grid two"><Field etiqueta="N.º ONU"><input className="input-field" disabled={soloLectura} inputMode="numeric" maxLength={4} value={datos.matpelOnu} onChange={(evento) => set('matpelOnu', evento.target.value.replace(/\D/g, '').slice(0, 4))} /></Field><Field etiqueta="Descripción MAT-PEL"><input className="input-field" disabled={soloLectura} value={datos.matpelDescripcion} onChange={(evento) => set('matpelDescripcion', evento.target.value)} /></Field></div>}
  </>;
}

type Columna = { clave: string; etiqueta: string; tipo?: 'text' | 'number' | 'select'; min?: number; opciones?: string[] };

function EditableTable({ titulo, filas, columnas, disabled, agregar, actualizar, quitar }: { titulo: string; filas: Valores[]; columnas: Columna[]; disabled?: boolean; agregar: () => void; actualizar: (filaId: string | number, clave: string, valor: string) => void; quitar: (filaId: string | number) => void }) {
  return <div className="service-table-wrap"><div className="service-table-title">{titulo}</div><div className="service-table-scroll"><table><thead><tr><th>N.º</th>{columnas.map((columna) => <th key={columna.clave}>{columna.etiqueta}</th>)}{!disabled && <th><span className="sr-only">Acciones</span></th>}</tr></thead><tbody>{filas.map((fila, indice) => <tr key={fila.id}><td>{indice + 1}</td>{columnas.map((columna) => <td key={columna.clave}>{columna.tipo === 'select' ? <select className="input-field" disabled={disabled} value={fila[columna.clave] ?? ''} onChange={(evento) => actualizar(fila.id, columna.clave, evento.target.value)}>{(columna.opciones ?? []).map((opcion) => <option key={opcion}>{opcion}</option>)}</select> : <input className="input-field" disabled={disabled} min={columna.min} type={columna.tipo ?? 'text'} value={fila[columna.clave] ?? ''} onChange={(evento) => actualizar(fila.id, columna.clave, evento.target.value)} />}</td>)}{!disabled && <td><button type="button" className="service-remove" onClick={() => quitar(fila.id)}>Quitar</button></td>}</tr>)}</tbody></table></div>{!disabled && <button type="button" className="service-add" onClick={agregar}>+ Agregar fila</button>}</div>;
}

function Instituciones({ datos, soloLectura, set, actualizarFila, agregarFila, quitarFila }: { datos: Valores; soloLectura: boolean; set: (campo: string, valor: unknown) => void; actualizarFila: (campo: string, filaId: string | number, clave: string, valor: unknown) => void; agregarFila: (campo: string, fila: Valores) => void; quitarFila: (campo: string, filaId: string | number) => void }) {
  const filas = arreglo<Valores>(datos.instituciones);
  return <><Toggle etiqueta="¿Participaron instituciones, cuarteles o compañías?" valor={filas.length > 0} disabled={soloLectura} onChange={(activo) => activo && !filas.length ? agregarFila('instituciones', { tipoRegistro: 'INSTITUCION', tipoCatalogo: 'Hospital', nombreDescripcion: '', aCargo: '', movil: '' }) : !activo && set('instituciones', [])} />{filas.length > 0 && <EditableTable titulo="Instituciones de apoyo o involucradas" filas={filas} disabled={soloLectura} columnas={[{ clave: 'tipoRegistro', etiqueta: 'Registro', tipo: 'select', opciones: ['INSTITUCION', 'CUARTEL_COMPANIA'] }, { clave: 'tipoCatalogo', etiqueta: 'Tipo / catálogo' }, { clave: 'nombreDescripcion', etiqueta: 'Nombre / descripción' }, { clave: 'aCargo', etiqueta: 'A cargo' }, { clave: 'movil', etiqueta: 'Móvil (si aplica)' }]} agregar={() => agregarFila('instituciones', { tipoRegistro: 'INSTITUCION', tipoCatalogo: '', nombreDescripcion: '', aCargo: '', movil: '' })} actualizar={(filaId, clave, valor) => actualizarFila('instituciones', filaId, clave, valor)} quitar={(filaId) => quitarFila('instituciones', filaId)} />}</>;
}

function ResumenPersonas({ datos, soloLectura, set }: { datos: Valores; soloLectura: boolean; set: (campo: string, valor: unknown) => void }) {
  const resumen = datos.resumenPersonas as Valores;
  return <div className="service-table-wrap"><div className="service-table-title">Resumen de involucrados o afectados</div><div className="service-table-scroll"><table><thead><tr><th>Tipo</th><th>Ilesos</th><th>Heridos</th><th>Fallecidos</th></tr></thead><tbody>{[['involucrados', 'Involucrados'], ['rescatados', 'Rescatados'], ['transportados', 'Transportados']].map(([clave, etiqueta]) => <tr key={clave}><td>{etiqueta}</td>{['ilesos', 'heridos', 'fallecidos'].map((estado) => <td key={estado}><input className="input-field" disabled={soloLectura} min="0" step="1" type="number" value={resumen?.[clave]?.[estado] ?? ''} onChange={(evento) => set('resumenPersonas', { ...resumen, [clave]: { ...resumen?.[clave], [estado]: evento.target.value } })} /></td>)}</tr>)}</tbody></table></div></div>;
}

function MovilesDespachados({ filas, disabled, actualizar, agregar, quitar }: { filas: Valores[]; disabled?: boolean; actualizar: (campo: string, filaId: string | number, clave: string, valor: unknown) => void; agregar: () => void; quitar: (filaId: string | number) => void }) {
  return <div className="service-table-wrap"><div className="service-table-title">Móviles despachados</div><div className="service-table-scroll"><table><thead><tr><th>Usar</th><th>Móvil</th><th>Chofer</th><th>Salida</th><th>En base</th><th>Km inicial</th><th>Km final</th><th>Recorrido</th>{!disabled && <th><span className="sr-only">Acciones</span></th>}</tr></thead><tbody>{filas.map((fila) => {
    const recorrido = fila.kilometrajeInicial !== '' && fila.kilometrajeFinal !== '' && decimalNoNegativo(fila.kilometrajeInicial) && decimalNoNegativo(fila.kilometrajeFinal) ? Number(fila.kilometrajeFinal) - Number(fila.kilometrajeInicial) : null;
    return <tr key={fila.id}><td><input aria-label={`Despachar ${fila.movilId || 'móvil'}`} disabled={disabled} type="checkbox" checked={Boolean(fila.seleccionado)} onChange={(evento) => actualizar('movilesDespachados', fila.id, 'seleccionado', evento.target.checked)} /></td><td><input className="input-field" disabled={disabled} value={fila.movilId ?? ''} onChange={(evento) => actualizar('movilesDespachados', fila.id, 'movilId', evento.target.value)} /></td><td><input className="input-field" disabled={disabled || !fila.seleccionado} value={fila.chofer ?? ''} onChange={(evento) => actualizar('movilesDespachados', fila.id, 'chofer', evento.target.value)} /></td><td><input className="input-field" disabled={disabled || !fila.seleccionado} type="time" value={fila.horaSalida ?? ''} onChange={(evento) => actualizar('movilesDespachados', fila.id, 'horaSalida', evento.target.value)} /></td><td><input className="input-field" disabled={disabled || !fila.seleccionado} type="time" value={fila.horaEnBase ?? ''} onChange={(evento) => actualizar('movilesDespachados', fila.id, 'horaEnBase', evento.target.value)} /></td><td><input className="input-field" disabled={disabled || !fila.seleccionado} min="0" step="0.1" type="number" value={fila.kilometrajeInicial ?? ''} onChange={(evento) => actualizar('movilesDespachados', fila.id, 'kilometrajeInicial', evento.target.value)} /></td><td><input className="input-field" disabled={disabled || !fila.seleccionado} min="0" step="0.1" type="number" value={fila.kilometrajeFinal ?? ''} onChange={(evento) => actualizar('movilesDespachados', fila.id, 'kilometrajeFinal', evento.target.value)} /></td><td>{recorrido === null ? '—' : recorrido >= 0 ? recorrido.toLocaleString('es-PY') : 'Revisar'}</td>{!disabled && <td>{MOVILES_BASE.includes(fila.movilId) ? null : <button type="button" className="service-remove" onClick={() => quitar(fila.id)}>Quitar</button>}</td>}</tr>;
  })}</tbody></table></div>{!disabled && <button type="button" className="service-add" onClick={agregar}>+ Agregar móvil</button>}</div>;
}

function Nomina({ filas, disabled, actualizar }: { filas: Valores[]; disabled?: boolean; actualizar: (filaId: string | number, clave: string, valor: unknown) => void }) {
  return <div className="nomina-grid">{filas.map((fila) => <Field key={fila.id} etiqueta={fila.rolCodigo}><input className="input-field" disabled={disabled} value={fila.nombreManual ?? ''} onChange={(evento) => actualizar(fila.id, 'nombreManual', evento.target.value)} placeholder="Personal o código" /></Field>)}</div>;
}

function Croquis({ valor, disabled, onChange }: { valor: Valores; disabled?: boolean; onChange: (valor: Valores) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dibujando, setDibujando] = useState(false);
  const [herramienta, setHerramienta] = useState<'lapiz' | 'borrador'>('lapiz');
  const historial = useRef<string[]>([]);
  const indiceHistorial = useRef(-1);
  const actual = useRef('');

  const pintar = (origen: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const contexto = canvas.getContext('2d');
    if (!contexto) return;
    contexto.clearRect(0, 0, canvas.width, canvas.height);
    if (!origen) return;
    const imagen = new Image();
    imagen.onload = () => contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height);
    imagen.src = origen;
  };
  useEffect(() => {
    const fuente = texto(valor?.datos);
    if (fuente === actual.current) return;
    actual.current = fuente;
    historial.current = [fuente];
    indiceHistorial.current = 0;
    pintar(fuente);
  // El valor recibido es la fuente de verdad al abrir o recuperar un borrador.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor?.datos]);
  const posicion = (evento: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rectangulo = canvas.getBoundingClientRect();
    return { x: (evento.clientX - rectangulo.left) * (canvas.width / rectangulo.width), y: (evento.clientY - rectangulo.top) * (canvas.height / rectangulo.height) };
  };
  const confirmarTrazo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const siguiente = canvas.toDataURL('image/png');
    actual.current = siguiente;
    historial.current = [...historial.current.slice(0, indiceHistorial.current + 1), siguiente];
    indiceHistorial.current = historial.current.length - 1;
    onChange({ formato: 'PNG', datos: siguiente });
  };
  const iniciar = (evento: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    const contexto = canvas?.getContext('2d');
    if (!canvas || !contexto) return;
    canvas.setPointerCapture(evento.pointerId);
    const punto = posicion(evento);
    contexto.beginPath(); contexto.moveTo(punto.x, punto.y);
    contexto.lineCap = 'round'; contexto.lineJoin = 'round';
    contexto.lineWidth = herramienta === 'borrador' ? 28 : 3;
    contexto.strokeStyle = '#10263f';
    contexto.globalCompositeOperation = herramienta === 'borrador' ? 'destination-out' : 'source-over';
    setDibujando(true);
  };
  const dibujar = (evento: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dibujando || disabled) return;
    const contexto = canvasRef.current?.getContext('2d');
    if (!contexto) return;
    const punto = posicion(evento); contexto.lineTo(punto.x, punto.y); contexto.stroke();
  };
  const terminar = () => { if (dibujando) confirmarTrazo(); setDibujando(false); };
  const deshacer = () => { if (indiceHistorial.current <= 0) return; indiceHistorial.current -= 1; const siguiente = historial.current[indiceHistorial.current]; actual.current = siguiente; pintar(siguiente); onChange({ formato: siguiente ? 'PNG' : null, datos: siguiente }); };
  const rehacer = () => { if (indiceHistorial.current >= historial.current.length - 1) return; indiceHistorial.current += 1; const siguiente = historial.current[indiceHistorial.current]; actual.current = siguiente; pintar(siguiente); onChange({ formato: siguiente ? 'PNG' : null, datos: siguiente }); };
  const adjuntar = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = () => {
      const fuente = texto(lector.result);
      const canvas = canvasRef.current; const contexto = canvas?.getContext('2d');
      if (!canvas || !contexto || !fuente) return;
      const imagen = new Image();
      imagen.onload = () => { contexto.clearRect(0, 0, canvas.width, canvas.height); const escala = Math.min(canvas.width / imagen.width, canvas.height / imagen.height); const ancho = imagen.width * escala; const alto = imagen.height * escala; contexto.drawImage(imagen, (canvas.width - ancho) / 2, (canvas.height - alto) / 2, ancho, alto); confirmarTrazo(); };
      imagen.src = fuente;
    };
    lector.readAsDataURL(archivo);
    evento.target.value = '';
  };
  return <div className="croquis-placeholder"><div className="croquis-heading"><div><strong>Croquis o mapa situacional</strong><p>Dibuje con mouse, dedo o lápiz; también puede adjuntar una imagen. El PNG se conserva con el borrador.</p></div>{!disabled && <div className="croquis-tools"><button type="button" className={herramienta === 'lapiz' ? 'active' : ''} onClick={() => setHerramienta('lapiz')}>Lápiz</button><button type="button" className={herramienta === 'borrador' ? 'active' : ''} onClick={() => setHerramienta('borrador')}>Borrador</button><button type="button" onClick={deshacer}>Deshacer</button><button type="button" onClick={rehacer}>Rehacer</button><label>Adjuntar imagen<input type="file" accept="image/png,image/jpeg,image/webp" onChange={adjuntar} /></label><button type="button" className="danger" onClick={() => { if (window.confirm('¿Desea limpiar el croquis? Esta acción se puede deshacer antes de guardar.')) { const canvas = canvasRef.current; canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height); confirmarTrazo(); } }}>Limpiar</button></div>}</div><canvas className="croquis-canvas" ref={canvasRef} width="1200" height="600" onPointerDown={iniciar} onPointerMove={dibujar} onPointerUp={terminar} onPointerCancel={terminar} onPointerLeave={terminar} /></div>;
}
