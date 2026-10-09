import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado. */
@Entity({ name: 'gre_guias', schema: 'matpel' })
export class GreGuia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'version_id', type: 'uniqueidentifier' })
  versionId: string;

  @Column({ name: 'numero', type: 'char', length: 3 })
  numero: string;

  @Column({ name: 'titulo_original', type: 'nvarchar', length: 500, nullable: true })
  tituloOriginal: string | null;

  @Column({ name: 'estado_contenido', type: 'nvarchar', length: 24 })
  estadoContenido: string;

  @Column({ name: 'referencia_id', type: 'uniqueidentifier' })
  referenciaId: string;

}
