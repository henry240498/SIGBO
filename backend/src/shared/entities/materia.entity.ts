import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type NivelMateria = 'BASICO' | 'INTERMEDIO' | 'AVANZADO';

/** Catalogo de materias academicas (schema academia). */
@Entity({ name: 'materias', schema: 'academia' })
export class Materia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 20 })
  codigo: string;

  @Column({ type: 'nvarchar', length: 200 })
  nombre: string;

  @Column({ type: 'nvarchar', nullable: true })
  descripcion: string | null;

  @Column({ type: 'nvarchar', length: 20 })
  nivel: NivelMateria;

  @Column({ type: 'int', default: 0 })
  horasTeoricas: number;

  @Column({ type: 'int', default: 0 })
  horasPracticas: number;

  @Column({ type: 'int', insert: false, update: false, select: true, nullable: true })
  horasTotales: number | null;

  @Column({ type: 'bit', default: false })
  requierePracticas: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 60.0 })
  notaAprobacion: number;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
