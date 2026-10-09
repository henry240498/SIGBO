import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado. */
@Entity({ name: 'gre_activaciones_historial', schema: 'matpel' })
export class GreActivacionHistorial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'idioma', type: 'nvarchar', length: 10 })
  idioma: string;

  @Column({ name: 'version_id', type: 'uniqueidentifier' })
  versionId: string;

  @Column({ name: 'version_anterior_id', type: 'uniqueidentifier', nullable: true })
  versionAnteriorId: string | null;

  @Column({ name: 'revision', type: 'int' })
  revision: number;

  @Column({ name: 'clave_idempotencia', type: 'uniqueidentifier' })
  claveIdempotencia: string;

  @Column({ name: 'activada_por', type: 'uniqueidentifier' })
  activadaPor: string;

  @Column({ name: 'fundamento', type: 'nvarchar', length: 'MAX' })
  fundamento: string;

  @Column({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

}
