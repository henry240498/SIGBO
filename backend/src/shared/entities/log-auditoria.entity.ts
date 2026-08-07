import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'logs_auditoria', schema: 'seguridad' })
export class LogAuditoria {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  usuarioId: string | null;

  @Column({ type: 'nvarchar', length: 100 })
  accion: string;

  @Column({ type: 'nvarchar', length: 100 })
  recurso: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  recursoId: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  userAgent: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  datosAntes: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  datosDespues: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  metadata: string | null;

  @CreateDateColumn({ type: 'datetimeoffset', precision: 3 })
  fecha: Date;
}
