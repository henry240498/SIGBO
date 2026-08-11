import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoImportacionMarcador = 'ANALIZADO' | 'CONFIRMADO' | 'CANCELADO';

/** Cabecera de una importacion del Excel del marcador digital. El hash del
 * archivo garantiza idempotencia real: subir el mismo archivo dos veces no
 * genera duplicados (seccion 14 del pedido de Asistencia). */
@Entity({ name: 'importaciones_marcador', schema: 'operaciones' })
export class ImportacionMarcador {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 255 })
  archivoNombre: string;

  @Column({ type: 'char', length: 64 })
  archivoHash: string;

  @Column({ type: 'nvarchar', nullable: true })
  archivoUrl: string | null;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ type: 'datetimeoffset', precision: 3 })
  fechaImportacion: Date;

  @Column({ type: 'int', default: 0 })
  hojasEncontradas: number;

  @Column({ type: 'int', default: 0 })
  registrosEncontrados: number;

  @Column({ type: 'int', default: 0 })
  registrosReconocidos: number;

  @Column({ type: 'int', default: 0 })
  registrosNoIdentificados: number;

  @Column({ type: 'int', default: 0 })
  registrosDuplicados: number;

  @Column({ type: 'int', default: 0 })
  registrosConInconsistencias: number;

  @Column({ type: 'int', nullable: true })
  registrosImportados: number | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ANALIZADO' })
  estado: EstadoImportacionMarcador;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;
}
