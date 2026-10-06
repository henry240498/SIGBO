import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Ultima posicion conocida de un movil (migracion 078): una fila por movil. */
@Entity({ name: 'posicion_actual', schema: 'vehiculos' })
export class PosicionMovil {
  @PrimaryColumn({ type: 'uniqueidentifier' })
  vehiculoId: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitud: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitud: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, nullable: true })
  velocidadKmh: number | null;

  @Column({ type: 'decimal', precision: 7, scale: 1, nullable: true })
  precisionM: number | null;

  /** Momento de la lectura en el dispositivo (no el de llegada al servidor). */
  @Column({ type: 'datetimeoffset', precision: 3 })
  registradoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  reportadoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
