import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bombero, RequisitoRolGuardia, VehiculoAutorizado } from '../../shared/entities';

/** Valida elegibilidad de rol de forma configurable (seccion 7 del pedido:
 * "estas reglas deben ser configurables y no estar quemadas en el
 * frontend"). Un bombero califica para `rol` si coincide con ALGUNA fila
 * activa de requisitos_rol_guardia para ese rol (OR entre filas), cumpliendo
 * TODAS las columnas no nulas de esa fila (AND entre columnas). Si no hay
 * ninguna fila configurada para el rol, no se restringe por esta via.
 *
 * Caso especial explicito del pedido: el rol CHOFER ademas exige que el
 * bombero tenga al menos un registro en personal.vehiculos_autorizados
 * ("Solamente otro personal autorizado como chofer puede reemplazarlo"). */
@Injectable()
export class ElegibilidadService {
  constructor(
    @InjectRepository(RequisitoRolGuardia) private readonly requisitoRepo: Repository<RequisitoRolGuardia>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(VehiculoAutorizado) private readonly autorizadoRepo: Repository<VehiculoAutorizado>,
  ) {}

  async validar(rol: string, bomberoId: string): Promise<void> {
    const bombero = await this.bomberoRepo.findOne({ where: { id: bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${bomberoId} no encontrado`);

    const requisitos = await this.requisitoRepo.find({ where: { rol, activo: true } });
    if (requisitos.length > 0) {
      const cumple = requisitos.some(
        (r) =>
          (r.cargoIdRequerido === null || r.cargoIdRequerido === bombero.cargoPrincipalId) &&
          (r.rangoIdRequerido === null || r.rangoIdRequerido === bombero.rangoId) &&
          (r.tipoBomberoIdRequerido === null || r.tipoBomberoIdRequerido === bombero.tipoBomberoId),
      );
      if (!cumple) {
        throw new BadRequestException(
          `${bombero.nombre} ${bombero.apellido} no cumple los requisitos configurados para el rol ${rol}`,
        );
      }
    }

    if (rol === 'CHOFER') {
      const autorizado = await this.autorizadoRepo.findOne({ where: { bomberoId } });
      if (!autorizado) {
        throw new BadRequestException(
          `${bombero.nombre} ${bombero.apellido} no tiene autorizacion de chofer registrada (personal.vehiculos_autorizados)`,
        );
      }
    }
  }
}
