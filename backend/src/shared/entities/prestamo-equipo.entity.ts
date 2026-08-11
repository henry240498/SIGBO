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

  @Column({ type: 'datetimeoffset', precision: 3 })
  fechaPrestamo: Date;

  /** Fecha/hora en la que el equipo deberia devolverse (comprometida, ingresada
   * al prestar). Distinta de `fechaDevolucion`, que es la devolucion real. */
  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaDevolucionComprometida: Date | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaDevolucion: Date | null;

  @Column({ type: 'nvarchar', length: 20, default: 'PRESTADO' })
  estado: EstadoPrestamoEquipo;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
