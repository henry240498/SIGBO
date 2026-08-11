import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Regla configurable de elegibilidad para un rol de guardia (seccion 7:
 * "estas reglas deben ser configurables y no estar quemadas en el
 * frontend"). Un bombero califica para `rol` si coincide con ALGUNA fila
 * de este tipo (OR entre filas), cumpliendo TODAS las columnas no nulas
 * de esa fila (AND entre columnas). Ejemplo: fila
 * (rol='CHOFER', cargoIdRequerido=<id de Chofer>) exige que el bombero
 * tenga ese cargo; una fila con varias columnas no nulas exige todas. */
@Entity({ name: 'requisitos_rol_guardia', schema: 'operaciones' })
export class RequisitoRolGuardia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 30 })
  rol: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  cargoIdRequerido: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  rangoIdRequerido: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  tipoBomberoIdRequerido: string | null;

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
