import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type TurnoGuardia = 'DIURNO' | 'NOCTURNO' | 'COMPLETO';
export type TipoGuardiaRegistro = 'ORDINARIA' | 'ESPECIAL' | 'EXTRAORDINARIA';
export type EstadoGuardia = 'PROGRAMADA' | 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA' | 'REEMPLAZADA';

/** Guardias programadas reales (schema operaciones). No confundir con
 * organizacion.tipos_guardia, que es el catalogo de tipos. */
@Entity({ name: 'guardias', schema: 'operaciones' })
export class Guardia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'nvarchar', length: 20 })
  turno: TurnoGuardia;

  @Column({ type: 'time', precision: 0 })
  horaInicio: string;

  @Column({ type: 'time', precision: 0 })
  horaFin: string;

  @Column({ type: 'nvarchar', length: 20, default: 'ORDINARIA' })
  tipo: TipoGuardiaRegistro;

  @Column({ type: 'nvarchar', length: 20, default: 'PROGRAMADA' })
  estado: EstadoGuardia;

  @Column({ type: 'uniqueidentifier', nullable: true })
  jefeGuardiaId: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
