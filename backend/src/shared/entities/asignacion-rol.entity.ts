import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'asignacion_roles', schema: 'seguridad' })
export class AsignacionRol {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ type: 'uniqueidentifier' })
  rolId: string;

  @CreateDateColumn({ name: 'fecha_asignacion', type: 'datetimeoffset', precision: 3 })
  fechaAsignacion: Date;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaExpiracion: Date | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  asignadoPor: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  motivo: string | null;
}
