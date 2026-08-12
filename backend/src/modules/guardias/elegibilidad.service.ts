import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bombero, Rango, RequisitoRolGuardia, VehiculoAutorizado } from '../../shared/entities';

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
    @InjectRepository(Rango) private readonly rangoRepo: Repository<Rango>,
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

  /** Version no destructiva de `validar()` para el generador automatico
   * (Fase B): necesita poder probar muchos candidatos y seguir con el
   * siguiente sin que una BadRequestException interrumpa la corrida. */
  async esElegible(rol: string, bomberoId: string): Promise<boolean> {
    const bombero = await this.bomberoRepo.findOne({ where: { id: bomberoId } });
    if (!bombero) return false;

    const requisitos = await this.requisitoRepo.find({ where: { rol, activo: true } });
    if (requisitos.length > 0) {
      const cumple = requisitos.some(
        (r) =>
          (r.cargoIdRequerido === null || r.cargoIdRequerido === bombero.cargoPrincipalId) &&
          (r.rangoIdRequerido === null || r.rangoIdRequerido === bombero.rangoId) &&
          (r.tipoBomberoIdRequerido === null || r.tipoBomberoIdRequerido === bombero.tipoBomberoId),
      );
      if (!cumple) return false;
    }

    if (rol === 'CHOFER') {
      const autorizado = await this.autorizadoRepo.findOne({ where: { bomberoId } });
      if (!autorizado) return false;
    }

    return true;
  }

  /** Regla de reemplazo (seccion 13 del pedido de Orden de Guardia): un
   * CHOFER solo puede ser reemplazado por otro CHOFER habilitado (ya
   * enforced por `validar('CHOFER', ...)` via `VehiculoAutorizado`); un
   * OFICIAL_A_CARGO solo puede ser reemplazado por otro que cumpla los
   * requisitos configurados Y, si `exigirRangoIgualOSuperior` esta activo,
   * tenga rango igual o mayor al reemplazado -- nada mas en el sistema
   * puede expresar "relativo a quien esta siendo reemplazado", asi que esta
   * comparacion se hace aqui, no en `validar()`. */
  async validarReemplazo(
    rolOriginal: string | null,
    bomberoReemplazadoId: string,
    bomberoNuevoId: string,
    exigirRangoIgualOSuperiorOficial: boolean,
  ): Promise<void> {
    if (!rolOriginal) return;

    await this.validar(rolOriginal, bomberoNuevoId);

    if (rolOriginal === 'OFICIAL_A_CARGO' && exigirRangoIgualOSuperiorOficial) {
      const [reemplazado, nuevo] = await Promise.all([
        this.bomberoRepo.findOne({ where: { id: bomberoReemplazadoId } }),
        this.bomberoRepo.findOne({ where: { id: bomberoNuevoId } }),
      ]);
      if (!reemplazado || !nuevo) return;

      const [rangoReemplazado, rangoNuevo] = await Promise.all([
        reemplazado.rangoId ? this.rangoRepo.findOne({ where: { id: reemplazado.rangoId } }) : null,
        nuevo.rangoId ? this.rangoRepo.findOne({ where: { id: nuevo.rangoId } }) : null,
      ]);
      const nivelReemplazado = rangoReemplazado?.nivelJerarquico ?? 0;
      const nivelNuevo = rangoNuevo?.nivelJerarquico ?? 0;

      if (nivelNuevo < nivelReemplazado) {
        throw new BadRequestException(
          `${nuevo.nombre} ${nuevo.apellido} (${rangoNuevo?.nombre ?? 'sin rango'}) tiene un rango inferior al de ` +
            `${reemplazado.nombre} ${reemplazado.apellido} (${rangoReemplazado?.nombre ?? 'sin rango'}); un Oficial a Cargo ` +
            `solo puede ser reemplazado por otro del mismo rango o mayor rango`,
        );
      }
    }
  }
}
