import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado. */
@Entity({ name: 'gre_paginas', schema: 'matpel' })
export class GrePagina {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'version_id', type: 'uniqueidentifier' })
  versionId: string;

  @Column({ name: 'pagina_pdf', type: 'int' })
  paginaPdf: number;

  @Column({ name: 'etiqueta_pdf', type: 'nvarchar', length: 80 })
  etiquetaPdf: string;

  @Column({ name: 'etiquetas_impresas_json', type: 'nvarchar', length: 'MAX' })
  etiquetasImpresasJson: string;

  @Column({ name: 'ancho_pt', type: 'float' })
  anchoPt: number;

  @Column({ name: 'alto_pt', type: 'float' })
  altoPt: number;

  @Column({ name: 'rotacion', type: 'int' })
  rotacion: number;

  @Column({ name: 'sha256_texto_nativo', type: 'char', length: 64 })
  sha256TextoNativo: string;

  @Column({ name: 'caracteres_texto', type: 'int' })
  caracteresTexto: number;

  @Column({ name: 'numeracion_ambigua', type: 'bit' })
  numeracionAmbigua: boolean;

}
