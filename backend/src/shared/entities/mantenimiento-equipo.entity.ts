import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type TipoMantenimientoEquipo = 'PREVENTIVO' | 'CORRECTIVO' | 'CALIBRACION';

@Entity({ name: 'mantenimientos_equipos', schema: 'equipos' })
export class MantenimientoEquipo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  equipoId: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'nvarchar', length: 30 })
  tipo: TipoMantenimientoEquipo;

  @Column({ type: 'nvarchar' })
  descripcion: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  costo: number | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  proveedor: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  tecnico: string | null;

  @Column({ type: 'date', nullable: true })
  proximoMantenimiento: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  archivoUrl: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
