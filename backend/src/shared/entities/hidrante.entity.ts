import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoHidrante = 'OPERATIVO' | 'FUERA_SERVICIO' | 'SIN_VERIFICAR';

/** Hidrante de la zona (migracion 080). Se da de baja con `activo = false`, nunca se borra. */
@Entity({ name: 'hidrantes', schema: 'servicios' })
export class Hidrante {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 30 })
  codigo: string;

  @Column({ type: 'nvarchar', length: 40, nullable: true })
  tipo: string | null;

  @Column({ type: 'nvarchar', length: 300 })
  direccion: string;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  referencia: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitud: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitud: number;

  @Column({ type: 'nvarchar', length: 20, default: 'SIN_VERIFICAR' })
  estado: EstadoHidrante;

  @Column({ type: 'int', nullable: true })
  caudalLpm: number | null;

  @Column({ type: 'date', nullable: true })
  ultimaInspeccion: string | null;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  observaciones: string | null;

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
