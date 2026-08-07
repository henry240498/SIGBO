import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'condicion_combatiente', schema: 'personal' })
export class CondicionCombatiente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'bit', default: true })
  disponibilidadOperativa: boolean;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  nivelEntrenamiento: string | null;

  @Column({ type: 'int', nullable: true })
  horasOperativas: number | null;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
