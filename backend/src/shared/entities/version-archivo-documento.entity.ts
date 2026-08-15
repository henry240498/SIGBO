import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Historico append-only de cada archivo que fue el "vigente" de un
 * documento (seccion 12): al cargar una version nueva, el archivo que
 * estaba vigente se snapshotea aca antes de reemplazarse en
 * Documento.archivoUrl -- nunca se pierde, consultable si el usuario
 * tiene permiso. */
@Entity({ name: 'versiones_archivo', schema: 'documentos' })
export class VersionArchivoDocumento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  documentoId: string;

  @Column({ type: 'int' })
  numeroVersion: number;

  @Column({ type: 'nvarchar' })
  archivoUrl: string;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  archivoNombreOriginal: string | null;

  @Column({ type: 'nvarchar', length: 10, nullable: true })
  archivoExtension: string | null;

  @Column({ type: 'bigint', nullable: true })
  archivoTamanoBytes: number | null;

  @Column({ type: 'nvarchar', nullable: true })
  motivo: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
