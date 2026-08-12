import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Un candidato evaluado en un sorteo (`SorteoGuardia`), seleccionado o no.
 * Se persisten TODOS los elegibles -- no solo los ganadores -- porque es la
 * unica forma de que una auditoria futura pueda confirmar que el sorteo
 * respeto el criterio de candidatos configurado (seccion 20 del pedido). */
@Entity({ name: 'sorteo_participantes', schema: 'operaciones' })
export class SorteoParticipante {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  sorteoId: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'bit', default: false })
  seleccionado: boolean;

  /** Posicion resultante del sorteo (Fisher-Yates) para trazabilidad del
   * orden en que fueron extraidos. */
  @Column({ type: 'int', default: 0 })
  orden: number;
}
