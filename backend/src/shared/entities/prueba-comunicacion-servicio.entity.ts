import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Prueba de comunicacion/radio registrada por el RO sobre el mapa
 * (Seguimiento Geografico, seccion 8 del pedido). Tabla propia -- no
 * un evento mas de HistorialServicio -- porque `nivel` y
 * `distanciaMetros` necesitan ser columnas consultables por SQL para
 * las estadisticas futuras de la seccion 25 (promedio de nivel,
 * distancia de degradacion, etc.), no un valor mas adentro de un JSON. */
@Entity({ name: 'pruebas_comunicacion', schema: 'servicios' })
export class PruebaComunicacionServicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  servicioId: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  movilId: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitud: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitud: number;

  /** Calculada en el servidor por Haversine desde el cuartel de
   * referencia (seccion 12: "no depender unicamente de que el usuario
   * escriba manualmente"). Null si no hay un cuartel con coordenadas
   * cargadas para calcularla. */
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distanciaMetros: number | null;

  /** 1 a 5 -- nunca 0 (seccion 9 del pedido: "muy malo" es 1, no 0). */
  @Column({ type: 'tinyint' })
  nivel: number;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @Column({ type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
