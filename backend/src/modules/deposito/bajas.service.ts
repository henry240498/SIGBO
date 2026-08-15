import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Articulo, BajaDeposito, Equipo, TenenciaDeposito } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { MovimientosDepositoService } from './movimientos-deposito.service';
import { CreateBajaDepositoDto } from './dto/baja-deposito.dto';

@Injectable()
export class BajasService {
  constructor(
    @InjectRepository(BajaDeposito) private readonly bajaRepo: Repository<BajaDeposito>,
    @InjectRepository(Articulo) private readonly articuloRepo: Repository<Articulo>,
    @InjectRepository(Equipo) private readonly equipoRepo: Repository<Equipo>,
    @InjectRepository(TenenciaDeposito) private readonly tenenciaRepo: Repository<TenenciaDeposito>,
    private readonly movimientosService: MovimientosDepositoService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(filtros: { tipoElemento?: string; motivoBajaId?: string; desde?: string; hasta?: string }) {
    const qb = this.bajaRepo.createQueryBuilder('b').orderBy('b.fecha', 'DESC');
    if (filtros.tipoElemento) qb.andWhere('b.tipoElemento = :tipoElemento', { tipoElemento: filtros.tipoElemento });
    if (filtros.motivoBajaId) qb.andWhere('b.motivoBajaId = :motivoBajaId', { motivoBajaId: filtros.motivoBajaId });
    if (filtros.desde) qb.andWhere('b.fecha >= :desde', { desde: filtros.desde });
    if (filtros.hasta) qb.andWhere('b.fecha <= :hasta', { hasta: filtros.hasta });
    return qb.getMany();
  }

  async findOne(id: string) {
    const baja = await this.bajaRepo.findOne({ where: { id } });
    if (!baja) throw new NotFoundException(`Baja ${id} no encontrada`);
    return baja;
  }

  async create(dto: CreateBajaDepositoDto, actorId: string, ip?: string) {
    const tipoMovimientoBaja = await this.movimientosService.obtenerParametro('TIPO_MOVIMIENTO_DEPOSITO', 'Baja');
    const estadoBaja = await this.movimientosService.obtenerParametro('ESTADO_ELEMENTO_DEPOSITO', 'Baja');

    let movimientoId: string;

    if (dto.tipoElemento === 'EQUIPO') {
      if (!dto.equipoId) throw new BadRequestException('equipoId es requerido cuando tipoElemento=EQUIPO');
      const equipo = await this.equipoRepo.findOne({ where: { id: dto.equipoId } });
      if (!equipo) throw new NotFoundException(`Equipo ${dto.equipoId} no encontrado`);

      // Conserva la ubicacion/tenedor actual como "ultima ubicacion conocida"
      // -- la baja solo cambia el estado, no inventa una ubicacion nueva.
      const tenenciaActual = await this.tenenciaRepo.findOne({ where: { equipoId: dto.equipoId, tipoElemento: 'EQUIPO' } });

      const movimiento = await this.movimientosService.registrar({
        tipoMovimientoId: tipoMovimientoBaja,
        tipoElemento: 'EQUIPO',
        equipoId: dto.equipoId,
        destino: tenenciaActual
          ? {
              tipoTenenciaId: tenenciaActual.tipoTenenciaId,
              ubicacionId: tenenciaActual.ubicacionId,
              vehiculoId: tenenciaActual.vehiculoId,
              bomberoId: tenenciaActual.bomberoId,
              servicioId: tenenciaActual.servicioId,
            }
          : { tipoTenenciaId: await this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'En deposito') },
        estadoElementoId: estadoBaja,
        responsableId: dto.responsableId ?? null,
        motivo: 'Baja de elemento',
        observacion: dto.observacion ?? null,
        documentoUrl: dto.documentoUrl ?? null,
        actorId,
        ip,
      });
      movimientoId = movimiento.id;

      // Sincroniza equipos.equipos.estado (gap ya identificado en el
      // modulo Equipos -- ver auditoria previa: estado no se mantenia
      // sincronizado con prestamo/mantenimiento; Deposito lo completa aca
      // para la transicion a BAJA).
      await this.equipoRepo.update(dto.equipoId, { estado: 'BAJA' as any });
    } else {
      if (!dto.articuloId) throw new BadRequestException('articuloId es requerido cuando tipoElemento=ARTICULO');
      if (!dto.cantidad) throw new BadRequestException('cantidad es requerida cuando tipoElemento=ARTICULO');
      const articulo = await this.articuloRepo.findOne({ where: { id: dto.articuloId } });
      if (!articulo) throw new NotFoundException(`Articulo ${dto.articuloId} no encontrado`);
      if (!dto.origenUbicacionId && !dto.origenVehiculoId && !dto.origenBomberoId && !dto.origenServicioId) {
        throw new BadRequestException('Debe indicarse el origen (ubicacion/vehiculo/bombero/servicio) desde donde se da de baja el articulo');
      }

      const tipoTenenciaOrigen = await this.resolverTipoTenenciaOrigen(dto);

      const movimiento = await this.movimientosService.registrar({
        tipoMovimientoId: tipoMovimientoBaja,
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
        estadoElementoId: estadoBaja,
        responsableId: dto.responsableId ?? null,
        motivo: 'Baja de articulo',
        observacion: dto.observacion ?? null,
        documentoUrl: dto.documentoUrl ?? null,
        actorId,
        ip,
      });
      movimientoId = movimiento.id;
    }

    const baja = await this.bajaRepo.save(
      this.bajaRepo.create({
        tipoElemento: dto.tipoElemento as 'EQUIPO' | 'ARTICULO',
        articuloId: dto.tipoElemento === 'ARTICULO' ? (dto.articuloId ?? null) : null,
        equipoId: dto.tipoElemento === 'EQUIPO' ? (dto.equipoId ?? null) : null,
        cantidad: dto.cantidad ?? null,
        motivoBajaId: dto.motivoBajaId,
        fecha: dto.fecha,
        responsableId: dto.responsableId ?? null,
        autorizadoPor: dto.autorizadoPor ?? null,
        documentoUrl: dto.documentoUrl ?? null,
        observacion: dto.observacion ?? null,
        movimientoId,
        creadoPor: actorId,
      }),
    );

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'deposito.bajas',
      recursoId: baja.id,
      datosDespues: baja,
      ip: ip ?? null,
    });

    return baja;
  }

  private async resolverTipoTenenciaOrigen(dto: CreateBajaDepositoDto): Promise<string> {
    if (dto.origenUbicacionId) return this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'En deposito');
    if (dto.origenVehiculoId) return this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'En vehiculo');
    if (dto.origenBomberoId) return this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'Con personal');
    return this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'En servicio');
  }
}
