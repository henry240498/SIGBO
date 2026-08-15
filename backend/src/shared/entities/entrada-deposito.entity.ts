import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Encabezado de una entrada de deposito (seccion 10-12 del pedido):
 * compra, donacion, transferencia, devolucion, recuperacion u otro.
 * `tipoEntradaId` reutiliza organizacion.parametros (tipo
 * TIPO_MOVIMIENTO_DEPOSITO) -- no crea un catalogo paralelo. Registrar
 * una entrada crea automaticamente los movimientos correspondientes
 * (uno por item), nunca se factura aparte a mano. */
@Entity({ name: 'entradas', schema: 'deposito' })
export class EntradaDeposito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  tipoEntradaId: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  proveedorId: string | null;

  /** Para donaciones sin proveedor formal (seccion 11). */
  @Column({ type: 'nvarchar', length: 200, nullable: true })
  donanteNombre: string | null;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  donanteDocumento: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  numeroDocumento: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  valorTotal: number | null;

  @Column({ type: 'uniqueidentifier' })
  ubicacionDestinoId: string;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
