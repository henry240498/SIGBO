import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Un firmante requerido de un documento (secciones 9-10 del pedido).
 * Exactamente uno de cargoFirmanteId/bomberoFirmanteId (CK_docf_firmante
 * en SQL): por cargo se resuelve automaticamente quien lo ocupa hoy
 * (resolverFirmante), por bombero es una persona puntual fija. Firma
 * parcial: si un documento requiere 2 firmantes y solo uno esta
 * autorizado para firma digital, esa fila queda `firmado=1` con
 * `firmaUrl` cargada y la otra permanece `firmado=0` -- el generador
 * de PDF/DOCX deja el renglon en blanco para esa segunda firma. */
@Entity({ name: 'firmas_documento', schema: 'documentos' })
export class FirmaDocumento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  documentoId: string;

  @Column({ type: 'int', default: 1 })
  orden: number;

  @Column({ type: 'uniqueidentifier', nullable: true })
  cargoFirmanteId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  bomberoFirmanteId: string | null;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  etiquetaRol: string | null;

  @Column({ type: 'bit', default: false })
  firmado: boolean;

  @Column({ type: 'nvarchar', nullable: true })
  firmaUrl: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaFirma: Date | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  firmadoPor: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
