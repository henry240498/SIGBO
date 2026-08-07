import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'condicion_apoyo_economico', schema: 'personal' })
export class CondicionApoyoEconomico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  comision: string | null;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  funcion: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  responsabilidades: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  actividades: string | null;

  @Column({ type: 'date', nullable: true })
  periodoInicio: string | null;

  @Column({ type: 'date', nullable: true })
  periodoFin: string | null;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
