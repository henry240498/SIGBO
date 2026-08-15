import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoPrestamoDeposito = 'ACTIVO' | 'DEVUELTO_PARCIAL' | 'DEVUELTO' | 'EXTRAVIADO';

/** Prestamo amplio de Deposito (seccion 7 del pedido): a personal, a otra
 * institucion, para un servicio, capacitacion, mantenimiento u otro motivo.
 * Distinto de equipos.prestamos_equipos (bombero-only, un solo equipo por
 * fila, sin ubicacion) -- ese mecanismo se deja intacto para no romper las
 * pantallas que ya lo usan; este cubre multi-item, cantidad, y cualquier
 * tipo de destinatario. */
@Entity({ name: 'prestamos', schema: 'deposito' })
export class PrestamoDeposito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  tipoPrestamoId: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  solicitanteBomberoId: string | null;

  /** Nombre/identificacion libre cuando el prestamo es a otra institucion u
   * otro destinatario que no tiene ficha de Personal. */
  @Column({ type: 'nvarchar', length: 300, nullable: true })
  solicitanteExterno: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  servicioDestinoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  autorizadoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3 })
  fechaEntrega: Date;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaDevolucionComprometida: Date | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaDevolucionReal: Date | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVO' })
  estado: EstadoPrestamoDeposito;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
