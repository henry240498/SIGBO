import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado. */
@Entity({ name: 'gre_aliases', schema: 'matpel' })
export class GreAlias {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'version_id', type: 'uniqueidentifier' })
  versionId: string;

  @Column({ name: 'entrada_id', type: 'uniqueidentifier' })
  entradaId: string;

  @Column({ name: 'nombre_original', type: 'nvarchar', length: 1000 })
  nombreOriginal: string;

  @Column({ name: 'nombre_normalizado', type: 'nvarchar', length: 400 })
  nombreNormalizado: string;

  @Column({ name: 'referencia_id', type: 'uniqueidentifier' })
  referenciaId: string;

}
