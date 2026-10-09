import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoGreVersion = 'IMPORTANDO' | 'VALIDANDO' | 'REQUIERE_REVISION' | 'VALIDADA' | 'ERROR';

/** Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado. */
@Entity({ name: 'gre_versiones', schema: 'matpel' })
export class GreVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'documento_id', type: 'uniqueidentifier' })
  documentoId: string;

  @Column({ name: 'version_parser', type: 'nvarchar', length: 80 })
  versionParser: string;

  @Column({ name: 'version_normalizador', type: 'nvarchar', length: 80 })
  versionNormalizador: string;

  @Column({ name: 'version_esquema', type: 'nvarchar', length: 30 })
  versionEsquema: string;

  /** 0 para extracción inicial; una corrección revisada crea otra candidata. */
  @Column({ name: 'revision_correcciones', type: 'int' })
  revisionCorrecciones: number;

  @Column({ name: 'derivada_de_id', type: 'uniqueidentifier', nullable: true })
  derivadaDeId: string | null;

  @Column({ name: 'sha256_contenido', type: 'char', length: 64, nullable: true })
  sha256Contenido: string | null;

  @Column({ name: 'estado', type: 'nvarchar', length: 24 })
  estado: EstadoGreVersion;

  @Column({ name: 'reporte_json', type: 'nvarchar', length: 'MAX', nullable: true })
  reporteJson: string | null;

  @Column({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ name: 'validada_en', type: 'datetimeoffset', precision: 3, nullable: true })
  validadaEn: Date | null;

  @Column({ name: 'validada_por', type: 'uniqueidentifier', nullable: true })
  validadaPor: string | null;

}
