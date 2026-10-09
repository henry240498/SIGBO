import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado. */
@Entity({ name: 'gre_reglas', schema: 'matpel' })
export class GreRegla {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'version_id', type: 'uniqueidentifier' })
  versionId: string;

  @Column({ name: 'codigo', type: 'nvarchar', length: 80 })
  codigo: string;

  @Column({ name: 'tipo_uso', type: 'nvarchar', length: 20 })
  tipoUso: string;

  @Column({ name: 'texto_original', type: 'nvarchar', length: 'MAX' })
  textoOriginal: string;

  @Column({ name: 'condiciones_json', type: 'nvarchar', length: 'MAX', nullable: true })
  condicionesJson: string | null;

  @Column({ name: 'parametros_json', type: 'nvarchar', length: 'MAX', nullable: true })
  parametrosJson: string | null;

  @Column({ name: 'version_interpretacion', type: 'nvarchar', length: 80, nullable: true })
  versionInterpretacion: string | null;

  @Column({ name: 'ejecutable', type: 'bit' })
  ejecutable: boolean;

  @Column({ name: 'referencia_id', type: 'uniqueidentifier' })
  referenciaId: string;

}
