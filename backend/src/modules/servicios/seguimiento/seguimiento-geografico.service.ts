import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  Cuartel,
  HistorialServicio,
  PruebaComunicacionServicio,
  RutaPlanificadaServicio,
  Servicio,
  Vehiculo,
} from '../../../shared/entities';
import { AuditoriaService } from '../../seguridad/auditoria.service';
import {
  ActualizarEventoGeograficoDto,
  ActualizarPruebaComunicacionDto,
  CrearEventoGeograficoDto,
  CrearPruebaComunicacionDto,
  GuardarRutaPlanificadaDto,
} from './dto/seguimiento-geografico.dto';

const RECURSO_RUTA = 'servicios.rutas_planificadas';
const RECURSO_EVENTO = 'servicios.historial_servicios';
const RECURSO_PRUEBA = 'servicios.pruebas_comunicacion';
const RADIO_TIERRA_METROS = 6371000;

/** "Seguimiento Geografico y Operativo del Servicio": ruta planificada,
 * eventos del recorrido y pruebas de comunicacion. Modulo separado de
 * ServiciosService a proposito -- no toca el flujo de la Comunicacion
 * de Servicio (crear/editar/finalizar), solo lee `Servicio` para
 * ubicarlo en el mapa y para resolver el numero de servicio. */
@Injectable()
export class SeguimientoGeograficoService {
  constructor(
    @InjectRepository(Servicio) private readonly servicioRepo: Repository<Servicio>,
    @InjectRepository(Cuartel) private readonly cuartelRepo: Repository<Cuartel>,
    @InjectRepository(Vehiculo) private readonly vehiculoRepo: Repository<Vehiculo>,
    @InjectRepository(HistorialServicio) private readonly historialRepo: Repository<HistorialServicio>,
    @InjectRepository(RutaPlanificadaServicio) private readonly rutaRepo: Repository<RutaPlanificadaServicio>,
    @InjectRepository(PruebaComunicacionServicio) private readonly pruebaRepo: Repository<PruebaComunicacionServicio>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  /* ------------------------------------------------------------ */
  /* Lectura                                                          */
  /* ------------------------------------------------------------ */

  async obtenerResumen(servicioId: string) {
    const servicio = await this.obtenerServicio(servicioId);
    const [cuartel, ruta, eventos, pruebas] = await Promise.all([
      this.resolverCuartelReferencia(),
      this.rutaRepo.findOne({ where: { servicioId } }),
      this.historialRepo.find({ where: { servicioId }, order: { timestampEvento: 'ASC' } }),
      this.pruebaRepo.find({ where: { servicioId }, order: { creadoEn: 'ASC' } }),
    ]);

    const movilIds = [...new Set([...eventos.map((e) => e.movilId), ...pruebas.map((p) => p.movilId)].filter((id): id is string => !!id))];
    const moviles = movilIds.length ? await this.vehiculoRepo.find({ where: { id: In(movilIds) } }) : [];
    const movilPorId = new Map(moviles.map((m) => [m.id, `${m.numeroInterno}${m.marca ? ` · ${m.marca}` : ''}`.trim()]));

    const rutaRealizada = eventos
      .filter((e) => e.tipoEvento === 'GPS' && e.latitud != null && e.longitud != null)
      .map((e) => ({ lat: Number(e.latitud), lon: Number(e.longitud), timestamp: e.timestampEvento }));

    return {
      servicio: {
        id: servicio.id,
        numeroServicio: servicio.numeroServicio,
        direccion: servicio.direccion,
        estado: servicio.estado,
      },
      incidente: servicio.coordenadasLat != null && servicio.coordenadasLon != null
        ? { lat: Number(servicio.coordenadasLat), lon: Number(servicio.coordenadasLon) }
        : null,
      cuartel: cuartel && cuartel.latitud != null && cuartel.longitud != null
        ? { id: cuartel.id, nombre: cuartel.nombre, lat: Number(cuartel.latitud), lon: Number(cuartel.longitud) }
        : null,
      rutaPlanificada: ruta ? { id: ruta.id, puntos: JSON.parse(ruta.puntos), actualizadoEn: ruta.actualizadoEn } : null,
      rutaRealizada,
      eventos: eventos.map((e) => this.presentarEvento(e, movilPorId)),
      pruebasComunicacion: pruebas.map((p) => this.presentarPrueba(p, movilPorId)),
    };
  }

  /* ------------------------------------------------------------ */
  /* Ruta planificada (seccion 5-6 del pedido)                        */
  /* ------------------------------------------------------------ */

  async guardarRutaPlanificada(servicioId: string, dto: GuardarRutaPlanificadaDto, usuarioId: string, ip?: string | null) {
    await this.obtenerServicio(servicioId);
    const puntosOrdenados = [...dto.puntos].sort((a, b) => a.orden - b.orden);
    const puntosJson = JSON.stringify(puntosOrdenados);

    const existente = await this.rutaRepo.findOne({ where: { servicioId } });
    if (!existente) {
      const creada = await this.rutaRepo.save(this.rutaRepo.create({ servicioId, puntos: puntosJson, creadoPor: usuarioId, actualizadoPor: usuarioId }));
      await this.auditoriaService.registrar({ usuarioId, accion: 'CREAR_RUTA_PLANIFICADA', recurso: RECURSO_RUTA, recursoId: creada.id, datosDespues: { servicioId, puntos: puntosOrdenados }, ip: ip ?? null });
      return { id: creada.id, puntos: puntosOrdenados, actualizadoEn: creada.actualizadoEn };
    }

    const antes = JSON.parse(existente.puntos);
    await this.rutaRepo.update(existente.id, { puntos: puntosJson, actualizadoPor: usuarioId });
    const actualizada = await this.rutaRepo.findOneByOrFail({ id: existente.id });
    await this.auditoriaService.registrar({ usuarioId, accion: 'EDITAR_RUTA_PLANIFICADA', recurso: RECURSO_RUTA, recursoId: existente.id, datosAntes: { puntos: antes }, datosDespues: { puntos: puntosOrdenados }, ip: ip ?? null });
    return { id: actualizada.id, puntos: puntosOrdenados, actualizadoEn: actualizada.actualizadoEn };
  }

  async eliminarRutaPlanificada(servicioId: string, usuarioId: string, ip?: string | null) {
    await this.obtenerServicio(servicioId);
    const existente = await this.rutaRepo.findOne({ where: { servicioId } });
    if (!existente) throw new NotFoundException('Este servicio no tiene una ruta planificada');
    await this.rutaRepo.delete(existente.id);
    await this.auditoriaService.registrar({ usuarioId, accion: 'ELIMINAR_RUTA_PLANIFICADA', recurso: RECURSO_RUTA, recursoId: existente.id, datosAntes: { puntos: JSON.parse(existente.puntos) }, ip: ip ?? null });
    return { eliminado: true };
  }

  /* ------------------------------------------------------------ */
  /* Eventos geograficos (seccion 7, 13)                              */
  /* ------------------------------------------------------------ */

  async agregarEvento(servicioId: string, dto: CrearEventoGeograficoDto, usuarioId: string, ip?: string | null) {
    await this.obtenerServicio(servicioId);
    if (dto.movilId) await this.validarMovil(dto.movilId);
    const evento = await this.historialRepo.save(this.historialRepo.create({
      servicioId,
      timestampEvento: new Date(),
      tipoEvento: dto.tipoEvento,
      latitud: dto.latitud,
      longitud: dto.longitud,
      movilId: dto.movilId ?? null,
      direccion: dto.destino ?? null,
      observacion: dto.observacion ?? null,
      datos: null,
      creadoPor: usuarioId,
    }));
    await this.auditoriaService.registrar({ usuarioId, accion: 'CREAR_EVENTO_GEOGRAFICO', recurso: RECURSO_EVENTO, recursoId: evento.id, datosDespues: this.resumenEvento(evento), ip: ip ?? null });
    return this.presentarEvento(evento, await this.mapaMoviles([evento.movilId]));
  }

  async actualizarEvento(servicioId: string, eventoId: string, dto: ActualizarEventoGeograficoDto, usuarioId: string, ip?: string | null) {
    const evento = await this.obtenerEvento(servicioId, eventoId);
    const antes = this.resumenEvento(evento);
    await this.historialRepo.update(eventoId, {
      ...(dto.destino !== undefined ? { direccion: dto.destino } : {}),
      ...(dto.observacion !== undefined ? { observacion: dto.observacion } : {}),
    });
    const actualizado = await this.historialRepo.findOneByOrFail({ id: eventoId });
    await this.auditoriaService.registrar({ usuarioId, accion: 'EDITAR_EVENTO_GEOGRAFICO', recurso: RECURSO_EVENTO, recursoId: eventoId, datosAntes: antes, datosDespues: this.resumenEvento(actualizado), ip: ip ?? null });
    return this.presentarEvento(actualizado, await this.mapaMoviles([actualizado.movilId]));
  }

  async eliminarEvento(servicioId: string, eventoId: string, usuarioId: string, ip?: string | null) {
    const evento = await this.obtenerEvento(servicioId, eventoId);
    await this.historialRepo.delete(eventoId);
    await this.auditoriaService.registrar({ usuarioId, accion: 'ELIMINAR_EVENTO_GEOGRAFICO', recurso: RECURSO_EVENTO, recursoId: eventoId, datosAntes: this.resumenEvento(evento), ip: ip ?? null });
    return { eliminado: true };
  }

  /* ------------------------------------------------------------ */
  /* Pruebas de comunicacion (seccion 8-12)                           */
  /* ------------------------------------------------------------ */

  async agregarPruebaComunicacion(servicioId: string, dto: CrearPruebaComunicacionDto, usuarioId: string, ip?: string | null) {
    await this.obtenerServicio(servicioId);
    if (dto.movilId) await this.validarMovil(dto.movilId);
    const cuartel = await this.resolverCuartelReferencia();
    const distanciaMetros = cuartel && cuartel.latitud != null && cuartel.longitud != null
      ? this.distanciaHaversine(Number(cuartel.latitud), Number(cuartel.longitud), dto.latitud, dto.longitud)
      : null;

    const prueba = await this.pruebaRepo.save(this.pruebaRepo.create({
      servicioId,
      movilId: dto.movilId ?? null,
      latitud: dto.latitud,
      longitud: dto.longitud,
      distanciaMetros,
      nivel: dto.nivel,
      observacion: dto.observacion ?? null,
      creadoPor: usuarioId,
    }));
    await this.auditoriaService.registrar({ usuarioId, accion: 'CREAR_PRUEBA_COMUNICACION', recurso: RECURSO_PRUEBA, recursoId: prueba.id, datosDespues: this.resumenPrueba(prueba), ip: ip ?? null });
    return this.presentarPrueba(prueba, await this.mapaMoviles([prueba.movilId]));
  }

  async actualizarPruebaComunicacion(servicioId: string, pruebaId: string, dto: ActualizarPruebaComunicacionDto, usuarioId: string, ip?: string | null) {
    const prueba = await this.obtenerPrueba(servicioId, pruebaId);
    const antes = this.resumenPrueba(prueba);
    await this.pruebaRepo.update(pruebaId, { ...(dto.observacion !== undefined ? { observacion: dto.observacion } : {}) });
    const actualizada = await this.pruebaRepo.findOneByOrFail({ id: pruebaId });
    await this.auditoriaService.registrar({ usuarioId, accion: 'EDITAR_PRUEBA_COMUNICACION', recurso: RECURSO_PRUEBA, recursoId: pruebaId, datosAntes: antes, datosDespues: this.resumenPrueba(actualizada), ip: ip ?? null });
    return this.presentarPrueba(actualizada, await this.mapaMoviles([actualizada.movilId]));
  }

  async eliminarPruebaComunicacion(servicioId: string, pruebaId: string, usuarioId: string, ip?: string | null) {
    const prueba = await this.obtenerPrueba(servicioId, pruebaId);
    await this.pruebaRepo.delete(pruebaId);
    await this.auditoriaService.registrar({ usuarioId, accion: 'ELIMINAR_PRUEBA_COMUNICACION', recurso: RECURSO_PRUEBA, recursoId: pruebaId, datosAntes: this.resumenPrueba(prueba), ip: ip ?? null });
    return { eliminado: true };
  }

  /* ------------------------------------------------------------ */
  /* Utilidades                                                       */
  /* ------------------------------------------------------------ */

  private async obtenerServicio(servicioId: string) {
    const servicio = await this.servicioRepo.findOne({ where: { id: servicioId } });
    if (!servicio) throw new NotFoundException(`Servicio ${servicioId} no encontrado`);
    return servicio;
  }

  private async obtenerEvento(servicioId: string, eventoId: string) {
    const evento = await this.historialRepo.findOne({ where: { id: eventoId, servicioId } });
    if (!evento) throw new NotFoundException(`Evento ${eventoId} no encontrado en este servicio`);
    return evento;
  }

  private async obtenerPrueba(servicioId: string, pruebaId: string) {
    const prueba = await this.pruebaRepo.findOne({ where: { id: pruebaId, servicioId } });
    if (!prueba) throw new NotFoundException(`Prueba de comunicación ${pruebaId} no encontrada en este servicio`);
    return prueba;
  }

  private async validarMovil(movilId: string) {
    const existe = await this.vehiculoRepo.exists({ where: { id: movilId } });
    if (!existe) throw new BadRequestException('El móvil seleccionado no existe');
  }

  /** Institucion de una sola sede en la practica (ver identidad
   * institucional): si hay mas de un cuartel activo con coordenadas
   * cargadas, no se puede elegir uno "el" cuartel sin ambiguedad, asi
   * que se prefiere no resolver ninguno antes que adivinar mal. */
  private async resolverCuartelReferencia(): Promise<Cuartel | null> {
    const cuarteles = await this.cuartelRepo.find({ where: { estado: 'ACTIVO' } });
    const conCoordenadas = cuarteles.filter((c) => c.latitud != null && c.longitud != null);
    return conCoordenadas.length === 1 ? conCoordenadas[0] : null;
  }

  private async mapaMoviles(ids: Array<string | null>): Promise<Map<string, string>> {
    const unicos = [...new Set(ids.filter((id): id is string => !!id))];
    if (unicos.length === 0) return new Map();
    const moviles = await this.vehiculoRepo.find({ where: { id: In(unicos) } });
    return new Map(moviles.map((m) => [m.id, `${m.numeroInterno}${m.marca ? ` · ${m.marca}` : ''}`.trim()]));
  }

  /** Distancia entre dos coordenadas (formula de Haversine, radio
   * terrestre medio) -- seccion 12: "si el sistema puede calcularla,
   * debe hacerlo", nunca depender de que el usuario la tipee. */
  private distanciaHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const rad = (grados: number) => (grados * Math.PI) / 180;
    const dLat = rad(lat2 - lat1);
    const dLon = rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(RADIO_TIERRA_METROS * c * 100) / 100;
  }

  private presentarEvento(evento: HistorialServicio, movilPorId: Map<string, string>) {
    return {
      id: evento.id,
      tipoEvento: evento.tipoEvento,
      timestamp: evento.timestampEvento,
      lat: evento.latitud != null ? Number(evento.latitud) : null,
      lon: evento.longitud != null ? Number(evento.longitud) : null,
      movilId: evento.movilId,
      movil: evento.movilId ? movilPorId.get(evento.movilId) ?? null : null,
      destino: evento.direccion,
      observacion: evento.observacion,
      creadoPor: evento.creadoPor,
    };
  }

  private presentarPrueba(prueba: PruebaComunicacionServicio, movilPorId: Map<string, string>) {
    return {
      id: prueba.id,
      lat: Number(prueba.latitud),
      lon: Number(prueba.longitud),
      distanciaMetros: prueba.distanciaMetros != null ? Number(prueba.distanciaMetros) : null,
      nivel: prueba.nivel,
      movilId: prueba.movilId,
      movil: prueba.movilId ? movilPorId.get(prueba.movilId) ?? null : null,
      observacion: prueba.observacion,
      creadoEn: prueba.creadoEn,
      creadoPor: prueba.creadoPor,
    };
  }

  private resumenEvento(evento: HistorialServicio) {
    return { tipoEvento: evento.tipoEvento, lat: evento.latitud, lon: evento.longitud, destino: evento.direccion, observacion: evento.observacion };
  }

  private resumenPrueba(prueba: PruebaComunicacionServicio) {
    return { lat: prueba.latitud, lon: prueba.longitud, nivel: prueba.nivel, distanciaMetros: prueba.distanciaMetros, observacion: prueba.observacion };
  }
}
