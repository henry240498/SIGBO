import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Salon, patio de simulacros u otra instalacion reservable (migracion 083). */
@Entity({ name: 'instalaciones', schema: 'organizacion' })
export class Instalacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 100 })
  nombre: string;

  @Column({ type: 'int', nullable: true })
  capacidad: number | null;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  descripcion: string | null;

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}

export type EstadoReserva = 'SOLICITADA' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA';

@Entity({ name: 'reservas_instalacion', schema: 'organizacion' })
export class ReservaInstalacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  instalacionId: string;

  @Column({ type: 'nvarchar', length: 150 })
  titulo: string;

  @Column({ type: 'nvarchar', length: 150 })
  solicitanteNombre: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  contacto: string | null;

  @Column({ type: 'int', nullable: true })
  personas: number | null;

  @Column({ type: 'datetimeoffset', precision: 3 })
  inicio: Date;

  @Column({ type: 'datetimeoffset', precision: 3 })
  fin: Date;

  @Column({ type: 'nvarchar', length: 12, default: 'SOLICITADA' })
  estado: EstadoReserva;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  motivoDecision: string | null;

  @Column({ type: 'uniqueidentifier' })
  creadoPor: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  decididoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  decididoEn: Date | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}

export type ResultadoInspeccion = 'APROBADO' | 'CON_OBSERVACIONES' | 'RECHAZADO';

/** Inspeccion de prevencion a un establecimiento, con su certificado si lo aprobo. */
@Entity({ name: 'inspecciones_prevencion', schema: 'servicios' })
export class InspeccionPrevencion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  puntoRiesgoId: string | null;

  @Column({ type: 'nvarchar', length: 150 })
  establecimiento: string;

  @Column({ type: 'nvarchar', length: 300 })
  direccion: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'uniqueidentifier' })
  inspectorId: string;

  @Column({ type: 'nvarchar', length: 20 })
  resultado: ResultadoInspeccion;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  observaciones: string | null;

  @Column({ type: 'nvarchar', length: 40, nullable: true })
  certificadoNumero: string | null;

  @Column({ type: 'date', nullable: true })
  certificadoVence: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
