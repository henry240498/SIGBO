import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Pernoctar en el cuartel NO es lo mismo que estar de guardia (seccion 8
 * del pedido) -- por eso vive en tabla propia, nunca como fila de
 * asignacion_guardias. `guardiaId` es opcional, solo como contexto. */
@Entity({ name: 'pernoctes', schema: 'operaciones' })
export class Pernocte {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  guardiaId: string | null;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  horaEntrada: Date | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  horaSalida: Date | null;

  @Column({ type: 'nvarchar', nullable: true })
  motivo: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
