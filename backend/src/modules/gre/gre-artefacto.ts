/** Contrato del catálogo candidato que produce scripts/matpel (fases 3B–3C).
 * El artefacto es una entrada no confiable: se valida forma, límites y procedencia
 * completa antes de persistir. Un problema detiene la carga; no se corrige ni se omite. */

export const TIPO_ARTEFACTO = 'gre_catalogo_candidato';

/** SQL Server devuelve uniqueidentifier en mayúsculas en consultas crudas: nunca comparar ids con ===. */
export const mismoId = (a: string | null | undefined, b: string | null | undefined) =>
  !!a && !!b && a.toLowerCase() === b.toLowerCase();
export const ESQUEMA_ARTEFACTO = 1;
export const SISTEMA_COORDENADAS = 'PYMUPDF_SIN_ROTAR_PT';

export interface ReferenciaArtefacto {
  id: string; documentoSha256: string; paginaPdf: number; etiquetaPdf: string;
  cajaPt: number[]; textoOriginal: string; metodo: string; tecnica?: string; estadoRevision: string;
}
export interface PaginaArtefacto {
  paginaPdf: number; etiquetaPdf: string; etiquetasImpresas: unknown[]; anchoPt: number; altoPt: number;
  rotacion: number; sha256TextoNativo: string; caracteresTexto: number; requiereRevisionNumeracion: boolean;
}
export interface SeccionArtefacto {
  id: string; tituloOriginal: string; pdfDesde: number; pdfHasta: number; tratamiento: string; estadoExtraccion?: string;
}
export interface EntradaIndiceArtefacto {
  id: string; indice: 'AMARILLO' | 'AZUL'; paginaPdf: number; identificador: string | null; identificadorOriginal: string;
  tipoIdentificador: string | null; nombreOriginal: string; nombreNormalizado: string; guiaNumero: string;
  guiaOriginal: string; polimerizable: boolean; resaltadoVerde: boolean | null; fuentes: Record<string, string[]>;
}
export interface RelacionArtefacto {
  id: string; identificador: string | null; nombreNormalizado: string; amarilloIds: string[]; azulIds: string[];
  estado: string; guiaNumero?: string; polimerizable?: boolean; resaltadoVerde?: boolean | null;
}
export interface BloqueArtefacto {
  id: string; orden: number; nivel: number | null; padreId: string | null; encabezadoOriginal: string | null;
  lineas: string[]; fuentes: string[]; textoOriginal: string; seccionId?: string; paginaPdf?: number;
}
export interface GuiaArtefacto {
  numero: string; tituloOriginal: string | null; estadoContenido: string; paginasPdf: number[];
  fuentes: Record<string, string[]>; bloques: BloqueArtefacto[];
}
export interface CeldaArtefacto {
  columna: string; orden: number; textoOriginal: string; valorDecimal: string | null; unidad: string | null;
  modificador: string | null; estadoDato: string; condiciones: unknown; fuentes: string[];
}
export interface FilaArtefacto {
  id: string; orden: number; paginaPdf: number; grupo: string; entradaId?: string | null;
  identificador?: string; identificadores?: string[]; guiaNumero?: string; guiaOriginal?: string; polimerizable?: boolean;
  nombreOriginal?: string; nombreNormalizado?: string; contenedorOriginal?: string; contenedorNormalizado?: string;
  materialId?: string; condiciones: Record<string, unknown>; celdas: CeldaArtefacto[]; fuentes: Record<string, string[]>;
}
export interface TablaArtefacto {
  codigo: string; seccionId: string; tituloOriginal: string; estructura: Record<string, unknown>;
  fuentes: string[]; notas: { textoOriginal: string; fuentes: string[] }[]; filas: FilaArtefacto[];
}
export interface ReglaArtefacto {
  codigo: string; tipoUso: string; ejecutable: boolean; versionInterpretacion: string | null; paginaPdf: number;
  textoOriginal: string; extractoNormalizado: string; parametros: unknown; fuentes: string[];
}
export interface ArtefactoGre {
  tipo: string; schemaVersion: number; versionParser: string; versionNormalizador: string;
  herramienta: { nombre: string; version: string }; sistemaCoordenadas: string;
  estadoCatalogo: string; aptoActivacion: boolean;
  documento: { sha256: string; bytes: number; paginas: number; edicion: string; idioma: string; titulo: string; identificacion: unknown };
  paginas: PaginaArtefacto[]; secciones: SeccionArtefacto[]; entradas: EntradaIndiceArtefacto[];
  relacionesIndices: RelacionArtefacto[]; guias: GuiaArtefacto[]; tablas: TablaArtefacto[];
  textos: BloqueArtefacto[]; reglas: ReglaArtefacto[]; referencias: ReferenciaArtefacto[];
  hallazgos: Record<string, unknown>[]; resumen: Record<string, unknown>; pendientes: string[];
}

const METODOS = new Set(['NATIVO', 'GEOMETRIA', 'OCR', 'REVISION_HUMANA']);
const ESTADOS_DATO = new Set(['DATO', 'REFERENCIA', 'VACIO_EXPLICITO', 'NO_VALIDADO']);
const TIPOS_USO = new Set(['SELECCION', 'ADVERTENCIA', 'DECISION_HUMANA']);
const ESTADOS_GUIA = new Set(['CON_CONTENIDO', 'INTENCIONALMENTE_VACIA']);
const MAX_REFERENCIAS = 500_000;

export class ArtefactoInvalidoError extends Error {
  constructor(readonly problemas: string[]) {
    super(`Artefacto GRE inválido: ${problemas.slice(0, 5).join('; ')}${problemas.length > 5 ? ` (+${problemas.length - 5})` : ''}`);
  }
}

const esTexto = (v: unknown, max?: number): v is string => typeof v === 'string' && (max === undefined || v.length <= max);
const esEntero = (v: unknown, min = 0): v is number => Number.isSafeInteger(v) && (v as number) >= min;

/** Verifica el artefacto completo contra el documento esperado. Devuelve el mismo objeto tipado. */
export function validarArtefacto(datos: unknown, shaEsperado: string): ArtefactoGre {
  const p: string[] = [];
  const a = datos as ArtefactoGre;
  if (!a || typeof a !== 'object') throw new ArtefactoInvalidoError(['no es un objeto JSON']);
  if (a.tipo !== TIPO_ARTEFACTO || a.schemaVersion !== ESQUEMA_ARTEFACTO) p.push('tipo o esquema desconocido');
  if (a.sistemaCoordenadas !== SISTEMA_COORDENADAS) p.push('sistema de coordenadas desconocido');
  if (a.estadoCatalogo !== 'NO_IMPORTADA' || a.aptoActivacion !== false) p.push('el artefacto declara un estado que no le corresponde');
  if (!esTexto(a.versionParser, 80) || !esTexto(a.versionNormalizador, 80)) p.push('versiones de herramienta inválidas');
  const d = a.documento;
  if (!d || d.sha256 !== shaEsperado || !/^[a-f0-9]{64}$/.test(d.sha256)) p.push('el documento no coincide con la fuente solicitada');
  for (const campo of ['paginas', 'secciones', 'entradas', 'relacionesIndices', 'guias', 'tablas', 'textos', 'reglas', 'referencias', 'hallazgos'] as const) {
    if (!Array.isArray(a[campo])) p.push(`falta ${campo}`);
  }
  if (p.length) throw new ArtefactoInvalidoError(p);

  if (!esEntero(d.paginas, 1) || d.paginas > 3000 || a.paginas.length !== d.paginas) p.push('cantidad de páginas incoherente');
  a.paginas.forEach((pg, i) => {
    if (pg.paginaPdf !== i + 1 || !(pg.anchoPt > 0) || !(pg.altoPt > 0) || ![0, 90, 180, 270].includes(pg.rotacion)
      || !/^[a-f0-9]{64}$/.test(pg.sha256TextoNativo) || !esTexto(pg.etiquetaPdf, 80) || !esEntero(pg.caracteresTexto)) {
      p.push(`página ${i + 1} inválida`);
    }
  });
  if (a.referencias.length > MAX_REFERENCIAS) p.push('demasiadas referencias');
  const refs = new Map<string, ReferenciaArtefacto>();
  for (const r of a.referencias) {
    const pagina = a.paginas[r.paginaPdf - 1];
    const caja = r.cajaPt;
    if (refs.has(r.id)) p.push(`referencia duplicada ${r.id}`);
    refs.set(r.id, r);
    if (!pagina || r.documentoSha256 !== d.sha256 || !METODOS.has(r.metodo) || !esTexto(r.textoOriginal)
      || !Array.isArray(caja) || caja.length !== 4 || !caja.every(Number.isFinite)
      || caja[0] < 0 || caja[1] < 0 || caja[2] <= caja[0] || caja[3] <= caja[1]
      || caja[2] > pagina.anchoPt || caja[3] > pagina.altoPt) {
      p.push(`referencia ${r.id} inválida`);
    }
  }
  const exigir = (ids: unknown, donde: string, alMenosUna = true) => {
    if (!Array.isArray(ids) || (alMenosUna && ids.length === 0)) { p.push(`${donde} sin fuente`); return; }
    for (const id of ids) if (!refs.has(id)) p.push(`${donde}: referencia inexistente ${id}`);
  };
  const secciones = new Set<string>();
  a.secciones.forEach((s) => {
    secciones.add(s.id);
    if (!esTexto(s.tituloOriginal, 500) || !esEntero(s.pdfDesde, 1) || s.pdfHasta < s.pdfDesde || s.pdfHasta > d.paginas
      || !esTexto(s.tratamiento, 80)) p.push(`sección ${s.id} inválida`);
  });
  for (const e of a.entradas) {
    if (!esTexto(e.nombreOriginal, 1000) || !esTexto(e.nombreNormalizado, 400) || !/^\d{3}$/.test(e.guiaNumero)
      || (e.identificador !== null && !/^\d{4}$/.test(e.identificador))) p.push(`entrada ${e.id} inválida`);
    for (const [campo, ids] of Object.entries(e.fuentes ?? {})) exigir(ids, `entrada ${e.id}.${campo}`);
  }
  const entradasPorId = new Map(a.entradas.map((e) => [e.id, e]));
  const relaciones = new Set<string>();
  for (const r of a.relacionesIndices) {
    relaciones.add(r.id);
    if (!/^entrada-\d+$/.test(r.id) || [...r.amarilloIds, ...r.azulIds].some((id) => !entradasPorId.has(id))) {
      p.push(`relación ${r.id} inválida`);
    }
  }
  const guias = new Set<string>();
  for (const g of a.guias) {
    if (!/^\d{3}$/.test(g.numero) || guias.has(g.numero) || !ESTADOS_GUIA.has(g.estadoContenido)
      || (g.tituloOriginal !== null && !esTexto(g.tituloOriginal, 500))) p.push(`guía ${g.numero} inválida`);
    guias.add(g.numero);
    exigir(g.fuentes?.numero, `guía ${g.numero}.numero`);
    for (const b of g.bloques) {
      if (b.encabezadoOriginal !== null && !esTexto(b.encabezadoOriginal, 500)) p.push(`bloque ${b.id} inválido`);
      exigir(b.fuentes, `bloque ${b.id}`);
    }
  }
  for (const b of a.textos) {
    if (!b.seccionId || !secciones.has(b.seccionId)) p.push(`texto ${b.id} sin sección`);
    exigir(b.fuentes, `texto ${b.id}`);
  }
  for (const t of a.tablas) {
    if (!esTexto(t.codigo, 80) || !secciones.has(t.seccionId) || !esTexto(t.tituloOriginal, 500)) p.push(`tabla ${t.codigo} inválida`);
    exigir(t.fuentes, `tabla ${t.codigo}`);
    for (const f of t.filas) {
      if (f.entradaId && !relaciones.has(f.entradaId)) p.push(`fila ${f.id}: entrada inexistente`);
      const etiqueta = f.nombreOriginal ?? f.contenedorOriginal;
      if (!esTexto(etiqueta, 1000)) p.push(`fila ${f.id} sin etiqueta`);
      for (const [campo, ids] of Object.entries(f.fuentes ?? {})) exigir(ids, `fila ${f.id}.${campo}`);
      const columnas = new Set<string>();
      for (const c of f.celdas) {
        if (!esTexto(c.columna, 80) || columnas.has(c.columna) || !ESTADOS_DATO.has(c.estadoDato)
          || (c.valorDecimal !== null && (!esTexto(c.valorDecimal, 120) || !/^\d+(\.\d+)?$/.test(c.valorDecimal)))
          || (c.unidad !== null && !esTexto(c.unidad, 80)) || (c.modificador !== null && !esTexto(c.modificador, 40))
          || (c.estadoDato === 'VACIO_EXPLICITO' && c.valorDecimal !== null)) p.push(`celda ${f.id}.${c.columna} inválida`);
        columnas.add(c.columna);
        exigir(c.fuentes, `celda ${f.id}.${c.columna}`, c.estadoDato !== 'NO_VALIDADO');
      }
    }
  }
  for (const r of a.reglas) {
    if (!esTexto(r.codigo, 80) || !TIPOS_USO.has(r.tipoUso) || (r.ejecutable && (r.tipoUso !== 'SELECCION' || !r.versionInterpretacion))) {
      p.push(`regla ${r.codigo} inválida`);
    }
    exigir(r.fuentes, `regla ${r.codigo}`);
  }
  if (p.length) throw new ArtefactoInvalidoError(p);
  return a;
}
