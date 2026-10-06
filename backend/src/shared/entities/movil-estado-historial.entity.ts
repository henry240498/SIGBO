import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { EstadoOperativoMovil } from './vehiculo.entity';

/** Cada cambio de estado operativo de un movil (migracion 077). Solo se agrega,
 * nunca se modifica: es el rastro de donde estuvo cada unidad. */
@Entity({ name: 'movil_estado_historial', schema: 'vehiculos' })
export class MovilEstadoHistorial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  vehiculoId: string;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  estadoAnterior: EstadoOperativoMovil | null;

  @Column({ type: 'nvarchar', length: 20 })
  estadoNuevo: EstadoOperativoMovil;

  @Column({ type: 'uniqueidentifier', nullable: true })
  servicioId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  despachoId: string | null;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  motivo: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  usuarioId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
