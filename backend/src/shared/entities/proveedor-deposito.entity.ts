import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoProveedorDeposito = 'ACTIVO' | 'INACTIVO';

/** Catalogo de proveedores, compartido entre Deposito y (a futuro)
 * Finanzas -- se registra aca primero porque Deposito lo necesita antes;
 * Finanzas debe reutilizarlo, nunca duplicarlo. */
@Entity({ name: 'proveedores', schema: 'deposito' })
export class ProveedorDeposito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 200 })
  razonSocial: string;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  nombreComercial: string | null;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  ruc: string | null;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  direccion: string | null;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  telefono: string | null;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  contacto: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVO' })
  estado: EstadoProveedorDeposito;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
