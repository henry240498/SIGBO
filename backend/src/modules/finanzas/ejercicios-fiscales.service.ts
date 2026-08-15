import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EjercicioFiscal } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateEjercicioFiscalDto } from './dto/ejercicio-fiscal.dto';

/** Periodos anuales de Finanzas (seccion 15 del pedido): todo
 * movimiento pertenece a un ejercicio, nunca se mezclan entre anios. */
@Injectable()
export class EjerciciosFiscalesService {
  constructor(
    @InjectRepository(EjercicioFiscal) private readonly repo: Repository<EjercicioFiscal>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll() {
    return this.repo.find({ order: { anio: 'DESC' } });
  }

  async findOne(id: string) {
    const ejercicio = await this.repo.findOne({ where: { id } });
    if (!ejercicio) throw new NotFoundException(`Ejercicio fiscal ${id} no encontrado`);
    return ejercicio;
  }

  /** Resuelve el ejercicio ABIERTO cuya vigencia cubre una fecha dada
   * -- usado por MovimientosFinancierosService para no exigirle al
   * usuario elegir el ejercicio a mano en cada movimiento. */
  async resolverParaFecha(fecha: string): Promise<EjercicioFiscal> {
    const ejercicio = await this.repo
      .createQueryBuilder('e')
      .where('e.fechaInicio <= :fecha', { fecha })
      .andWhere('e.fechaFin >= :fecha', { fecha })
      .getOne();
    if (!ejercicio) throw new NotFoundException(`No existe un ejercicio fiscal que cubra la fecha ${fecha}`);
    if (ejercicio.estado === 'CERRADO') throw new ConflictException(`El ejercicio fiscal ${ejercicio.anio} ya esta cerrado`);
    return ejercicio;
  }

  async create(dto: CreateEjercicioFiscalDto, actorId: string, ip?: string) {
    const existente = await this.repo.findOne({ where: { anio: dto.anio } });
    if (existente) throw new ConflictException(`Ya existe un ejercicio fiscal para el anio ${dto.anio}`);
    if (new Date(dto.fechaFin) <= new Date(dto.fechaInicio)) {
      throw new ConflictException('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    const ejercicio = await this.repo.save(
      this.repo.create({
        anio: dto.anio,
        fechaInicio: dto.fechaInicio,
        fechaFin: dto.fechaFin,
        creadoPor: actorId,
      }),
    );

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'finanzas.ejercicios_fiscales',
      recursoId: ejercicio.id,
      datosDespues: ejercicio,
      ip: ip ?? null,
    });
    return ejercicio;
  }

  async cerrar(id: string, actorId: string, ip?: string) {
    const ejercicio = await this.findOne(id);
    if (ejercicio.estado === 'CERRADO') throw new ConflictException('Este ejercicio ya esta cerrado');

    await this.repo.update(id, { estado: 'CERRADO' });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CERRAR',
      recurso: 'finanzas.ejercicios_fiscales',
      recursoId: id,
      datosAntes: ejercicio,
      datosDespues: { estado: 'CERRADO' },
      ip: ip ?? null,
    });
    return this.findOne(id);
  }

  async reabrir(id: string, actorId: string, ip?: string) {
    const ejercicio = await this.findOne(id);
    if (ejercicio.estado === 'ABIERTO') throw new ConflictException('Este ejercicio ya esta abierto');

    await this.repo.update(id, { estado: 'ABIERTO' });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'REABRIR',
      recurso: 'finanzas.ejercicios_fiscales',
      recursoId: id,
      datosAntes: ejercicio,
      datosDespues: { estado: 'ABIERTO' },
      ip: ip ?? null,
    });
    return this.findOne(id);
  }
}
