import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Ausencia, Bombero, EstadoAusencia, Usuario } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CancelarAusenciaDto, DecidirAusenciaDto, SolicitarAusenciaDto } from './dto/campo.dto';

export interface ContextoAusencias {
  usuarioId: string;
  puedeDecidir: boolean;
  ip?: string | null;
  userAgent?: string | null;
}

export const MAX_DIAS_AUSENCIA = 180;
const soloFecha = (v: unknown) => String(v).slice(0, 10);
const hoyLocal = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dias = (hasta: string, desde: string) => Math.round((Date.parse(`${hasta}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / 86_400_000) + 1;
/** Rangos de fechas AAAA-MM-DD, extremos incluidos: se pisan si cada uno empieza antes de que el otro termine. */
export const seSolapan = (a: { desde: string; hasta: string }, b: { desde: string; hasta: string }) => a.desde <= b.hasta && b.desde <= a.hasta;

@Injectable()
export class AusenciasService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
  ) {}

  async solicitar(dto: SolicitarAusenciaDto, ctx: ContextoAusencias, hoy = hoyLocal()) {
    const propio = (await this.dataSource.getRepository(Usuario).findOne({ where: { id: ctx.usuarioId } }))?.bomberoId ?? null;
    const bomberoId = dto.bomberoId ?? propio;
    if (!bomberoId) throw new BadRequestException('Su usuario no esta vinculado a un bombero: indique para quien es la ausencia.');
    if (bomberoId !== propio && !ctx.puedeDecidir) throw new ForbiddenException('Solo quien decide ausencias puede pedirlas para otro bombero.');
    if (!(await this.dataSource.getRepository(Bombero).findOne({ where: { id: bomberoId } }))) throw new NotFoundException('Bombero no encontrado');

    const desde = soloFecha(dto.desde);
    const hasta = soloFecha(dto.hasta);
    if (hasta < desde) throw new BadRequestException('La fecha final no puede ser anterior a la inicial.');
    if (hasta < hoy) throw new BadRequestException('La ausencia no puede terminar en el pasado.');
    if (dias(hasta, desde) > MAX_DIAS_AUSENCIA) throw new BadRequestException(`Una ausencia no puede superar ${MAX_DIAS_AUSENCIA} dias.`);

    const repo = this.dataSource.getRepository(Ausencia);
    const vigentes = (await repo.find({ where: { bomberoId } })).filter((a) => a.estado === 'SOLICITADA' || a.estado === 'APROBADA');
    const choque = vigentes.find((a) => seSolapan(a, { desde, hasta }));
    if (choque) throw new ConflictException(`Ya tiene una ausencia ${choque.estado.toLowerCase()} del ${choque.desde} al ${choque.hasta}.`);

    const a = await repo.save(
      repo.create({ bomberoId, desde, hasta, motivo: dto.motivo, estado: 'SOLICITADA', motivoDecision: null, solicitadaPor: ctx.usuarioId, decididaPor: null, decididaEn: null }),
    );
    await this.auditar('SOLICITAR', a.id, null, { bomberoId, desde, hasta }, ctx);
    return a;
  }

  async decidir(id: string, dto: DecidirAusenciaDto, ctx: ContextoAusencias) {
    if (!ctx.puedeDecidir) throw new ForbiddenException('Decidir ausencias requiere ausencias:decidir.');
    if (dto.decision === 'RECHAZAR' && !dto.motivo) throw new BadRequestException('Indique el motivo del rechazo.');
    const repo = this.dataSource.getRepository(Ausencia);
    const a = await repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Ausencia no encontrada');
    if (a.estado !== 'SOLICITADA') throw new ConflictException(`La ausencia ya esta ${a.estado}.`);
    const antes: EstadoAusencia = a.estado;
    a.estado = dto.decision === 'APROBAR' ? 'APROBADA' : 'RECHAZADA';
    a.motivoDecision = dto.motivo ?? null;
    a.decididaPor = ctx.usuarioId;
    a.decididaEn = new Date();
    const g = await repo.save(a);
    await this.auditar(dto.decision, id, { estado: antes }, { estado: g.estado, motivo: dto.motivo }, ctx);
    return g;
  }

  async cancelar(id: string, dto: CancelarAusenciaDto, ctx: ContextoAusencias) {
    const repo = this.dataSource.getRepository(Ausencia);
    const a = await repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Ausencia no encontrada');
    if (a.solicitadaPor !== ctx.usuarioId && !ctx.puedeDecidir) throw new ForbiddenException('Solo quien la pidio o quien decide ausencias puede cancelarla.');
    if (a.estado !== 'SOLICITADA' && a.estado !== 'APROBADA') throw new ConflictException(`La ausencia ya esta ${a.estado}.`);
    const antes = a.estado;
    a.estado = 'CANCELADA';
    a.motivoDecision = dto.motivo ?? a.motivoDecision;
    const g = await repo.save(a);
    await this.auditar('CANCELAR', id, { estado: antes }, { estado: g.estado }, ctx);
    return g;
  }

  /** Quien decide ve todas; el resto solo las suyas (por quien las pidio o por ser el bombero afectado). */
  async listar(ctx: ContextoAusencias, estado?: EstadoAusencia) {
    const repo = this.dataSource.getRepository(Ausencia);
    let filas = await repo.find({ where: estado ? { estado } : {}, order: { desde: 'DESC' }, take: 300 });
    if (!ctx.puedeDecidir) {
      const propio = (await this.dataSource.getRepository(Usuario).findOne({ where: { id: ctx.usuarioId } }))?.bomberoId ?? null;
      filas = filas.filter((a) => a.solicitadaPor === ctx.usuarioId || (propio !== null && a.bomberoId === propio));
    }
    const nombres = new Map<string, string>();
    const bomberos = this.dataSource.getRepository(Bombero);
    for (const a of filas) {
      if (!nombres.has(a.bomberoId)) {
        const b = await bomberos.findOne({ where: { id: a.bomberoId } });
        nombres.set(a.bomberoId, b ? `${b.apellido}, ${b.nombre}` : 'Sin ficha');
      }
    }
    return filas.map((a) => ({ ...a, bombero: nombres.get(a.bomberoId) }));
  }

  /** Ids de bomberos con una ausencia APROBADA que cubre la fecha (AAAA-MM-DD). */
  async ausentesEl(fecha: string): Promise<Set<string>> {
    const aprobadas = await this.dataSource.getRepository(Ausencia).find({ where: { estado: 'APROBADA' } });
    return new Set(aprobadas.filter((a) => a.desde <= fecha && fecha <= a.hasta).map((a) => a.bomberoId));
  }

  private auditar(accion: string, recursoId: string, antes: unknown, despues: unknown, ctx: ContextoAusencias) {
    return this.auditoria.registrar({
      usuarioId: ctx.usuarioId,
      accion,
      recurso: 'operaciones.ausencia',
      recursoId,
      datosAntes: antes ?? undefined,
      datosDespues: despues,
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    });
  }
}
