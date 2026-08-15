import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type OrigenDocumento = 'INTERNO' | 'EXTERNO';

/** Ficha central de un documento institucional (seccion 6 del pedido).
 * `estadoId`/`tipoDocumentoId`/`categoriaDocumentoId`/`nivelConfidencialidadId`
 * referencian organizacion.parametros -- parametrizables per seccion 3-4-11-32,
 * pero las transiciones de estado se validan en codigo por nombre (ver
 * DocumentosService), no cualquier valor vale desde cualquier otro.
 * `archivoUrl` es SIEMPRE el archivo vigente; el historico de versiones
 * anteriores vive en documentos.versiones_archivo (nunca se sobrescribe
 * silenciosamente -- seccion 12). */
@Entity({ name: 'documentos_institucionales', schema: 'documentos' })
export class Documento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  numeroDocumental: string | null;

  @Column({ type: 'uniqueidentifier' })
  tipoDocumentoId: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  categoriaDocumentoId: string | null;

  @Column({ type: 'nvarchar', length: 300 })
  titulo: string;

  @Column({ type: 'nvarchar', nullable: true })
  descripcion: string | null;

  @Column({ type: 'nvarchar', length: 10, default: 'INTERNO' })
  origen: OrigenDocumento;

  @Column({ type: 'date' })
  fechaEmision: string;

  @Column({ type: 'date', nullable: true })
  fechaInicioVigencia: string | null;

  @Column({ type: 'date', nullable: true })
  fechaVencimiento: string | null;

  @Column({ type: 'uniqueidentifier' })
  estadoId: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'uniqueidentifier', nullable: true })
  nivelConfidencialidadId: string | null;

  @Column({ type: 'bit', default: false })
  esFisico: boolean;

  @Column({ type: 'uniqueidentifier', nullable: true })
  archivoFisicoId: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  estante: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  caja: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  carpeta: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  archivoUrl: string | null;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  archivoNombreOriginal: string | null;

  @Column({ type: 'nvarchar', length: 10, nullable: true })
  archivoExtension: string | null;

  @Column({ type: 'bigint', nullable: true })
  archivoTamanoBytes: number | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  expedienteId: string | null;

  @Column({ type: 'int', nullable: true })
  ordenEnExpediente: number | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  plantillaId: string | null;

  /** Slug del modulo que genero el documento (ej 'guardias', 'servicios'),
   * null si fue creado directamente en Documentos. */
  @Column({ type: 'nvarchar', length: 50, nullable: true })
  generadoPorModulo: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  motivoAnulacionId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  anuladoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaAnulacion: Date | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
