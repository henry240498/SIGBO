import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { createHash, randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { join, resolve, sep } from 'path';
import { DataSource, In } from 'typeorm';
import { GreDocumento, GreImportacion, GreReferencia, GreVersion } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { ArtefactoGre, ArtefactoInvalidoError, validarArtefacto } from './gre-artefacto';
import { ejecutarPlan, planDeCarga } from './gre-carga';
import { GRE_RAIZ_PRIVADA } from './gre-fuentes.service';
import { GreProcesoService, ResultadoCatalogo } from './gre-proceso.service';
import { huellaSolicitud, resultadoPrevio } from './gre-idempotencia';

export const VERSION_ESQUEMA = 'artefacto-1/sql-094';
export const identidadParser = (parser: string, pymupdf: string) => `${parser}/pymupdf-${pymupdf}`;
const MAX_ARTEFACTO = 256 * 1024 * 1024;
const MAX_INTENTOS = 3;

export interface ContextoGre { usuarioId: string; ip?: string | null; userAgent?: string | null }
export interface TrabajoReclamado { id: string; versionId: string; token: string; intento: number }

/** Importación controlada: la petición HTTP solo encola. Un trabajador local reclama el
 * trabajo con lease, ejecuta la extracción y carga el candidato en una sola transacción.
 * El resultado queda REQUIERE_REVISION: importar nunca valida ni activa una edición. */
@Injectable()
export class GreImportacionService {
  private readonly log = new Logger('GreImportacion');

  constructor(
    @InjectDataSource() private readonly ds: DataSource,
    private readonly proceso: GreProcesoService,
    private readonly auditoria: AuditoriaService,
    @Inject(GRE_RAIZ_PRIVADA) private readonly raizPrivada: string,
  ) {}

  async documentos() {
    const { candidatos, descartados } = await this.proceso.listar();
    const shas = [...new Set(candidatos.map((c) => c.sha256))];
    const registrados = shas.length ? await this.ds.getRepository(GreDocumento).find({ where: { sha256: In(shas) } }) : [];
    const versiones = registrados.length
      ? await this.ds.getRepository(GreVersion).find({ where: { documentoId: In(registrados.map((d) => d.id)) }, order: { creadoEn: 'DESC' } })
      : [];
    return {
      candidatos: candidatos.map((c) => {
        const documento = registrados.find((d) => d.sha256 === c.sha256);
        return {
          seleccionId: c.sha256, archivo: c.archivo, edicion: c.edicion, idioma: c.idioma, paginas: c.paginas,
          bytes: c.bytes, titulo: c.titulo, documentoId: documento?.id ?? null,
          versiones: versiones.filter((v) => v.documentoId === documento?.id)
            .map((v) => ({ id: v.id, estado: v.estado, versionParser: v.versionParser, creadoEn: v.creadoEn })),
        };
      }),
      descartados: descartados.map((d) => ({ archivo: d.archivo, motivo: d.motivo })),
    };
  }

  async solicitar(seleccionId: string, claveIdempotencia: string, ctx: ContextoGre) {
    if (!/^[a-f0-9]{64}$/.test(seleccionId)) throw new BadRequestException('Seleccioná una fuente detectada.');
    const candidato = await this.candidato(seleccionId);
    const herramienta = await this.proceso.versiones();
    const huella = huellaSolicitud({ seleccionId });
    return this.ds.transaction('SERIALIZABLE', async (m) => {
      const previo = await resultadoPrevio(m, 'GRE_IMPORTACION_SOLICITADA', claveIdempotencia, ctx.usuarioId, huella);
      if (previo) return previo;
      const responder = async (respuesta: { importacionId: string | null; versionGreId: string; estado: string; existente: boolean }) => {
        await this.auditoria.registrar({ usuarioId: ctx.usuarioId, accion: 'GRE_IMPORTACION_SOLICITADA',
          recurso: 'matpel.gre_importaciones', recursoId: respuesta.importacionId, ip: ctx.ip, userAgent: ctx.userAgent,
          datosDespues: { versionGreId: respuesta.versionGreId, documentoSha256: seleccionId, ...herramienta },
          metadata: { claveIdempotencia: claveIdempotencia.toLowerCase(), huellaSolicitud: huella, resultadoSolicitud: respuesta } }, m);
        return respuesta;
      };
      // Serializar por hash antes de comprobar documento/versión evita dos trabajos
      // para la misma identidad cuando llegan solicitudes simultáneas.
      await m.query(`SELECT id FROM matpel.gre_documentos WITH (UPDLOCK, HOLDLOCK) WHERE sha256 = @0`, [seleccionId]);
      let documento = await m.getRepository(GreDocumento).findOne({ where: { sha256: seleccionId } });
      if (!documento) {
        const id = randomUUID();
        await m.createQueryBuilder().insert().into(GreDocumento).values({
          id, sha256: seleccionId, referenciaPrivada: `privado:gre:${seleccionId}.pdf`, tamanoBytes: candidato.bytes,
          paginas: candidato.paginas, titulo: candidato.titulo.slice(0, 400), edicion: candidato.edicion,
          idioma: candidato.idioma, identificacionJson: JSON.stringify({ ...(candidato.identificacion as object), archivo: candidato.archivo }),
          incorporadaPor: ctx.usuarioId,
        }).updateEntity(false).execute();
        documento = await m.getRepository(GreDocumento).findOneByOrFail({ id });
      }
      const identidad = { documentoId: documento.id, versionParser: identidadParser(herramienta.versionParser, herramienta.pymupdf),
        versionNormalizador: herramienta.versionNormalizador, versionEsquema: VERSION_ESQUEMA, revisionCorrecciones: 0 };
      let version = await m.getRepository(GreVersion).findOne({ where: identidad });
      if (version) {
        const ultima = await m.getRepository(GreImportacion).findOne({ where: { versionId: version.id }, order: { creadoEn: 'DESC' } });
        const vivo = ultima && ['PENDIENTE', 'EN_PROCESO'].includes(ultima.estado);
        // La misma identidad no se importa dos veces: se devuelve el trabajo o el candidato existente.
        if (version.estado !== 'ERROR' && (version.estado !== 'IMPORTANDO' || vivo)) {
          return responder({ importacionId: ultima?.id ?? null, versionGreId: version.id, estado: version.estado, existente: true });
        }
        await m.createQueryBuilder().update(GreVersion).set({ estado: 'IMPORTANDO', reporteJson: null })
          .where('id = :id', { id: version.id }).updateEntity(false).execute();
      } else {
        const id = randomUUID();
        await m.createQueryBuilder().insert().into(GreVersion).values({ id, ...identidad, estado: 'IMPORTANDO' })
          .updateEntity(false).execute();
        version = await m.getRepository(GreVersion).findOneByOrFail({ id });
      }
      const importacionId = randomUUID();
      await m.createQueryBuilder().insert().into(GreImportacion).values({
        id: importacionId, versionId: version.id, estado: 'PENDIENTE', etapa: 'EN_COLA', paginasProcesadas: 0,
        intento: 0, solicitadaPor: ctx.usuarioId,
      }).updateEntity(false).execute();
      return responder({ importacionId, versionGreId: version.id, estado: 'IMPORTANDO', existente: false });
    });
  }

  async estado(importacionId: string) {
    const importacion = await this.ds.getRepository(GreImportacion).findOneBy({ id: importacionId });
    if (!importacion) throw new NotFoundException('La importación no existe.');
    const version = await this.ds.getRepository(GreVersion).findOneByOrFail({ id: importacion.versionId });
    const reporte = version.reporteJson ? JSON.parse(version.reporteJson) : null;
    return {
      importacionId: importacion.id, estado: importacion.estado, etapa: importacion.etapa,
      paginasProcesadas: importacion.paginasProcesadas, intento: importacion.intento,
      heartbeatEn: importacion.heartbeatEn, creadoEn: importacion.creadoEn, finalizadaEn: importacion.finalizadaEn,
      errores: importacion.erroresJson ? JSON.parse(importacion.erroresJson) : null,
      version: { id: version.id, estado: version.estado, versionParser: version.versionParser,
        resumen: reporte?.resumen ?? null, hallazgos: reporte?.hallazgos?.length ?? null },
    };
  }

  /** Reclama el trabajo más antiguo pendiente, o uno cuyo lease venció (trabajador caído). */
  async reclamar(): Promise<TrabajoReclamado | null> {
    const token = randomUUID();
    // MSSQL conserva el aislamiento de una conexión del pool tras una transacción.
    // READPAST necesita READ COMMITTED/REPEATABLE READ: declararlo aquí evita heredar
    // SERIALIZABLE de una solicitud o activación anterior.
    const filas: { id: string; version_id: string; intento: number }[] = await this.ds.transaction('READ COMMITTED', (m) => m.query(`
      ;WITH siguiente AS (
        SELECT TOP (1) * FROM matpel.gre_importaciones WITH (UPDLOCK, READPAST, ROWLOCK)
        WHERE estado = N'PENDIENTE' OR (estado = N'EN_PROCESO' AND lease_hasta < SYSDATETIMEOFFSET())
        ORDER BY creado_en)
      UPDATE siguiente SET estado = N'EN_PROCESO', lease_token = @0,
        lease_hasta = DATEADD(MINUTE, 30, SYSDATETIMEOFFSET()), heartbeat_en = SYSDATETIMEOFFSET(),
        intento = intento + 1, etapa = N'RECLAMADA'
      OUTPUT INSERTED.id, INSERTED.version_id, INSERTED.intento;`, [token]));
    if (!filas.length) return null;
    const trabajo = { id: filas[0].id.toLowerCase(), versionId: filas[0].version_id.toLowerCase(), token, intento: filas[0].intento };
    if (trabajo.intento > MAX_INTENTOS) {
      await this.fallar(trabajo, new Error(`Se agotaron ${MAX_INTENTOS} intentos; revisá el registro del trabajador.`));
      return null;
    }
    return trabajo;
  }

  async procesarPendientes(maximo = 5): Promise<number> {
    let procesados = 0;
    for (let i = 0; i < maximo; i++) {
      const trabajo = await this.reclamar();
      if (!trabajo) break;
      await this.procesar(trabajo);
      procesados++;
    }
    return procesados;
  }

  async procesar(t: TrabajoReclamado): Promise<void> {
    const etapa = async (nombre: string) => {
      const filas = await this.ds.query(
        `UPDATE matpel.gre_importaciones SET etapa = @0, heartbeat_en = SYSDATETIMEOFFSET(),
          lease_hasta = DATEADD(MINUTE, 30, SYSDATETIMEOFFSET())
          OUTPUT INSERTED.id WHERE id = @1 AND lease_token = @2 AND estado = N'EN_PROCESO'
          AND lease_hasta > SYSDATETIMEOFFSET()`, [nombre, t.id, t.token]);
      if (filas.length !== 1) throw new Error('El lease del trabajo venció; otro trabajador puede retomarlo.');
    };
    try {
      const version = await this.ds.getRepository(GreVersion).findOneByOrFail({ id: t.versionId });
      const documento = await this.ds.getRepository(GreDocumento).findOneByOrFail({ id: version.documentoId });
      await etapa('EXTRAYENDO');
      const candidato = await this.candidato(documento.sha256);
      const resultado = await this.proceso.catalogo(candidato.archivo);
      if (resultado.documentoSha256 !== documento.sha256) throw new Error('La extracción no corresponde a la fuente registrada.');
      await etapa('VALIDANDO_ARTEFACTO');
      const artefacto = await this.leerArtefacto(resultado, documento.sha256);
      if (identidadParser(artefacto.versionParser, artefacto.herramienta.version) !== version.versionParser
        || artefacto.versionNormalizador !== version.versionNormalizador) {
        throw new Error('El extractor cambió de versión después de la solicitud: solicitá una importación nueva.');
      }
      if (artefacto.documento.bytes !== documento.tamanoBytes || artefacto.documento.paginas !== documento.paginas
        || artefacto.documento.edicion !== documento.edicion || artefacto.documento.idioma !== documento.idioma) {
        throw new Error('Los metadatos del artefacto no corresponden al documento registrado.');
      }
      await etapa('CARGANDO');
      const conteo = await this.ds.transaction(async (m) => {
        const vigente = await m.createQueryBuilder().update(GreImportacion).set({ heartbeatEn: () => 'SYSDATETIMEOFFSET()' })
          .where('id = :id AND lease_token = :token AND estado = :estado AND lease_hasta > SYSDATETIMEOFFSET()',
            { id: t.id, token: t.token, estado: 'EN_PROCESO' })
          .updateEntity(false).execute();
        if (vigente.affected !== 1) throw new Error('El lease del trabajo venció; otro trabajador lo retomó.');
        if (await m.getRepository(GreReferencia).count({ where: { versionId: version.id } })) {
          throw new Error('La versión ya tiene contenido: no se carga dos veces.');
        }
        const resultadoCarga = await ejecutarPlan(m, planDeCarga(artefacto, version.id));
        const reporte = { artefacto: resultado.artefacto, artefactoSha256: resultado.artefactoSha256,
          herramienta: artefacto.herramienta, resumen: artefacto.resumen, hallazgos: artefacto.hallazgos,
          pendientes: artefacto.pendientes, carga: resultadoCarga };
        await m.createQueryBuilder().update(GreVersion)
          .set({ estado: 'REQUIERE_REVISION', sha256Contenido: resultado.artefactoSha256, reporteJson: JSON.stringify(reporte) })
          .where('id = :id', { id: version.id }).updateEntity(false).execute();
        await m.createQueryBuilder().update(GreImportacion)
          .set({ estado: 'COMPLETADA', etapa: 'COMPLETADA', paginasProcesadas: artefacto.paginas.length,
            finalizadaEn: () => 'SYSDATETIMEOFFSET()', leaseToken: null, leaseHasta: null })
          .where('id = :id', { id: t.id }).updateEntity(false).execute();
        await this.auditoria.registrar({ usuarioId: null, accion: 'GRE_IMPORTACION_COMPLETADA',
          recurso: 'matpel.gre_versiones', recursoId: version.id,
          datosDespues: { estado: 'REQUIERE_REVISION', artefactoSha256: resultado.artefactoSha256, conteo: resultadoCarga,
            hallazgos: artefacto.hallazgos.length } }, m);
        return resultadoCarga;
      });
      this.log.log(`Importación ${t.id}: candidato ${version.id} cargado (${JSON.stringify(conteo)}).`);
    } catch (error) {
      await this.fallar(t, error);
    }
  }

  private async fallar(t: TrabajoReclamado, error: unknown) {
    const mensaje = error instanceof Error ? error.message : String(error);
    const problemas = error instanceof ArtefactoInvalidoError ? error.problemas.slice(0, 200) : undefined;
    this.log.error(`Importación ${t.id} falló: ${mensaje}`);
    await this.ds.transaction(async (m) => {
      const propias = await m.query(`UPDATE matpel.gre_importaciones SET estado = N'ERROR', etapa = N'ERROR', errores_json = @0,
        finalizada_en = SYSDATETIMEOFFSET(), lease_token = NULL, lease_hasta = NULL
        OUTPUT INSERTED.id WHERE id = @1 AND lease_token = @2 AND estado = N'EN_PROCESO'`,
        [JSON.stringify({ mensaje, problemas, en: new Date().toISOString() }), t.id, t.token]);
      // Un trabajador vencido no puede alterar el candidato que otro está cargando.
      if (!propias.length) return;
      await m.query(`UPDATE matpel.gre_versiones SET estado = N'ERROR' WHERE id = @0 AND estado = N'IMPORTANDO'`, [t.versionId]);
      await this.auditoria.registrar({ usuarioId: null, accion: 'GRE_IMPORTACION_FALLIDA',
        recurso: 'matpel.gre_importaciones', recursoId: t.id,
        datosDespues: { versionGreId: t.versionId, mensaje, problemas, intento: t.intento } }, m);
    });
  }

  private async candidato(sha256: string) {
    const { candidatos } = await this.proceso.listar();
    const candidato = candidatos.filter((c) => c.sha256 === sha256).sort((a, b) => a.archivo.localeCompare(b.archivo))[0];
    if (!candidato) throw new NotFoundException('La fuente seleccionada ya no está disponible en la carpeta de manuales.');
    return candidato;
  }

  /** Lee el artefacto publicado por el extractor: nombre esperado, dentro del almacén,
   * hash coincidente y contrato validado. Nunca abre una ruta aportada por un cliente. */
  async leerArtefacto(resultado: ResultadoCatalogo, sha256: string): Promise<ArtefactoGre> {
    if (!new RegExp(`^${sha256}\\.[a-z0-9.\\-]+\\.json$`).test(resultado.artefacto)) {
      throw new Error('Nombre de artefacto inesperado.');
    }
    const raiz = resolve(this.raizPrivada);
    const archivo = resolve(join(raiz, resultado.artefacto));
    if (!archivo.startsWith(raiz + sep)) throw new Error('El artefacto quedó fuera del almacén privado.');
    const estado = await fs.lstat(archivo);
    if (!estado.isFile() || estado.isSymbolicLink() || estado.size > MAX_ARTEFACTO) throw new Error('Artefacto inválido.');
    const bytes = await fs.readFile(archivo);
    if (createHash('sha256').update(bytes).digest('hex') !== resultado.artefactoSha256) {
      throw new Error('El artefacto no coincide con el hash informado por el extractor.');
    }
    return validarArtefacto(JSON.parse(bytes.toString('utf8')), sha256);
  }
}
