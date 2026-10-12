import { createHash } from 'crypto';
import definiciones from './fuentes/gre2024-definiciones.json';
import { CatalogoMatpel, normalizarMatpel } from './matpel-modelo';
import { mismoId } from './gre-artefacto';

export const VERSION_INTERPRETACION_MATPEL = definiciones.versionInterpretacion;
export const FUENTE_ESTUDIADA_MATPEL = definiciones.documentoSha256;
export function canonicalMatpel(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonicalMatpel).join(',')}]`;
  if (v && typeof v === 'object') return `{${Object.keys(v).filter(k => (v as any)[k] !== undefined).sort()
    .map(k => `${JSON.stringify(k)}:${canonicalMatpel((v as any)[k])}`).join(',')}}`;
  return JSON.stringify(v);
}
export const hashMatpel = (v: unknown) => createHash('sha256').update(canonicalMatpel(v)).digest('hex');
const compactar = (s: string) => normalizarMatpel(s).replace(/\s/g, '');
const cache = new WeakMap<CatalogoMatpel, ReturnType<typeof preparar>>();

/** Preparación de UNA lectura inmutable: no interpreta cantidades con regex al evaluar. */
function preparar(c: CatalogoMatpel) {
  const porPagina = new Map<number, typeof c.referencias>();
  for (const r of c.referencias) {
    const lista = porPagina.get(r.paginaPdf) ?? []; lista.push(r); porPagina.set(r.paginaPdf, lista);
  }
  const referencias = (pagina: number, literal: string | null) => {
    const rs = porPagina.get(pagina) ?? [];
    if (literal === null) return { presente: false, referenciaIds: [] as string[] };
    const original = compactar(literal);
    const textoPagina = rs.map(r => compactar(r.textoOriginal ?? '')).join('');
    const presente = !!original && textoPagina.includes(original);
    const ids = rs.filter(r => {
      const t = compactar(r.textoOriginal ?? '');
      return t.length > 2 && (original.includes(t) || t.includes(original));
    }).map(r => r.id);
    return { presente, referenciaIds: presente ? ids : [] };
  };
  const compatible = c.documento.sha256 === FUENTE_ESTUDIADA_MATPEL;
  const cantidadesTabla3 = compatible ? definiciones.cantidadesTabla3.map(q => ({ ...q,
    ...referencias(q.paginaPdf, q.literal) })).filter(q => q.presente) : [];
  const condicionesDocumentales = compatible ? definiciones.reglasDocumentales.map(r => ({ ...r,
    fuentes: r.fuentes.map(f => ({ ...f, ...referencias(f.paginaPdf, f.extractoLiteral) })),
    validacion: 'DOCUMENTAL_NO_ACEPTACION_OPERACIONAL' as const })) : [];
  const entradasPorId = new Map(c.entradas.map(e => [e.id.toLowerCase(), e]));
  const reglasPorCodigo = new Map(c.reglas.map(r => [r.codigo, r]));
  const filasPorTabla = new Map<string, typeof c.filas>();
  const condicionesPorFila = new Map<string, Record<string, any>>();
  for (const f of c.filas) {
    const clave = f.tablaId.toLowerCase(); const fs = filasPorTabla.get(clave) ?? [];
    fs.push(f); filasPorTabla.set(clave, fs);
    // Estructura cerrada validada por la importación; un JSON dañado detiene preparación.
    const condicion = JSON.parse(f.condicionesJson ?? '{}');
    if (!condicion || typeof condicion !== 'object' || Array.isArray(condicion)) throw new Error('Condición GRE inválida.');
    condicionesPorFila.set(f.id.toLowerCase(), condicion);
  }
  const celdasPorFila = new Map<string, typeof c.celdas>();
  for (const celda of c.celdas) {
    const clave = celda.filaId.toLowerCase(); const cs = celdasPorFila.get(clave) ?? [];
    cs.push(celda); celdasPorFila.set(clave, cs);
  }
  return { compatible, cantidadesTabla3, tiposFilaTabla3: definiciones.tiposFilaTabla3,
    condicionesDocumentales, entradasPorId, reglasPorCodigo, filasPorTabla,
    condicionesPorFila, celdasPorFila, sha256Interpretacion: hashMatpel(definiciones),
    sha256Contenido: c.sha256Contenido ?? hashMatpel({ entradas: c.entradas, guias: c.guias,
      bloques: c.bloques, tablas: c.tablas, filas: c.filas, celdas: c.celdas, reglas: c.reglas,
      camposFuente: c.camposFuente, referencias: c.referencias, paginas: c.paginas, secciones: c.secciones }) };
}

export function perfilMatpel(c: CatalogoMatpel) {
  const previo = cache.get(c); if (previo) return previo;
  const perfil = preparar(c); cache.set(c, perfil); return perfil;
}

/** Texto contextual íntegro; no extrae un número ni adopta sus acciones. */
export function lecturaGuiasMatpel(c: CatalogoMatpel, guiaIds: string[]) {
  return c.guias.filter(g => guiaIds.some(id => mismoId(id, g.id))).map(g => {
    const bloques = c.bloques.filter(b => mismoId(b.guiaId, g.id));
    const evacuacion = bloques.filter(b => normalizarMatpel(b.encabezadoOriginal ?? '') === 'EVACUACION');
    const perfil = perfilMatpel(c);
    const condiciones = perfil.condicionesDocumentales.filter(r => r.id.startsWith(`GRE24-G${g.numero}-`));
    return { guiaId: g.id, numero: g.numero, referenciaId: g.referenciaId,
      tratamiento: 'LECTURA_DOCUMENTAL' as const, bloquesTotales: bloques.length,
      estadoImplementacion: 'LECTURA_COMPLETA_SIN_SELECCION_AUTOMATICA' as const,
      distancias: evacuacion.map(b => ({ bloqueId: b.id, textoOriginal: b.textoOriginal,
        referenciaId: b.referenciaId, finalidad: 'AISLAMIENTO_Y_EVACUACION_CONDICIONADOS' as const })),
      condiciones, advertencia: 'Leer todas las condiciones de la guía. Este texto no selecciona una distancia ni una acción por sí solo.' };
  });
}
