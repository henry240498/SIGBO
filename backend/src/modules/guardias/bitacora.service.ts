import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Bombero,
  EventoAsistencia,
  Guardia,
  InspeccionEstacion,
  InspeccionMovil,
  MarcacionAsistencia,
  NovedadGuardia,
  ParticipanteEvento,
  Pernocte,
  PrestamoEquipo,
  Servicio,
  Usuario,
} from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { GuardiasService } from './guardias.service';

/** SIGBO debe funcionar como concentrador de informacion de la guardia, no
 * como base de datos aislada (seccion 33 del pedido): esta bitacora NUNCA
 * duplica almacenamiento, solo consulta lo ya registrado en cada modulo
 * (Asistencia, Servicios, Equipos, Eventos) dentro de la ventana horaria
 * real de la guardia (`GuardiasService.rangoGuardia`), mas lo propio de
 * Guardias (personal, pernoctes, inspecciones, novedades manuales). */
@Injectable()
export class BitacoraService {
  constructor(
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(MarcacionAsistencia) private readonly marcacionRepo: Repository<MarcacionAsistencia>,
    @InjectRepository(Servicio) private readonly servicioRepo: Repository<Servicio>,
    @InjectRepository(EventoAsistencia) private readonly eventoRepo: Repository<EventoAsistencia>,
    @InjectRepository(ParticipanteEvento) private readonly participanteRepo: Repository<ParticipanteEvento>,
    @InjectRepository(PrestamoEquipo) private readonly prestamoRepo: Repository<PrestamoEquipo>,
    @InjectRepository(Pernocte) private readonly pernocteRepo: Repository<Pernocte>,
    @InjectRepository(InspeccionEstacion) private readonly inspeccionEstacionRepo: Repository<InspeccionEstacion>,
    @InjectRepository(InspeccionMovil) private readonly inspeccionMovilRepo: Repository<InspeccionMovil>,
    @InjectRepository(NovedadGuardia) private readonly novedadRepo: Repository<NovedadGuardia>,
    @InjectRepository(Guardia) private readonly guardiaRepo: Repository<Guardia>,
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    private readonly guardiasService: GuardiasService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async obtener(guardiaId: string) {
    const guardia = await this.guardiasService.findOne(guardiaId);
    const { inicio, fin } = this.guardiasService.rangoGuardia(guardia);

    const personal = await this.guardiasService.listarAsignaciones(guardiaId);
    const bomberoIds = [...new Set(personal.map((a) => a.bomberoId))];

    const [marcaciones, servicios, participaciones, prestamos, pernoctes, inspeccionesEstacion, inspeccionesMovil, novedades] =
      await Promise.all([
        bomberoIds.length
          ? this.marcacionRepo
              .createQueryBuilder('m')
              .where('m.bomberoId IN (:...ids)', { ids: bomberoIds })
              .andWhere('m.timestampMarcacion BETWEEN :inicio AND :fin', { inicio, fin })
              .orderBy('m.timestampMarcacion', 'ASC')
              .getMany()
          : [],
        this.servicioRepo
          .createQueryBuilder('s')
          .where('s.fechaHoraAviso <= :fin', { fin })
          .andWhere('(s.fechaHoraFin IS NULL OR s.fechaHoraFin >= :inicio)', { inicio })
          .orderBy('s.fechaHoraAviso', 'ASC')
          .getMany(),
        bomberoIds.length
          ? this.participanteRepo.createQueryBuilder('pe').where('pe.bomberoId IN (:...ids)', { ids: bomberoIds }).getMany()
          : [],
        bomberoIds.length
          ? this.prestamoRepo
              .createQueryBuilder('p')
              .where('p.bomberoId IN (:...ids)', { ids: bomberoIds })
              .andWhere('p.fechaPrestamo BETWEEN :inicio AND :fin', { inicio, fin })
              .orderBy('p.fechaPrestamo', 'ASC')
              .getMany()
          : [],
        this.pernocteRepo.find({ where: { guardiaId } }),
        this.inspeccionEstacionRepo.find({ where: { guardiaId } }),
        this.inspeccionMovilRepo.find({ where: { guardiaId } }),
        this.novedadRepo.find({ where: { guardiaId }, order: { fechaHora: 'ASC' } }),
      ]);

    let eventos: EventoAsistencia[] = [];
    if (participaciones.length > 0) {
      const eventoIds = [...new Set(participaciones.map((p) => p.eventoId))];
      eventos = await this.eventoRepo
        .createQueryBuilder('e')
        .where('e.id IN (:...ids)', { ids: eventoIds })
        .andWhere('e.fechaInicio <= :fin', { fin })
        .andWhere('e.fechaFin >= :inicio', { inicio })
        .orderBy('e.fechaInicio', 'ASC')
        .getMany();
    }

    const bomberos = bomberoIds.length
      ? await this.bomberoRepo.createQueryBuilder('b').where('b.id IN (:...ids)', { ids: bomberoIds }).getMany()
      : [];
    const nombrePorBombero = new Map(bomberos.map((b) => [b.id, `${b.nombre} ${b.apellido}`]));

    return {
      guardia,
      personal,
      marcacionesAsistencia: marcaciones.map((m) => ({ ...m, nombreCompleto: nombrePorBombero.get(m.bomberoId) ?? '(desconocido)' })),
      servicios,
      eventos,
      prestamosEquipo: prestamos.map((p) => ({ ...p, nombreCompleto: p.bomberoId ? nombrePorBombero.get(p.bomberoId) ?? '(desconocido)' : null })),
      pernoctes,
      inspeccionesEstacion,
      inspeccionesMovil,
      novedades,
    };
  }

  /** Cierre de guardia (secciones 22/32 del pedido): genera un snapshot JSON
   * INMUTABLE del resumen en el momento del cierre -- si datos relacionados
   * (asistencia, servicios, etc.) cambian despues, el informe ya cerrado no
   * cambia retroactivamente. Nunca borra nada: solo cambia estado y guarda
   * el resumen. */
  async cerrar(guardiaId: string, observacion: string | undefined, responsableIdSolicitado: string | undefined, actorId: string, ip?: string) {
    const anterior = await this.guardiasService.findOne(guardiaId);
    if (anterior.estado === 'FINALIZADA') throw new BadRequestException('Esta guardia ya esta finalizada');
    if (anterior.estado === 'ANULADA') throw new BadRequestException('No se puede cerrar una guardia anulada');

    // cierreResponsableId referencia personal.bomberos, NUNCA
    // seguridad.usuarios: el usuario que ejecuta el cierre (actorId) puede
    // no tener ficha de bombero. Prioridad: bombero indicado explicitamente
    // > bombero vinculado al usuario que cierra > jefe de guardia asignado.
    let cierreResponsableId: string | null = responsableIdSolicitado ?? null;
    if (cierreResponsableId) {
      const bombero = await this.bomberoRepo.findOne({ where: { id: cierreResponsableId } });
      if (!bombero) throw new BadRequestException(`Bombero ${cierreResponsableId} no encontrado`);
    } else {
      const usuario = await this.usuarioRepo.findOne({ where: { id: actorId } });
      cierreResponsableId = usuario?.bomberoId ?? anterior.jefeGuardiaId ?? null;
    }

    const bitacora = await this.obtener(guardiaId);
    const resumen = {
      generadoEn: new Date().toISOString(),
      personalTotal: bitacora.personal.length,
      personalPorTipoParticipacion: bitacora.personal.reduce<Record<string, number>>((acc, p) => {
        acc[p.tipoParticipacion] = (acc[p.tipoParticipacion] ?? 0) + 1;
        return acc;
      }, {}),
      pernoctesCantidad: bitacora.pernoctes.length,
      inspeccionesEstacionNoOk: bitacora.inspeccionesEstacion.filter((i) => i.estado === 'NO_OK').length,
      inspeccionesMovilNoOk: bitacora.inspeccionesMovil.filter((i) => i.estado === 'NO_OK').length,
      serviciosCantidad: bitacora.servicios.length,
      eventosCantidad: bitacora.eventos.length,
      prestamosEquipoCantidad: bitacora.prestamosEquipo.length,
      novedadesCantidad: bitacora.novedades.length,
    };

    await this.guardiaRepo.update(guardiaId, {
      estado: 'FINALIZADA',
      cierreResponsableId,
      cierreObservacion: observacion ?? null,
      cierreResumen: JSON.stringify(resumen),
      cerradaEn: new Date(),
    });
    const actualizada = await this.guardiasService.findOne(guardiaId);

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CERRAR_GUARDIA',
      recurso: 'operaciones.guardias',
      recursoId: guardiaId,
      datosAntes: anterior,
      datosDespues: actualizada,
      ip: ip ?? null,
    });
    return actualizada;
  }

  /** Reapertura (seccion 32): nunca elimina el snapshot del cierre anterior
   * -- si se vuelve a cerrar, el resumen se sobreescribe, pero el valor
   * previo queda en el log de auditoria (datosAntes) de ese segundo
   * cierre. */
  async reabrir(guardiaId: string, motivo: string, actorId: string, ip?: string) {
    const anterior = await this.guardiasService.findOne(guardiaId);
    if (anterior.estado !== 'FINALIZADA') throw new BadRequestException('Solo se puede reabrir una guardia finalizada');

    await this.guardiaRepo.update(guardiaId, {
      estado: 'EN_CURSO',
      observaciones: anterior.observaciones ? `${anterior.observaciones}\n[REABIERTA] ${motivo}` : `[REABIERTA] ${motivo}`,
    });
    const actualizada = await this.guardiasService.findOne(guardiaId);

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'REABRIR_GUARDIA',
      recurso: 'operaciones.guardias',
      recursoId: guardiaId,
      datosAntes: anterior,
      datosDespues: actualizada,
      ip: ip ?? null,
    });
    return actualizada;
  }
}
