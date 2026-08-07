import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'usuario_telefonos', schema: 'seguridad' })
export class UsuarioTelefono {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ type: 'nvarchar', length: 30 })
  numero: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  etiqueta: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
