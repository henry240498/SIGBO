import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovimientoFinanciero, Presupuesto } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreatePresupuestoDto, UpdatePresupuestoDto } from './dto/presupuesto.dto';

export interface PresupuestoConEjecucion extends Presupuesto {
  ejecutado: number;
  disponible: number;
  porcentajeEjecutado: number;
}

/** Presupuesto por categoria de egreso y ejercicio (seccion 14). El
 * "ejecutado" NUNCA se guarda como columna -- se calcula en tiempo
 * real sumando finanzas.movimientos_financieros para que nunca quede
 * desincronizado del historial real. */
@Injectable()
export class PresupuestosService {
  constructor(
    @InjectRepository(Presupuesto) private readonly repo: Repository<Presupuesto>,
    @InjectRepository(MovimientoFinanciero) private readonly movimientoRepo: Repository<MovimientoFinanciero>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async findAll(ejercicioId: string): Promise<PresupuestoConEjecucion[]> {
    const presupuestos = await this.repo.find({ where: { ejercicioId }, order: { creadoEn: 'ASC' } });
    if (presupuestos.length === 0) return [];

    const ejecutados = await this.movimientoRepo
      .createQueryBuilder('m')
      .select('m.categoriaEgresoId', 'categoriaEgresoId')
      .addSelect('SUM(m.importe)', 'total')
      .where('m.ejercicioId = :ejercicioId', { ejercicioId })
      .andWhere("m.tipo = 'EGRESO'")
      .andWhere("m.estado = 'REGISTRADO'")
      .groupBy('m.categoriaEgresoId')
      .getRawMany<{ categoriaEgresoId: string; total: string }>();
    const ejecutadoPorCategoria = new Map(ejecutados.map((e) => [e.categoriaEgresoId, Number(e.total)]));

    return presupuestos.map((p) => {
      const ejecutado = ejecutadoPorCategoria.get(p.categoriaEgresoId) ?? 0;
      const disponible = p.montoPresupuestado - ejecutado;
      const porcentajeEjecutado = p.montoPresupuestado > 0 ? Math.round((ejecutado / p.montoPresupuestado) * 10000) / 100 : 0;
      return { ...p, ejecutado, disponible, porcentajeEjecutado };
    });
  }

  async findOne(id: string) {
    const presupuesto = await this.repo.findOne({ where: { id } });
    if (!presupuesto) throw new NotFoundException(`Presupuesto ${id} no encontrado`);
    return presupuesto;
  }

  async create(dto: CreatePresupuestoDto, actorId: string, ip?: string) {
    const existente = await this.repo.findOne({ where: { ejercicioId: dto.ejercicioId, categoriaEgresoId: dto.categoriaEgresoId } });
    if (existente) throw new ConflictException('Ya existe un presupuesto para esta categoria en este ejercicio -- edite el existente');

    const presupuesto = await this.repo.save(
      this.repo.create({
        ejercicioId: dto.ejercicioId,
        categoriaEgresoId: dto.categoriaEgresoId,
        montoPresupuestado: dto.montoPresupuestado,
        observacion: dto.observacion ?? null,
        creadoPor: actorId,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'finanzas.presupuestos',
      recursoId: presupuesto.id,
      datosDespues: presupuesto,
      ip: ip ?? null,
    });
    return presupuesto;
  }

  async update(id: string, dto: UpdatePresupuestoDto, actorId: string, ip?: string) {
    const antes = await this.findOne(id);

    if (dto.categoriaEgresoId !== undefined && dto.categoriaEgresoId !== antes.categoriaEgresoId) {
      const existente = await this.repo.findOne({ where: { ejercicioId: antes.ejercicioId, categoriaEgresoId: dto.categoriaEgresoId } });
      if (existente) throw new ConflictException('Ya existe un presupuesto para esa categoria en este ejercicio');
    }

    await this.repo.update(id, {
      montoPresupuestado: dto.montoPresupuestado,
      ...(dto.categoriaEgresoId !== undefined ? { categoriaEgresoId: dto.categoriaEgresoId } : {}),
      ...(dto.observacion !== undefined ? { observacion: dto.observacion } : {}),
      actualizadoPor: actorId,
    });
    const despues = await this.findOne(id);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'EDITAR',
      recurso: 'finanzas.presupuestos',
      recursoId: id,
      datosAntes: antes,
      datosDespues: despues,
      ip: ip ?? null,
    });
    return despues;
  }
}
