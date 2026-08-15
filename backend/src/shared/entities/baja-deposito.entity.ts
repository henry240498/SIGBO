import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TipoElementoDeposito } from './tenencia-deposito.entity';

/** Baja de un elemento (seccion 13 del pedido): nunca elimina el registro
 * fisicamente -- el elemento pasa a estado BAJA (tenencia.estadoElementoId)
 * y permanece en el historial. `motivoBajaId` referencia
 * organizacion.parametros (tipo MOTIVO_BAJA_DEPOSITO). */
@Entity({ name: 'bajas', schema: 'deposito' })
export class BajaDeposito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 10 })
  tipoElemento: TipoElementoDeposito;

  @Column({ type: 'uniqueidentifier', nullable: true })
  articuloId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  equipoId: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  cantidad: number | null;

  @Column({ type: 'uniqueidentifier' })
  motivoBajaId: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  responsableId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  autorizadoPor: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  documentoUrl: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  movimientoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
