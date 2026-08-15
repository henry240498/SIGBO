import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Contador de numeracion documental por tipo+anio(+institucion) --
 * seccion 7 del pedido. No asume una numeracion unica global: cada
 * combinacion tipo+anio tiene su propio correlativo (Resolucion N.º
 * 01/2026, Orden de Servicio N.º 01/2026, en paralelo). */
@Entity({ name: 'numeraciones', schema: 'documentos' })
export class NumeracionDocumento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  tipoDocumentoId: string;

  @Column({ type: 'int' })
  anio: number;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @Column({ type: 'int', default: 0 })
  ultimoNumero: number;
}
