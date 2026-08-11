import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionGuardia, EventoAsistencia, Guardia, Parametro, ParticipanteEvento } from '../../shared/entities';
import { MarcacionesService } from './marcaciones.service';

@Injectable()
export class DashboardAsistenciaService {
  constructor(
    @InjectRepository(EventoAsistencia) private readonly eventoRepo: Repository<EventoAsistencia>,
    @InjectRepository(ParticipanteEvento) private readonly participanteRepo: Repository<ParticipanteEvento>,
    @InjectRepository(Guardia) private readonly guardiaRepo: Repository<Guardia>,
    @InjectRepository(AsignacionGuardia) private readonly asignacionRepo: Repository<AsignacionGuardia>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
    private readonly marcacionesService: MarcacionesService,
  ) {}

  async obtenerIndicadores() {
    const ahora = new Date();

    const [enCuartelIds, eventosActivos] = await Promise.all([
      this.marcacionesService.bomberosEnCuartelAhora(),
      this.eventoRepo
        .createQueryBuilder('e')
        .where('e.fechaInicio <= :ahora AND e.fechaFin >= :ahora', { ahora })
        .andWhere('e.estado <> :cancelado', { cancelado: 'CANCELADO' })
        .getMany(),
    ]);

    const tiposEvento = await this.parametroRepo
      .createQueryBuilder('p')
      .where('p.tipo = :tipo', { tipo: 'TIPO_EVENTO_ASISTENCIA' })
      .getMany();
    const nombrePorTipoId = new Map(tiposEvento.map((t) => [t.id, t.nombre]));

    const porTipoEvento: Record<string, number> = {};
    for (const evento of eventosActivos) {
      const participantesEvento = await this.participanteRepo.count({ where: { eventoId: evento.id } });
      const nombreTipo = evento.tipoEventoId ? nombrePorTipoId.get(evento.tipoEventoId) ?? 'Otro' : 'Sin tipo';
      porTipoEvento[nombreTipo] = (porTipoEvento[nombreTipo] ?? 0) + participantesEvento;
    }

    /* "Ausentes" = personal asignado a una guardia/evento de HOY cuyo horario
     * ya finalizo, sin ninguna participacion/asignacion confirmada. Nunca se
     * cuenta como ausente a alguien que simplemente no marco entrada/salida
     * en general (seccion 17 del pedido). */
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const finHoy = new Date(inicioHoy.getTime() + 24 * 60 * 60 * 1000);

    const eventosFinalizadosHoy = await this.eventoRepo
      .createQueryBuilder('e')
      .where('e.fechaFin >= :inicioHoy AND e.fechaFin < :finHoy', { inicioHoy, finHoy })
      .andWhere('e.fechaFin < :ahora', { ahora })
      .getMany();

    let ausentes = 0;
    for (const evento of eventosFinalizadosHoy) {
      ausentes += await this.participanteRepo.count({
        where: { eventoId: evento.id, estadoParticipacion: 'NO_REGISTRADA' },
      });
    }

    return {
      enCuartel: enCuartelIds.length,
      eventosActivos: eventosActivos.length,
      participantesActivosPorTipoEvento: porTipoEvento,
      ausentesDeActividadesFinalizadasHoy: ausentes,
      fechaCalculo: ahora.toISOString(),
    };
  }
}
