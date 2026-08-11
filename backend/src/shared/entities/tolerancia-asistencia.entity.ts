import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** Reglas de tolerancia de horario parametrizables por tipo de evento (NULL =
 * regla general por defecto) -- nunca codificadas rigidamente en el backend. */
@Entity({ name: 'tolerancias_asistencia', schema: 'operaciones' })
export class ToleranciaAsistencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  tipoEventoId: string | null;

  @Column({ type: 'int', default: 0 })
  minutosToleranciaEntrada: number;

  @Column({ type: 'int', default: 0 })
  minutosToleranciaSalida: number;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVO' })
  estado: 'ACTIVO' | 'INACTIVO';

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
