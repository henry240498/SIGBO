import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type OrigenPersonalServicio = 'TRIPULACION' | 'AJUSTE' | 'SOLICITUD';

/** Personal que participo en un servicio (schema servicios). */
@Entity({ name: 'personal_servicio', schema: 'servicios' })
export class PersonalServicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  servicioId: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'nvarchar', length: 50 })
  rol: string;

  @Column({ type: 'int', default: 0 })
  horasServicio: number;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  vehiculoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  despachoId: string | null;

  /** De donde salio la fila: la tripulacion del movil, un ajuste o una solicitud de despacho. */
  @Column({ type: 'nvarchar', length: 12, nullable: true })
  origen: OrigenPersonalServicio | null;

  /** Codigo del parametro FUNCION_INCIDENTE (rol guarda el nombre legible). */
  @Column({ type: 'nvarchar', length: 40, nullable: true })
  funcion: string | null;

  /** Control de personal: dentro de la zona de trabajo. Nunca se libera solo. */
  @Column({ type: 'bit', default: false })
  enZona: boolean;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  zonaDesde: Date | null;

  /** Minutos exactos de servicio; horasServicio queda como el valor redondeado (horasDeServicio). */
  @Column({ type: 'int', nullable: true })
  minutosServicio: number | null;

}
