import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoFilaImportacion = 'RECONOCIDO' | 'NO_IDENTIFICADO' | 'DUPLICADO' | 'YA_IMPORTADO' | 'INCONSISTENTE';

/** Una fila cruda del Excel analizada durante la previsualizacion de una
 * importacion, antes de confirmarse (o no) como marcacion real. Conserva el
 * dato original completo para auditoria (seccion 16 del pedido). */
@Entity({ name: 'importaciones_marcador_filas', schema: 'operaciones' })
export class ImportacionMarcadorFila {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  importacionId: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  hojaExcel: string | null;

  @Column({ type: 'int', nullable: true })
  filaExcel: number | null;

  @Column({ type: 'nvarchar' })
  datoOriginal: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  codigoDetectado: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  bomberoIdResuelto: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  tipoMarcacionDetectado: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  timestampDetectado: Date | null;

  @Column({ type: 'nvarchar', length: 20 })
  estadoFila: EstadoFilaImportacion;

  @Column({ type: 'nvarchar', nullable: true })
  motivo: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  marcacionIdGenerada: string | null;
}
