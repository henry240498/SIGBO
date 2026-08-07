import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'asignacion_permisos_rol', schema: 'seguridad' })
export class AsignacionPermisoRol {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  rolId: string;

  @Column({ type: 'uniqueidentifier' })
  permisoId: string;

  @CreateDateColumn({ name: 'fecha_asignacion', type: 'datetimeoffset', precision: 3 })
  fechaAsignacion: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  asignadoPor: string | null;
}
