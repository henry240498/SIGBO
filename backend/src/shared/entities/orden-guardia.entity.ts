import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoOrdenGuardia = 'BORRADOR' | 'REVISADA' | 'APROBADA' | 'PUBLICADA' | 'ANULADA';

/** Documento oficial mensual de Orden de Guardia -- capa de lectura sobre
 * la planificacion ya existente (Guardia/AsignacionGuardia/GrupoGuardia/
 * EsquemaHorarioGuardia), nunca una fuente de datos propia. `contenidoJson`
 * (un `OrdenGuardiaSnapshot`) es el documento congelado en el momento de la
 * publicacion: una vez `estado='PUBLICADA'` no vuelve a cambiar aunque la
 * planificacion subyacente cambie despues -- mismo mecanismo de
 * inmutabilidad que `FojaServicio`. */
@Entity({ name: 'ordenes_guardia', schema: 'operaciones' })
export class OrdenGuardia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  anio: number;

  @Column({ type: 'int' })
  mes: number;

  @Column({ type: 'int' })
  numero: number;

  @Column({ type: 'date' })
  periodoDesde: string;

  @Column({ type: 'date' })
  periodoHasta: string;

  @Column({ type: 'date' })
  fechaEmision: string;

  @Column({ type: 'nvarchar', length: 20, default: 'BORRADOR' })
  estado: EstadoOrdenGuardia;

  @Column({ type: 'nvarchar' })
  contenidoJson: string;

  @CreateDateColumn({ name: 'generado_en', type: 'datetimeoffset', precision: 3 })
  generadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  generadoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  revisadaEn: Date | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  revisadaPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  aprobadaEn: Date | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  aprobadaPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  publicadaEn: Date | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  publicadaPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  anuladaEn: Date | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  anuladaPor: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  anuladaMotivo: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  archivoPdfUrl: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  archivoDocxUrl: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;
}
