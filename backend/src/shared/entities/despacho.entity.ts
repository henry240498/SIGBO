import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoDespacho = 'DESPACHADO' | 'EN_SERVICIO' | 'REGRESANDO' | 'CERRADO' | 'CANCELADO';

/** Despacho de un movil a un servicio (migracion 077): salida, llegada, fin y regreso. */
@Entity({ name: 'despachos', schema: 'servicios' })
export class Despacho {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  servicioId: string;

  @Column({ type: 'uniqueidentifier' })
  vehiculoId: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  conductorId: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'DESPACHADO' })
  estado: EstadoDespacho;

  @Column({ type: 'datetimeoffset', precision: 3 })
  horaSalida: Date;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  horaLlegada: Date | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  horaFin: Date | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  horaRegreso: Date | null;

  @Column({ type: 'int', nullable: true })
  kmSalida: number | null;

  @Column({ type: 'int', nullable: true })
  kmRegreso: number | null;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  observaciones: string | null;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  motivoCancelacion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
