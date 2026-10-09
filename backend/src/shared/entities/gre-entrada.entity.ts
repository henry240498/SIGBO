import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado. */
@Entity({ name: 'gre_entradas', schema: 'matpel' })
export class GreEntrada {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'version_id', type: 'uniqueidentifier' })
  versionId: string;

  @Column({ name: 'nombre_original', type: 'nvarchar', length: 1000 })
  nombreOriginal: string;

  @Column({ name: 'nombre_normalizado', type: 'nvarchar', length: 400 })
  nombreNormalizado: string;

  @Column({ name: 'identificador', type: 'char', length: 4, nullable: true })
  identificador: string | null;

  @Column({ name: 'tipo_identificador', type: 'nvarchar', length: 20, nullable: true })
  tipoIdentificador: string | null;

  @Column({ name: 'guia_id', type: 'uniqueidentifier', nullable: true })
  guiaId: string | null;

  @Column({ name: 'polimerizable', type: 'bit', nullable: true })
  polimerizable: boolean | null;

  @Column({ name: 'resaltado_verde', type: 'bit', nullable: true })
  resaltadoVerde: boolean | null;

  @Column({ name: 'referencia_id', type: 'uniqueidentifier' })
  referenciaId: string;

}
