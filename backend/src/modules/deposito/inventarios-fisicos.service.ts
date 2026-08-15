import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IncidenciaDeposito,
  InventarioFisicoDeposito,
  InventarioFisicoItemDeposito,
  TenenciaDeposito,
} from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateInventarioFisicoDto, AgregarItemInventarioFisicoDto } from './dto/inventario-fisico.dto';

@Injectable()
export class InventariosFisicosService {
  constructor(
    @InjectRepository(InventarioFisicoDeposito) private readonly inventarioRepo: Repository<InventarioFisicoDeposito>,
    @InjectRepository(InventarioFisicoItemDeposito) private readonly itemRepo: Repository<InventarioFisicoItemDeposito>,
    @InjectRepository(TenenciaDeposito) private readonly tenenciaRepo: Repository<TenenciaDeposito>,
    @InjectRepository(IncidenciaDeposito) private readonly incidenciaRepo: Repository<IncidenciaDeposito>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(filtros: { estado?: string; ubicacionId?: string }) {
    const qb = this.inventarioRepo.createQueryBuilder('i').orderBy('i.fecha', 'DESC');
    if (filtros.estado) qb.andWhere('i.estado = :estado', { estado: filtros.estado });
    if (filtros.ubicacionId) qb.andWhere('i.ubicacionId = :ubicacionId', { ubicacionId: filtros.ubicacionId });
    return qb.getMany();
  }

  async findOne(id: string) {
    const inventario = await this.inventarioRepo.findOne({ where: { id } });
    if (!inventario) throw new NotFoundException(`Inventario fisico ${id} no encontrado`);
    return inventario;
  }

  async items(inventarioId: string) {
    await this.findOne(inventarioId);
    return this.itemRepo.find({ where: { inventarioFisicoId: inventarioId }, order: { creadoEn: 'ASC' } });
  }

  async create(dto: CreateInventarioFisicoDto, actorId: string) {
    return this.inventarioRepo.save(
      this.inventarioRepo.create({
        fecha: dto.fecha,
        ubicacionId: dto.ubicacionId ?? null,
        responsableId: dto.responsableId ?? null,
        observacion: dto.observacion ?? null,
        creadoPor: actorId,
      }),
    );
  }

  /** Calcula la cantidad-segun-sistema automaticamente (nunca la ingresa el
   * usuario a mano) y compara contra la cantidad fisica contada. Si difieren,
   * genera una incidencia -- nunca ajusta el stock silenciosamente (seccion
   * 15 del pedido). El ajuste real, si corresponde, se hace aparte via
   * /deposito/movimientos con tipo "Ajuste de inventario". */
  async agregarItem(inventarioId: string, dto: AgregarItemInventarioFisicoDto, actorId: string) {
    const inventario = await this.findOne(inventarioId);
    if (inventario.estado === 'FINALIZADO') throw new BadRequestException('Este inventario fisico ya fue finalizado');
    if (dto.tipoElemento === 'ARTICULO' && !dto.articuloId) throw new BadRequestException('articuloId es requerido para tipoElemento=ARTICULO');
    if (dto.tipoElemento === 'EQUIPO' && !dto.equipoId) throw new BadRequestException('equipoId es requerido para tipoElemento=EQUIPO');

    let cantidadSistema = 0;
    if (dto.tipoElemento === 'ARTICULO') {
      const qb = this.tenenciaRepo
        .createQueryBuilder('t')
        .where('t.articuloId = :articuloId', { articuloId: dto.articuloId })
        .andWhere('t.tipoElemento = :tipoElemento', { tipoElemento: 'ARTICULO' });
      if (inventario.ubicacionId) qb.andWhere('t.ubicacionId = :ubicacionId', { ubicacionId: inventario.ubicacionId });
      const tenencias = await qb.getMany();
      cantidadSistema = tenencias.reduce((suma, t) => suma + (t.cantidad ?? 0), 0);
    } else {
      const where: any = { equipoId: dto.equipoId, tipoElemento: 'EQUIPO' };
      if (inventario.ubicacionId) where.ubicacionId = inventario.ubicacionId;
      const tenencia = await this.tenenciaRepo.findOne({ where });
      cantidadSistema = tenencia ? 1 : 0;
    }

    const diferencia = dto.cantidadFisica - cantidadSistema;
    const generaIncidencia = diferencia !== 0;

    const item = await this.itemRepo.save(
      this.itemRepo.create({
        inventarioFisicoId: inventarioId,
        tipoElemento: dto.tipoElemento as 'EQUIPO' | 'ARTICULO',
        articuloId: dto.tipoElemento === 'ARTICULO' ? (dto.articuloId ?? null) : null,
        equipoId: dto.tipoElemento === 'EQUIPO' ? (dto.equipoId ?? null) : null,
        cantidadSistema,
        cantidadFisica: dto.cantidadFisica,
        diferencia,
        generaIncidencia,
        observacion: dto.observacion ?? null,
      }),
    );

    if (generaIncidencia) {
      await this.incidenciaRepo.save(
        this.incidenciaRepo.create({
          origenTipo: 'INVENTARIO_FISICO',
          tipoElemento: dto.tipoElemento as 'EQUIPO' | 'ARTICULO',
          articuloId: item.articuloId,
          equipoId: item.equipoId,
          inventarioFisicoItemId: item.id,
          descripcion: `Diferencia de inventario: sistema=${cantidadSistema}, fisico=${dto.cantidadFisica} (diferencia ${diferencia > 0 ? '+' : ''}${diferencia})`,
          gravedad: Math.abs(diferencia) > cantidadSistema * 0.2 ? 'ALTA' : 'MEDIA',
          fechaApertura: new Date(),
          reportadoPor: actorId,
        }),
      );

      await this.auditoriaService.registrar({
        usuarioId: actorId,
        accion: 'GENERAR_INCIDENCIA_INVENTARIO',
        recurso: 'deposito.inventario_fisico_items',
        recursoId: item.id,
        datosDespues: item,
      });
    }

    return item;
  }

  async finalizar(inventarioId: string, actorId: string, ip?: string) {
    const inventario = await this.findOne(inventarioId);
    if (inventario.estado === 'FINALIZADO') throw new BadRequestException('Este inventario ya fue finalizado');
    await this.inventarioRepo.update(inventarioId, { estado: 'FINALIZADO' });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'FINALIZAR',
      recurso: 'deposito.inventarios_fisicos',
      recursoId: inventarioId,
      ip: ip ?? null,
    });

    return this.findOne(inventarioId);
  }
}
