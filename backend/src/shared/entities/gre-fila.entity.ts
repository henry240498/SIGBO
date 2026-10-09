import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado. */
@Entity({ name: 'gre_filas', schema: 'matpel' })
export class GreFila {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'version_id', type: 'uniqueidentifier' })
  versionId: string;

  @Column({ name: 'tabla_id', type: 'uniqueidentifier' })
  tablaId: string;

  @Column({ name: 'orden', type: 'int' })
  orden: number;

  @Column({ name: 'entrada_id', type: 'uniqueidentifier', nullable: true })
  entradaId: string | null;

  @Column({ name: 'etiqueta_original', type: 'nvarchar', length: 1000, nullable: true })
  etiquetaOriginal: string | null;

  @Column({ name: 'condiciones_json', type: 'nvarchar', length: 'MAX', nullable: true })
  condicionesJson: string | null;

  @Column({ name: 'referencia_id', type: 'uniqueidentifier' })
  referenciaId: string;

}
