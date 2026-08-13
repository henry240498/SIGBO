import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoGrupoGuardia = 'ACTIVO' | 'INACTIVO';

/** Composicion predefinida de un grupo de guardia (seccion 3 del pedido):
 * al crear una guardia real a partir de un grupo, el sistema recupera
 * automaticamente su personal titular sin tener que volver a cargarlo. */
@Entity({ name: 'grupos_guardia', schema: 'operaciones' })
export class GrupoGuardia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 150 })
  nombre: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  oficialACargoId: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVO' })
  estado: EstadoGrupoGuardia;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  /** Cada cuantos dias vuelve a corresponderle una guardia a este grupo
   * (seccion 8 del pedido: rotacion por ciclos, no dia fijo de semana). */
  @Column({ type: 'int', nullable: true })
  cicloRotacionDias: number | null;

  /** Días fijos en los que puede asignarse el grupo (CSV LUN..DOM).
   * Es opcional para conservar los grupos de rotación libre existentes. */
  @Column({ type: 'nvarchar', length: 27, nullable: true, name: 'dias_semana_csv' })
  diasSemanaCsv: string | null;

  /** Capacidad del grupo; si son NULL, el generador usa los valores del
   * esquema de horario aplicado en su lugar (seccion 9). */
  @Column({ type: 'int', nullable: true })
  cantidadMinima: number | null;

  @Column({ type: 'int', nullable: true })
  cantidadMaxima: number | null;

  @Column({ type: 'int', nullable: true })
  cantidadOficiales: number | null;

  @Column({ type: 'int', nullable: true })
  cantidadChoferes: number | null;
}
