import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoEquipo = 'OPERATIVO' | 'EN_MANTENIMIENTO' | 'DANIADO' | 'BAJA' | 'PRESTADO';

@Entity({ name: 'equipos', schema: 'equipos' })
export class Equipo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  categoriaId: string;

  @Column({ type: 'nvarchar', length: 50 })
  codigoInterno: string;

  @Column({ type: 'nvarchar', length: 200 })
  nombre: string;

  @Column({ type: 'nvarchar', nullable: true })
  descripcion: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  marca: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  modelo: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  numeroSerie: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'OPERATIVO' })
  estado: EstadoEquipo;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  ubicacion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  responsableId: string | null;

  @Column({ type: 'date', nullable: true })
  fechaCompra: string | null;

  @Column({ type: 'date', nullable: true })
  fechaVencimiento: string | null;

  @Column({ type: 'int', nullable: true })
  vidaUtilMeses: number | null;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  qrCode: string | null;

  @Column({ type: 'nvarchar', default: '[]' })
  fotos: string;

  @Column({ type: 'nvarchar', default: '[]' })
  documentos: string;

  @Column({ type: 'nvarchar', nullable: true })
  metadata: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  /** Movil al que esta actualmente asignado (seccion 16-19 del pedido de
   * Guardias: Equipo -> Asignacion -> Movil). NULL = no asignado a ningun movil. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  vehiculoAsignadoId: string | null;

  /** Ubicacion parametrizada (organizacion.parametros, tipo UBICACION_EQUIPO
   * -- seccion 18). Distinta de `ubicacion`, que queda como nota libre. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  ubicacionTipo: string | null;
}
