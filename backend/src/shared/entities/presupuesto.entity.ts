import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** Presupuesto de una categoria de egreso para un ejercicio (seccion
 * 14 del pedido). El "ejecutado" y el "disponible" NUNCA se guardan
 * aca -- se calculan en tiempo real sumando
 * finanzas.movimientos_financieros (ver PresupuestosService), para que
 * nunca queden desincronizados. */
@Entity({ name: 'presupuestos', schema: 'finanzas' })
export class Presupuesto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  ejercicioId: string;

  /** Referencia a organizacion.parametros (tipo CATEGORIA_EGRESO_FINANZAS). */
  @Column({ type: 'uniqueidentifier' })
  categoriaEgresoId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  montoPresupuestado: number;

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
