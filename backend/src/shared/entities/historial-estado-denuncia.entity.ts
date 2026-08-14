import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'historial_estados_denuncia', schema: 'denuncias' })
export class HistorialEstadoDenuncia {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uniqueidentifier' }) denunciaId: string;
  @Column({ type: 'nvarchar', length: 25, nullable: true }) estadoAnterior: string | null;
  @Column({ type: 'nvarchar', length: 25 }) estadoNuevo: string;
  @Column({ type: 'uniqueidentifier', nullable: true }) usuarioId: string | null;
  @Column({ type: 'nvarchar', nullable: true }) comentario: string | null;
  @CreateDateColumn({ type: 'datetimeoffset', precision: 3 }) fecha: Date;
}
