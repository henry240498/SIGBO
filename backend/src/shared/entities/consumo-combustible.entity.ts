import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'consumos_combustible', schema: 'vehiculos' })
export class ConsumoCombustible {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  vehiculoId: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  galones: number;

  @Column({ type: 'int' })
  kilometrajeActual: number;

  @Column({ type: 'nvarchar', length: 20, default: 'DIESEL' })
  tipoCombustible: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  costo: number | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  proveedor: string | null;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  factura: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
