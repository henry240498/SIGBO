import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado. */
@Entity({ name: 'gre_bloques', schema: 'matpel' })
export class GreBloque {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'version_id', type: 'uniqueidentifier' })
  versionId: string;

  @Column({ name: 'seccion_id', type: 'uniqueidentifier' })
  seccionId: string;

  @Column({ name: 'guia_id', type: 'uniqueidentifier', nullable: true })
  guiaId: string | null;

  @Column({ name: 'padre_id', type: 'uniqueidentifier', nullable: true })
  padreId: string | null;

  @Column({ name: 'orden', type: 'int' })
  orden: number;

  @Column({ name: 'encabezado_original', type: 'nvarchar', length: 500, nullable: true })
  encabezadoOriginal: string | null;

  @Column({ name: 'texto_original', type: 'nvarchar', length: 'MAX' })
  textoOriginal: string;

  @Column({ name: 'referencia_id', type: 'uniqueidentifier' })
  referenciaId: string;

}
