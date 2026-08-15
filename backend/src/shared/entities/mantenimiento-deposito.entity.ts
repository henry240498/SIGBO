import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TipoElementoDeposito } from './tenencia-deposito.entity';

export type EstadoMantenimientoDeposito = 'EN_PROCESO' | 'FINALIZADO';

/** Mantenimiento de un elemento (seccion 14 del pedido): a diferencia del
 * estado generico ESTADO_ELEMENTO_DEPOSITO='En mantenimiento', esta tabla
 * guarda los campos estructurados que pedia el negocio -- taller/responsable,
 * fecha estimada de salida, fecha real, costo -- en vez de dejarlos sueltos
 * en observacion. `movimientoIngresoId`/`movimientoSalidaId` enlazan con el
 * historial real de deposito.movimientos (el mantenimiento nunca mueve la
 * tenencia por fuera de ese mecanismo). */
@Entity({ name: 'mantenimientos', schema: 'deposito' })
export class MantenimientoDeposito {
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

  @Column({ type: 'nvarchar', length: 300 })
  motivo: string;

  /** Responsable interno (bombero/tecnico propio) cuando corresponde. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  responsableId: string | null;

  /** Taller externo cuando el mantenimiento no lo hace personal propio. */
  @Column({ type: 'nvarchar', length: 200, nullable: true })
  tallerExterno: string | null;

  @Column({ type: 'date' })
  fechaIngreso: string;

  @Column({ type: 'date', nullable: true })
  fechaEstimadaSalida: string | null;

  @Column({ type: 'date', nullable: true })
  fechaSalidaReal: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  costo: number | null;

  @Column({ type: 'nvarchar', length: 20, default: 'EN_PROCESO' })
  estado: EstadoMantenimientoDeposito;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  /** Ubicacion desde donde salio el elemento -- adonde vuelve al finalizar. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  ubicacionOrigenId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  movimientoIngresoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  movimientoSalidaId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
