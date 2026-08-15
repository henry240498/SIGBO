import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoTurnoCaja = 'ABIERTO' | 'CERRADO';

/** Sesion de apertura/cierre de una caja (seccion 5 del pedido). Solo
 * puede haber un turno ABIERTO por caja a la vez (indice unico
 * filtrado en la migracion). El cierre calcula `diferencia` =
 * saldoFisico - saldoTeorico; si no es cero queda registrada, nunca se
 * ajusta silenciosamente. */
@Entity({ name: 'turnos_caja', schema: 'finanzas' })
export class TurnoCaja {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  cajaId: string;

  @Column({ type: 'datetimeoffset', precision: 3 })
  fechaApertura: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  usuarioApertura: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  saldoInicial: number;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaCierre: Date | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  usuarioCierre: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  saldoTeorico: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  saldoFisico: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  diferencia: number | null;

  @Column({ type: 'nvarchar', nullable: true })
  observacionCierre: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ABIERTO' })
  estado: EstadoTurnoCaja;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
