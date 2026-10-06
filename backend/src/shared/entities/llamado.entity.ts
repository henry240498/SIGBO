import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoLlamado = 'RECIBIDO' | 'EN_ATENCION' | 'CERRADO';

/** Llamada recibida por el radio operador (migracion 079). Solo registra el
 * hecho: convertirlo en servicio y despachar es decision del mando. */
@Entity({ name: 'llamados', schema: 'servicios' })
export class Llamado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'datetimeoffset', precision: 3 })
  recibidoEn: Date;

  @Column({ type: 'nvarchar', length: 64, nullable: true })
  claveIdempotencia: string | null;

  @Column({ type: 'nvarchar', length: 40 })
  medio: string;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  llamanteNombre: string | null;

  @Column({ type: 'nvarchar', length: 40, nullable: true })
  llamanteTelefono: string | null;

  @Column({ type: 'nvarchar', length: 300 })
  direccion: string;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  referencia: string | null;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  descripcion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  tipoServicioId: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'RECIBIDO' })
  estado: EstadoLlamado;

  @Column({ type: 'uniqueidentifier', nullable: true })
  servicioId: string | null;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  motivoCierre: string | null;

  @Column({ type: 'uniqueidentifier' })
  recibidoPor: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  cerradoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  cerradoEn: Date | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
