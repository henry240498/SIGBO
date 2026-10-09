import { ConflictException } from '@nestjs/common';
import { createHash } from 'crypto';
import { EntityManager } from 'typeorm';
import { mismoId } from './gre-artefacto';

/** La auditoría se escribe en la misma transacción que el cambio. Los bloqueos
 * protegen la clave de reintento sin modificar el esquema ya preparado en 094. */
export function huellaSolicitud(valor: unknown): string {
  const ordenar = (v: any): any => {
    if (Array.isArray(v)) return v.map(ordenar);
    if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, ordenar(v[k])]));
    if (typeof v === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(v)) return v.toLowerCase();
    return v;
  };
  return createHash('sha256').update(JSON.stringify(ordenar(valor))).digest('hex');
}

export async function resultadoPrevio(m: EntityManager, accion: string, clave: string, actor: string, huella: string) {
  const [previo] = await m.query(`SELECT usuario_id, metadata FROM seguridad.logs_auditoria WITH (UPDLOCK, HOLDLOCK)
    WHERE accion = @0 AND JSON_VALUE(metadata, '$.claveIdempotencia') = @1`, [accion, clave.toLowerCase()]);
  if (!previo) return null;
  const metadata = JSON.parse(previo.metadata);
  if (!mismoId(previo.usuario_id, actor) || metadata.huellaSolicitud !== huella || !metadata.resultadoSolicitud) {
    throw new ConflictException({ codigo: 'IDEMPOTENCIA_EN_CONFLICTO', message: 'La clave ya se usó para otra solicitud.' });
  }
  return metadata.resultadoSolicitud;
}
