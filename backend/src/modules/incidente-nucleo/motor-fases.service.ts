import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { Despacho, FaseOperativa, PersonalServicio, ResultadoIncidente, Servicio } from '../../shared/entities';
import { DESPACHO_ACTIVO, estadoDesdeFase, faseAutomatica, HechoAutomatico } from './incidente.logica';

export interface CambioFase {
  antes: FaseOperativa;
  despues: FaseOperativa;
}

/**
 * Aplica las transiciones de fase del incidente. Siempre dentro de la transaccion del llamador:
 * bloquea la fila del servicio y escribe fase, fase_desde y el estado heredado derivado.
 * Usa solo update() para no pisar columnas que el llamador haya cambiado en la misma transaccion.
 */
@Injectable()
export class MotorFases {
  async bloquear(m: EntityManager, servicioId: string): Promise<Servicio> {
    const s = await m.getRepository(Servicio).findOne({ where: { id: servicioId }, lock: { mode: 'pessimistic_write' } });
    if (!s) throw new NotFoundException('Incidente no encontrado.');
    return s;
  }

  async despachosActivos(m: EntityManager, servicioId: string): Promise<Despacho[]> {
    const todos = await m.getRepository(Despacho).find({ where: { servicioId } });
    return todos.filter((d) => DESPACHO_ACTIVO.includes(d.estado));
  }

  /** Dentro de transacción: servicio primero, luego móviles y personal. Nunca libera personal. */
  async validarCierre(m: EntityManager, servicioId: string): Promise<void> {
    const s = await this.bloquear(m, servicioId);
    if (s.faseOperativa === 'CERRADO') throw new ConflictException('El incidente ya está cerrado.');
    if ((await this.despachosActivos(m, servicioId)).length) {
      throw new ConflictException('No se puede cerrar: hay móviles todavía afuera. Registrá su regreso primero.');
    }
    const personal = await m.getRepository(PersonalServicio).find({ where: { servicioId, enZona: true } });
    if (personal.length) throw new ConflictException('No se puede cerrar: hay personal dentro de la zona. Registrá su salida primero.');
  }

  async alHecho(m: EntityManager, servicioId: string, hecho: HechoAutomatico, ahora = new Date()): Promise<CambioFase | null> {
    const s = await this.bloquear(m, servicioId);
    const despachos = hecho === 'DESPACHOS_CAMBIARON' ? await m.getRepository(Despacho).find({ where: { servicioId } }) : [];
    const destino = faseAutomatica(s.faseOperativa, hecho, despachos);
    return destino ? this.fijar(m, s, destino, ahora) : null;
  }

  async fijar(
    m: EntityManager,
    s: Servicio,
    destino: FaseOperativa,
    ahora = new Date(),
    resultado?: ResultadoIncidente | null,
  ): Promise<CambioFase> {
    // Relee bajo bloqueo para no derivar estados desde una copia anterior a la transacción.
    const vigente = await this.bloquear(m, s.id);
    if (vigente.faseOperativa === 'CERRADO') throw new ConflictException('El incidente ya está cerrado.');
    if (destino === 'CERRADO') await this.validarCierre(m, s.id);
    Object.assign(s, vigente);
    const antes = s.faseOperativa;
    const res = resultado === undefined ? s.resultado : resultado;
    const cambios = { faseOperativa: destino, faseDesde: ahora, resultado: res, estado: estadoDesdeFase(destino, res) };
    await m.getRepository(Servicio).update({ id: s.id }, cambios);
    Object.assign(s, cambios);
    return { antes, despues: destino };
  }
}
