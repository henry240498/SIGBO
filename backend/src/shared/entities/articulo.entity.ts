import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoArticulo = 'ACTIVO' | 'INACTIVO';

/** Item de inventario por CANTIDAD (guantes descartables, agua, material de
 * limpieza, insumos). Distinto de un elemento con trazabilidad individual,
 * que sigue viviendo en equipos.equipos (nunca duplicado aqui). El id es un
 * GUID tecnico interno; `codigo` es el codigo institucional, editable,
 * independiente del id, con control de duplicados. */
@Entity({ name: 'articulos', schema: 'deposito' })
export class Articulo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 50 })
  codigo: string;

  @Column({ type: 'nvarchar', length: 200 })
  nombre: string;

  @Column({ type: 'nvarchar', nullable: true })
  descripcion: string | null;

  @Column({ type: 'uniqueidentifier' })
  categoriaArticuloId: string;

  /** Referencia a organizacion.parametros (tipo UNIDAD_MEDIDA_DEPOSITO). */
  @Column({ type: 'uniqueidentifier', nullable: true })
  unidadMedidaId: string | null;

  /** Total fisico actual. Nunca se edita a mano: solo cambia como
   * consecuencia de un movimiento (entrada/salida/consumo/ajuste). Las
   * cantidades disponible/asignada/prestada se derivan en tiempo de
   * consulta a partir de deposito.tenencias, no se duplican aqui. */
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  stockActual: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  stockMinimo: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  stockMaximo: number | null;

  @Column({ type: 'bit', default: false })
  controlaLote: boolean;

  @Column({ type: 'bit', default: false })
  controlaVencimiento: boolean;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVO' })
  estado: EstadoArticulo;

  /** Campo preparado para multi-institucion futura; sin scoping real aun. */
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
