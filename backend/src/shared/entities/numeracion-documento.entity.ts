import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Contador de numeracion documental por tipo+anio(+institucion) --
 * seccion 7 del pedido. No asume una numeracion unica global: cada
 * combinacion tipo+anio tiene su propio correlativo (Resolucion N.º
 * 01/2026, Orden de Servicio N.º 01/2026, en paralelo).
 *
 * `anio`/`ultimoNumero` son la posicion VIGENTE ("anio actual"/"numero
 * actual" del pedido) -- se siguen leyendo igual que antes de la
 * migracion 069. Los campos `*Desde`/`*Hasta` describen el rango
 * declarado para este numerador (informativo/de control, ej. "esta
 * numeracion arranca en 2026-01 desde el 01"); `fechaVigencia*`
 * determina si esta configuracion aplica "hoy". */
@Entity({ name: 'numeraciones', schema: 'documentos' })
export class NumeracionDocumento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  tipoDocumentoId: string;

  @Column({ type: 'int' })
  anio: number;

  @Column({ type: 'int', nullable: true })
  mesActual: number | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @Column({ type: 'int', default: 0 })
  ultimoNumero: number;

  @Column({ type: 'int', nullable: true })
  anioDesde: number | null;

  @Column({ type: 'int', nullable: true })
  mesDesde: number | null;

  @Column({ type: 'int', nullable: true })
  numeroDesde: number | null;

  @Column({ type: 'int', nullable: true })
  anioHasta: number | null;

  @Column({ type: 'int', nullable: true })
  mesHasta: number | null;

  @Column({ type: 'int', nullable: true })
  numeroHasta: number | null;

  @Column({ type: 'date', nullable: true })
  fechaVigenciaDesde: string | null;

  @Column({ type: 'date', nullable: true })
  fechaVigenciaHasta: string | null;

  @Column({ type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
