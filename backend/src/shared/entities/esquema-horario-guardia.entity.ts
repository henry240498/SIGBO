import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Catalogo parametrizable de plantillas de horario de guardia (secciones
 * 2/14/15/19 del pedido): reemplaza cualquier horario "quemado" en el
 * frontend. `diasSemanaCsv` NULL significa que el esquema solo se usa para
 * feriados/fechas especiales, nunca por dia de semana normal. */
@Entity({ name: 'esquemas_horario_guardia', schema: 'operaciones' })
export class EsquemaHorarioGuardia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 150 })
  nombre: string;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  diasSemanaCsv: string | null;

  @Column({ type: 'time', precision: 0 })
  horaInicio: string;

  @Column({ type: 'time', precision: 0 })
  horaFin: string;

  @Column({ type: 'bit', default: false })
  cruzaMedianoche: boolean;

  @Column({ type: 'int', default: 1 })
  diasDuracion: number;

  @Column({ type: 'bit', default: false })
  esEspecial: boolean;

  /** Si TRUE, el generador automatico resuelve este esquema eligiendo un
   * grupo de guardia segun su ciclo de rotacion (seccion 8 del pedido). Si
   * FALSE, arma la guardia asignando personal individual directamente
   * (ej. personal rentado en turnos diurnos, sin grupo fijo). */
  @Column({ type: 'bit', default: false })
  usaRotacionGrupo: boolean;

  @Column({ type: 'bit', default: true })
  requiereOficial: boolean;

  @Column({ type: 'bit', default: true })
  requiereChofer: boolean;

  @Column({ type: 'int', nullable: true })
  cantidadMinima: number | null;

  @Column({ type: 'int', nullable: true })
  cantidadMaxima: number | null;

  @Column({ type: 'int', default: 1 })
  cantidadOficiales: number;

  @Column({ type: 'int', default: 1 })
  cantidadChoferes: number;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
