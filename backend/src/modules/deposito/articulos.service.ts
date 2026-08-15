import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Articulo, TenenciaDeposito } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateArticuloDto, UpdateArticuloDto } from './dto/articulo.dto';
import { MovimientosDepositoService } from './movimientos-deposito.service';

@Injectable()
export class ArticulosService {
  constructor(
    @InjectRepository(Articulo) private readonly articuloRepo: Repository<Articulo>,
    @InjectRepository(TenenciaDeposito) private readonly tenenciaRepo: Repository<TenenciaDeposito>,
    private readonly movimientosService: MovimientosDepositoService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(filtros: { q?: string; categoriaArticuloId?: string; estado?: string; stockBajo?: string }) {
    const qb = this.articuloRepo.createQueryBuilder('a').orderBy('a.nombre', 'ASC');
    if (filtros.q) qb.andWhere('(a.nombre LIKE :q OR a.codigo LIKE :q)', { q: `%${filtros.q}%` });
    if (filtros.categoriaArticuloId) qb.andWhere('a.categoriaArticuloId = :categoriaArticuloId', { categoriaArticuloId: filtros.categoriaArticuloId });
    if (filtros.estado) qb.andWhere('a.estado = :estado', { estado: filtros.estado });
    if (filtros.stockBajo === 'true') qb.andWhere('a.stockActual < a.stockMinimo');
    return qb.getMany();
  }

  async findOne(id: string) {
    const articulo = await this.articuloRepo.findOne({ where: { id } });
    if (!articulo) throw new NotFoundException(`Articulo ${id} no encontrado`);
    return articulo;
  }

  private async verificarCodigoDuplicado(codigo: string, idExcluido?: string) {
    const existente = await this.articuloRepo.findOne({ where: { codigo } });
    if (existente && existente.id !== idExcluido) {
      throw new ConflictException(`El codigo ${codigo} ya se encuentra asignado a otro articulo`);
    }
  }

  async create(dto: CreateArticuloDto, actorId: string, ip?: string) {
    await this.verificarCodigoDuplicado(dto.codigo);
    if (dto.stockInicial && !dto.ubicacionInicialId) {
      throw new BadRequestException('ubicacionInicialId es requerido cuando se indica stockInicial');
    }

    const articulo = await this.articuloRepo.save(
      this.articuloRepo.create({
        codigo: dto.codigo,
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        categoriaArticuloId: dto.categoriaArticuloId,
        unidadMedidaId: dto.unidadMedidaId ?? null,
        stockMinimo: dto.stockMinimo ?? 0,
        stockMaximo: dto.stockMaximo ?? null,
        controlaLote: dto.controlaLote ?? false,
        controlaVencimiento: dto.controlaVencimiento ?? false,
        estado: (dto.estado as any) ?? 'ACTIVO',
        creadoPor: actorId,
      }),
    );

    if (dto.stockInicial && dto.ubicacionInicialId) {
      const [tipoMovimientoId, tipoTenenciaId, estadoElementoId] = await Promise.all([
        this.movimientosService.obtenerParametro('TIPO_MOVIMIENTO_DEPOSITO', 'Entrada'),
        this.movimientosService.obtenerParametro('TIPO_TENENCIA_DEPOSITO', 'En deposito'),
        this.movimientosService.obtenerParametro('ESTADO_ELEMENTO_DEPOSITO', 'Disponible'),
      ]);
      await this.movimientosService.registrar({
        tipoMovimientoId,
        tipoElemento: 'ARTICULO',
        articuloId: articulo.id,
        cantidad: dto.stockInicial,
        destino: { tipoTenenciaId, ubicacionId: dto.ubicacionInicialId },
        estadoElementoId,
        motivo: 'Alta de articulo con stock inicial',
        actorId,
        ip,
      });
    }

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'deposito.articulos',
      recursoId: articulo.id,
      datosDespues: articulo,
      ip: ip ?? null,
    });

    return this.findOne(articulo.id);
  }

  async update(id: string, dto: UpdateArticuloDto, actorId: string, ip?: string) {
    const antes = await this.findOne(id);
    if (dto.codigo !== undefined) await this.verificarCodigoDuplicado(dto.codigo, id);

    await this.articuloRepo.update(id, {
      ...(dto.codigo !== undefined ? { codigo: dto.codigo } : {}),
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
      ...(dto.categoriaArticuloId !== undefined ? { categoriaArticuloId: dto.categoriaArticuloId } : {}),
      ...(dto.unidadMedidaId !== undefined ? { unidadMedidaId: dto.unidadMedidaId } : {}),
      ...(dto.stockMinimo !== undefined ? { stockMinimo: dto.stockMinimo } : {}),
      ...(dto.stockMaximo !== undefined ? { stockMaximo: dto.stockMaximo } : {}),
      ...(dto.controlaLote !== undefined ? { controlaLote: dto.controlaLote } : {}),
      ...(dto.controlaVencimiento !== undefined ? { controlaVencimiento: dto.controlaVencimiento } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado as any } : {}),
      actualizadoPor: actorId,
    });

    const despues = await this.findOne(id);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'EDITAR',
      recurso: 'deposito.articulos',
      recursoId: id,
      datosAntes: antes,
      datosDespues: despues,
      ip: ip ?? null,
    });
    return despues;
  }

  /** Tenencias actuales de un articulo (donde esta repartido el stock). */
  async tenencias(articuloId: string) {
    await this.findOne(articuloId);
    return this.tenenciaRepo.find({ where: { articuloId }, order: { actualizadoEn: 'DESC' } });
  }
}
