import { randomUUID } from 'crypto';
import { EntityManager, EntityTarget, ObjectLiteral } from 'typeorm';
import {
  GreBloque, GreCampoFuente, GreCelda, GreEntrada, GreFila, GreGuia, GrePagina, GreReferencia, GreRegla,
  GreSeccion, GreTabla,
} from '../../shared/entities';
import { ArtefactoGre, BloqueArtefacto, SISTEMA_COORDENADAS } from './gre-artefacto';

type Fila<T> = Partial<T> & { id: string };

/** Filas listas para insertar, en orden de dependencias. Toda clave sale de este plan:
 * los vínculos entre tablas y con sus fuentes se arman sin consultar la base. */
export interface PlanCarga {
  paginas: Fila<GrePagina>[];
  secciones: Fila<GreSeccion>[];
  referencias: Fila<GreReferencia>[];
  guias: Fila<GreGuia>[];
  bloques: Fila<GreBloque>[];
  entradas: Fila<GreEntrada>[];
  tablas: Fila<GreTabla>[];
  filas: Fila<GreFila>[];
  celdas: Fila<GreCelda>[];
  reglas: Fila<GreRegla>[];
  camposFuente: Fila<GreCampoFuente>[];
}

type Destino = Partial<Pick<GreCampoFuente, 'seccionId' | 'entradaId' | 'guiaId' | 'bloqueId' | 'tablaId' | 'filaId' | 'celdaId' | 'reglaId'>>;

export function planDeCarga(a: ArtefactoGre, versionId: string, nuevoId: () => string = randomUUID): PlanCarga {
  const plan: PlanCarga = { paginas: [], secciones: [], referencias: [], guias: [], bloques: [], entradas: [],
    tablas: [], filas: [], celdas: [], reglas: [], camposFuente: [] };
  const referencia = new Map<string, string>();
  const ref = (idArtefacto: string) => {
    const id = referencia.get(idArtefacto);
    if (!id) throw new Error(`Referencia sin cargar: ${idArtefacto}`);
    return id;
  };
  const campo = (nombre: string, refs: string[] | undefined, destino: Destino) => {
    const vistos = new Set<string>();
    for (const r of refs ?? []) {
      if (vistos.has(r)) continue;  // una referencia repetida no duplica el vínculo
      vistos.add(r);
      plan.camposFuente.push({ id: nuevoId(), versionId, campo: nombre, referenciaId: ref(r), seccionId: null,
        entradaId: null, aliasId: null, guiaId: null, bloqueId: null, tablaId: null, filaId: null, celdaId: null,
        reglaId: null, ...destino });
    }
  };

  plan.paginas = a.paginas.map((p) => ({ id: nuevoId(), versionId, paginaPdf: p.paginaPdf, etiquetaPdf: p.etiquetaPdf,
    etiquetasImpresasJson: JSON.stringify(p.etiquetasImpresas ?? []), anchoPt: p.anchoPt, altoPt: p.altoPt,
    rotacion: p.rotacion, sha256TextoNativo: p.sha256TextoNativo, caracteresTexto: p.caracteresTexto,
    numeracionAmbigua: !!p.requiereRevisionNumeracion }));

  const seccion = new Map<string, string>();
  const seccionDePagina: (string | undefined)[] = [];
  a.secciones.forEach((s, orden) => {
    const id = nuevoId();
    seccion.set(s.id, id);
    for (let n = s.pdfDesde; n <= s.pdfHasta; n++) seccionDePagina[n] = id;
    plan.secciones.push({ id, versionId, tituloOriginal: s.tituloOriginal, orden, paginaDesde: s.pdfDesde,
      paginaHasta: s.pdfHasta, tratamiento: s.tratamiento });
  });

  for (const r of a.referencias) {
    const id = nuevoId();
    referencia.set(r.id, id);
    plan.referencias.push({ id, versionId, paginaPdf: r.paginaPdf, seccionId: seccionDePagina[r.paginaPdf] ?? null,
      textoOriginal: r.textoOriginal, metodo: r.metodo, cajaPtJson: JSON.stringify(r.cajaPt),
      sistemaCoordenadas: SISTEMA_COORDENADAS, orientacion: null, confianza: null, estadoRevision: 'PENDIENTE' });
  }

  const guia = new Map<string, string>();
  for (const g of a.guias) {
    const id = nuevoId();
    guia.set(g.numero, id);
    plan.guias.push({ id, versionId, numero: g.numero, tituloOriginal: g.tituloOriginal,
      estadoContenido: g.estadoContenido, referenciaId: ref(g.fuentes.numero[0]) });
    for (const [nombre, refs] of Object.entries(g.fuentes)) campo(nombre, refs, { guiaId: id });
    const seccionGuia = seccionDePagina[g.paginasPdf[0]];
    if (!seccionGuia) throw new Error(`Guía ${g.numero} fuera de secciones`);
    const bloques = new Map<string, string>();
    // Padres primero: la FK del padre se comprueba por sentencia.
    const ordenados = [...g.bloques].sort((x, y) => Number(x.nivel === 2) - Number(y.nivel === 2) || x.orden - y.orden);
    for (const b of ordenados) {
      const idBloque = nuevoId();
      bloques.set(b.id, idBloque);
      plan.bloques.push(bloque(b, idBloque, seccionGuia, id, b.padreId ? bloques.get(b.padreId) ?? null : null));
      campo('texto', b.fuentes, { bloqueId: idBloque });
    }
  }
  for (const b of a.textos) {
    const id = nuevoId();
    plan.bloques.push(bloque(b, id, seccion.get(b.seccionId!)!, null, null));
    campo('texto', b.fuentes, { bloqueId: id });
  }
  function bloque(b: BloqueArtefacto, id: string, seccionId: string, guiaId: string | null, padreId: string | null): Fila<GreBloque> {
    return { id, versionId, seccionId, guiaId, padreId, orden: b.orden, encabezadoOriginal: b.encabezadoOriginal,
      textoOriginal: b.textoOriginal, referenciaId: ref(b.fuentes[0]) };
  }

  // Una entrada candidata por par amarillo/azul conciliado; el identificador no es su clave.
  const indices = new Map(a.entradas.map((e) => [e.id, e]));
  const entrada = new Map<string, string>();
  for (const r of a.relacionesIndices) {
    if (r.estado !== 'CONCILIADA') continue;
    const amarillo = indices.get(r.amarilloIds[0])!;
    const azul = indices.get(r.azulIds[0])!;
    const id = nuevoId();
    entrada.set(r.id, id);
    plan.entradas.push({ id, versionId, nombreOriginal: amarillo.nombreOriginal, nombreNormalizado: r.nombreNormalizado,
      identificador: r.identificador, tipoIdentificador: r.identificador ? amarillo.tipoIdentificador : null,
      guiaId: guia.get(r.guiaNumero!) ?? null, polimerizable: r.polimerizable ?? null,
      resaltadoVerde: r.resaltadoVerde ?? null, referenciaId: ref(amarillo.fuentes.nombre[0]) });
    for (const e of [amarillo, azul]) {
      for (const [nombre, refs] of Object.entries(e.fuentes)) campo(`${e.indice.toLowerCase()}.${nombre}`, refs, { entradaId: id });
    }
  }

  for (const t of a.tablas) {
    const id = nuevoId();
    const conRefs = (xs: unknown) => Array.isArray(xs)
      ? xs.map((x: any) => ({ ...x, fuentes: (x.fuentes ?? []).map(ref) })) : xs;
    const estructura = { ...t.estructura, materiales: conRefs(t.estructura.materiales), leyenda: conRefs(t.estructura.leyenda),
      notas: t.notas.map((n) => ({ textoOriginal: n.textoOriginal, fuentes: n.fuentes.map(ref) })) };
    plan.tablas.push({ id, versionId, seccionId: seccion.get(t.seccionId)!, codigo: t.codigo, tituloOriginal: t.tituloOriginal,
      estructuraJson: JSON.stringify(estructura), referenciaId: ref(t.fuentes[0]) });
    campo('encabezado', t.fuentes, { tablaId: id });
    t.notas.forEach((n) => campo('nota', n.fuentes, { tablaId: id }));
    for (const x of [...((t.estructura.materiales as any[]) ?? []), ...((t.estructura.leyenda as any[]) ?? [])]) {
      campo(x.formula ? 'leyenda' : 'material', x.fuentes, { tablaId: id });
    }
    for (const f of t.filas) {
      const idFila = nuevoId();
      const principal = f.fuentes.nombre?.[0] ?? f.fuentes.contenedor?.[0];
      plan.filas.push({ id: idFila, versionId, tablaId: id, orden: f.orden,
        entradaId: f.entradaId ? entrada.get(f.entradaId) ?? null : null,
        etiquetaOriginal: f.nombreOriginal ?? f.contenedorOriginal ?? null,
        condicionesJson: JSON.stringify({ ...f.condiciones, paginaPdf: f.paginaPdf, grupo: f.grupo,
          identificador: f.identificador ?? null, identificadores: f.identificadores ?? null,
          guiaNumero: f.guiaNumero ?? null, guiaOriginal: f.guiaOriginal ?? null, polimerizable: f.polimerizable ?? null,
          nombreNormalizado: f.nombreNormalizado ?? null, contenedorNormalizado: f.contenedorNormalizado ?? null,
          materialId: f.materialId ?? null, filaArtefacto: f.id }),
        referenciaId: ref(principal) });
      for (const [nombre, refs] of Object.entries(f.fuentes)) campo(nombre, refs, { filaId: idFila });
      for (const c of f.celdas) {
        const idCelda = nuevoId();
        plan.celdas.push({ id: idCelda, versionId, filaId: idFila, columnaCodigo: c.columna, orden: c.orden,
          textoOriginal: c.textoOriginal, valorDecimal: c.valorDecimal, unidadOriginal: c.unidad,
          modificador: c.modificador, estadoDato: c.estadoDato,
          condicionesJson: c.condiciones == null ? null : JSON.stringify(c.condiciones),
          // Una celda ilegible no tiene caja propia: su procedencia es la franja de la fila.
          referenciaId: ref(c.fuentes[0] ?? f.fuentes.grupo?.[0] ?? principal) });
        campo('valor', c.fuentes, { celdaId: idCelda });
      }
    }
  }

  for (const r of a.reglas) {
    const id = nuevoId();
    plan.reglas.push({ id, versionId, codigo: r.codigo, tipoUso: r.tipoUso, textoOriginal: r.textoOriginal,
      condicionesJson: null, parametrosJson: r.parametros == null ? null : JSON.stringify(r.parametros),
      versionInterpretacion: r.versionInterpretacion, ejecutable: r.ejecutable, referenciaId: ref(r.fuentes[0]) });
    campo('texto', r.fuentes, { reglaId: id });
  }
  return plan;
}

/** SQL Server admite 2100 parámetros por sentencia: cada lote queda por debajo. Sin
 * OUTPUT (updateEntity false): las tablas GRE tienen triggers de inmutabilidad. */
export async function insertarEnLotes<T extends ObjectLiteral>(manager: EntityManager, entidad: EntityTarget<T>,
  filas: ObjectLiteral[], alAvanzar?: (insertadas: number) => Promise<void> | void): Promise<void> {
  if (!filas.length) return;
  const tamano = Math.max(1, Math.floor(2000 / (Object.keys(filas[0]).length + 1)));
  for (let i = 0; i < filas.length; i += tamano) {
    await manager.createQueryBuilder().insert().into(entidad).values(filas.slice(i, i + tamano) as any)
      .updateEntity(false).callListeners(false).execute();
    await alAvanzar?.(Math.min(i + tamano, filas.length));
  }
}

export async function ejecutarPlan(manager: EntityManager, plan: PlanCarga,
  alAvanzar?: (etapa: string) => Promise<void> | void): Promise<Record<string, number>> {
  const pasos: [string, EntityTarget<ObjectLiteral>, ObjectLiteral[]][] = [
    ['paginas', GrePagina, plan.paginas], ['secciones', GreSeccion, plan.secciones],
    ['referencias', GreReferencia, plan.referencias], ['guias', GreGuia, plan.guias],
    ['bloques', GreBloque, plan.bloques.filter((b) => !b.padreId)], ['bloques', GreBloque, plan.bloques.filter((b) => b.padreId)],
    ['entradas', GreEntrada, plan.entradas], ['tablas', GreTabla, plan.tablas], ['filas', GreFila, plan.filas],
    ['celdas', GreCelda, plan.celdas], ['reglas', GreRegla, plan.reglas], ['camposFuente', GreCampoFuente, plan.camposFuente],
  ];
  const conteo: Record<string, number> = {};
  for (const [etapa, entidad, filas] of pasos) {
    await alAvanzar?.(etapa);
    await insertarEnLotes(manager, entidad, filas);
    conteo[etapa] = (conteo[etapa] ?? 0) + filas.length;
  }
  return conteo;
}
