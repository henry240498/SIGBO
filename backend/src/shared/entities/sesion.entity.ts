import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sesiones', schema: 'seguridad' })
export class Sesion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ type: 'nvarchar', length: 255 })
  refreshTokenHash: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  userAgent: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  dispositivo: string | null;

  @CreateDateColumn({ name: 'fecha_inicio', type: 'datetimeoffset', precision: 3 })
  fechaInicio: Date;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaExpiracion: Date | null;

  @Column({ type: 'datetimeoffset', precision: 3, default: () => 'SYSDATETIMEOFFSET()' })
  fechaUltimaActividad: Date;

  @Column({ type: 'bit', default: true })
  activa: boolean;

  @Column({ type: 'nvarchar', nullable: true })
  sessionData: string | null;
}
