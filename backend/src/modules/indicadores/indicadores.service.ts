import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Between, DataSource, In } from 'typeorm';
import { Despacho, Servicio, TipoServicio, Vehiculo, VictimaServicio } from '../../shared/entities';
import { totalesPorCategoria } from '../campo/victimas.service';
import {
  DIAS_SEMANA,
  FRANJAS,
  agruparEnGrilla,
  contarPor,
  estadistica,
  franjaHoraria,
  segundosEntre,
} from './estadistica.util';

const MAX_RANGO_DIAS = 732;

/** Convierte AAAA-MM-DD a inicio/fin del dia en hora local. */
function rango(desde: string, hasta: string) {
  const ini = new Date(`${desde}T00:00:00`);
  const fin = new Date(`${hasta}T23:59:59.999`);
  if (Number.isNaN(ini.getTime()) || Number.isNaN(fin.getTime()) || fin < ini) {
    throw new BadRequestException('Rango de fechas invalido (use AAAA-MM-DD).');
  }
  if ((fin.getTime() - ini.getTime()) / 86_400_000 > MAX_RANGO_DIAS) {
    throw new BadRequestException(`El rango no puede superar ${MAX_RANGO_DIAS} dias.`);
  }
  return { ini, fin };
}

@Injectable()
export class IndicadoresService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private async serviciosEntre(ini: Date, fin: Date) {
    const todos = await this.dataSource.getRepository(Servicio).find({ where: { fechaHoraAviso: Between(ini, fin) } });
    return todos.filter((s) => s.estado !== 'CANCELADO');
  }

  /** 4.1: volumen, tiempos de respuesta y distribucion de los servicios del periodo. */
  async operativos(desde: string, hasta: string) {
    const { ini, fin } = rango(desde, hasta);
    const servicios = await this.serviciosEntre(ini, fin);

    const tipos = new Map<string, string>();
    for (const t of await this.dataSource.getRepository(TipoServicio).find({})) tipos.set(t.id, t.nombre);

    const despachos = servicios.length
      ? (await this.dataSource.getRepository(Despacho).find({ where: { servicioId: In(servicios.map((s) => s.id)) } })).filter((d) => d.estado !== 'CANCELADO')
      : [];
    const victimas = servicios.length ? await this.dataSource.getRepository(VictimaServicio).find({ where: { servicioId: In(servicios.map((s) => s.id)) } }) : [];
    const moviles = new Map<string, string>();
    for (const v of await this.dataSource.getRepository(Vehiculo).find({})) moviles.set(v.id, v.numeroInterno);

    const porMovil = new Map<string, number[]>();
    for (const d of despachos) {
      const s = segundosEntre(d.horaSalida, d.horaLlegada);
      if (s === null) continue;
      const nombre = moviles.get(d.vehiculoId) ?? '?';
      porMovil.set(nombre, [...(porMovil.get(nombre) ?? []), s]);
    }

    const franjas = contarPor(servicios, (s) => franjaHoraria(s.fechaHoraAviso));
    const dias = contarPor(servicios, (s) => DIAS_SEMANA[new Date(s.fechaHoraAviso).getDay()]);

    return {
      desde,
      hasta,
      totalServicios: servicios.length,
      sinDespacho: servicios.filter((s) => !despachos.some((d) => d.servicioId === s.id)).length,
      /** Aviso -> primera salida del cuartel. */
      tiempoDeSalida: estadistica(servicios.map((s) => segundosEntre(s.fechaHoraAviso, s.fechaHoraSalida)).filter((x): x is number => x !== null)),
      /** Aviso -> primera llegada al lugar. */
      tiempoDeRespuesta: estadistica(servicios.map((s) => segundosEntre(s.fechaHoraAviso, s.fechaHoraLlegada)).filter((x): x is number => x !== null)),
      /** Salida -> llegada de cada movil despachado. */
      tiempoDeViaje: estadistica(despachos.map((d) => segundosEntre(d.horaSalida, d.horaLlegada)).filter((x): x is number => x !== null)),
      /** Personas rescatadas, heridas, fallecidas y evacuadas en los servicios del periodo. */
      victimas: totalesPorCategoria(victimas),
      porTipo: contarPor(servicios, (s) => tipos.get(s.tipoServicioId) ?? 'Sin tipo'),
      porGravedad: contarPor(servicios, (s) => s.gravedad ?? 'Sin gravedad'),
      porFranja: FRANJAS.map((f) => ({ clave: f, cantidad: franjas.find((x) => x.clave === f)?.cantidad ?? 0 })),
      porDiaSemana: DIAS_SEMANA.map((d) => ({ clave: d, cantidad: dias.find((x) => x.clave === d)?.cantidad ?? 0 })),
      porMovil: [...porMovil.entries()]
        .map(([movil, tiempos]) => ({ movil, salidas: tiempos.length, viaje: estadistica(tiempos) }))
        .sort((a, b) => b.salidas - a.salidas),
    };
  }

  /** 4.2: donde ocurren los servicios (celdas con cantidad), para el mapa de calor. */
  async calor(desde: string, hasta: string, celdaM = 500) {
    const { ini, fin } = rango(desde, hasta);
    const servicios = await this.serviciosEntre(ini, fin);
    const conCoordenadas = servicios.filter((s) => s.coordenadasLat !== null && s.coordenadasLon !== null && s.coordenadasLat !== undefined);
    const celdas = agruparEnGrilla(
      conCoordenadas.map((s) => ({ lat: Number(s.coordenadasLat), lon: Number(s.coordenadasLon) })),
      Math.min(Math.max(celdaM, 50), 5000),
    ).slice(0, 500);
    return {
      desde,
      hasta,
      celdaM,
      serviciosEnElPeriodo: servicios.length,
      serviciosConUbicacion: conCoordenadas.length,
      celdas,
    };
  }
}
