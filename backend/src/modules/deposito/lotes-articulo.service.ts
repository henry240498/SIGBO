import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Articulo, LoteArticulo } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateLoteArticuloDto } from './dto/lote-articulo.dto';

/** CRUD de lotes/vencimientos (seccion 17 del pedido) -- metadata de
 * trazabilidad por lote (insumos medicos, medicamentos, quimicos), en
 * paralelo al stock agregado que ya administra deposito.articulos.
 * `cantidad` de un lote es informativa sobre ese lote especifico; el total
 * disponible del articulo sigue siendo `Articulo.stockActual`. */
@Injectable()
export class LotesArticuloService {
  constructor(
    @InjectRepository(LoteArticulo) private readonly loteRepo: Repository<LoteArticulo>,
    @InjectRepository(Articulo) private readonly articuloRepo: Repository<Articulo>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(articuloId?: string, estado?: string) {
    const qb = this.loteRepo.createQueryBuilder('l').orderBy('l.fechaVencimiento', 'ASC');
    if (articuloId) qb.andWhere('l.articuloId = :articuloId', { articuloId });
    if (estado) qb.andWhere('l.estado = :estado', { estado });
    return qb.getMany();
  }

  async findOne(id: string) {
    const lote = await this.loteRepo.findOne({ where: { id } });
    if (!lote) throw new NotFoundException(`Lote ${id} no encontrado`);
    return lote;
  }

  /** Lotes vencidos o por vencer dentro de N dias -- alerta del pedido
   * (seccion 17), nunca actua solo. */
  async proximosAVencer(dias = 30) {
    const limite = new Date();
    limite.setDate(limite.getDate() + dias);
    return this.loteRepo.find({
      where: { estado: 'VIGENTE', fechaVencimiento: LessThanOrEqual(limite.toISOString().slice(0, 10)) },
      order: { fechaVencimiento: 'ASC' },
    });
  }

  async create(dto: CreateLoteArticuloDto, actorId: string, ip?: string) {
    const articulo = await this.articuloRepo.findOne({ where: { id: dto.articuloId } });
    if (!articulo) throw new NotFoundException(`Articulo ${dto.articuloId} no encontrado`);
    if (!articulo.controlaLote) {
      throw new BadRequestException('Este articulo no tiene habilitado el control por lote (controlaLote=false)');
    }
    const existente = await this.loteRepo.findOne({ where: { articuloId: dto.articuloId, numeroLote: dto.numeroLote } });
    if (existente) throw new BadRequestException(`Ya existe el lote ${dto.numeroLote} para este articulo`);

    const lote = await this.loteRepo.save(
      this.loteRepo.create({
        articuloId: dto.articuloId,
        numeroLote: dto.numeroLote,
        fechaFabricacion: dto.fechaFabricacion ?? null,
        fechaVencimiento: dto.fechaVencimiento ?? null,
        cantidad: dto.cantidad,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'deposito.lotes_articulo',
      recursoId: lote.id,
      datosDespues: lote,
      ip: ip ?? null,
    });
    return lote;
  }

  /** Marca vencidos los lotes cuya fecha ya paso -- job de mantenimiento
   * simple, invocado bajo demanda (no hay scheduler en este proyecto). */
  async actualizarVencidos() {
    const hoy = new Date().toISOString().slice(0, 10);
    const resultado = await this.loteRepo
      .createQueryBuilder()
      .update(LoteArticulo)
      .set({ estado: 'VENCIDO' })
      .where('estado = :vigente', { vigente: 'VIGENTE' })
      .andWhere('fechaVencimiento IS NOT NULL AND fechaVencimiento < :hoy', { hoy })
      .execute();
    return { actualizados: resultado.affected ?? 0 };
  }
}
