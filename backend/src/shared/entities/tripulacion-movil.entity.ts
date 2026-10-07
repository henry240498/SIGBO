import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Quien va en cada movil y con que funcion (migracion 093). Se carga al tomar la guardia;
 * cada despacho la copia a personal_servicio. Una persona, un movil (UQ_tripm_bombero). */
@Entity({ name: 'tripulacion_movil', schema: 'vehiculos' })
export class TripulacionMovil {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  vehiculoId: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  /** Codigo del parametro FUNCION_INCIDENTE (CONDUCTOR, JEFE_DOTACION...). */
  @Column({ type: 'nvarchar', length: 40 })
  funcion: string;

  @Column({ type: 'uniqueidentifier' })
  asignadoPor: string;

  @Column({ type: 'datetimeoffset', precision: 3 })
  asignadoEn: Date;
}
