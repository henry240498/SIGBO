import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsumoCombustible, MantenimientoVehiculo, Servicio, Vehiculo } from '../../shared/entities';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { CreateMantenimientoVehiculoDto } from './dto/create-mantenimiento-vehiculo.dto';
import { CreateConsumoCombustibleDto } from './dto/create-consumo-combustible.dto';
import { BajaVehiculoDto } from './dto/baja-vehiculo.dto';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo) private readonly vehiculoRepo: Repository<Vehiculo>,
    @InjectRepository(MantenimientoVehiculo) private readonly mantenimientoRepo: Repository<MantenimientoVehiculo>,
    @InjectRepository(ConsumoCombustible) private readonly combustibleRepo: Repository<ConsumoCombustible>,
    @InjectRepository(Servicio) private readonly servicioRepo: Repository<Servicio>,
  ) {}

  findAll(estado?: string) {
    return this.vehiculoRepo.find({
      where: estado ? { estado: estado as Vehiculo['estado'] } : undefined,
      order: { numeroInterno: 'ASC' },
    });
  }

  async findOne(id: string) {
    const vehiculo = await this.vehiculoRepo.findOne({ where: { id } });
    if (!vehiculo) throw new NotFoundException(`Vehiculo ${id} no encontrado`);
    return vehiculo;
  }

  async create(dto: CreateVehiculoDto) {
    const existentePorNumero = await this.vehiculoRepo.findOne({
      where: { numeroInterno: dto.numeroInterno },
    });
    if (existentePorNumero) {
      throw new ConflictException(`Ya existe un vehiculo con el numero interno "${dto.numeroInterno}"`);
    }

    if (dto.patente) {
      const existentePorPatente = await this.vehiculoRepo.findOne({ where: { patente: dto.patente } });
      if (existentePorPatente) {
        throw new ConflictException(`Ya existe un vehiculo con la patente "${dto.patente}"`);
      }
    }

    return this.vehiculoRepo.save(
      this.vehiculoRepo.create({
        ...dto,
        kilometrajeActual: dto.kilometrajeActual ?? 0,
        combustibleActual: dto.combustibleActual ?? 0,
        estado: dto.estado ?? 'OPERATIVO',
      } as unknown as Vehiculo),
    );
  }

  async update(id: string, dto: UpdateVehiculoDto) {
    await this.findOne(id);

    if (dto.numeroInterno !== undefined) {
      const existente = await this.vehiculoRepo.findOne({ where: { numeroInterno: dto.numeroInterno } });
      if (existente && existente.id !== id) {
        throw new ConflictException(`Ya existe un vehiculo con el numero interno "${dto.numeroInterno}"`);
      }
    }

    if (dto.patente !== undefined && dto.patente !== null) {
      const existente = await this.vehiculoRepo.findOne({ where: { patente: dto.patente } });
      if (existente && existente.id !== id) {
        throw new ConflictException(`Ya existe un vehiculo con la patente "${dto.patente}"`);
      }
    }

    await this.vehiculoRepo.update(id, { ...dto } as Partial<Vehiculo>);
    return this.findOne(id);
  }

  async darBaja(id: string, dto: BajaVehiculoDto) {
    await this.findOne(id);
    await this.vehiculoRepo.update(id, {
      estado: 'BAJA',
      fechaBaja: dto.fechaBaja ?? new Date().toISOString().slice(0, 10),
      motivoBaja: dto.motivoBaja ?? null,
    });
    return this.findOne(id);
  }

  async listarMantenimientos(vehiculoId: string) {
    await this.findOne(vehiculoId);
    return this.mantenimientoRepo.find({ where: { vehiculoId }, order: { fecha: 'DESC' } });
  }

  async crearMantenimiento(vehiculoId: string, dto: CreateMantenimientoVehiculoDto, actorId: string) {
    await this.findOne(vehiculoId);
    return this.mantenimientoRepo.save(
      this.mantenimientoRepo.create({
        vehiculoId,
        tipo: dto.tipo,
        fecha: dto.fecha,
        descripcion: dto.descripcion,
        costo: dto.costo ?? null,
        kilometraje: dto.kilometraje ?? null,
        taller: dto.taller ?? null,
        responsable: dto.responsable ?? null,
        proximoMantenimiento: dto.proximoMantenimiento ?? null,
        archivoUrl: dto.archivoUrl ?? null,
        creadoPor: actorId,
      }),
    );
  }

  async listarCombustible(vehiculoId: string) {
    await this.findOne(vehiculoId);
    return this.combustibleRepo.find({ where: { vehiculoId }, order: { fecha: 'DESC' } });
  }

  async crearCombustible(vehiculoId: string, dto: CreateConsumoCombustibleDto, actorId: string) {
    const vehiculo = await this.findOne(vehiculoId);
    const registro = await this.combustibleRepo.save(
      this.combustibleRepo.create({
        vehiculoId,
        fecha: dto.fecha,
        galones: dto.galones,
        kilometrajeActual: dto.kilometrajeActual,
        tipoCombustible: dto.tipoCombustible ?? 'DIESEL',
        costo: dto.costo ?? null,
        proveedor: dto.proveedor ?? null,
        factura: dto.factura ?? null,
        creadoPor: actorId,
      }),
    );
    if (dto.kilometrajeActual > vehiculo.kilometrajeActual) {
      await this.vehiculoRepo.update(vehiculoId, { kilometrajeActual: dto.kilometrajeActual });
    }
    return registro;
  }

  /** Agrega mantenimientos + cargas de combustible + servicios donde este
   * vehiculo participo como principal, ordenado por fecha (seccion 15). */
  async historial(vehiculoId: string) {
    await this.findOne(vehiculoId);

    const [mantenimientos, combustible, servicios] = await Promise.all([
      this.mantenimientoRepo.find({ where: { vehiculoId } }),
      this.combustibleRepo.find({ where: { vehiculoId } }),
      this.servicioRepo.find({ where: { vehiculoPrincipalId: vehiculoId } }),
    ]);

    const eventos = [
      ...mantenimientos.map((m) => ({
        tipo: 'MANTENIMIENTO' as const,
        fecha: new Date(m.fecha).toISOString(),
        detalle: `${m.tipo}: ${m.descripcion}`,
        registro: m,
      })),
      ...combustible.map((c) => ({
        tipo: 'COMBUSTIBLE' as const,
        fecha: new Date(c.fecha).toISOString(),
        detalle: `${c.galones} galones (${c.tipoCombustible}) - km ${c.kilometrajeActual}`,
        registro: c,
      })),
      ...servicios.map((s) => ({
        tipo: 'SERVICIO' as const,
        fecha: new Date(s.fechaHoraAviso).toISOString(),
        detalle: `Servicio ${s.numeroServicio} (${s.estado})`,
        registro: s,
      })),
    ];

    eventos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    return eventos;
  }
}
