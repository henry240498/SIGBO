import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'usuario_correos', schema: 'seguridad' })
export class UsuarioCorreo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ type: 'nvarchar', length: 255 })
  correo: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  etiqueta: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
