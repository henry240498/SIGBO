import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AmbitoBeneficioSocio } from './beneficio-socio.entity';

/** Rastro auditado de cada vez que se aplico un BeneficioSocio (seccion
 * 12-13 del pedido: la aplicacion del descuento debe quedar
 * registrada, nunca ser un calculo invisible). */
@Entity({ name: 'aplicaciones_beneficio', schema: 'finanzas' })
export class AplicacionBeneficio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  beneficioId: string;

  @Column({ type: 'uniqueidentifier' })
  socioProtectorId: string;

  @Column({ type: 'nvarchar', length: 20 })
  ambito: AmbitoBeneficioSocio;

  /** Ej. academia.inscripciones.id -- registro sobre el que se aplico. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  referenciaId: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  montoBase: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  descuentoAplicado: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  montoFinal: number;

  @Column({ type: 'datetimeoffset', precision: 3 })
  aplicadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  aplicadoPor: string | null;
}
