import { ConflictException, ForbiddenException } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { Parametro, PersonalServicio, ServicioParticipante, Usuario } from '../../shared/entities';
import type { PoliticaHorasServicio } from './incidente.logica';

export type PoliticaParticipacion = 'MARCAR_NO_ASIGNADO' | 'SOLO_ASIGNADOS';

async function leerPolitica<T extends string>(m: EntityManager, codigo: string, permitidas: readonly T[]): Promise<T> {
  const filas = await m.getRepository(Parametro).find({ where: { tipo: 'POLITICA_INCIDENTE', codigo } });
  const vigentes = filas.filter((p) => p.estado === 'ACTIVO' && p.eliminadoEn === null);
  if (vigentes.length !== 1 || !permitidas.includes(vigentes[0].descripcion as T)) {
    throw new ConflictException(`La política ${codigo} no está configurada correctamente: debe existir un único valor activo y válido.`);
  }
  return vigentes[0].descripcion as T;
}

export function politicaHoras(m: EntityManager): Promise<PoliticaHorasServicio> {
  return leerPolitica(m, 'HORAS_SERVICIO', ['MAS_CERCANA', 'HORA_INICIADA', 'HORAS_COMPLETAS']);
}

export function politicaParticipacion(m: EntityManager): Promise<PoliticaParticipacion> {
  return leerPolitica(m, 'PARTICIPACION', ['MARCAR_NO_ASIGNADO', 'SOLO_ASIGNADOS']);
}

/** Complementa los permisos del llamador; no decide habilitación institucional ni crea asignaciones. */
export async function validarParticipacion(
  m: EntityManager, servicioId: string, usuarioId: string, esEmergencia = false,
): Promise<{ fueraDeAsignacion: boolean }> {
  // Emergencia evita incluso configuración ausente o inválida: el aviso siempre debe llegar.
  const politica = esEmergencia ? null : await politicaParticipacion(m);
  const usuario = await m.getRepository(Usuario).findOne({ where: { id: usuarioId } });
  const personal = usuario?.bomberoId
    ? await m.getRepository(PersonalServicio).find({ where: { servicioId, bomberoId: usuario.bomberoId } }) : [];
  const participantes = await m.getRepository(ServicioParticipante).find({ where: { servicioId, usuarioId } });
  const asignado = personal.length > 0 || participantes.some((p) => p.estado !== 'RETIRADO' && !p.hasta);
  if (!asignado && politica === 'SOLO_ASIGNADOS') {
    throw new ForbiddenException('Primero debes incorporarte al servicio: la política permite actuar solo a personal asignado.');
  }
  return { fueraDeAsignacion: !asignado };
}
