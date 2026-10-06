import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type NivelRiesgo = 'BAJO' | 'MEDIO' | 'ALTO' | 'CRITICO';

/** Establecimiento o lugar de riesgo conocido (migracion 080). */
@Entity({ name: 'puntos_riesgo', schema: 'servicios' })
export class PuntoRiesgo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 150 })
  nombre: string;

  @Column({ type: 'nvarchar', length: 60, nullable: true })
  categoria: string | null;

  @Column({ type: 'nvarchar', length: 10, default: 'MEDIO' })
  nivelRiesgo: NivelRiesgo;

  @Column({ type: 'nvarchar', length: 300 })
  direccion: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitud: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitud: number;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  contactoNombre: string | null;

  @Column({ type: 'nvarchar', length: 40, nullable: true })
  contactoTelefono: string | null;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  descripcion: string | null;

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}

/** Version de la ficha de pre-plan de un punto de riesgo. Solo una es vigente. */
@Entity({ name: 'preplanes', schema: 'servicios' })
export class Preplan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  puntoRiesgoId: string;

  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'nvarchar', length: 200 })
  titulo: string;

  @Column({ type: 'nvarchar' })
  contenido: string;

  @Column({ type: 'bit', default: true })
  vigente: boolean;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
