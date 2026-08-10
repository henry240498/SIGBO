import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bombero, MarcacionAsistencia } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { RegistrarMarcacionDto } from './dto/registrar-marcacion.dto';

@Injectable()
export class MarcacionesService {
  constructor(
    @InjectRepository(MarcacionAsistencia) private readonly marcacionRepo: Repository<MarcacionAsistencia>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async registrarManual(dto: RegistrarMarcacionDto, actorId: string, ip?: string) {
    const bombero = await this.bomberoRepo.findOne({ where: { id: dto.bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${dto.bomberoId} no encontrado`);

    const marcacion = await this.marcacionRepo.save(
      this.marcacionRepo.create({
        eventoId: dto.eventoId ?? null,
        bomberoId: dto.bomberoId,
        tipoMarcacion: dto.tipoMarcacion as any,
        metodo: 'MANUAL',
        timestampMarcacion: dto.timestampMarcacion ? new Date(dto.timestampMarcacion) : new Date(),
        observaciones: dto.observaciones ?? null,
        fuente: 'MANUAL',
        registradoPor: actorId,
        motivo: dto.motivo ?? null,
      }),
    );

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'REGISTRAR_MARCACION_MANUAL',
      recurso: 'operaciones.marcaciones_asistencia',
      recursoId: marcacion.id,
      datosDespues: marcacion,
      ip: ip ?? null,
    });

    return marcacion;
  }

  listarPorBombero(bomberoId: string, desde?: string, hasta?: string) {
    const query = this.marcacionRepo
      .createQueryBuilder('m')
      .where('m.bomberoId = :bomberoId', { bomberoId })
      .orderBy('m.timestampMarcacion', 'DESC');
    if (desde) query.andWhere('m.timestampMarcacion >= :desde', { desde });
    if (hasta) query.andWhere('m.timestampMarcacion <= :hasta', { hasta });
    return query.getMany();
  }

  listarDelDia(fecha: string) {
    const inicio = `${fecha}T00:00:00.000Z`;
    const fin = `${fecha}T23:59:59.999Z`;
    return this.marcacionRepo
      .createQueryBuilder('m')
      .where('m.timestampMarcacion BETWEEN :inicio AND :fin', { inicio, fin })
      .orderBy('m.timestampMarcacion', 'DESC')
      .getMany();
  }

  /** Consulta general para el Dashboard de consulta de marcaciones (filtros
   * combinables, sin requerir un bombero puntual como los otros metodos). */
  async buscar(filtros: {
    bomberoId?: string;
    desde?: string;
    hasta?: string;
    fuente?: string;
    tipoMarcacion?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = filtros.page && filtros.page > 0 ? filtros.page : 1;
    const pageSize = filtros.pageSize && filtros.pageSize > 0 ? Math.min(filtros.pageSize, 500) : 100;

    const query = this.marcacionRepo.createQueryBuilder('m').orderBy('m.timestampMarcacion', 'DESC');
    if (filtros.bomberoId) query.andWhere('m.bomberoId = :bomberoId', { bomberoId: filtros.bomberoId });
    if (filtros.desde) query.andWhere('m.timestampMarcacion >= :desde', { desde: filtros.desde });
    if (filtros.hasta) query.andWhere('m.timestampMarcacion <= :hasta', { hasta: filtros.hasta });
    if (filtros.fuente) query.andWhere('m.fuente = :fuente', { fuente: filtros.fuente });
    if (filtros.tipoMarcacion) query.andWhere('m.tipoMarcacion = :tipoMarcacion', { tipoMarcacion: filtros.tipoMarcacion });

    const [items, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total, page, pageSize };
  }

  /** Bomberos con una ENTRADA de hoy sin una SALIDA posterior -- "en cuartel"
   * ahora mismo. Usado por el dashboard (seccion 27). */
  async bomberosEnCuartelAhora(): Promise<string[]> {
    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString();

    const marcacionesHoy = await this.marcacionRepo
      .createQueryBuilder('m')
      .where('m.timestampMarcacion >= :inicioHoy', { inicioHoy })
      .orderBy('m.timestampMarcacion', 'ASC')
      .getMany();

    const ultimoEstado = new Map<string, 'ENTRADA' | 'SALIDA'>();
    for (const m of marcacionesHoy) {
      ultimoEstado.set(m.bomberoId, m.tipoMarcacion);
    }
    return [...ultimoEstado.entries()].filter(([, tipo]) => tipo === 'ENTRADA').map(([bomberoId]) => bomberoId);
  }
}
