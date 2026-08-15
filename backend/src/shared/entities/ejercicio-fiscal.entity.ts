import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoEjercicioFiscal = 'ABIERTO' | 'CERRADO';

/** Periodo anual de Finanzas (seccion 15 del pedido): todo movimiento
 * financiero pertenece a un ejercicio, nunca se mezclan entre anios. */
@Entity({ name: 'ejercicios_fiscales', schema: 'finanzas' })
export class EjercicioFiscal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  anio: number;

  @Column({ type: 'date' })
  fechaInicio: string;

  @Column({ type: 'date' })
  fechaFin: string;

  @Column({ type: 'nvarchar', length: 20, default: 'ABIERTO' })
  estado: EstadoEjercicioFiscal;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
