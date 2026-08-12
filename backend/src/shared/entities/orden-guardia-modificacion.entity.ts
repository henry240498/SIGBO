import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Historial de cambios a una Orden de Guardia ya PUBLICADA (seccion 15 del
 * pedido): nunca modifica `OrdenGuardia.contenidoJson` -- solo agrega un
 * registro de que cambio, por que, y quien lo hizo. */
@Entity({ name: 'ordenes_guardia_modificaciones', schema: 'operaciones' })
export class OrdenGuardiaModificacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  ordenId: string;

  @Column({ type: 'nvarchar', length: 100 })
  campo: string;

  @Column({ type: 'nvarchar' })
  descripcion: string;

  @Column({ type: 'nvarchar', nullable: true })
  valorAnterior: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  valorNuevo: string | null;

  @Column({ type: 'nvarchar' })
  motivo: string;

  @CreateDateColumn({ name: 'registrado_en', type: 'datetimeoffset', precision: 3 })
  registradoEn: Date;

  @Column({ type: 'uniqueidentifier' })
  registradoPor: string;
}
