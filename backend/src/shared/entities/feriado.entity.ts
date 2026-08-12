import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type TipoFeriado = 'FIJO' | 'MOVIL' | 'TRASLADADO';

/** Calendario de feriados institucional (seccion 17-18 del pedido de
 * Guardias). Un feriado MOVIL puede trasladarse de fecha; `fechaOriginal`
 * conserva la fecha previa cuando corresponde. Trasladar un feriado nunca
 * reclasifica guardias en silencio -- ver FeriadosService.mover(). */
@Entity({ name: 'feriados', schema: 'organizacion' })
export class Feriado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'nvarchar', length: 150 })
  nombre: string;

  @Column({ type: 'nvarchar', length: 20, default: 'FIJO' })
  tipo: TipoFeriado;

  @Column({ type: 'date', nullable: true })
  fechaOriginal: string | null;

  @Column({ type: 'bit', default: true })
  esEspecial: boolean;

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
