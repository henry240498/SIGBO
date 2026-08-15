import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  Articulo,
  Equipo,
  MovimientoDeposito,
  Parametro,
  TenenciaDeposito,
} from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { RegistrarMovimientoDto } from './dto/registrar-movimiento.dto';

export interface TenenciaKey {
  tipoTenenciaId: string;
  ubicacionId?: string | null;
  vehiculoId?: string | null;
  bomberoId?: string | null;
  servicioId?: string | null;
}

/** Input completamente resuelto (todos los ids ya validados/conocidos) --
 * usado tanto por el endpoint manual (Etapa 2) como internamente por
 * Entradas/Bajas/Prestamos (Etapas 3-5), que arman este objeto ellos mismos
 * en vez de reimplementar la sincronizacion de tenencias. */
export interface MovimientoInput {
  tipoMovimientoId: string;
  tipoElemento: 'EQUIPO' | 'ARTICULO';
  equipoId?: string | null;
  articuloId?: string | null;
  loteId?: string | null;
  cantidad?: number | null;
  origen?: TenenciaKey | null;
  destino?: TenenciaKey | null;
  estadoElementoId: string;
  responsableId?: string | null;
  motivo?: string | null;
  observacion?: string | null;
  documentoUrl?: string | null;
  actorId: string;
  ip?: string;
}

/** Motor central de trazabilidad de Deposito (seccion 6 del pedido): cada
 * movimiento que se registra aca crea SIEMPRE una fila de historial
 * (deposito.movimientos, append-only) y sincroniza deposito.tenencias en la
 * misma transaccion -- nunca se actualiza la ubicacion/estado de un
 * elemento por fuera de este flujo. */
@Injectable()
export class MovimientosDepositoService {
  constructor(
    @InjectRepository(MovimientoDeposito) private readonly movimientoRepo: Repository<MovimientoDeposito>,
    @InjectRepository(TenenciaDeposito) private readonly tenenciaRepo: Repository<TenenciaDeposito>,
    @InjectRepository(Articulo) private readonly articuloRepo: Repository<Articulo>,
    @InjectRepository(Equipo) private readonly equipoRepo: Repository<Equipo>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  /** Resuelve un id de organizacion.parametros por tipo+nombre exacto.
   * Todos los nombres consultados aca fueron sembrados en la migracion
   * 041 -- si falta, es un error de configuracion real, no un caso normal. */
  async obtenerParametro(tipo: string, nombre: string): Promise<string> {
    const parametro = await this.parametroRepo.findOne({ where: { tipo: tipo as any, nombre } });
    if (!parametro) throw new NotFoundException(`Parametro '${nombre}' (tipo ${tipo}) no encontrado -- revisar organizacion > parametros`);
    return parametro.id;
  }

  /** "Donde esta esto ahora" para un elemento individual -- responde
   * directamente la pregunta central del pedido (seccion 5). */
  async tenenciaDeEquipo(equipoId: string) {
    return this.tenenciaRepo.findOne({ where: { equipoId, tipoElemento: 'EQUIPO' } });
  }

  listar(filtros: { tipoElemento?: string; equipoId?: string; articuloId?: string; tipoMovimientoId?: string; desde?: string; hasta?: string }) {
    const qb = this.movimientoRepo.createQueryBuilder('m').orderBy('m.creadoEn', 'DESC');
    if (filtros.tipoElemento) qb.andWhere('m.tipoElemento = :tipoElemento', { tipoElemento: filtros.tipoElemento });
    if (filtros.equipoId) qb.andWhere('m.equipoId = :equipoId', { equipoId: filtros.equipoId });
    if (filtros.articuloId) qb.andWhere('m.articuloId = :articuloId', { articuloId: filtros.articuloId });
    if (filtros.tipoMovimientoId) qb.andWhere('m.tipoMovimientoId = :tipoMovimientoId', { tipoMovimientoId: filtros.tipoMovimientoId });
    if (filtros.desde) qb.andWhere('m.creadoEn >= :desde', { desde: filtros.desde });
    if (filtros.hasta) qb.andWhere('m.creadoEn <= :hasta', { hasta: filtros.hasta });
    return qb.getMany();
  }

  /** Punto de entrada HTTP generico -- valida el DTO crudo y delega en
   * `registrar()`. Cubre Entrada/Salida/Transferencia/Asignacion/Consumo/
   * Mantenimiento/Recuperacion/Otro. */
  async registrarManual(dto: RegistrarMovimientoDto, actorId: string, ip?: string) {
    if (dto.tipoElemento === 'EQUIPO' && !dto.equipoId) throw new BadRequestException('equipoId es requerido cuando tipoElemento=EQUIPO');
    if (dto.tipoElemento === 'ARTICULO' && !dto.articuloId) throw new BadRequestException('articuloId es requerido cuando tipoElemento=ARTICULO');
    if (dto.tipoElemento === 'ARTICULO' && !dto.cantidad) throw new BadRequestException('cantidad es requerida cuando tipoElemento=ARTICULO');
    if (!dto.origenTipoTenenciaId && !dto.destinoTipoTenenciaId) {
      throw new BadRequestException('Debe indicarse al menos un origen o un destino');
    }

    const estadoElementoId = dto.estadoElementoId ?? (await this.obtenerParametro('ESTADO_ELEMENTO_DEPOSITO', 'Disponible'));

    return this.registrar({
      tipoMovimientoId: dto.tipoMovimientoId,
      tipoElemento: dto.tipoElemento as 'EQUIPO' | 'ARTICULO',
      equipoId: dto.equipoId ?? null,
      articuloId: dto.articuloId ?? null,
      loteId: dto.loteId ?? null,
      cantidad: dto.cantidad ?? null,
      origen: dto.origenTipoTenenciaId
        ? {
            tipoTenenciaId: dto.origenTipoTenenciaId,
            ubicacionId: dto.origenUbicacionId ?? null,
            vehiculoId: dto.origenVehiculoId ?? null,
            bomberoId: dto.origenBomberoId ?? null,
            servicioId: dto.origenServicioId ?? null,
          }
        : null,
      destino: dto.destinoTipoTenenciaId
        ? {
            tipoTenenciaId: dto.destinoTipoTenenciaId,
            ubicacionId: dto.destinoUbicacionId ?? null,
            vehiculoId: dto.destinoVehiculoId ?? null,
            bomberoId: dto.destinoBomberoId ?? null,
            servicioId: dto.destinoServicioId ?? null,
          }
        : null,
      estadoElementoId,
      responsableId: dto.responsableId ?? null,
      motivo: dto.motivo ?? null,
      observacion: dto.observacion ?? null,
      documentoUrl: dto.documentoUrl ?? null,
      actorId,
      ip,
    });
  }

  /** Motor real: crea el movimiento + sincroniza tenencia, en una
   * transaccion. Reutilizado directamente (en TypeScript, sin pasar por
   * HTTP) por Entradas/Bajas/Prestamos. */
  async registrar(input: MovimientoInput): Promise<MovimientoDeposito> {
    if (input.tipoElemento === 'EQUIPO') {
      const equipo = await this.equipoRepo.findOne({ where: { id: input.equipoId ?? undefined } });
      if (!equipo) throw new NotFoundException(`Equipo ${input.equipoId} no encontrado`);
    } else {
      const articulo = await this.articuloRepo.findOne({ where: { id: input.articuloId ?? undefined } });
      if (!articulo) throw new NotFoundException(`Articulo ${input.articuloId} no encontrado`);
      if (!input.cantidad || input.cantidad <= 0) throw new BadRequestException('La cantidad debe ser mayor a cero para un articulo');
    }

    const movimiento = await this.movimientoRepo.manager.transaction(async (manager) => {
      const guardado = await manager.save(
        MovimientoDeposito,
        manager.create(MovimientoDeposito, {
          tipoMovimientoId: input.tipoMovimientoId,
          tipoElemento: input.tipoElemento,
          equipoId: input.equipoId ?? null,
          articuloId: input.articuloId ?? null,
          loteId: input.loteId ?? null,
          cantidad: input.cantidad ?? null,
          ubicacionOrigenId: input.origen?.ubicacionId ?? null,
          ubicacionDestinoId: input.destino?.ubicacionId ?? null,
          vehiculoOrigenId: input.origen?.vehiculoId ?? null,
          vehiculoDestinoId: input.destino?.vehiculoId ?? null,
          bomberoOrigenId: input.origen?.bomberoId ?? null,
          bomberoDestinoId: input.destino?.bomberoId ?? null,
          servicioOrigenId: input.origen?.servicioId ?? null,
          servicioDestinoId: input.destino?.servicioId ?? null,
          responsableId: input.responsableId ?? null,
          motivo: input.motivo ?? null,
          observacion: input.observacion ?? null,
          documentoUrl: input.documentoUrl ?? null,
          creadoPor: input.actorId,
        }),
      );

      await this.sincronizarTenencia(manager, input);

      return guardado;
    });

    await this.auditoriaService.registrar({
      usuarioId: input.actorId,
      accion: 'REGISTRAR_MOVIMIENTO',
      recurso: 'deposito.movimientos',
      recursoId: movimiento.id,
      datosDespues: movimiento,
      ip: input.ip ?? null,
    });

    return movimiento;
  }

  private async sincronizarTenencia(manager: EntityManager, input: MovimientoInput) {
    if (input.tipoElemento === 'EQUIPO') {
      await this.sincronizarTenenciaEquipo(manager, input);
    } else {
      await this.sincronizarTenenciaArticulo(manager, input);
    }
  }

  private async sincronizarTenenciaEquipo(manager: EntityManager, input: MovimientoInput) {
    if (!input.destino) {
      throw new BadRequestException('Un movimiento de un elemento individual (EQUIPO) siempre requiere un destino');
    }
    const existente = await manager.findOne(TenenciaDeposito, { where: { equipoId: input.equipoId!, tipoElemento: 'EQUIPO' } });
    const datos = {
      tipoElemento: 'EQUIPO' as const,
      equipoId: input.equipoId,
      articuloId: null,
      loteId: input.loteId ?? null,
      cantidad: null,
      tipoTenenciaId: input.destino.tipoTenenciaId,
      ubicacionId: input.destino.ubicacionId ?? null,
      vehiculoId: input.destino.vehiculoId ?? null,
      bomberoId: input.destino.bomberoId ?? null,
      servicioId: input.destino.servicioId ?? null,
      estadoElementoId: input.estadoElementoId,
      observacion: input.observacion ?? null,
      actualizadoPor: input.actorId,
    };
    if (existente) {
      await manager.update(TenenciaDeposito, existente.id, datos);
    } else {
      await manager.save(TenenciaDeposito, manager.create(TenenciaDeposito, datos));
    }
  }

  private mismaTenencia(a: TenenciaDeposito, b: TenenciaKey): boolean {
    return (
      a.tipoTenenciaId === b.tipoTenenciaId &&
      (a.ubicacionId ?? null) === (b.ubicacionId ?? null) &&
      (a.vehiculoId ?? null) === (b.vehiculoId ?? null) &&
      (a.bomberoId ?? null) === (b.bomberoId ?? null) &&
      (a.servicioId ?? null) === (b.servicioId ?? null)
    );
  }

  private async sincronizarTenenciaArticulo(manager: EntityManager, input: MovimientoInput) {
    const cantidad = input.cantidad!;
    const filas = await manager.find(TenenciaDeposito, { where: { articuloId: input.articuloId!, tipoElemento: 'ARTICULO' } });

    if (input.origen) {
      const fila = filas.find((f) => this.mismaTenencia(f, input.origen!));
      if (!fila || (fila.cantidad ?? 0) < cantidad) {
        throw new BadRequestException('No hay stock suficiente en la tenencia de origen indicada para este movimiento');
      }
      const restante = (fila.cantidad ?? 0) - cantidad;
      if (restante <= 0) {
        await manager.delete(TenenciaDeposito, fila.id);
      } else {
        await manager.update(TenenciaDeposito, fila.id, { cantidad: restante, actualizadoPor: input.actorId });
      }
    }

    if (input.destino) {
      const fila = filas.find((f) => this.mismaTenencia(f, input.destino!));
      if (fila) {
        await manager.update(TenenciaDeposito, fila.id, {
          cantidad: (fila.cantidad ?? 0) + cantidad,
          estadoElementoId: input.estadoElementoId,
          actualizadoPor: input.actorId,
        });
      } else {
        await manager.save(
          TenenciaDeposito,
          manager.create(TenenciaDeposito, {
            tipoElemento: 'ARTICULO',
            equipoId: null,
            articuloId: input.articuloId,
            loteId: input.loteId ?? null,
            cantidad,
            tipoTenenciaId: input.destino.tipoTenenciaId,
            ubicacionId: input.destino.ubicacionId ?? null,
            vehiculoId: input.destino.vehiculoId ?? null,
            bomberoId: input.destino.bomberoId ?? null,
            servicioId: input.destino.servicioId ?? null,
            estadoElementoId: input.estadoElementoId,
            observacion: input.observacion ?? null,
            actualizadoPor: input.actorId,
          }),
        );
      }
    }

    // El stock total del articulo solo cambia cuando el movimiento cruza el
    // limite de la institucion (entrada pura o salida pura); una
    // transferencia/asignacion interna mueve stock entre tenencias sin
    // alterar el total.
    if (input.destino && !input.origen) {
      await manager.increment(Articulo, { id: input.articuloId! }, 'stockActual', cantidad);
    } else if (input.origen && !input.destino) {
      await manager.decrement(Articulo, { id: input.articuloId! }, 'stockActual', cantidad);
    }
  }
}
