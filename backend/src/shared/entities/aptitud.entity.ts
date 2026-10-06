import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type CategoriaAptitud = 'MEDICA' | 'LICENCIA' | 'OTRA';

/** Aptitud con vencimiento de un bombero (carnet de salud, vacuna, licencia...). Migracion 082. */
@Entity({ name: 'aptitudes', schema: 'personal' })
export class Aptitud {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'nvarchar', length: 10, default: 'OTRA' })
  categoria: CategoriaAptitud;

  @Column({ type: 'nvarchar', length: 80 })
  tipo: string;

  @Column({ type: 'date', nullable: true })
  emitidoEn: string | null;

  @Column({ type: 'date' })
  venceEn: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  observacion: string | null;

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
