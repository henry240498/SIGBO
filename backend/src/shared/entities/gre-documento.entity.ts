import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado. */
@Entity({ name: 'gre_documentos', schema: 'matpel' })
export class GreDocumento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sha256', type: 'char', length: 64 })
  sha256: string;

  @Column({ name: 'referencia_privada', type: 'nvarchar', length: 100 })
  referenciaPrivada: string;

  @Column({ name: 'tamano_bytes', type: 'int' })
  tamanoBytes: number;

  @Column({ name: 'paginas', type: 'int' })
  paginas: number;

  @Column({ name: 'titulo', type: 'nvarchar', length: 400 })
  titulo: string;

  @Column({ name: 'edicion', type: 'nvarchar', length: 20 })
  edicion: string;

  @Column({ name: 'idioma', type: 'nvarchar', length: 10 })
  idioma: string;

  @Column({ name: 'identificacion_json', type: 'nvarchar', length: 'MAX' })
  identificacionJson: string;

  @Column({ name: 'incorporada_por', type: 'uniqueidentifier' })
  incorporadaPor: string;

  @Column({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

}
