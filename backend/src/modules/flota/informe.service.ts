import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Convocatoria, ConvocatoriaRespuesta, Despacho, HistorialServicio, Llamado, Servicio, TipoServicio, Vehiculo, VictimaServicio } from '../../shared/entities';
import { totalesPorCategoria } from '../campo/victimas.service';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { DatosInforme, generarPdfInforme } from './informe-intervencion.pdf';

const NOMBRE_EVENTO: Record<string, string> = {
  SALIDA_CUARTEL: 'Salida del cuartel',
  LLEGADA_SERVICIO: 'Llegada al lugar',
  SALIDA_SERVICIO: 'Salida del lugar',
  LLEGADA_CENTRO_SALUD: 'Llegada al centro de salud',
  SALIDA_CENTRO_SALUD: 'Salida del centro de salud',
  REGRESO_CUARTEL: 'Regreso al cuartel',
  FIN_SERVICIO: 'Fin del servicio',
  PUNTO_CONTROL: 'Punto de control',
  GPS: 'Posicion GPS',
  INCIDENTE: 'Incidente',
  OBSERVACION: 'Observacion',
  OTRO: 'Otro',
};

@Injectable()
export class InformeService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
  ) {}

  /** Arma los datos desde los registros existentes. Separado del PDF para poder probarlo. */
  async reunirDatos(servicioId: string, generadoPor: string): Promise<DatosInforme> {
    const servicio = await this.dataSource.getRepository(Servicio).findOne({ where: { id: servicioId } });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');

    const tipo = await this.dataSource.getRepository(TipoServicio).findOne({ where: { id: servicio.tipoServicioId } });
    const llamado = await this.dataSource.getRepository(Llamado).findOne({ where: { servicioId } });
    const despachos = await this.dataSource.getRepository(Despacho).find({ where: { servicioId }, order: { horaDespacho: 'ASC' } });
    const historial = await this.dataSource
      .getRepository(HistorialServicio)
      .find({ where: { servicioId }, order: { timestampEvento: 'ASC' } });

    const convocatorias = await this.dataSource.getRepository(Convocatoria).find({ where: { servicioId } });
    const convocados: DatosInforme['convocados'] = [];
    for (const c of convocatorias) {
      for (const r of await this.dataSource.getRepository(ConvocatoriaRespuesta).find({ where: { convocatoriaId: c.id }, order: { respondidoEn: 'ASC' } })) {
        convocados.push({ usuario: r.usuarioNombre, respuesta: r.respuesta, etaMinutos: r.etaMinutos });
      }
    }
    const filasVictimas = await this.dataSource.getRepository(VictimaServicio).find({ where: { servicioId } });

    const vehiculos = new Map<string, string>();
    const vehiculoRepo = this.dataSource.getRepository(Vehiculo);
    const idsVehiculo = new Set([...despachos.map((d) => d.vehiculoId), ...historial.map((h) => h.movilId).filter((x): x is string => !!x)]);
    for (const id of idsVehiculo) {
      const v = await vehiculoRepo.findOne({ where: { id } });
      vehiculos.set(id, v ? v.numeroInterno : '?');
    }

    return {
      servicio: {
        numeroServicio: servicio.numeroServicio,
        estado: servicio.estado,
        gravedad: servicio.gravedad,
        direccion: servicio.direccion,
        ciudad: servicio.ciudad,
        descripcion: servicio.descripcion,
        fechaHoraAviso: servicio.fechaHoraAviso,
        fechaHoraSalida: servicio.fechaHoraSalida,
        fechaHoraLlegada: servicio.fechaHoraLlegada,
        fechaHoraFin: servicio.fechaHoraFin,
      },
      tipoServicio: tipo?.nombre ?? null,
      llamado: llamado
        ? {
            recibidoEn: llamado.recibidoEn,
            medio: llamado.medio,
            llamanteNombre: llamado.llamanteNombre,
            llamanteTelefono: llamado.llamanteTelefono,
            descripcion: llamado.descripcion,
          }
        : null,
      despachos: despachos.map((d) => ({
        movil: vehiculos.get(d.vehiculoId) ?? '?',
        estado: d.estado,
        horaSalida: d.horaSalida,
        horaLlegada: d.horaLlegada,
        horaFin: d.horaFin,
        horaRegreso: d.horaRegreso,
        kmRecorridos: d.kmSalida !== null && d.kmSalida !== undefined && d.kmRegreso !== null && d.kmRegreso !== undefined ? d.kmRegreso - d.kmSalida : null,
        motivoCancelacion: d.motivoCancelacion,
      })),
      cronologia: historial.map((h) => ({
        cuando: h.timestampEvento,
        evento: NOMBRE_EVENTO[h.tipoEvento] ?? h.tipoEvento,
        movil: h.movilId ? vehiculos.get(h.movilId) ?? null : null,
        observacion: h.observacion,
      })),
      convocados,
      victimas: filasVictimas.length ? totalesPorCategoria(filasVictimas) : null,
      generadoPor,
      generadoEn: new Date(),
    };
  }

  async generarPdf(servicioId: string, usuarioId: string, username: string) {
    const datos = await this.reunirDatos(servicioId, username);
    const buffer = await generarPdfInforme(datos);
    await this.auditoria.registrar({
      usuarioId,
      accion: 'EXPORTAR_RESUMEN_OPERATIVO',
      recurso: 'servicios.servicio',
      recursoId: servicioId,
      datosDespues: { numeroServicio: datos.servicio.numeroServicio, despachos: datos.despachos.length },
    });
    return { buffer, nombreArchivo: `resumen-operativo-${datos.servicio.numeroServicio}.pdf` };
  }
}
