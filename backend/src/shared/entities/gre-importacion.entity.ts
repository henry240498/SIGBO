import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado. */
@Entity({ name: 'gre_importaciones', schema: 'matpel' })
export class GreImportacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'version_id', type: 'uniqueidentifier' })
  versionId: string;

  @Column({ name: 'estado', type: 'nvarchar', length: 20 })
  estado: string;

  @Column({ name: 'etapa', type: 'nvarchar', length: 80 })
  etapa: string;

  @Column({ name: 'paginas_procesadas', type: 'int' })
  paginasProcesadas: number;

  @Column({ name: 'intento', type: 'int' })
  intento: number;

  @Column({ name: 'lease_token', type: 'uniqueidentifier', nullable: true })
  leaseToken: string | null;

  @Column({ name: 'lease_hasta', type: 'datetimeoffset', precision: 3, nullable: true })
  leaseHasta: Date | null;

  @Column({ name: 'heartbeat_en', type: 'datetimeoffset', precision: 3, nullable: true })
  heartbeatEn: Date | null;

  @Column({ name: 'errores_json', type: 'nvarchar', length: 'MAX', nullable: true })
  erroresJson: string | null;

  @Column({ name: 'solicitada_por', type: 'uniqueidentifier' })
  solicitadaPor: string;

  @Column({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ name: 'finalizada_en', type: 'datetimeoffset', precision: 3, nullable: true })
  finalizadaEn: Date | null;

}
