import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type TipoMantenimientoVehiculo = 'PREVENTIVO' | 'CORRECTIVO' | 'EMERGENCIA' | 'ITV' | 'REPARACION';

@Entity({ name: 'mantenimientos_vehiculos', schema: 'vehiculos' })
export class MantenimientoVehiculo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  vehiculoId: string;

  @Column({ type: 'nvarchar', length: 30 })
  tipo: TipoMantenimientoVehiculo;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'nvarchar' })
  descripcion: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  costo: number | null;

  @Column({ type: 'int', nullable: true })
  kilometraje: number | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  taller: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  responsable: string | null;

  @Column({ type: 'date', nullable: true })
  proximoMantenimiento: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  archivoUrl: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
