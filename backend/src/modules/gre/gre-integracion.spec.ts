/**
 * Integración GRE contra SQL Server real, en una base DESECHABLE. Solo corre con
 * GRE_DB_PRUEBA=sigbo_gre_prueba_<16 hex>, creada por scripts/matpel/probar_integracion.cjs.
 * Usa el catálogo real ya extraído en private_uploads/gre: valida, revisa, activa y
 * compara solo dentro de esa base; nunca en sigbo_cbvc.
 */
import { createHash, randomUUID } from 'crypto';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../../core/database/data-source-options';
import { GreVersion, LogAuditoria } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { ejecutarPlan, planDeCarga } from './gre-carga';
import { GreActivacionService } from './gre-activacion.service';
import { GreComparacionService } from './gre-comparacion.service';
import { GreImportacionService } from './gre-importacion.service';
import { GreProcesoService } from './gre-proceso.service';
import { GreRevisionService } from './gre-revision.service';

const BASE = process.env.GRE_DB_PRUEBA;
const describir = BASE ? describe : describe.skip;
const RAIZ = join(process.cwd(), 'private_uploads', 'gre');
const SHA = 'bfc8b663259528dadd81a499afac2d5fd417467786ac616fb31625680f4ea4af';

describir('GRE en SQL Server: importación, revisión, validación y activación', () => {
  jest.setTimeout(15 * 60_000);
  let ds: DataSource;
  let importacion: GreImportacionService;
  let revision: GreRevisionService;
  let activacion: GreActivacionService;
  let comparacion: GreComparacionService;
  const actor = randomUUID();
  const ctx = { usuarioId: actor, ip: null, userAgent: 'prueba-integracion' };
  let versionId: string;
  let derivadaId: string;

  beforeAll(async () => {
    if (!/^sigbo_gre_prueba_[0-9a-f]{16}$/.test(BASE!)) throw new Error('La prueba GRE exige una base temporal propia.');
    ds = new DataSource({ ...(dataSourceOptions as any), database: BASE, requestTimeout: 120_000 });
    await ds.initialize();
    await ds.query(`INSERT INTO seguridad.usuarios (id, username) VALUES (@0, N'prueba-gre')`, [actor]);
    const auditoria = new AuditoriaService(ds.getRepository(LogAuditoria));
    const proceso = new GreProcesoService(RAIZ);
    // La extracción ya está probada en la suite Python; acá se usa el artefacto publicado.
    const herramientas = await proceso.versiones();
    const artefacto = `${SHA}.${herramientas.versionParser}-${herramientas.versionNormalizador}-pymupdf${herramientas.pymupdf}.json`;
    if (!readdirSync(RAIZ).includes(artefacto)) throw new Error('Falta el catálogo real de la versión actual del extractor.');
    const bytes = readFileSync(join(RAIZ, artefacto));
    jest.spyOn(proceso, 'catalogo').mockResolvedValue({ artefacto, artefactoBytes: bytes.length, artefactoNuevo: false,
      artefactoSha256: createHash('sha256').update(bytes).digest('hex'), documentoSha256: SHA });
    importacion = new GreImportacionService(ds, proceso, auditoria, RAIZ);
    revision = new GreRevisionService(ds, auditoria);
    activacion = new GreActivacionService(ds, auditoria);
    comparacion = new GreComparacionService(ds);
    // Preparar el catálogo antes de los casos: un fallo de carga detiene toda la
    // suite, sin ejecutar cientos de miles de inserts de los casos dependientes.
    const solicitud = await importacion.solicitar(SHA, randomUUID(), ctx);
    versionId = solicitud.versionGreId;
    expect(solicitud.existente).toBe(false);
    const trabajo = await importacion.reclamar();
    expect(trabajo?.id).toBe(solicitud.importacionId);
    await importacion.procesar(trabajo!);
    const estado = await importacion.estado(solicitud.importacionId!);
    if (estado.estado !== 'COMPLETADA') throw new Error(JSON.stringify(estado.errores));
  });

  afterAll(async () => { if (ds?.isInitialized) await ds.destroy(); });

  it('importa el catálogo real como candidato que requiere revisión', async () => {
    const solicitud = await importacion.solicitar(SHA, randomUUID(), ctx);
    const estado = await importacion.estado(solicitud.importacionId!);
    expect(estado.estado).toBe('COMPLETADA');
    expect(estado.version.estado).toBe('REQUIERE_REVISION');
    expect(estado.version.hallazgos).toBe(0);
    const [conteo] = await ds.query(`SELECT
      (SELECT COUNT(*) FROM matpel.gre_entradas WHERE version_id = @0) AS entradas,
      (SELECT COUNT(*) FROM matpel.gre_guias WHERE version_id = @0) AS guias,
      (SELECT COUNT(*) FROM matpel.gre_filas WHERE version_id = @0) AS filas,
      (SELECT COUNT(*) FROM matpel.gre_reglas WHERE version_id = @0) AS reglas,
      (SELECT COUNT(*) FROM matpel.gre_referencias WHERE version_id = @0 AND estado_revision = N'PENDIENTE') AS pendientes`, [versionId]);
    expect(conteo).toMatchObject({ entradas: 2665, guias: 64, filas: 550, reglas: 26 });
    expect(conteo.pendientes).toBeGreaterThan(30000);
  });

  it('no duplica una importación de la misma identidad', async () => {
    const clave = randomUUID();
    const otra = await importacion.solicitar(SHA, clave, ctx);
    expect(otra).toMatchObject({ versionGreId: versionId, existente: true });
    expect(await importacion.solicitar(SHA, clave, ctx)).toEqual(otra);
    expect(await importacion.reclamar()).toBeNull();
  });

  it('no valida ni activa mientras falten filas por verificar', async () => {
    const progreso = await revision.progreso(versionId);
    expect(progreso.filas).toEqual({ total: 550, verificadas: 0 });
    expect(progreso.validable).toBe(false);
    await expect(revision.validar(versionId, 'intento anticipado de validación', randomUUID(), ctx))
      .rejects.toMatchObject({ response: { codigo: 'VALIDACION_INCOMPLETA' } });
    await expect(activacion.activar(versionId, 0, 'intento de activar sin validar', randomUUID(), ctx))
      .rejects.toMatchObject({ response: { codigo: 'VERSION_NO_VALIDADA' } });
  });

  it('una corrección propuesta bloquea la validación hasta un candidato corregido', async () => {
    const pagina = await revision.filasDePagina(versionId, 'TABLA_1', 298);
    expect(pagina.filas.length).toBe(18);
    const celda = pagina.filas[0].referencias[0];
    await revision.registrar(versionId, { referenciaIds: [celda.id] }, 'CORRECCION_PROPUESTA',
      'prueba: la referencia se marca para corrección', 'valor de prueba', randomUUID(), ctx);
    expect((await revision.progreso(versionId)).referencias.rechazadas).toBe(1);
    // Volver a verificar la referencia registra otra revisión; el historial no se edita.
    await revision.registrar(versionId, { referenciaIds: [celda.id] }, 'VERIFICADO',
      'prueba: cotejada de nuevo contra la página 298', null, randomUUID(), ctx);
    const [{ total }] = await ds.query(`SELECT COUNT(*) AS total FROM matpel.gre_revisiones WHERE version_id = @0`, [versionId]);
    expect(total).toBeGreaterThanOrEqual(2);
  });

  it('rechaza referencias ajenas y conserva idempotencia de revisiones y propuestas', async () => {
    await expect(revision.registrar(versionId, { referenciaIds: [randomUUID()] }, 'VERIFICADO',
      'prueba de referencia inexistente', null, randomUUID(), ctx)).rejects.toMatchObject({ status: 404 });
    const pagina = await revision.filasDePagina(versionId, 'TABLA_1', 298);
    const id = pagina.filas[0].referencias[0].id;
    const clave = randomUUID();
    const objetivo = { referenciaIds: [id] };
    const primera = await revision.registrar(versionId, objetivo, 'CORRECCION_PROPUESTA',
      'prueba de propuesta con idempotencia', 'primera propuesta de prueba', clave, ctx);
    expect(await revision.registrar(versionId, objetivo, 'CORRECCION_PROPUESTA',
      'prueba de propuesta con idempotencia', 'primera propuesta de prueba', clave, ctx)).toEqual(primera);
    await expect(revision.registrar(versionId, objetivo, 'CORRECCION_PROPUESTA',
      'prueba de propuesta con idempotencia', 'otra propuesta de prueba', clave, ctx))
      .rejects.toMatchObject({ response: { codigo: 'IDEMPOTENCIA_EN_CONFLICTO' } });
    const otra = await revision.registrar(versionId, objetivo, 'CORRECCION_PROPUESTA',
      'prueba de segunda propuesta auditada', 'segunda propuesta de prueba', randomUUID(), ctx);
    expect(otra.cambiadas).toBe(0);
    expect(otra.revisionesRegistradas).toBeGreaterThan(0);
  });

  it('valida tras verificar todas las filas y queda inmutable', async () => {
    const progreso = await revision.progreso(versionId);
    // Una página real de cada estructura verifica el endpoint de revisión por
    // página; el barrido paginado siguiente coteja TODAS las referencias/filas.
    for (const p of ['TABLA_1', 'TABLA_2', 'TABLA_3'].map((codigo) => progreso.paginas.find((p) => p.codigo === codigo)!)) {
      await revision.registrar(versionId, { pagina: { tablaCodigo: p.codigo, paginaPdf: p.pagina } }, 'VERIFICADO',
        `prueba de integración: página ${p.pagina} cotejada`, null, randomUUID(), ctx);
    }
    // Cotejo SIMULADO solo en esta base de prueba. En el catálogo institucional
    // un revisor debe comprobar también índices, guías, notas y reglas contra el PDF.
    expect((await revision.progreso(versionId)).validable).toBe(false);
    const total = (await revision.progreso(versionId)).referencias.total;
    for (let p = 1; (p - 1) * 3000 < total; p++) {
      const lote = await revision.referencias(versionId, undefined, p, 3000);
      await revision.registrar(versionId, { referenciaIds: lote.referencias.map((r: any) => r.id) }, 'VERIFICADO',
        'prueba automatizada del control de referencias; no es cotejo institucional', null, randomUUID(), ctx);
    }
    const final = await revision.progreso(versionId);
    expect(final.validable).toBe(true);
    const resultado = await revision.validar(versionId, 'prueba de integración en base desechable', randomUUID(), ctx);
    expect(resultado.estado).toBe('VALIDADA');
    await expect(ds.query(`UPDATE matpel.gre_celdas SET valor_decimal = N'0' WHERE version_id = @0`, [versionId]))
      .rejects.toThrow(/inmutable/);
    await expect(revision.registrar(versionId, { pagina: { tablaCodigo: 'TABLA_3', paginaPdf: 341 } }, 'RECHAZADO',
      'prueba: no se revisa una versión validada', null, randomUUID(), ctx)).rejects.toMatchObject({ status: 409 });
  });

  it('activa con revisión esperada e idempotencia, y conserva el historial', async () => {
    const clave = randomUUID();
    const primera = await activacion.activar(versionId, 0, 'prueba de activación en base desechable', clave, ctx);
    expect(primera).toMatchObject({ idioma: 'es', revision: 1, versionAnteriorId: null, repetida: false });
    expect(await activacion.activar(versionId, 0, 'prueba de activación en base desechable', clave, ctx))
      .toMatchObject({ repetida: true, revision: 1 });
    await expect(activacion.activar(versionId, 0, 'revisión vieja del puntero', randomUUID(), ctx))
      .rejects.toMatchObject({ response: { codigo: 'VERSION_EN_CONFLICTO', revisionActual: 1 } });
    await expect(ds.query(`DELETE FROM matpel.gre_activaciones_historial`)).rejects.toThrow(/inmutable/);
  });

  it('compara dos versiones de la misma fuente sin diferencias de contenido', async () => {
    const [v] = await ds.query(`SELECT documento_id, version_parser, version_normalizador, version_esquema
      FROM matpel.gre_versiones WHERE id = @0`, [versionId]);
    const derivada = randomUUID();
    derivadaId = derivada;
    await ds.query(`INSERT INTO matpel.gre_versiones (id, documento_id, version_parser, version_normalizador, version_esquema,
      revision_correcciones, derivada_de_id, estado) VALUES (@0, @1, @2, @3, @4, 1, @5, N'IMPORTANDO')`,
    [derivada, v.documento_id, v.version_parser, v.version_normalizador, v.version_esquema, versionId]);
    const artefacto = await importacion.leerArtefacto(await (importacion as any).proceso.catalogo('x'), SHA);
    await ds.transaction((m) => ejecutarPlan(m, planDeCarga(artefacto, derivada)));
    await ds.createQueryBuilder().update(GreVersion).set({ estado: 'REQUIERE_REVISION' })
      .where('id = :id', { id: derivada }).updateEntity(false).execute();
    const diferencias = await comparacion.comparar(versionId, derivada);
    for (const grupo of ['entradas', 'guias', 'tablas', 'filas', 'reglas'] as const) {
      expect(diferencias[grupo].totales).toEqual({ altas: 0, bajas: 0, cambios: 0 });
    }
  });

  it('serializa activaciones concurrentes y permite recuperar la edición anterior', async () => {
    const original = await ds.getRepository(GreVersion).findOneByOrFail({ id: versionId });
    // Simulación explícita del cotejo de la copia SOLO en la base desechable.
    // El flujo de revisión por servicio ya se ejercitó con todas las referencias del original.
    await ds.query(`UPDATE matpel.gre_referencias SET estado_revision = N'VERIFICADA' WHERE version_id = @0`, [derivadaId]);
    await ds.createQueryBuilder().update(GreVersion).set({ reporteJson: original.reporteJson, sha256Contenido: original.sha256Contenido })
      .where('id = :id', { id: derivadaId }).updateEntity(false).execute();
    await revision.validar(derivadaId, 'simulación de cotejo de copia para probar recuperación', randomUUID(), ctx);
    const concurrentes = await Promise.allSettled([
      activacion.activar(derivadaId, 1, 'prueba concurrente de activación primera', randomUUID(), ctx),
      activacion.activar(derivadaId, 1, 'prueba concurrente de activación segunda', randomUUID(), ctx),
    ]);
    expect(concurrentes.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const rechazo = concurrentes.find((r) => r.status === 'rejected') as PromiseRejectedResult;
    expect(rechazo.reason).toMatchObject({ response: { codigo: 'VERSION_EN_CONFLICTO', revisionActual: 2 } });
    expect(await activacion.activar(versionId, 2, 'prueba de recuperación de la edición anterior', randomUUID(), ctx))
      .toMatchObject({ revision: 3, versionAnteriorId: expect.any(String) });
    const estado = await activacion.estado();
    expect(estado.activas).toHaveLength(1);
    expect(estado.activas[0].versionGreId.toLowerCase()).toBe(versionId.toLowerCase());
    expect(estado.historial).toHaveLength(3);
    expect((await ds.getRepository(GreVersion).findOneByOrFail({ id: derivadaId })).estado).toBe('VALIDADA');
  });
});
