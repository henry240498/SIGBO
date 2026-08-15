import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Articulo, Equipo, EntradaDeposito, EntradaDepositoItem, ProveedorDeposito, UbicacionDeposito } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { MovimientosDepositoService } from './movimientos-deposito.service';
import { CreateEntradaDepositoDto } from './dto/entrada-deposito.dto';

@Injectable()
export class EntradasService {
  constructor(
    @InjectRepository(EntradaDeposito) private readonly entradaRepo: Repository<EntradaDeposito>,
    @InjectRepository(EntradaDepositoItem) private readonly itemRepo: Repository<EntradaDepositoItem>,
    @InjectRepository(ProveedorDeposito) private readonly proveedorRepo: Repository<ProveedorDeposito>,
    @InjectRepository(UbicacionDeposito) private readonly ubicacionRepo: Repository<UbicacionDeposito>,
    @InjectRepository(Articulo) private readonly articuloRepo: Repository<Articulo>,
    @InjectRepository(Equipo) private readonly equipoRepo: Repository<Equipo>,
    private readonly movimientosService: MovimientosDepositoService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(filtros: { proveedorId?: string; tipoEntradaId?: string; desde?: string; hasta?: string }) {
    const qb = this.entradaRepo.createQueryBuilder('e').orderBy('e.fecha', 'DESC');
    if (filtros.proveedorId) qb.andWhere('e.proveedorId = :proveedorId', { proveedorId: filtros.proveedorId });
    if (filtros.tipoEntradaId) qb.andWhere('e.tipoEntradaId = :tipoEntradaId', { tipoEntradaId: filtros.tipoEntradaId });
    if (filtros.desde) qb.andWhere('e.fecha >= :desde', { desde: filtros.desde });
    if (filtros.hasta) qb.andWhere('e.fecha <= :hasta', { hasta: filtros.hasta });
    return qb.getMany();
  }

  async findOne(id: string) {
    const entrada = await this.entradaRepo.findOne({ where: { id } });
    if (!entrada) throw new NotFoundException(`Entrada ${id} no encontrada`);
    return entrada;
  }

  async items(entradaId: string) {
    await this.findOne(entradaId);
    return this.itemRepo.find({ where: { entradaId } });
  }

  async create(dto: CreateEntradaDepositoDto, actorId: string, ip?: string) {
    if (dto.items.length === 0) throw new BadRequestException('La entrada debe tener al menos un item');

    const ubicacion = await this.ubicacionRepo.findOne({ where: { id: dto.ubicacionDestinoId } });
    if (!ubicacion) throw new NotFoundException(`Ubicacion ${dto.ubicacionDestinoId} no encontrada`);

    if (dto.proveedorId) {
      const proveedor = await this.proveedorRepo.findOne({ where: { id: dto.proveedorId } });
      if (!proveedor) throw new NotFoundException(`Proveedor ${dto.proveedorId} no encontrado`);
    }

    // Validar TODOS los items antes de crear nada -- evita dejar una
    // entrada a medio aplicar por un item invalido al final de la lista.
    for (const item of dto.items) {
      if (item.tipoElemento === 'ARTICULO') {
        if (!item.articuloId) throw new BadRequestException('articuloId es requerido para items de tipo ARTICULO');
        const articulo = await this.articuloRepo.findOne({ where: { id: item.articuloId } });
        if (!articulo) throw new NotFoundException(`Articulo ${item.articuloId} no encontrado`);
      } else {
        if (!item.equipoId) throw new BadRequestException('equipoId es requerido para items de tipo EQUIPO');
        const equipo = await this.equipoRepo.findOne({ where: { id: item.equipoId } });
        if (!equipo) throw new NotFoundException(`Equipo ${item.equipoId} no encontrado`);
      }
    }

    const valorCalculado = dto.items.reduce((suma, i) => suma + (i.precioUnitario ?? 0) * i.cantidad, 0);
    const valorTotal = dto.valorTotal ?? (valorCalculado || null);

    const entrada = await this.entradaRepo.save(
      this.entradaRepo.create({
        tipoEntradaId: dto.tipoEntradaId,
        fecha: dto.fecha,
        proveedorId: dto.proveedorId ?? null,
        donanteNombre: dto.donanteNombre ?? null,
        donanteDocumento: dto.donanteDocumento ?? null,
        numeroDocumento: dto.numeroDocumento ?? null,
        valorTotal,
        ubicacionDestinoId: dto.ubicacionDestinoId,
        observacion: dto.observacion ?? null,
        creadoPor: actorId,
      }),
    );

    const tipoTenenciaDeposito = await this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'En deposito');
    const estadoDisponible = await this.movimientosService.obtenerParametro('ESTADO_ELEMENTO_DEPOSITO', 'Disponible');

    for (const item of dto.items) {
      const movimiento = await this.movimientosService.registrar({
        tipoMovimientoId: dto.tipoEntradaId,
        tipoElemento: item.tipoElemento as 'EQUIPO' | 'ARTICULO',
        articuloId: item.tipoElemento === 'ARTICULO' ? item.articuloId : null,
        equipoId: item.tipoElemento === 'EQUIPO' ? item.equipoId : null,
        cantidad: item.tipoElemento === 'ARTICULO' ? item.cantidad : null,
        destino: { tipoTenenciaId: tipoTenenciaDeposito, ubicacionId: dto.ubicacionDestinoId },
        estadoElementoId: estadoDisponible,
        motivo: `Entrada${dto.numeroDocumento ? ` - Doc. ${dto.numeroDocumento}` : ''}`,
        observacion: dto.observacion ?? null,
        actorId,
        ip,
      });

      await this.itemRepo.save(
        this.itemRepo.create({
          entradaId: entrada.id,
          tipoElemento: item.tipoElemento as 'EQUIPO' | 'ARTICULO',
          articuloId: item.tipoElemento === 'ARTICULO' ? (item.articuloId ?? null) : null,
          equipoId: item.tipoElemento === 'EQUIPO' ? (item.equipoId ?? null) : null,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario ?? null,
          subtotal: item.precioUnitario ? item.precioUnitario * item.cantidad : null,
          movimientoId: movimiento.id,
        }),
      );
    }

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'deposito.entradas',
      recursoId: entrada.id,
      datosDespues: { ...entrada, items: dto.items },
      ip: ip ?? null,
    });

    return this.findOne(entrada.id);
  }
}
