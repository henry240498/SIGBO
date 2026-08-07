import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'condicion_incorporado', schema: 'personal' })
export class CondicionIncorporado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'date', nullable: true })
  fechaIncorporacion: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  formacionInicial: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  cursosRealizados: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  evaluaciones: string | null;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  estadoPreparacion: string | null;

  @Column({ type: 'date', nullable: true })
  fechaHabilitacion: string | null;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
