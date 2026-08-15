import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type TipoElementoDeposito = 'EQUIPO' | 'ARTICULO';

/** "Donde/con quien esta esto AHORA" -- la tabla de consulta rapida que
 * responde la pregunta central del pedido. Se actualiza EXCLUSIVAMENTE
 * junto con un deposito.movimientos en la misma transaccion (nunca se edita
 * sola -- ver DepositoMovimientosService). Un elemento con trazabilidad
 * individual (`tipo_elemento='EQUIPO'`) tiene una unica fila activa; un
 * articulo por cantidad (`tipo_elemento='ARTICULO'`) puede tener varias
 * filas (una por cada ubicacion/tenedor donde hay stock repartido), cada
 * una con su `cantidad`. */
@Entity({ name: 'tenencias', schema: 'deposito' })
export class TenenciaDeposito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 10 })
  tipoElemento: TipoElementoDeposito;

  /** Referencia a equipos.equipos -- NUNCA se duplica la ficha del equipo. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  equipoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  articuloId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  loteId: string | null;

  /** Solo aplica cuando tipoElemento = ARTICULO. */
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  cantidad: number | null;

  /** Referencia a organizacion.parametros (tipo TIPO_TENENCIA_DEPOSITO). */
  @Column({ type: 'uniqueidentifier' })
  tipoTenenciaId: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  ubicacionId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  vehiculoId: string | null;

  /** Custodio actual (responsable fisico), cuando la tenencia es "Con personal". */
  @Column({ type: 'uniqueidentifier', nullable: true })
  bomberoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  servicioId: string | null;

  /** Referencia a organizacion.parametros (tipo ESTADO_ELEMENTO_DEPOSITO). */
  @Column({ type: 'uniqueidentifier' })
  estadoElementoId: string;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
