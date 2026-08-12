import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feriado, Guardia } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateFeriadoDto, MoverFeriadoDto, UpdateFeriadoDto } from './dto/create-feriado.dto';

/** Columnas `type: 'date'` de TypeORM contra mssql pueden volver como
 * string "YYYY-MM-DD" o como Date segun el camino de lectura; se normaliza
 * siempre a string antes de comparar para no depender de cual sea. */
function soloFecha(valor: string | Date): string {
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);
  return valor.slice(0, 10);
}

@Injectable()
export class FeriadosService {
  constructor(
    @InjectRepository(Feriado) private readonly feriadoRepo: Repository<Feriado>,
    @InjectRepository(Guardia) private readonly guardiaRepo: Repository<Guardia>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(desde?: string, hasta?: string, soloActivos?: boolean) {
    const query = this.feriadoRepo.createQueryBuilder('f').orderBy('f.fecha', 'ASC');
    if (soloActivos) query.andWhere('f.activo = 1');
    if (desde) query.andWhere('f.fecha >= :desde', { desde });
    if (hasta) query.andWhere('f.fecha <= :hasta', { hasta });
    return query.getMany();
  }

  async findOne(id: string) {
    const feriado = await this.feriadoRepo.findOne({ where: { id } });
    if (!feriado) throw new NotFoundException(`Feriado ${id} no encontrado`);
    return feriado;
  }

  async create(dto: CreateFeriadoDto, actorId: string, ip?: string) {
    const feriado = await this.feriadoRepo.save(
      this.feriadoRepo.create({
        fecha: dto.fecha,
        nombre: dto.nombre,
        tipo: (dto.tipo as Feriado['tipo']) ?? 'FIJO',
        esEspecial: dto.esEspecial ?? true,
        observacion: dto.observacion ?? null,
        creadoPor: actorId,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'organizacion.feriados',
      recursoId: feriado.id,
      datosDespues: feriado,
      ip: ip ?? null,
    });
    return feriado;
  }

  async update(id: string, dto: UpdateFeriadoDto, actorId: string, ip?: string) {
    const anterior = await this.findOne(id);
    await this.feriadoRepo.update(id, { ...dto, actualizadoPor: actorId } as Partial<Feriado>);
    const actualizado = await this.findOne(id);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'EDITAR',
      recurso: 'organizacion.feriados',
      recursoId: id,
      datosAntes: anterior,
      datosDespues: actualizado,
      ip: ip ?? null,
    });
    return actualizado;
  }

  /** Traslado de un feriado movil (secciones 17-18 del pedido): NUNCA
   * reclasifica guardias en silencio. Solo actualiza la fecha del feriado
   * (conservando `fechaOriginal` la primera vez que se traslada) y devuelve
   * las guardias que caen en la fecha original y en la fecha nueva para que
   * el responsable las revise manualmente (via PATCH /guardias/:id). */
  async mover(id: string, dto: MoverFeriadoDto, actorId: string, ip?: string) {
    const anterior = await this.findOne(id);

    await this.feriadoRepo.update(id, {
      fecha: dto.nuevaFecha,
      fechaOriginal: anterior.fechaOriginal ?? anterior.fecha,
      tipo: 'TRASLADADO',
      observacion: anterior.observacion ? `${anterior.observacion}\n[TRASLADADO] ${dto.motivo}` : `[TRASLADADO] ${dto.motivo}`,
      actualizadoPor: actorId,
    });
    const actualizado = await this.findOne(id);

    const [guardiasFechaOriginal, guardiasFechaNueva] = await Promise.all([
      this.guardiaRepo.createQueryBuilder('g').where('CAST(g.fecha AS DATE) = :fecha', { fecha: soloFecha(anterior.fecha) }).getMany(),
      this.guardiaRepo.createQueryBuilder('g').where('CAST(g.fecha AS DATE) = :fecha', { fecha: soloFecha(dto.nuevaFecha) }).getMany(),
    ]);

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'MOVER_FERIADO',
      recurso: 'organizacion.feriados',
      recursoId: id,
      datosAntes: anterior,
      datosDespues: actualizado,
      metadata: {
        motivo: dto.motivo,
        guardiasAfectadasFechaOriginal: guardiasFechaOriginal.map((g) => g.id),
        guardiasAfectadasFechaNueva: guardiasFechaNueva.map((g) => g.id),
      },
      ip: ip ?? null,
    });

    return { feriado: actualizado, guardiasAfectadasFechaOriginal: guardiasFechaOriginal, guardiasAfectadasFechaNueva: guardiasFechaNueva };
  }

  async remove(id: string, actorId: string, ip?: string) {
    const feriado = await this.findOne(id);
    await this.feriadoRepo.update(id, { activo: false, actualizadoPor: actorId });
    const actualizado = await this.findOne(id);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'DESACTIVAR',
      recurso: 'organizacion.feriados',
      recursoId: id,
      datosAntes: feriado,
      datosDespues: actualizado,
      ip: ip ?? null,
    });
    return actualizado;
  }
}
