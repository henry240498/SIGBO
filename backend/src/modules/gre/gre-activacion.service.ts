import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { GreActivacion, GreActivacionHistorial } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { mismoId } from './gre-artefacto';
import { ContextoGre } from './gre-importacion.service';

/** Puntero de edición activa por idioma. Activar o recuperar una versión anterior es un
 * acto humano con fundamento: exige versión VALIDADA, la revisión esperada del puntero y
 * una clave idempotente. El historial es inmutable (triggers de 094). */
@Injectable()
export class GreActivacionService {
  constructor(@InjectDataSource() private readonly ds: DataSource, private readonly auditoria: AuditoriaService) {}

  async estado() {
    const activas = await this.ds.getRepository(GreActivacion).find();
    const historial = await this.ds.getRepository(GreActivacionHistorial).find({ order: { creadoEn: 'DESC' }, take: 50 });
    return { activas: activas.map((a) => ({ idioma: a.idioma, versionGreId: a.versionId, revision: a.revision, activadaEn: a.creadoEn })),
      historial: historial.map((h) => ({ idioma: h.idioma, versionGreId: h.versionId, versionAnteriorId: h.versionAnteriorId,
        revision: h.revision, activadaPor: h.activadaPor, fundamento: h.fundamento, creadoEn: h.creadoEn })) };
  }

  async activar(versionGreId: string, revisionEsperada: number, motivo: string, claveIdempotencia: string, ctx: ContextoGre) {
    return this.ds.transaction('SERIALIZABLE', async (m) => {
      const previa = await m.getRepository(GreActivacionHistorial).findOne({ where: { claveIdempotencia },
        lock: { mode: 'pessimistic_write' } });
      if (previa) {
        if (!mismoId(previa.versionId, versionGreId) || !mismoId(previa.activadaPor, ctx.usuarioId)
          || previa.fundamento !== motivo || previa.revision !== revisionEsperada + 1) {
          throw new ConflictException({ codigo: 'IDEMPOTENCIA_EN_CONFLICTO', message: 'La clave ya se usó para otra activación.' });
        }
        return { idioma: previa.idioma, versionGreId, revision: previa.revision, repetida: true };
      }
      const [version] = await m.query(`SELECT v.id, v.estado, d.idioma FROM matpel.gre_versiones v
        JOIN matpel.gre_documentos d ON d.id = v.documento_id WHERE v.id = @0`, [versionGreId]);
      if (!version) throw new NotFoundException('La versión GRE no existe.');
      if (version.estado !== 'VALIDADA') {
        throw new ConflictException({ codigo: 'VERSION_NO_VALIDADA', message: 'Solo se activa una versión validada.' });
      }
      const [puntero] = await m.query(`SELECT id, version_id, revision FROM matpel.gre_activaciones WITH (UPDLOCK, HOLDLOCK)
        WHERE idioma = @0`, [version.idioma]);
      const revisionActual = puntero?.revision ?? 0;
      if (revisionActual !== revisionEsperada) {
        throw new ConflictException({ codigo: 'VERSION_EN_CONFLICTO', message: 'La activación cambió desde que la consultaste.', revisionActual });
      }
      if (mismoId(puntero?.version_id, versionGreId)) {
        throw new ConflictException({ codigo: 'YA_ACTIVA', message: 'Esa versión ya es la edición activa.', revisionActual });
      }
      const revision = revisionActual + 1;
      await m.createQueryBuilder().insert().into(GreActivacionHistorial).values({ id: randomUUID(), idioma: version.idioma,
        versionId: versionGreId, versionAnteriorId: puntero?.version_id ?? null, revision, claveIdempotencia,
        activadaPor: ctx.usuarioId, fundamento: motivo }).updateEntity(false).execute();
      if (puntero) {
        await m.query(`UPDATE matpel.gre_activaciones SET version_id = @0, revision = @1, activada_por = @2,
          creado_en = SYSDATETIMEOFFSET() WHERE id = @3`, [versionGreId, revision, ctx.usuarioId, puntero.id]);
      } else {
        await m.createQueryBuilder().insert().into(GreActivacion).values({ id: randomUUID(), idioma: version.idioma,
          versionId: versionGreId, revision, activadaPor: ctx.usuarioId }).updateEntity(false).execute();
      }
      await this.auditoria.registrar({ usuarioId: ctx.usuarioId, accion: 'GRE_EDICION_ACTIVADA', recurso: 'matpel.gre_activaciones',
        recursoId: versionGreId, ip: ctx.ip, userAgent: ctx.userAgent,
        datosAntes: { versionGreId: puntero?.version_id ?? null, revision: revisionActual },
        datosDespues: { versionGreId, revision }, metadata: { claveIdempotencia, motivo } }, m);
      return { idioma: version.idioma, versionGreId, revision, versionAnteriorId: puntero?.version_id ?? null, repetida: false };
    });
  }
}
