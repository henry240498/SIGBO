import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type TipoEvidenciaDenuncia = 'AUDIO' | 'EVIDENCIA';

@Entity({ name: 'evidencias_denuncia', schema: 'denuncias' })
export class EvidenciaDenuncia {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'uniqueidentifier' }) denunciaId: string;
  @Column({ type: 'nvarchar', length: 15 }) tipo: TipoEvidenciaDenuncia;
  @Column({ type: 'nvarchar', length: 255 }) nombreOriginal: string;
  @Column({ type: 'nvarchar', length: 80 }) nombreAlmacenado: string;
  @Column({ type: 'nvarchar', length: 100 }) mimeType: string;
  @Column({ type: 'int' }) tamanoBytes: number;
  @Column({ type: 'int', nullable: true }) duracionSegundos: number | null;
  @Column({ type: 'char', length: 64 }) hashSha256: string;
  @CreateDateColumn({ type: 'datetimeoffset', precision: 3 }) creadoEn: Date;
}
