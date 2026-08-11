import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type TipoComunicacionServicio = 'OTRAS_OCURRENCIAS' | 'INCENDIO';
export type EstadoComunicacionServicio = 'BORRADOR' | 'PENDIENTE_REVISION' | 'OBSERVADO' | 'FINALIZADA' | 'ANULADO';

/** Formulario digital completo vinculado a un servicio operativo. */
@Entity({ name: 'comunicaciones_servicio', schema: 'servicios' })
export class ComunicacionServicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  servicioId: string;

  @Column({ type: 'nvarchar', length: 30 })
  tipo: TipoComunicacionServicio;

  @Column({ type: 'nvarchar', length: 20, default: 'BORRADOR' })
  estado: EstadoComunicacionServicio;

  @Column({ type: 'nvarchar' })
  datos: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  finalizadoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  finalizadoEn: Date | null;

  @Column({ type: 'nvarchar', nullable: true })
  motivoEstado: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
