import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoCuentaBancaria = 'ACTIVA' | 'INACTIVA';

/** Cuenta bancaria institucional (seccion 11 del pedido). El
 * controller la protege con un permiso de lectura mas estricto para no
 * mostrar numero de cuenta a cualquier usuario -- ver
 * CuentasBancariasController. */
@Entity({ name: 'cuentas_bancarias', schema: 'finanzas' })
export class CuentaBancaria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 150 })
  banco: string;

  @Column({ type: 'nvarchar', length: 50 })
  numeroCuenta: string;

  /** Referencia a organizacion.parametros (tipo TIPO_CUENTA_BANCARIA_FINANZAS). */
  @Column({ type: 'uniqueidentifier', nullable: true })
  tipoCuentaId: string | null;

  @Column({ type: 'nvarchar', length: 3, default: 'PYG' })
  moneda: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  responsableId: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVA' })
  estado: EstadoCuentaBancaria;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldoActual: number;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

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
