import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type AmbitoBeneficioSocio = 'ACADEMIA' | 'SERVICIOS' | 'GENERAL';
export type EstadoBeneficioSocio = 'ACTIVO' | 'INACTIVO';

/** Catalogo de descuentos/beneficios para Socios Protectores. Aplica
 * a TODO socio con estado activo (no hay asignacion 1 a 1
 * socio<->beneficio -- el pedido no la exige). El calculo se
 * registra siempre en AplicacionBeneficio y NUNCA modifica el precio
 * base de la actividad/servicio relacionado. */
@Entity({ name: 'beneficios_socios', schema: 'finanzas' })
export class BeneficioSocio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 150 })
  nombre: string;

  /** Referencia a organizacion.parametros (tipo TIPO_BENEFICIO_SOCIO). */
  @Column({ type: 'uniqueidentifier' })
  tipoId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentajeDescuento: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  montoFijoDescuento: number | null;

  @Column({ type: 'nvarchar', length: 20 })
  ambito: AmbitoBeneficioSocio;

  /** Curso especifico al que aplica; NULL = aplica a cualquier actividad academica. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  actividadAcademicaId: string | null;

  /** Preparado para Servicios -- ver seccion 13 del pedido; no hay
   * hoy un precio de servicio que descontar, se deja configurado. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  tipoServicioId: string | null;

  @Column({ type: 'date' })
  fechaInicio: string;

  @Column({ type: 'date', nullable: true })
  fechaFin: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVO' })
  estado: EstadoBeneficioSocio;

  @Column({ type: 'nvarchar', nullable: true })
  condiciones: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

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
