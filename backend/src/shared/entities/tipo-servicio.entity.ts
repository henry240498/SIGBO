import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Catalogo configurable de tipos de servicio (schema servicios). */
@Entity({ name: 'tipos_servicio', schema: 'servicios' })
export class TipoServicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 20 })
  codigo: string;

  @Column({ type: 'nvarchar', length: 100 })
  nombre: string;

  @Column({ type: 'nvarchar', nullable: true })
  descripcion: string | null;

  @Column({ type: 'nvarchar', length: 7, default: '#3B82F6' })
  color: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  icono: string | null;

  @Column({ type: 'int', default: 0 })
  prioridad: number;

  @Column({ type: 'bit', default: false })
  requiereRo: boolean;

  @Column({ type: 'bit', default: true })
  requiereVehiculo: boolean;

  @Column({ type: 'int', nullable: true })
  tiempoEstimadoMinutos: number | null;

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @Column({ type: 'nvarchar', nullable: true })
  metadata: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
