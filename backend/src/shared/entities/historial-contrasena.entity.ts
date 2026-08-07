import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'historial_contrasenas', schema: 'seguridad' })
export class HistorialContrasena {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ name: 'password_hash', type: 'nvarchar', length: 255 })
  passwordHash: string;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
