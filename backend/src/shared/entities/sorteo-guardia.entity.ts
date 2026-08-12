import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Sorteo de personal para una fecha especial (seccion 20 del pedido: 8 de
 * diciembre, Nochebuena, Navidad, vispera de Ano Nuevo, Ano Nuevo). Registra
 * la corrida completa (fecha, motivo, cantidad a seleccionar, quien y
 * cuando la ejecuto); los participantes -- elegibles seleccionados y no
 * seleccionados -- viven en `SorteoParticipante`. */
@Entity({ name: 'sorteos_guardia', schema: 'operaciones' })
export class SorteoGuardia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'nvarchar', length: 300 })
  motivo: string;

  @Column({ type: 'int' })
  cantidadASeleccionar: number;

  /** Esquema especial a aplicar si se crea una Guardia a partir de este
   * sorteo (opcional: el sorteo puede ejecutarse antes de decidir el
   * esquema). */
  @Column({ type: 'uniqueidentifier', nullable: true })
  esquemaHorarioId: string | null;

  /** Guardia creada a partir de este sorteo, si se uso el atajo
   * `crear-guardia`. Nullable: un sorteo puede quedar solo como registro. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  guardiaId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  ejecutadoPor: string | null;

  @CreateDateColumn({ name: 'ejecutado_en', type: 'datetimeoffset', precision: 3 })
  ejecutadoEn: Date;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;
}
