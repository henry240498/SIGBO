import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Historial de cambios del codigo visible de un Socio Protector
 * (SC001 -> SC125 debe dejar rastro). Mismo shape que
 * personal.historial_codigo para numeroBombero. */
@Entity({ name: 'socios_historial_codigo', schema: 'finanzas' })
export class SocioHistorialCodigo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  socioProtectorId: string;

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
