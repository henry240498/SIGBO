import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado. */
@Entity({ name: 'gre_referencias', schema: 'matpel' })
export class GreReferencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'version_id', type: 'uniqueidentifier' })
  versionId: string;

  @Column({ name: 'pagina_pdf', type: 'int' })
  paginaPdf: number;

  @Column({ name: 'seccion_id', type: 'uniqueidentifier', nullable: true })
  seccionId: string | null;

  @Column({ name: 'texto_original', type: 'nvarchar', length: 'MAX' })
  textoOriginal: string;

  @Column({ name: 'metodo', type: 'nvarchar', length: 30 })
  metodo: string;

  @Column({ name: 'caja_pt_json', type: 'nvarchar', length: 'MAX', nullable: true })
  cajaPtJson: string | null;

  @Column({ name: 'sistema_coordenadas', type: 'nvarchar', length: 30 })
  sistemaCoordenadas: string;

  @Column({ name: 'orientacion', type: 'int', nullable: true })
  orientacion: number | null;

  @Column({ name: 'confianza', type: 'float', nullable: true })
  confianza: number | null;

  @Column({ name: 'estado_revision', type: 'nvarchar', length: 15 })
  estadoRevision: string;

}
