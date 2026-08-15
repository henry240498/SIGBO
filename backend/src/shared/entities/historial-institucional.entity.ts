import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type TipoMovimientoInstitucional =
  | 'INGRESO'
  | 'ASCENSO'
  | 'CAMBIO_RANGO'
  | 'CAMBIO_CARGO'
  | 'CAMBIO_COMPANIA'
  | 'CAMBIO_CONDICION'
  | 'CAMBIO_CODIGO'
  | 'LICENCIA'
  | 'SUSPENSION'
  | 'RECONOCIMIENTO'
  | 'SANCION'
  | 'RETIRO'
  | 'FORMACION_ACADEMICA';

@Entity({ name: 'historial_institucional', schema: 'personal' })
export class HistorialInstitucional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'nvarchar', length: 30 })
  tipoMovimiento: TipoMovimientoInstitucional;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  usuarioResponsableId: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  motivo: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  documentoUrl: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  referenciaTabla: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  referenciaId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
