import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'historial_codigo', schema: 'personal' })
export class HistorialCodigo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'nvarchar', length: 20 })
  codigoAnterior: string;

  @Column({ type: 'nvarchar', length: 20 })
  codigoNuevo: string;

  @Column({ type: 'nvarchar', nullable: true })
  motivo: string | null;

  @Column({ type: 'datetimeoffset', precision: 3 })
  fechaCambio: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  cambiadoPor: string | null;
}
