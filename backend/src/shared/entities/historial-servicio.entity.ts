import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type TipoEventoHistorialServicio =
  | 'SALIDA_CUARTEL'
  | 'LLEGADA_SERVICIO'
  | 'SALIDA_SERVICIO'
  | 'LLEGADA_CENTRO_SALUD'
  | 'SALIDA_CENTRO_SALUD'
  | 'REGRESO_CUARTEL'
  | 'FIN_SERVICIO'
  | 'PUNTO_CONTROL'
  | 'GPS'
  | 'INCIDENTE'
  | 'OBSERVACION'
  | 'OTRO';

/** Linea de tiempo geografica/operativa de un servicio (Seguimiento
 * Geografico y Operativo). Tabla original de 007_servicios.sql, sin
 * entidad ni filas hasta la migracion 071 -- se reutiliza en vez de
 * crear una tabla nueva. Cada fila con `tipoEvento: 'GPS'` es un punto
 * de la "ruta realizada": hoy cargado manualmente desde la web, mas
 * adelante por la app movil sin cambiar esta tabla. */
@Entity({ name: 'historial_servicios', schema: 'servicios' })
export class HistorialServicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  servicioId: string;

  @Column({ type: 'datetimeoffset', precision: 3 })
  timestampEvento: Date;

  @Column({ type: 'nvarchar', length: 30 })
  tipoEvento: TipoEventoHistorialServicio;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitud: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitud: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  velocidadKmh: number | null;

  /** Reutilizada como etiqueta/destino descriptivo del evento (ej.
   * "Hospital Nacional de Itaugua") -- no es un rumbo GPS, pese al
   * nombre heredado de la migracion original. */
  @Column({ type: 'nvarchar', nullable: true })
  direccion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  movilId: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  datos: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
