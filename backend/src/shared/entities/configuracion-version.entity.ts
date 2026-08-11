import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'configuracion_versiones', schema: 'seguridad' })
export class ConfiguracionVersion {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'int' }) numero: number;
  @Column({ type: 'nvarchar', length: 30 }) estado: 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO';
  @Column({ name: 'valores_json', type: 'nvarchar', length: 'MAX' }) valoresJson: string;
  @Column({ type: 'nvarchar', length: 500, nullable: true }) motivo: string | null;
  @Column({ name: 'base_version', type: 'int', nullable: true }) baseVersion: number | null;
  @Column({ name: 'creado_por', type: 'uniqueidentifier' }) creadoPor: string;
  @Column({ name: 'publicado_por', type: 'uniqueidentifier', nullable: true }) publicadoPor: string | null;
  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 }) creadoEn: Date;
  @Column({ name: 'publicado_en', type: 'datetimeoffset', precision: 3, nullable: true }) publicadoEn: Date | null;
}
