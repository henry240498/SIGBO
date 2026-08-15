import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Documento respaldatorio de un movimiento u orden de pago (seccion
 * 10 del pedido): factura/recibo/comprobante con relacion documental
 * real, nunca solo el nombre del archivo suelto. */
@Entity({ name: 'documentos_respaldo', schema: 'finanzas' })
export class DocumentoRespaldo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  movimientoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  ordenPagoId: string | null;

  /** Referencia a organizacion.parametros (tipo TIPO_DOCUMENTO_FINANZAS). */
  @Column({ type: 'uniqueidentifier' })
  tipoDocumentoId: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  numero: string | null;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  timbrado: string | null;

  @Column({ type: 'date', nullable: true })
  fecha: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  proveedorId: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  importe: number | null;

  @Column({ type: 'nvarchar', nullable: true })
  archivoUrl: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
