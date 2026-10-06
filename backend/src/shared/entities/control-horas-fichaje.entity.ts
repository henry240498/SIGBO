import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Limites de horas de servicio que fija el cuartel (una fila activa). Migracion 082. */
@Entity({ name: 'limites_horas_servicio', schema: 'operaciones' })
export class LimiteHorasServicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  horasMaximasPeriodo: number;

  @Column({ type: 'int' })
  periodoDias: number;

  @Column({ type: 'int' })
  descansoMinimoHoras: number;

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}

/** Punto de fichaje (puerta del cuartel). Guarda solo el hash del token del QR. */
@Entity({ name: 'puntos_fichaje', schema: 'operaciones' })
export class PuntoFichaje {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 100 })
  nombre: string;

  @Column({ type: 'char', length: 64 })
  tokenHash: string;

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}

export type TipoFichaje = 'ENTRADA' | 'SALIDA';

@Entity({ name: 'fichajes', schema: 'operaciones' })
export class Fichaje {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  puntoId: string;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  bomberoId: string | null;

  @Column({ type: 'nvarchar', length: 10 })
  tipo: TipoFichaje;

  @Column({ type: 'datetimeoffset', precision: 3 })
  registradoEn: Date;
}
