import { DataSource } from 'typeorm';
import { AsignacionRol, Bombero, Usuario } from '../../shared/entities';
import type { SujetoUsuario } from './pantallas.logica';

/** Roles vigentes, rango y cargo de una persona: lo que las reglas de la matriz pueden nombrar. */
export async function resolverSujeto(dataSource: DataSource, usuarioId: string, ahora = new Date()): Promise<SujetoUsuario> {
  const asignaciones = await dataSource.getRepository(AsignacionRol).find({ where: { usuarioId } });
  const rolIds = asignaciones
    .filter((a) => !a.fechaExpiracion || new Date(a.fechaExpiracion).getTime() > ahora.getTime())
    .map((a) => a.rolId);
  const usuario = await dataSource.getRepository(Usuario).findOne({ where: { id: usuarioId } });
  let rangoId: string | null = null;
  let cargo: string | null = null;
  if (usuario?.bomberoId) {
    const b = await dataSource.getRepository(Bombero).findOne({ where: { id: usuario.bomberoId } });
    rangoId = b?.rangoId ?? null;
    cargo = b?.cargo ?? null;
  }
  return { usuarioId, rolIds, rangoId, cargo };
}

export const sujetoVacio = (usuarioId: string): SujetoUsuario => ({ usuarioId, rolIds: [], rangoId: null, cargo: null });
