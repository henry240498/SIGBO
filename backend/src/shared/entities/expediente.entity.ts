import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoExpediente = 'ABIERTO' | 'CERRADO';

/** Agrupador de documentos ordenados cronologicamente (seccion 23 del
 * pedido). El orden dentro del expediente vive en
 * Documento.ordenEnExpediente, no aca. */
@Entity({ name: 'expedientes', schema: 'documentos' })
export class Expediente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 50 })
  numero: string;

  @Column({ type: 'nvarchar', length: 300 })
  titulo: string;

  @Column({ type: 'nvarchar', nullable: true })
  descripcion: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ABIERTO' })
  estado: EstadoExpediente;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
