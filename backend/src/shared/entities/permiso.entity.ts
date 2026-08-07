import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'permisos', schema: 'seguridad' })
export class Permiso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 100 })
  nombre: string;

  @Column({ type: 'nvarchar', nullable: true })
  descripcion: string | null;

  @Column({ type: 'nvarchar', length: 50 })
  recurso: string;

  @Column({ type: 'nvarchar', length: 50 })
  accion: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  categoria: string | null;

  @Column({ name: 'es_sistema', type: 'bit', default: false })
  esSistema: boolean;

  @Column({ type: 'nvarchar', nullable: true })
  metadata: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
