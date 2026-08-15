import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Articulo, Equipo, PrestamoDeposito, PrestamoDepositoItem } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { MovimientosDepositoService } from './movimientos-deposito.service';
import { CreatePrestamoDepositoDto, DevolverPrestamoDto } from './dto/prestamo-deposito.dto';

@Injectable()
export class PrestamosService {
  constructor(
    @InjectRepository(PrestamoDeposito) private readonly prestamoRepo: Repository<PrestamoDeposito>,
    @InjectRepository(PrestamoDepositoItem) private readonly itemRepo: Repository<PrestamoDepositoItem>,
    @InjectRepository(Articulo) private readonly articuloRepo: Repository<Articulo>,
    @InjectRepository(Equipo) private readonly equipoRepo: Repository<Equipo>,
    private readonly movimientosService: MovimientosDepositoService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(filtros: { estado?: string; solicitanteBomberoId?: string }) {
    const qb = this.prestamoRepo.createQueryBuilder('p').orderBy('p.fechaEntrega', 'DESC');
    if (filtros.estado) qb.andWhere('p.estado = :estado', { estado: filtros.estado });
    if (filtros.solicitanteBomberoId) qb.andWhere('p.solicitanteBomberoId = :solicitanteBomberoId', { solicitanteBomberoId: filtros.solicitanteBomberoId });
    return qb.getMany();
  }

  /** Prestamos vencidos: activos (o parcialmente devueltos) cuya fecha de
   * devolucion comprometida ya paso (seccion 7 del pedido: alerta de
   * PRESTAMO VENCIDO). */
  vencidos() {
    return this.prestamoRepo.find({
      where: [
        { estado: 'ACTIVO', fechaDevolucionComprometida: LessThan(new Date()) },
        { estado: 'DEVUELTO_PARCIAL', fechaDevolucionComprometida: LessThan(new Date()) },
      ],
      order: { fechaDevolucionComprometida: 'ASC' },
    });
  }

  async findOne(id: string) {
    const prestamo = await this.prestamoRepo.findOne({ where: { id } });
    if (!prestamo) throw new NotFoundException(`Prestamo ${id} no encontrado`);
    return prestamo;
  }

  async items(prestamoId: string) {
    await this.findOne(prestamoId);
    return this.itemRepo.find({ where: { prestamoId } });
  }

  async create(dto: CreatePrestamoDepositoDto, actorId: string, ip?: string) {
    if (dto.items.length === 0) throw new BadRequestException('El prestamo debe tener al menos un item');
    if (!dto.solicitanteBomberoId && !dto.solicitanteExterno && !dto.servicioDestinoId) {
      throw new BadRequestException('Debe indicarse un solicitante (bombero, texto libre u otro institucion, o servicio destino)');
    }

    for (const item of dto.items) {
      if (item.tipoElemento === 'ARTICULO') {
        if (!item.articuloId || !item.cantidad) throw new BadRequestException('articuloId y cantidad son requeridos para items ARTICULO');
        const articulo = await this.articuloRepo.findOne({ where: { id: item.articuloId } });
        if (!articulo) throw new NotFoundException(`Articulo ${item.articuloId} no encontrado`);
      } else {
        if (!item.equipoId) throw new BadRequestException('equipoId es requerido para items EQUIPO');
        const equipo = await this.equipoRepo.findOne({ where: { id: item.equipoId } });
        if (!equipo) throw new NotFoundException(`Equipo ${item.equipoId} no encontrado`);
      }
    }

    const prestamo = await this.prestamoRepo.save(
      this.prestamoRepo.create({
        tipoPrestamoId: dto.tipoPrestamoId,
        solicitanteBomberoId: dto.solicitanteBomberoId ?? null,
        solicitanteExterno: dto.solicitanteExterno ?? null,
        servicioDestinoId: dto.servicioDestinoId ?? null,
        autorizadoPor: dto.autorizadoPor ?? null,
        fechaEntrega: new Date(dto.fechaEntrega),
        fechaDevolucionComprometida: dto.fechaDevolucionComprometida ? new Date(dto.fechaDevolucionComprometida) : null,
        observaciones: dto.observaciones ?? null,
        creadoPor: actorId,
      }),
    );

    const tipoMovimientoPrestamo = await this.movimientosService.obtenerParametro('TIPO_MOVIMIENTO_DEPOSITO', 'Prestamo');
    const tipoTenenciaPrestado = await this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'Prestado');
    const estadoPrestado = await this.movimientosService.obtenerParametro('ESTADO_ELEMENTO_DEPOSITO', 'Prestado');

    for (const item of dto.items) {
      const origenTipoTenencia = await this.resolverTipoTenenciaOrigen(item);
      const movimiento = await this.movimientosService.registrar({
        tipoMovimientoId: tipoMovimientoPrestamo,
        tipoElemento: item.tipoElemento as 'EQUIPO' | 'ARTICULO',
        articuloId: item.tipoElemento === 'ARTICULO' ? item.articuloId : null,
        equipoId: item.tipoElemento === 'EQUIPO' ? item.equipoId : null,
        cantidad: item.tipoElemento === 'ARTICULO' ? item.cantidad : null,
        origen: {
          tipoTenenciaId: origenTipoTenencia,
          ubicacionId: item.origenUbicacionId ?? null,
          vehiculoId: item.origenVehiculoId ?? null,
          bomberoId: item.origenBomberoId ?? null,
          servicioId: item.origenServicioId ?? null,
        },
        destino: {
          tipoTenenciaId: tipoTenenciaPrestado,
          bomberoId: dto.solicitanteBomberoId ?? null,
          servicioId: dto.servicioDestinoId ?? null,
        },
        estadoElementoId: estadoPrestado,
        responsableId: dto.solicitanteBomberoId ?? null,
        motivo: 'Prestamo',
        observacion: dto.observaciones ?? null,
        actorId,
        ip,
      });

      await this.itemRepo.save(
        this.itemRepo.create({
          prestamoId: prestamo.id,
          tipoElemento: item.tipoElemento as 'EQUIPO' | 'ARTICULO',
          articuloId: item.tipoElemento === 'ARTICULO' ? (item.articuloId ?? null) : null,
          equipoId: item.tipoElemento === 'EQUIPO' ? (item.equipoId ?? null) : null,
          cantidad: item.cantidad ?? null,
          estadoItem: 'PENDIENTE',
          movimientoEntregaId: movimiento.id,
        }),
      );
    }

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'deposito.prestamos',
      recursoId: prestamo.id,
      datosDespues: { ...prestamo, items: dto.items },
      ip: ip ?? null,
    });

    return this.findOne(prestamo.id);
  }

  async devolver(prestamoId: string, dto: DevolverPrestamoDto, actorId: string, ip?: string) {
    const prestamo = await this.findOne(prestamoId);
    if (prestamo.estado === 'DEVUELTO') throw new BadRequestException('Este prestamo ya fue devuelto por completo');

    const tipoMovimientoDevolucion = await this.movimientosService.obtenerParametro('TIPO_MOVIMIENTO_DEPOSITO', 'Devolucion');
    const tipoTenenciaPrestado = await this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'Prestado');
    const tipoTenenciaDeposito = await this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'En deposito');
    const estadoDisponible = await this.movimientosService.obtenerParametro('ESTADO_ELEMENTO_DEPOSITO', 'Disponible');
    const estadoPerdido = await this.movimientosService.obtenerParametro('ESTADO_ELEMENTO_DEPOSITO', 'Perdido');
    const estadoDanado = await this.movimientosService.obtenerParametro('ESTADO_ELEMENTO_DEPOSITO', 'Danado');

    for (const devolucion of dto.items) {
      const item = await this.itemRepo.findOne({ where: { id: devolucion.itemId, prestamoId } });
      if (!item) throw new NotFoundException(`Item de prestamo ${devolucion.itemId} no encontrado en este prestamo`);
      if (item.estadoItem !== 'PENDIENTE') throw new BadRequestException(`El item ${devolucion.itemId} ya fue procesado (estado actual: ${item.estadoItem})`);

      if (devolucion.estadoItem === 'DEVUELTO') {
        if (!devolucion.ubicacionDestinoId) {
          throw new BadRequestException('ubicacionDestinoId es requerido cuando estadoItem=DEVUELTO');
        }
        const movimiento = await this.movimientosService.registrar({
          tipoMovimientoId: tipoMovimientoDevolucion,
          tipoElemento: item.tipoElemento,
          articuloId: item.articuloId,
          equipoId: item.equipoId,
          cantidad: item.cantidad,
          origen: { tipoTenenciaId: tipoTenenciaPrestado, bomberoId: prestamo.solicitanteBomberoId, servicioId: prestamo.servicioDestinoId },
          destino: { tipoTenenciaId: tipoTenenciaDeposito, ubicacionId: devolucion.ubicacionDestinoId },
          estadoElementoId: estadoDisponible,
          motivo: 'Devolucion de prestamo',
          observacion: devolucion.observacion ?? null,
          actorId,
          ip,
        });
        await this.itemRepo.update(item.id, { estadoItem: 'DEVUELTO', movimientoDevolucionId: movimiento.id, observacion: devolucion.observacion ?? null });
      } else if (item.tipoElemento === 'EQUIPO') {
        // Extraviado/danado: para un elemento individual se puede reflejar
        // el nuevo estado sin moverlo (sigue "en poder de" quien lo tenia,
        // pero ya no Prestado activo). Para un ARTICULO por cantidad esto
        // requeriria fraccionar la tenencia -- se deja para registro manual
        // via /deposito/movimientos, no se automatiza aca (ver informe).
        const estadoResultante = devolucion.estadoItem === 'EXTRAVIADO' ? estadoPerdido : estadoDanado;
        const movimiento = await this.movimientosService.registrar({
          tipoMovimientoId: tipoMovimientoDevolucion,
          tipoElemento: 'EQUIPO',
          equipoId: item.equipoId,
          destino: { tipoTenenciaId: tipoTenenciaPrestado, bomberoId: prestamo.solicitanteBomberoId, servicioId: prestamo.servicioDestinoId },
          estadoElementoId: estadoResultante,
          motivo: `Prestamo cerrado como ${devolucion.estadoItem}`,
          observacion: devolucion.observacion ?? null,
          actorId,
          ip,
        });
        await this.itemRepo.update(item.id, { estadoItem: devolucion.estadoItem as any, movimientoDevolucionId: movimiento.id, observacion: devolucion.observacion ?? null });
      } else {
        await this.itemRepo.update(item.id, { estadoItem: devolucion.estadoItem as any, observacion: devolucion.observacion ?? null });
      }
    }

    const itemsActualizados = await this.itemRepo.find({ where: { prestamoId } });
    const pendientes = itemsActualizados.filter((i) => i.estadoItem === 'PENDIENTE').length;
    const nuevoEstado = pendientes === 0 ? 'DEVUELTO' : pendientes < itemsActualizados.length ? 'DEVUELTO_PARCIAL' : 'ACTIVO';

    await this.prestamoRepo.update(prestamoId, {
      estado: nuevoEstado,
      fechaDevolucionReal: nuevoEstado === 'DEVUELTO' ? new Date() : prestamo.fechaDevolucionReal,
      ...(dto.observaciones !== undefined ? { observaciones: dto.observaciones } : {}),
    });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'DEVOLVER',
      recurso: 'deposito.prestamos',
      recursoId: prestamoId,
      datosDespues: { estado: nuevoEstado, items: dto.items },
      ip: ip ?? null,
    });

    return this.findOne(prestamoId);
  }

  private async resolverTipoTenenciaOrigen(item: { origenUbicacionId?: string; origenVehiculoId?: string; origenBomberoId?: string; origenServicioId?: string }): Promise<string> {
    if (item.origenVehiculoId) return this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'En vehiculo');
    if (item.origenBomberoId) return this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'Con personal');
    if (item.origenServicioId) return this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'En servicio');
    return this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'En deposito');
  }
}
