import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface PuntoRutaPlanificada {
  orden: number;
  lat: number;
  lon: number;
  etiqueta?: string;
}

/** Ruta que el RO dibuja sobre el mapa desde la WEB antes o durante el
 * servicio (Seguimiento Geografico, seccion 5 del pedido). Una por
 * servicio -- redefinirla reemplaza `puntos` entero, con auditoria de
 * antes/despues. Independiente a proposito de la "ruta realizada"
 * (HistorialServicio con tipoEvento 'GPS'): nunca se mezclan. */
@Entity({ name: 'rutas_planificadas', schema: 'servicios' })
export class RutaPlanificadaServicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  servicioId: string;

  /** JSON: PuntoRutaPlanificada[], ordenado por `orden`. */
  @Column({ type: 'nvarchar' })
  puntos: string;

  @Column({ type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
