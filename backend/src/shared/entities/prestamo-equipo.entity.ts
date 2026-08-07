import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoPrestamoEquipo = 'PRESTADO' | 'DEVUELTO' | 'EXTRAVIADO' | 'DANIADO';

@Entity({ name: 'prestamos_equipos', schema: 'equipos' })
export class PrestamoEquipo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  equipoId: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  bomberoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  servicioId: string | null;

  @Column({ type: 'date' })
  fechaPrestamo: string;

  @Column({ type: 'date', nullable: true })
  fechaDevolucion: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'PRESTADO' })
  estado: EstadoPrestamoEquipo;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
