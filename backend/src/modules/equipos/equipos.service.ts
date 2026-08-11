import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriaEquipo, Equipo, MantenimientoEquipo, Parametro, PrestamoEquipo, Vehiculo } from '../../shared/entities';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';
import { CreateMantenimientoEquipoDto } from './dto/create-mantenimiento-equipo.dto';
import { AsignarMovilDto } from './dto/asignar-movil.dto';

@Injectable()
export class EquiposService {
  constructor(
    @InjectRepository(Equipo) private readonly equipoRepo: Repository<Equipo>,
    @InjectRepository(CategoriaEquipo)
    private readonly categoriaRepo: Repository<CategoriaEquipo>,
    @InjectRepository(MantenimientoEquipo) private readonly mantenimientoRepo: Repository<MantenimientoEquipo>,
    @InjectRepository(PrestamoEquipo) private readonly prestamoRepo: Repository<PrestamoEquipo>,
    @InjectRepository(Vehiculo) private readonly vehiculoRepo: Repository<Vehiculo>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
  ) {}

  findAll(q?: string, categoriaId?: string, estado?: string) {
    const qb = this.equipoRepo.createQueryBuilder('e');

    if (q) {
      qb.andWhere('(e.nombre LIKE :q OR e.codigoInterno LIKE :q OR e.numeroSerie LIKE :q)', {
        q: `%${q}%`,
      });
    }

    if (categoriaId) {
      qb.andWhere('e.categoriaId = :categoriaId', { categoriaId });
    }

    if (estado) {
      qb.andWhere('e.estado = :estado', { estado });
    }

    qb.orderBy('e.nombre', 'ASC');

    return qb.getMany();
  }

  async findOne(id: string) {
    const equipo = await this.equipoRepo.findOne({ where: { id } });
    if (!equipo) throw new NotFoundException(`Equipo ${id} no encontrado`);
    return equipo;
  }

  private async validarCategoria(categoriaId: string) {
    const categoria = await this.categoriaRepo.findOne({ where: { id: categoriaId } });
    if (!categoria) {
      throw new NotFoundException(`Categoria de equipo ${categoriaId} no encontrada`);
    }
  }

  async create(dto: CreateEquipoDto) {
    await this.validarCategoria(dto.categoriaId);

    const existente = await this.equipoRepo.findOne({ where: { codigoInterno: dto.codigoInterno } });
    if (existente) {
      throw new ConflictException(`Ya existe un equipo con el codigo "${dto.codigoInterno}"`);
    }

    return this.equipoRepo.save(
      this.equipoRepo.create({
        categoriaId: dto.categoriaId,
        codigoInterno: dto.codigoInterno,
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        marca: dto.marca ?? null,
        modelo: dto.modelo ?? null,
        numeroSerie: dto.numeroSerie ?? null,
        estado: dto.estado ?? 'OPERATIVO',
        ubicacion: dto.ubicacion ?? null,
        responsableId: dto.responsableId ?? null,
        fechaCompra: dto.fechaCompra ?? null,
        fechaVencimiento: dto.fechaVencimiento ?? null,
        vidaUtilMeses: dto.vidaUtilMeses ?? null,
        qrCode: dto.qrCode ?? null,
      }),
    );
  }

  async update(id: string, dto: UpdateEquipoDto) {
    await this.findOne(id);

    if (dto.categoriaId !== undefined) {
      await this.validarCategoria(dto.categoriaId);
    }

    if (dto.codigoInterno !== undefined) {
      const existente = await this.equipoRepo.findOne({ where: { codigoInterno: dto.codigoInterno } });
      if (existente && existente.id !== id) {
        throw new ConflictException(`Ya existe un equipo con el codigo "${dto.codigoInterno}"`);
      }
    }

    await this.equipoRepo.update(id, {
      ...(dto.categoriaId !== undefined ? { categoriaId: dto.categoriaId } : {}),
      ...(dto.codigoInterno !== undefined ? { codigoInterno: dto.codigoInterno } : {}),
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
      ...(dto.marca !== undefined ? { marca: dto.marca } : {}),
      ...(dto.modelo !== undefined ? { modelo: dto.modelo } : {}),
      ...(dto.numeroSerie !== undefined ? { numeroSerie: dto.numeroSerie } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado } : {}),
      ...(dto.ubicacion !== undefined ? { ubicacion: dto.ubicacion } : {}),
      ...(dto.responsableId !== undefined ? { responsableId: dto.responsableId } : {}),
      ...(dto.fechaCompra !== undefined ? { fechaCompra: dto.fechaCompra } : {}),
      ...(dto.fechaVencimiento !== undefined ? { fechaVencimiento: dto.fechaVencimiento } : {}),
      ...(dto.vidaUtilMeses !== undefined ? { vidaUtilMeses: dto.vidaUtilMeses } : {}),
      ...(dto.qrCode !== undefined ? { qrCode: dto.qrCode } : {}),
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    const equipo = await this.findOne(id);
    await this.equipoRepo.remove(equipo);
    return { eliminado: true };
  }

  async listarMantenimientos(equipoId: string) {
    await this.findOne(equipoId);
    return this.mantenimientoRepo.find({ where: { equipoId }, order: { fecha: 'DESC' } });
  }

  async crearMantenimiento(equipoId: string, dto: CreateMantenimientoEquipoDto, actorId: string) {
    await this.findOne(equipoId);
    return this.mantenimientoRepo.save(
      this.mantenimientoRepo.create({
        equipoId,
        fecha: dto.fecha,
        tipo: dto.tipo,
        descripcion: dto.descripcion,
        costo: dto.costo ?? null,
        proveedor: dto.proveedor ?? null,
        tecnico: dto.tecnico ?? null,
        proximoMantenimiento: dto.proximoMantenimiento ?? null,
        archivoUrl: dto.archivoUrl ?? null,
        creadoPor: actorId,
      }),
    );
  }

  async asignarMovil(equipoId: string, dto: AsignarMovilDto) {
    await this.findOne(equipoId);

    if (dto.vehiculoId) {
      const vehiculo = await this.vehiculoRepo.findOne({ where: { id: dto.vehiculoId } });
      if (!vehiculo) throw new NotFoundException(`Vehiculo ${dto.vehiculoId} no encontrado`);

      const ubicacionEnMovil = await this.obtenerUbicacionParametro('En movil');
      await this.equipoRepo.update(equipoId, {
        vehiculoAsignadoId: dto.vehiculoId,
        ubicacionTipo: ubicacionEnMovil,
      });
    } else {
      await this.equipoRepo.update(equipoId, { vehiculoAsignadoId: null, ubicacionTipo: null });
    }

    return this.findOne(equipoId);
  }

  private async obtenerUbicacionParametro(nombre: string): Promise<string | null> {
    const parametro = await this.parametroRepo.findOne({ where: { tipo: 'UBICACION_EQUIPO', nombre } });
    return parametro?.id ?? null;
  }

  /** Agrega prestamos + mantenimientos, ordenado por fecha (contraparte del
   * historial de Moviles, seccion 15-19 del pedido de Guardias). */
  async historial(equipoId: string) {
    await this.findOne(equipoId);

    const [prestamos, mantenimientos] = await Promise.all([
      this.prestamoRepo.find({ where: { equipoId } }),
      this.mantenimientoRepo.find({ where: { equipoId } }),
    ]);

    const eventos = [
      ...prestamos.map((p) => ({
        tipo: 'PRESTAMO' as const,
        fecha: new Date(p.fechaPrestamo).toISOString(),
        detalle: `Prestamo (${p.estado})${p.fechaDevolucion ? `, devuelto ${new Date(p.fechaDevolucion).toLocaleDateString()}` : ''}`,
        registro: p,
      })),
      ...mantenimientos.map((m) => ({
        tipo: 'MANTENIMIENTO' as const,
        fecha: new Date(m.fecha).toISOString(),
        detalle: `${m.tipo}: ${m.descripcion}`,
        registro: m,
      })),
    ];

    eventos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    return eventos;
  }
}
