import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bombero, HistorialCodigo, HistorialInstitucional } from '../../shared/entities';
import { CreateBomberoDto } from './dto/create-bombero.dto';
import { UpdateBomberoDto } from './dto/update-bombero.dto';

/** Traduce un cambio de `estado` al tipo de movimiento mas especifico posible. */
function tipoMovimientoPorEstado(estadoNuevo: string): string {
  if (estadoNuevo === 'LICENCIA') return 'LICENCIA';
  if (estadoNuevo === 'SUSPENDIDO') return 'SUSPENSION';
  if (estadoNuevo === 'RETIRADO') return 'RETIRO';
  return 'CAMBIO_CONDICION';
}

/** Campos de bomberos cuyo cambio queda registrado automaticamente en historial_institucional. */
const CAMPOS_HISTORIAL: Record<string, string> = {
  condicionInstitucional: 'CAMBIO_CONDICION',
  rangoId: 'CAMBIO_RANGO',
  cargoPrincipalId: 'CAMBIO_CARGO',
  companiaId: 'CAMBIO_COMPANIA',
};

@Injectable()
export class BomberosService {
  constructor(
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(HistorialCodigo) private readonly historialCodigoRepo: Repository<HistorialCodigo>,
    @InjectRepository(HistorialInstitucional)
    private readonly historialInstitucionalRepo: Repository<HistorialInstitucional>,
  ) {}

  findAll(estado?: string) {
    return this.bomberoRepo.find({
      where: estado ? { estado: estado as any } : undefined,
      order: { apellido: 'ASC', nombre: 'ASC' },
    });
  }

  async filasExportables(estado?: string) {
    const bomberos = await this.findAll(estado);
    return bomberos.map((b) => ({
      Codigo: b.numeroBombero,
      Cedula: b.cedula,
      Nombre: b.nombre,
      Apellido: b.apellido,
      Rango: b.rango,
      Cargo: b.cargo ?? '',
      Estado: b.estado,
      Condicion: b.condicionInstitucional ?? '',
      Telefono: b.telefonoPrincipal,
      Email: b.email ?? '',
      FechaIngreso: b.fechaIngreso,
    }));
  }

  async findOne(id: string) {
    const bombero = await this.bomberoRepo.findOne({ where: { id } });
    if (!bombero) throw new NotFoundException(`Bombero ${id} no encontrado`);
    return bombero;
  }

  async create(dto: CreateBomberoDto, creadoPor: string) {
    const existente = await this.bomberoRepo.findOne({
      where: [{ cedula: dto.cedula }, { numeroBombero: dto.numeroBombero }],
    });
    if (existente) {
      throw new ConflictException('Ya existe un bombero con esa cedula o numero de bombero');
    }

    const bombero = this.bomberoRepo.create({
      ...dto,
      estado: (dto.estado as any) ?? 'ACTIVO',
      contactosEmergencia: '[]',
      creadoPor,
    } as unknown as Bombero);
    const guardado = await this.bomberoRepo.save(bombero);

    await this.historialInstitucionalRepo.save(
      this.historialInstitucionalRepo.create({
        bomberoId: guardado.id,
        tipoMovimiento: 'INGRESO',
        fecha: new Date().toISOString().slice(0, 10),
        usuarioResponsableId: creadoPor,
        motivo: 'Alta de personal',
      }),
    );

    return guardado;
  }

  async update(id: string, dto: UpdateBomberoDto, actualizadoPor: string) {
    const anterior = await this.findOne(id);
    await this.bomberoRepo.update(id, { ...dto, actualizadoPor } as any);
    const fecha = new Date().toISOString().slice(0, 10);

    if (dto.numeroBombero && dto.numeroBombero !== anterior.numeroBombero) {
      await this.historialCodigoRepo.save(
        this.historialCodigoRepo.create({
          bomberoId: id,
          codigoAnterior: anterior.numeroBombero,
          codigoNuevo: dto.numeroBombero,
          motivo: 'Actualizacion de codigo institucional',
          fechaCambio: new Date(),
          cambiadoPor: actualizadoPor,
        }),
      );
      await this.historialInstitucionalRepo.save(
        this.historialInstitucionalRepo.create({
          bomberoId: id,
          tipoMovimiento: 'CAMBIO_CODIGO',
          fecha,
          usuarioResponsableId: actualizadoPor,
          motivo: `Codigo cambiado de ${anterior.numeroBombero} a ${dto.numeroBombero}`,
        }),
      );
    }

    for (const [campo, tipoMovimiento] of Object.entries(CAMPOS_HISTORIAL)) {
      const valorNuevo = (dto as any)[campo];
      const valorAnterior = (anterior as any)[campo];
      if (valorNuevo !== undefined && valorNuevo !== valorAnterior) {
        await this.historialInstitucionalRepo.save(
          this.historialInstitucionalRepo.create({
            bomberoId: id,
            tipoMovimiento: tipoMovimiento as any,
            fecha,
            usuarioResponsableId: actualizadoPor,
            motivo: `${campo}: ${valorAnterior ?? '(sin dato)'} -> ${valorNuevo}`,
          }),
        );
      }
    }

    if (dto.estado && dto.estado !== anterior.estado) {
      await this.historialInstitucionalRepo.save(
        this.historialInstitucionalRepo.create({
          bomberoId: id,
          tipoMovimiento: tipoMovimientoPorEstado(dto.estado) as any,
          fecha,
          usuarioResponsableId: actualizadoPor,
          motivo: `Estado cambiado de ${anterior.estado} a ${dto.estado}`,
        }),
      );
    }

    return this.findOne(id);
  }

  async darBaja(id: string, motivo: string, actualizadoPor: string) {
    await this.findOne(id);
    await this.bomberoRepo.update(id, {
      estado: 'RETIRADO',
      fechaBaja: new Date().toISOString().slice(0, 10),
      motivoBaja: motivo,
      actualizadoPor,
    });
    await this.historialInstitucionalRepo.save(
      this.historialInstitucionalRepo.create({
        bomberoId: id,
        tipoMovimiento: 'RETIRO',
        fecha: new Date().toISOString().slice(0, 10),
        usuarioResponsableId: actualizadoPor,
        motivo,
      }),
    );
    return this.findOne(id);
  }
}
