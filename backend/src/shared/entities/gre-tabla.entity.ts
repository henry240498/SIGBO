import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado. */
@Entity({ name: 'gre_tablas', schema: 'matpel' })
export class GreTabla {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'version_id', type: 'uniqueidentifier' })
  versionId: string;

  @Column({ name: 'seccion_id', type: 'uniqueidentifier' })
  seccionId: string;

  @Column({ name: 'codigo', type: 'nvarchar', length: 80 })
  codigo: string;

  @Column({ name: 'titulo_original', type: 'nvarchar', length: 500 })
  tituloOriginal: string;

  @Column({ name: 'estructura_json', type: 'nvarchar', length: 'MAX' })
  estructuraJson: string;

  @Column({ name: 'referencia_id', type: 'uniqueidentifier' })
  referenciaId: string;

}
