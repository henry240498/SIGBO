import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Articulo, Equipo, MantenimientoDeposito, TenenciaDeposito } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { MovimientosDepositoService } from './movimientos-deposito.service';
import { CreateMantenimientoDepositoDto, FinalizarMantenimientoDto } from './dto/mantenimiento-deposito.dto';

/** Mantenimiento estructurado (seccion 14 del pedido): a diferencia de un
 * movimiento manual generico con tipo "Mantenimiento", esto ademas guarda
 * taller/responsable, fecha estimada de salida, fecha real y costo, y
 * reutiliza el motor de MovimientosDepositoService para mover la tenencia a
 * "En taller" al ingresar y de vuelta a "En deposito" al finalizar -- nunca
 * edita tenencias por fuera de ese mecanismo. */
@Injectable()
export class MantenimientosService {
  constructor(
    @InjectRepository(MantenimientoDeposito) private readonly mantenimientoRepo: Repository<MantenimientoDeposito>,
    @InjectRepository(Articulo) private readonly articuloRepo: Repository<Articulo>,
    @InjectRepository(Equipo) private readonly equipoRepo: Repository<Equipo>,
    @InjectRepository(TenenciaDeposito) private readonly tenenciaRepo: Repository<TenenciaDeposito>,
    private readonly movimientosService: MovimientosDepositoService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(filtros: { estado?: string; equipoId?: string; articuloId?: string }) {
    const qb = this.mantenimientoRepo.createQueryBuilder('m').orderBy('m.fechaIngreso', 'DESC');
    if (filtros.estado) qb.andWhere('m.estado = :estado', { estado: filtros.estado });
    if (filtros.equipoId) qb.andWhere('m.equipoId = :equipoId', { equipoId: filtros.equipoId });
    if (filtros.articuloId) qb.andWhere('m.articuloId = :articuloId', { articuloId: filtros.articuloId });
    return qb.getMany();
  }

  async findOne(id: string) {
    const mantenimiento = await this.mantenimientoRepo.findOne({ where: { id } });
    if (!mantenimiento) throw new NotFoundException(`Mantenimiento ${id} no encontrado`);
    return mantenimiento;
  }

  async create(dto: CreateMantenimientoDepositoDto, actorId: string, ip?: string) {
    const tipoMovimientoMantenimiento = await this.movimientosService.obtenerParametro('TIPO_MOVIMIENTO_DEPOSITO', 'Mantenimiento');
    const tipoTenenciaTaller = await this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'En taller');
    const estadoEnMantenimiento = await this.movimientosService.obtenerParametro('ESTADO_ELEMENTO_DEPOSITO', 'En mantenimiento');

    let movimientoId: string;
    let ubicacionOrigenId: string | null = null;

    if (dto.tipoElemento === 'EQUIPO') {
      if (!dto.equipoId) throw new BadRequestException('equipoId es requerido cuando tipoElemento=EQUIPO');
      const equipo = await this.equipoRepo.findOne({ where: { id: dto.equipoId } });
      if (!equipo) throw new NotFoundException(`Equipo ${dto.equipoId} no encontrado`);

      const tenenciaActual = await this.tenenciaRepo.findOne({ where: { equipoId: dto.equipoId, tipoElemento: 'EQUIPO' } });
      ubicacionOrigenId = tenenciaActual?.ubicacionId ?? null;

      const movimiento = await this.movimientosService.registrar({
        tipoMovimientoId: tipoMovimientoMantenimiento,
        tipoElemento: 'EQUIPO',
        equipoId: dto.equipoId,
        origen: tenenciaActual
          ? {
              tipoTenenciaId: tenenciaActual.tipoTenenciaId,
              ubicacionId: tenenciaActual.ubicacionId,
              vehiculoId: tenenciaActual.vehiculoId,
              bomberoId: tenenciaActual.bomberoId,
              servicioId: tenenciaActual.servicioId,
            }
          : null,
        destino: { tipoTenenciaId: tipoTenenciaTaller },
        estadoElementoId: estadoEnMantenimiento,
        responsableId: dto.responsableId ?? null,
        motivo: dto.motivo,
        observacion: dto.observacion ?? null,
        actorId,
        ip,
      });
      movimientoId = movimiento.id;
    } else {
      if (!dto.articuloId) throw new BadRequestException('articuloId es requerido cuando tipoElemento=ARTICULO');
      if (!dto.cantidad) throw new BadRequestException('cantidad es requerida cuando tipoElemento=ARTICULO');
      const articulo = await this.articuloRepo.findOne({ where: { id: dto.articuloId } });
      if (!articulo) throw new NotFoundException(`Articulo ${dto.articuloId} no encontrado`);
      if (!dto.origenUbicacionId && !dto.origenVehiculoId && !dto.origenBomberoId && !dto.origenServicioId) {
        throw new BadRequestException('Debe indicarse el origen (ubicacion/vehiculo/bombero/servicio) desde donde se envia el articulo a mantenimiento');
      }

      const tipoTenenciaOrigen = await this.resolverTipoTenenciaOrigen(dto);
      ubicacionOrigenId = dto.origenUbicacionId ?? null;

      const movimiento = await this.movimientosService.registrar({
        tipoMovimientoId: tipoMovimientoMantenimiento,
        tipoElemento: 'ARTICULO',
        articuloId: dto.articuloId,
        cantidad: dto.cantidad,
        origen: {
          tipoTenenciaId: tipoTenenciaOrigen,
          ubicacionId: dto.origenUbicacionId ?? null,
          vehiculoId: dto.origenVehiculoId ?? null,
          bomberoId: dto.origenBomberoId ?? null,
          servicioId: dto.origenServicioId ?? null,
        },
        destino: { tipoTenenciaId: tipoTenenciaTaller },
        estadoElementoId: estadoEnMantenimiento,
        responsableId: dto.responsableId ?? null,
        motivo: dto.motivo,
        observacion: dto.observacion ?? null,
        actorId,
        ip,
      });
      movimientoId = movimiento.id;
    }

    const mantenimiento = await this.mantenimientoRepo.save(
      this.mantenimientoRepo.create({
        tipoElemento: dto.tipoElemento as 'EQUIPO' | 'ARTICULO',
        articuloId: dto.tipoElemento === 'ARTICULO' ? (dto.articuloId ?? null) : null,
        equipoId: dto.tipoElemento === 'EQUIPO' ? (dto.equipoId ?? null) : null,
        cantidad: dto.cantidad ?? null,
        motivo: dto.motivo,
        responsableId: dto.responsableId ?? null,
        tallerExterno: dto.tallerExterno ?? null,
        fechaIngreso: dto.fechaIngreso,
        fechaEstimadaSalida: dto.fechaEstimadaSalida ?? null,
        observacion: dto.observacion ?? null,
        ubicacionOrigenId,
        movimientoIngresoId: movimientoId,
        creadoPor: actorId,
      }),
    );

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'deposito.mantenimientos',
      recursoId: mantenimiento.id,
      datosDespues: mantenimiento,
      ip: ip ?? null,
    });

    return this.findOne(mantenimiento.id);
  }

  async finalizar(id: string, dto: FinalizarMantenimientoDto, actorId: string, ip?: string) {
    const mantenimiento = await this.findOne(id);
    if (mantenimiento.estado === 'FINALIZADO') throw new BadRequestException('Este mantenimiento ya fue finalizado');

    const ubicacionDestinoId = dto.ubicacionDestinoId ?? mantenimiento.ubicacionOrigenId;
    if (!ubicacionDestinoId) throw new BadRequestException('ubicacionDestinoId es requerido (no hay ubicacion de origen registrada para volver)');

    const resultado = dto.resultado ?? 'Disponible';
    const [tipoMovimientoRecuperacion, tipoTenenciaTaller, tipoTenenciaDeposito, estadoResultanteId] = await Promise.all([
      this.movimientosService.obtenerParametro('TIPO_MOVIMIENTO_DEPOSITO', 'Recuperacion'),
      this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'En taller'),
      this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'En deposito'),
      this.movimientosService.obtenerParametro('ESTADO_ELEMENTO_DEPOSITO', resultado),
    ]);

    const movimiento = await this.movimientosService.registrar({
      tipoMovimientoId: tipoMovimientoRecuperacion,
      tipoElemento: mantenimiento.tipoElemento,
      articuloId: mantenimiento.articuloId,
      equipoId: mantenimiento.equipoId,
      cantidad: mantenimiento.cantidad,
      origen: { tipoTenenciaId: tipoTenenciaTaller },
      destino: { tipoTenenciaId: tipoTenenciaDeposito, ubicacionId: ubicacionDestinoId },
      estadoElementoId: estadoResultanteId,
      motivo: 'Salida de mantenimiento',
      observacion: dto.observacion ?? null,
      actorId,
      ip,
    });

    await this.mantenimientoRepo.update(id, {
      estado: 'FINALIZADO',
      fechaSalidaReal: dto.fechaSalidaReal ?? new Date().toISOString().slice(0, 10),
      costo: dto.costo ?? mantenimiento.costo,
      movimientoSalidaId: movimiento.id,
      ...(dto.observacion !== undefined ? { observacion: dto.observacion } : {}),
    });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'FINALIZAR',
      recurso: 'deposito.mantenimientos',
      recursoId: id,
      datosDespues: { estado: 'FINALIZADO', resultado, costo: dto.costo ?? mantenimiento.costo },
      ip: ip ?? null,
    });

    return this.findOne(id);
  }

  private async resolverTipoTenenciaOrigen(dto: CreateMantenimientoDepositoDto): Promise<string> {
    if (dto.origenUbicacionId) return this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'En deposito');
    if (dto.origenVehiculoId) return this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'En vehiculo');
    if (dto.origenBomberoId) return this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'Con personal');
    return this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'En servicio');
  }
}
