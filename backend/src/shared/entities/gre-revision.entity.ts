import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado. */
@Entity({ name: 'gre_revisiones', schema: 'matpel' })
export class GreRevision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'version_id', type: 'uniqueidentifier' })
  versionId: string;

  @Column({ name: 'campo_fuente_id', type: 'uniqueidentifier' })
  campoFuenteId: string;

  @Column({ name: 'resultado', type: 'nvarchar', length: 20 })
  resultado: string;

  @Column({ name: 'valor_anterior_json', type: 'nvarchar', length: 'MAX', nullable: true })
  valorAnteriorJson: string | null;

  @Column({ name: 'valor_propuesto_json', type: 'nvarchar', length: 'MAX', nullable: true })
  valorPropuestoJson: string | null;

  @Column({ name: 'fundamento', type: 'nvarchar', length: 'MAX' })
  fundamento: string;

  @Column({ name: 'revisada_por', type: 'uniqueidentifier' })
  revisadaPor: string;

  @Column({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

}
