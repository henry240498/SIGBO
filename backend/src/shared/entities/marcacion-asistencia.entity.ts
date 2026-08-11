import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type TipoMarcacion = 'ENTRADA' | 'SALIDA';
export type MetodoMarcacion = 'HUELLA' | 'QR' | 'PIN' | 'RFID' | 'MANUAL' | 'APP';
export type FuenteAsistencia = 'MARCADOR_DIGITAL' | 'MANUAL' | 'IMPORTACION_EXCEL' | 'EVENTO' | 'GUARDIA' | 'OTRO';

/** Marcacion fisica de entrada/salida del cuartel. `eventoId` es opcional:
 * marcar presencia es una accion general, independiente de que exista un
 * evento puntual (la relacion con eventos se calcula por solapamiento de
 * horarios, no se fuerza). Preserva el dato original cuando proviene de una
 * importacion de Excel (auditoria, seccion 16 del pedido de Asistencia). */
@Entity({ name: 'marcaciones_asistencia', schema: 'operaciones' })
export class MarcacionAsistencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  eventoId: string | null;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'nvarchar', length: 20 })
  tipoMarcacion: TipoMarcacion;

  @Column({ type: 'nvarchar', length: 20 })
  metodo: MetodoMarcacion;

  @Column({ type: 'datetimeoffset', precision: 3 })
  timestampMarcacion: Date;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitud: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitud: number | null;

  @Column({ type: 'int', nullable: true })
  precisionMetros: number | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  dispositivo: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  @Column({ type: 'bit', default: false })
  verificado: boolean;

  @Column({ type: 'uniqueidentifier', nullable: true })
  verificadoPor: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  /** De donde proviene el registro (seccion 18 del pedido de Asistencia). */
  @Column({ type: 'nvarchar', length: 30, default: 'MANUAL' })
  fuente: FuenteAsistencia;

  @Column({ type: 'uniqueidentifier', nullable: true })
  registradoPor: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  motivo: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  importacionId: string | null;

  /** JSON crudo de la fila del Excel origen, cuando aplica (auditoria). */
  @Column({ type: 'nvarchar', nullable: true })
  datoOriginal: string | null;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  codigoOriginalExcel: string | null;

  @Column({ type: 'int', nullable: true })
  filaExcel: number | null;
}
