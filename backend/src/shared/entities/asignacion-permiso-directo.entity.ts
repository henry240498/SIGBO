import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'asignacion_permisos_directos', schema: 'seguridad' })
export class AsignacionPermisoDirecto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ type: 'uniqueidentifier' })
  permisoId: string;

  @Column({ type: 'bit', default: true })
  concedido: boolean;

  @CreateDateColumn({ name: 'fecha_asignacion', type: 'datetimeoffset', precision: 3 })
  fechaAsignacion: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  asignadoPor: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  motivo: string | null;
}
