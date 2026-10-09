import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource, EntityManager } from 'typeorm';
import { GreActivacion, GreDocumento, GreRevision, GreVersion } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { insertarEnLotes } from './gre-carga';
import { ContextoGre } from './gre-importacion.service';
import { huellaSolicitud, resultadoPrevio } from './gre-idempotencia';

export type ResultadoRevision = 'VERIFICADO' | 'RECHAZADO' | 'CORRECCION_PROPUESTA';
export interface ObjetivoRevision { filaIds?: string[]; referenciaIds?: string[]; pagina?: { tablaCodigo: string; paginaPdf: number } }

const MAX_REFERENCIAS_POR_REVISION = 3000;
const LOTE_IN = 1500;

/** Referencias críticas de cada fila de tabla: identificador, guía, nombre, franja y
 * cada celda. Una fila está verificada solo si todas lo están. */
const REFERENCIAS_DE_FILAS = `
  SELECT f.id AS fila_id, cf.referencia_id FROM matpel.gre_filas f
    JOIN matpel.gre_campos_fuente cf ON cf.fila_id = f.id WHERE f.version_id = @0
  UNION
  SELECT c.fila_id, cf.referencia_id FROM matpel.gre_celdas c
    JOIN matpel.gre_campos_fuente cf ON cf.celda_id = c.id WHERE c.version_id = @0`;

/** Revisión humana dato ↔ fuente y validación de una versión candidata. Validar exige
 * reporte sin hallazgos, celdas interpretadas y todas las referencias verificadas,
 * incluidas notas, condiciones, índices, guías y reglas que cambian la selección. */
@Injectable()
export class GreRevisionService {
  constructor(@InjectDataSource() private readonly ds: DataSource, private readonly auditoria: AuditoriaService) {}

  async versiones() {
    const versiones = await this.ds.getRepository(GreVersion).find({ order: { creadoEn: 'DESC' } });
    const documentos = await this.ds.getRepository(GreDocumento).find();
    const activas = await this.ds.getRepository(GreActivacion).find();
    return versiones.map((v) => {
      const d = documentos.find((x) => x.id === v.documentoId)!;
      const reporte = v.reporteJson ? JSON.parse(v.reporteJson) : null;
      const activa = activas.find((a) => a.versionId === v.id);
      return { id: v.id, estado: v.estado, disponibilidad: activa ? 'ACTIVA' : v.estado === 'VALIDADA' ? 'DISPONIBLE' : 'NO_DISPONIBLE',
        documento: { id: d.id, sha256: d.sha256, edicion: d.edicion, idioma: d.idioma, titulo: d.titulo, paginas: d.paginas },
        versionParser: v.versionParser, versionNormalizador: v.versionNormalizador, versionEsquema: v.versionEsquema,
        revisionCorrecciones: v.revisionCorrecciones, creadoEn: v.creadoEn, validadaEn: v.validadaEn,
        hallazgos: reporte?.hallazgos?.length ?? null, resumen: reporte?.resumen ?? null };
    });
  }

  async version(versionId: string, m: EntityManager = this.ds.manager): Promise<GreVersion> {
    const version = await m.getRepository(GreVersion).findOneBy({ id: versionId });
    if (!version) throw new NotFoundException('La versión GRE no existe.');
    return version;
  }

  async referencias(versionId: string, paginaPdf?: number, pagina = 1, tamano = 100) {
    await this.version(versionId);
    const filtro = paginaPdf == null ? '' : ' AND pagina_pdf = @1';
    const parametros = paginaPdf == null ? [versionId] : [versionId, paginaPdf];
    const [conteo] = await this.ds.query(`SELECT COUNT(*) AS total FROM matpel.gre_referencias WHERE version_id = @0${filtro}`, parametros);
    const referencias = await this.ds.query(`SELECT id, pagina_pdf, texto_original, caja_pt_json, estado_revision, metodo
      FROM matpel.gre_referencias WHERE version_id = @0${filtro} ORDER BY pagina_pdf, id
      OFFSET @${parametros.length} ROWS FETCH NEXT @${parametros.length + 1} ROWS ONLY`,
      [...parametros, (pagina - 1) * tamano, tamano]);
    return { versionGreId: versionId, total: Number(conteo.total), pagina, tamano,
      referencias: referencias.map((r: any) => ({ id: r.id, paginaPdf: r.pagina_pdf, textoOriginal: r.texto_original,
        cajaPt: JSON.parse(r.caja_pt_json ?? 'null'), estadoRevision: r.estado_revision, metodo: r.metodo })) };
  }

  async progreso(versionId: string, m: EntityManager = this.ds.manager) {
    const version = await this.version(versionId, m);
    const reporte = version.reporteJson ? JSON.parse(version.reporteJson) : null;
    const paginas: { codigo: string; pagina: number; filas: number; verificadas: number; rechazadas: number }[] = await m.query(`
      ;WITH refs AS (${REFERENCIAS_DE_FILAS}),
      estado AS (
        SELECT refs.fila_id, COUNT(*) AS total,
          SUM(CASE WHEN r.estado_revision = N'VERIFICADA' THEN 1 ELSE 0 END) AS verificadas,
          SUM(CASE WHEN r.estado_revision = N'RECHAZADA' THEN 1 ELSE 0 END) AS rechazadas
        FROM refs JOIN matpel.gre_referencias r ON r.id = refs.referencia_id GROUP BY refs.fila_id)
      SELECT t.codigo, CAST(JSON_VALUE(f.condiciones_json, '$.paginaPdf') AS INT) AS pagina, COUNT(*) AS filas,
        SUM(CASE WHEN e.total = e.verificadas THEN 1 ELSE 0 END) AS verificadas,
        SUM(CASE WHEN e.rechazadas > 0 THEN 1 ELSE 0 END) AS rechazadas
      FROM matpel.gre_filas f JOIN matpel.gre_tablas t ON t.id = f.tabla_id
      LEFT JOIN estado e ON e.fila_id = f.id
      WHERE f.version_id = @0
      GROUP BY t.codigo, CAST(JSON_VALUE(f.condiciones_json, '$.paginaPdf') AS INT)
      ORDER BY t.codigo, pagina`, [versionId]);
    const [referencias] = await m.query(`
      SELECT COUNT(*) AS total, SUM(CASE WHEN estado_revision = N'VERIFICADA' THEN 1 ELSE 0 END) AS verificadas,
        SUM(CASE WHEN estado_revision = N'RECHAZADA' THEN 1 ELSE 0 END) AS rechazadas
      FROM matpel.gre_referencias WHERE version_id = @0`, [versionId]);
    const filas = paginas.reduce((s, p) => s + p.filas, 0);
    const verificadas = paginas.reduce((s, p) => s + p.verificadas, 0);
    const motivos: string[] = [];
    if (version.estado !== 'REQUIERE_REVISION') motivos.push(`La versión está en estado ${version.estado}.`);
    if (!reporte || !Array.isArray(reporte.hallazgos)) motivos.push('Falta el reporte comprobado de importación.');
    if (reporte?.hallazgos?.length) motivos.push(`El reporte de importación tiene ${reporte.hallazgos.length} hallazgos críticos.`);
    if (!filas || !referencias.total) motivos.push('El candidato no tiene contenido completo para revisar.');
    if (Number(referencias.verificadas ?? 0) < Number(referencias.total)) motivos.push('Faltan referencias por cotejar contra la fuente.');
    const [incompletas] = await m.query(`SELECT COUNT(*) AS total FROM matpel.gre_celdas
      WHERE version_id = @0 AND estado_dato = N'NO_VALIDADO'`, [versionId]);
    if (Number(incompletas.total)) motivos.push('Hay celdas sin interpretación validada; requieren un candidato corregido.');
    const tablas: { codigo: string; filas: number }[] = await m.query(`SELECT t.codigo, COUNT(f.id) AS filas
      FROM matpel.gre_tablas t LEFT JOIN matpel.gre_filas f ON f.tabla_id = t.id AND f.version_id = t.version_id
      WHERE t.version_id = @0 GROUP BY t.codigo`, [versionId]);
    if (tablas.length !== 3 || ['TABLA_1', 'TABLA_2', 'TABLA_3'].some((codigo) =>
      !tablas.some((t) => t.codigo === codigo && Number(t.filas) > 0))) {
      motivos.push('Falta contenido en alguna de las tres tablas requeridas.');
    }
    if (Number(referencias.rechazadas)) motivos.push(`${referencias.rechazadas} referencias rechazadas o con corrección propuesta.`);
    if (verificadas < filas) motivos.push(`Faltan verificar ${filas - verificadas} de ${filas} filas de tablas.`);
    return { versionGreId: versionId, estado: version.estado, hallazgos: reporte?.hallazgos ?? [], resumen: reporte?.resumen ?? null,
      referencias: { total: Number(referencias.total), verificadas: Number(referencias.verificadas ?? 0),
        rechazadas: Number(referencias.rechazadas ?? 0) },
      filas: { total: filas, verificadas }, paginas, validable: motivos.length === 0, motivos };
  }

  /** Filas de una página de tabla con celdas y estado de revisión de cada referencia,
   * para cotejar lado a lado con la página del PDF. */
  async filasDePagina(versionId: string, tablaCodigo: string, paginaPdf: number) {
    await this.version(versionId);
    const filas: any[] = await this.ds.query(`
      SELECT f.id, f.orden, f.etiqueta_original, f.condiciones_json, f.entrada_id
      FROM matpel.gre_filas f JOIN matpel.gre_tablas t ON t.id = f.tabla_id
      WHERE f.version_id = @0 AND t.codigo = @1 AND CAST(JSON_VALUE(f.condiciones_json, '$.paginaPdf') AS INT) = @2
      ORDER BY f.orden`, [versionId, tablaCodigo, paginaPdf]);
    if (!filas.length) return { versionGreId: versionId, tablaCodigo, paginaPdf, filas: [] };
    const ids = filas.map((f) => f.id);
    const celdas: any[] = [];
    const refs: any[] = [];
    for (let i = 0; i < ids.length; i += LOTE_IN) {
      const lote = ids.slice(i, i + LOTE_IN);
      const marcas = lote.map((_, k) => `@${k + 1}`).join(',');
      celdas.push(...await this.ds.query(`SELECT fila_id, columna_codigo, orden, texto_original, valor_decimal, unidad_original,
        modificador, estado_dato FROM matpel.gre_celdas WHERE version_id = @0 AND fila_id IN (${marcas}) ORDER BY orden`, [versionId, ...lote]));
      refs.push(...await this.ds.query(`;WITH refs AS (${REFERENCIAS_DE_FILAS})
        SELECT refs.fila_id, r.id, r.estado_revision, r.texto_original, r.caja_pt_json FROM refs
        JOIN matpel.gre_referencias r ON r.id = refs.referencia_id WHERE refs.fila_id IN (${marcas})`, [versionId, ...lote]));
    }
    return {
      versionGreId: versionId, tablaCodigo, paginaPdf,
      filas: filas.map((f) => {
        const propias = refs.filter((r) => r.fila_id === f.id);
        const estado = propias.some((r) => r.estado_revision === 'RECHAZADA') ? 'RECHAZADA'
          : propias.length && propias.every((r) => r.estado_revision === 'VERIFICADA') ? 'VERIFICADA' : 'PENDIENTE';
        return { id: f.id, orden: f.orden, etiquetaOriginal: f.etiqueta_original, entradaId: f.entrada_id,
          condiciones: JSON.parse(f.condiciones_json ?? 'null'), estadoRevision: estado,
          celdas: celdas.filter((c) => c.fila_id === f.id).map((c) => ({ columna: c.columna_codigo, orden: c.orden,
            textoOriginal: c.texto_original, valorDecimal: c.valor_decimal, unidad: c.unidad_original,
            modificador: c.modificador, estadoDato: c.estado_dato })),
          referencias: propias.map((r) => ({ id: r.id, estadoRevision: r.estado_revision, textoOriginal: r.texto_original,
            cajaPt: JSON.parse(r.caja_pt_json ?? 'null') })) };
      }),
    };
  }

  async registrar(versionId: string, objetivo: ObjetivoRevision, resultado: ResultadoRevision, fundamento: string,
    valorPropuesto: string | null, claveIdempotencia: string, ctx: ContextoGre) {
    const destinos = [objetivo.filaIds?.length, objetivo.referenciaIds?.length, objetivo.pagina ? 1 : 0].filter(Boolean);
    if (destinos.length !== 1) throw new BadRequestException('Indicá filas, referencias o una página de tabla, uno solo.');
    if (resultado === 'CORRECCION_PROPUESTA' && !valorPropuesto?.trim()) {
      throw new BadRequestException('Una corrección propuesta requiere el valor que muestra la fuente.');
    }
    if ((objetivo.referenciaIds?.length ?? 0) > MAX_REFERENCIAS_POR_REVISION || (objetivo.filaIds?.length ?? 0) > 500) {
      throw new BadRequestException('Demasiados objetivos en una sola revisión.');
    }
    const huella = huellaSolicitud({ versionId, objetivo, resultado, fundamento, valorPropuesto });
    return this.ds.transaction(async (m) => {
      const previo = await resultadoPrevio(m, 'GRE_REVISION_REGISTRADA', claveIdempotencia, ctx.usuarioId, huella);
      if (previo) return previo;
      const [bloqueo] = await m.query(`SELECT estado FROM matpel.gre_versiones WITH (UPDLOCK, HOLDLOCK) WHERE id = @0`, [versionId]);
      if (!bloqueo) throw new NotFoundException('La versión GRE no existe.');
      if (bloqueo.estado !== 'REQUIERE_REVISION') {
        throw new ConflictException({ codigo: 'VERSION_NO_REVISABLE', message: `La versión está en estado ${bloqueo.estado}.` });
      }
      const referencias = await this.referenciasObjetivo(m, versionId, objetivo);
      if (!referencias.length) throw new NotFoundException('El objetivo no tiene referencias en esta versión.');
      if (referencias.length > MAX_REFERENCIAS_POR_REVISION) throw new BadRequestException('Demasiadas referencias en una sola revisión.');
      const estadoNuevo = resultado === 'VERIFICADO' ? 'VERIFICADA' : 'RECHAZADA';
      const revisar: string[] = [];
      let cambiadas = 0;
      for (let i = 0; i < referencias.length; i += LOTE_IN) {
        const lote = referencias.slice(i, i + LOTE_IN);
        const filas: { id: string; estado_revision: string }[] = await m.query(`SELECT id, estado_revision FROM matpel.gre_referencias
          WHERE version_id = @0 AND id IN (${lote.map((_, k) => `@${k + 1}`).join(',')})`, [versionId, ...lote]);
        // Reiterar una verificación conserva el acto en auditoría, sin volver a
        // insertar cada campo ya verificado. Nuevos rechazos/propuestas sí dejan
        // detalle aunque el estado anterior también sea RECHAZADA.
        revisar.push(...filas.filter((f) => f.estado_revision !== estadoNuevo || resultado !== 'VERIFICADO').map((f) => f.id));
        cambiadas += filas.filter((f) => f.estado_revision !== estadoNuevo).length;
      }
      const revisiones: Partial<GreRevision>[] = [];
      for (let i = 0; i < revisar.length; i += LOTE_IN) {
        const lote = revisar.slice(i, i + LOTE_IN);
        const marcas = lote.map((_, k) => `@${k + 1}`).join(',');
        const campos: { id: string; texto_original: string }[] = await m.query(`SELECT cf.id, r.texto_original
          FROM matpel.gre_campos_fuente cf JOIN matpel.gre_referencias r ON r.id = cf.referencia_id
          WHERE cf.version_id = @0 AND cf.referencia_id IN (${marcas})`, [versionId, ...lote]);
        for (const c of campos) {
          revisiones.push({ id: randomUUID(), versionId, campoFuenteId: c.id, resultado,
            valorAnteriorJson: JSON.stringify({ textoOriginal: c.texto_original }),
            valorPropuestoJson: resultado === 'CORRECCION_PROPUESTA' ? JSON.stringify({ textoPropuesto: valorPropuesto }) : null,
            fundamento, revisadaPor: ctx.usuarioId });
        }
        await m.query(`UPDATE matpel.gre_referencias SET estado_revision = @0 WHERE version_id = @1 AND id IN (${lote.map((_, k) => `@${k + 2}`).join(',')})`,
          [estadoNuevo, versionId, ...lote]);
      }
      await insertarEnLotes(m, GreRevision, revisiones);
      const respuesta = { versionGreId: versionId, resultado, referencias: referencias.length, cambiadas,
        revisionesRegistradas: revisiones.length };
      await this.auditoria.registrar({ usuarioId: ctx.usuarioId, accion: 'GRE_REVISION_REGISTRADA',
        recurso: 'matpel.gre_versiones', recursoId: versionId, ip: ctx.ip, userAgent: ctx.userAgent,
        datosDespues: { resultado, referencias: referencias.length, cambiadas, objetivo },
        metadata: { claveIdempotencia: claveIdempotencia.toLowerCase(), huellaSolicitud: huella, resultadoSolicitud: respuesta } }, m);
      return respuesta;
    });
  }

  private async referenciasObjetivo(m: EntityManager, versionId: string, objetivo: ObjetivoRevision): Promise<string[]> {
    if (objetivo.referenciaIds?.length) {
      const ids = [...new Set(objetivo.referenciaIds.map((id) => id.toLowerCase()))];
      let encontradas = 0;
      for (let i = 0; i < ids.length; i += LOTE_IN) {
        const lote = ids.slice(i, i + LOTE_IN);
        const [conteo] = await m.query(`SELECT COUNT(*) AS total FROM matpel.gre_referencias WHERE version_id = @0
          AND id IN (${lote.map((_, k) => `@${k + 1}`).join(',')})`, [versionId, ...lote]);
        encontradas += Number(conteo.total);
      }
      if (encontradas !== ids.length) throw new NotFoundException('Alguna referencia no pertenece a esta versión.');
      return ids;
    }
    let filas: string[];
    if (objetivo.pagina) {
      const res: { id: string }[] = await m.query(`SELECT f.id FROM matpel.gre_filas f JOIN matpel.gre_tablas t ON t.id = f.tabla_id
        WHERE f.version_id = @0 AND t.codigo = @1 AND CAST(JSON_VALUE(f.condiciones_json, '$.paginaPdf') AS INT) = @2`,
        [versionId, objetivo.pagina.tablaCodigo, objetivo.pagina.paginaPdf]);
      filas = res.map((r) => r.id);
    } else {
      filas = [...new Set(objetivo.filaIds!.map((id) => id.toLowerCase()))];
      let encontradas = 0;
      for (let i = 0; i < filas.length; i += LOTE_IN) {
        const lote = filas.slice(i, i + LOTE_IN);
        const [conteo] = await m.query(`SELECT COUNT(*) AS total FROM matpel.gre_filas WHERE version_id = @0
          AND id IN (${lote.map((_, k) => `@${k + 1}`).join(',')})`, [versionId, ...lote]);
        encontradas += Number(conteo.total);
      }
      if (encontradas !== filas.length) throw new NotFoundException('Alguna fila no pertenece a esta versión.');
    }
    const refs = new Set<string>();
    for (let i = 0; i < filas.length; i += LOTE_IN) {
      const lote = filas.slice(i, i + LOTE_IN);
      const res: { referencia_id: string }[] = await m.query(`;WITH refs AS (${REFERENCIAS_DE_FILAS})
        SELECT referencia_id FROM refs WHERE fila_id IN (${lote.map((_, k) => `@${k + 1}`).join(',')})`, [versionId, ...lote]);
      res.forEach((r) => refs.add(r.referencia_id));
    }
    return [...refs];
  }

  async validar(versionId: string, fundamento: string, claveIdempotencia: string, ctx: ContextoGre) {
    const huella = huellaSolicitud({ versionId, fundamento });
    // Bloqueo de la versión: ninguna revisión entra mientras se valida.
    return this.ds.transaction(async (m) => {
      const previo = await resultadoPrevio(m, 'GRE_VERSION_VALIDADA', claveIdempotencia, ctx.usuarioId, huella);
      if (previo) return previo;
      const [bloqueo] = await m.query(`SELECT estado FROM matpel.gre_versiones WITH (UPDLOCK, HOLDLOCK) WHERE id = @0`, [versionId]);
      if (!bloqueo) throw new NotFoundException('La versión GRE no existe.');
      if (bloqueo.estado === 'VALIDADA') {
        return { versionGreId: versionId, estado: 'VALIDADA', yaValidada: true };
      }
      const progreso = await this.progreso(versionId, m);
      if (!progreso.validable) throw new ConflictException({ codigo: 'VALIDACION_INCOMPLETA', message: progreso.motivos.join(' '), motivos: progreso.motivos });
      await m.createQueryBuilder().update(GreVersion)
        .set({ estado: 'VALIDADA', validadaEn: () => 'SYSDATETIMEOFFSET()', validadaPor: ctx.usuarioId })
        .where('id = :id AND estado = :estado', { id: versionId, estado: 'REQUIERE_REVISION' }).updateEntity(false).execute();
      const respuesta = { versionGreId: versionId, estado: 'VALIDADA', yaValidada: false };
      await this.auditoria.registrar({ usuarioId: ctx.usuarioId, accion: 'GRE_VERSION_VALIDADA', recurso: 'matpel.gre_versiones',
        recursoId: versionId, ip: ctx.ip, userAgent: ctx.userAgent,
        datosAntes: { estado: 'REQUIERE_REVISION' }, datosDespues: { estado: 'VALIDADA', filas: progreso.filas },
        metadata: { claveIdempotencia: claveIdempotencia.toLowerCase(), fundamento, huellaSolicitud: huella,
          resultadoSolicitud: respuesta } }, m);
      return respuesta;
    });
  }
}
