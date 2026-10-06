import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CategoriaVictima, Servicio, VictimaServicio } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { RegistrarVictimasDto } from './dto/campo.dto';
import { ContextoCampo } from './adjuntos.service';

export const CATEGORIAS_VICTIMA: CategoriaVictima[] = ['RESCATADA', 'HERIDA', 'FALLECIDA', 'EVACUADA'];

/** Totales por categoria (todas presentes, aunque sean 0). */
export function totalesPorCategoria(filas: Array<{ categoria: CategoriaVictima; cantidad: number }>): Record<CategoriaVictima, number> {
  const t: Record<CategoriaVictima, number> = { RESCATADA: 0, HERIDA: 0, FALLECIDA: 0, EVACUADA: 0 };
  for (const f of filas) t[f.categoria] += f.cantidad;
  return t;
}

/** Solo registra el hecho (cuantas personas, en que categoria). No es un diagnostico ni una ficha medica. */
@Injectable()
export class VictimasService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
  ) {}

  async registrar(dto: RegistrarVictimasDto, ctx: ContextoCampo) {
    const servicio = await this.dataSource.getRepository(Servicio).findOne({ where: { id: dto.servicioId } });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');
    if (servicio.estado === 'CANCELADO') throw new ConflictException('El servicio esta cancelado.');
    const repo = this.dataSource.getRepository(VictimaServicio);
    const v = await repo.save(
      repo.create({ servicioId: dto.servicioId, categoria: dto.categoria, cantidad: dto.cantidad, observacion: dto.observacion ?? null, registradoPor: ctx.usuarioId }),
    );
    await this.auditoria.registrar({
      usuarioId: ctx.usuarioId,
      accion: 'REGISTRAR',
      recurso: 'servicios.victimas',
      recursoId: v.id,
      datosDespues: { servicioId: v.servicioId, categoria: v.categoria, cantidad: v.cantidad },
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    });
    return v;
  }

  async deServicio(servicioId: string) {
    const filas = await this.dataSource.getRepository(VictimaServicio).find({ where: { servicioId }, order: { creadoEn: 'ASC' } });
    return { registros: filas, totales: totalesPorCategoria(filas) };
  }
}
