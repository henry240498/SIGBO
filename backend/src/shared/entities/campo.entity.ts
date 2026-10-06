import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

export type EntidadAdjunto = 'SERVICIO' | 'DESPACHO' | 'VEHICULO' | 'HIDRANTE' | 'PUNTO_RIESGO';
export type TipoAdjunto = 'FOTO' | 'FIRMA';

/** Foto o firma tomada con el celular (migracion 086). El archivo es privado: solo se sirve a usuarios autorizados. */
@Entity({ name: 'adjuntos', schema: 'servicios' })
export class Adjunto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 20 })
  entidad: EntidadAdjunto;

  @Column({ type: 'uniqueidentifier' })
  entidadId: string;

  @Column({ type: 'nvarchar', length: 10 })
  tipo: TipoAdjunto;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  descripcion: string | null;

  @Column({ type: 'nvarchar', length: 200 })
  referencia: string;

  @Column({ type: 'int' })
  tamanoBytes: number;

  @Column({ type: 'nvarchar', length: 64, nullable: true })
  claveIdempotencia: string | null;

  @Column({ type: 'uniqueidentifier' })
  subidoPor: string;

  /** Cuando se tomo (en el celular), no cuando llego al servidor. */
  @Column({ type: 'datetimeoffset', precision: 3 })
  tomadoEn: Date;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}

export type CategoriaVictima = 'RESCATADA' | 'HERIDA' | 'FALLECIDA' | 'EVACUADA';

@Entity({ name: 'victimas_servicio', schema: 'servicios' })
export class VictimaServicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  servicioId: string;

  @Column({ type: 'nvarchar', length: 10 })
  categoria: CategoriaVictima;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  observacion: string | null;

  @Column({ type: 'uniqueidentifier' })
  registradoPor: string;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}

export type EstadoAusencia = 'SOLICITADA' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA';

/** Permiso de ausencia de un bombero (migracion 086). */
@Entity({ name: 'ausencias', schema: 'operaciones' })
export class Ausencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'date' })
  desde: string;

  @Column({ type: 'date' })
  hasta: string;

  @Column({ type: 'nvarchar', length: 300 })
  motivo: string;

  @Column({ type: 'nvarchar', length: 12, default: 'SOLICITADA' })
  estado: EstadoAusencia;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  motivoDecision: string | null;

  @Column({ type: 'uniqueidentifier' })
  solicitadaPor: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  decididaPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  decididaEn: Date | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}

/** Aviso de vencimiento ya enviado (clave = origen + persona + que + fecha + umbral). */
@Entity({ name: 'avisos_vencimiento', schema: 'personal' })
export class AvisoVencimiento {
  @PrimaryColumn({ type: 'nvarchar', length: 200 })
  clave: string;

  @Column({ type: 'datetimeoffset', precision: 3 })
  avisadoEn: Date;
}
