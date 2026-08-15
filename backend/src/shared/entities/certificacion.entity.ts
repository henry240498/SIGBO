import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type TipoCertificacion =
  | 'BASICO'
  | 'INTERMEDIO'
  | 'AVANZADO'
  | 'ESPECIALIDAD'
  | 'CURSO'
  | 'SEMINARIO'
  | 'TALLER'
  | 'ENTRENAMIENTO';

@Entity({ name: 'certificaciones', schema: 'personal' })
export class Certificacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'nvarchar', length: 50 })
  tipo: TipoCertificacion;

  @Column({ type: 'nvarchar', length: 200 })
  nombre: string;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  institucion: string | null;

  @Column({ type: 'date' })
  fechaObtencion: string;

  @Column({ type: 'date', nullable: true })
  fechaVencimiento: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  numeroCertificado: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  archivoUrl: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'VIGENTE' })
  estado: 'VIGENTE' | 'VENCIDO' | 'EN_PROCESO';

  @Column({ type: 'int', nullable: true })
  duracionHoras: number | null;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  instructor: string | null;

  /** Si el certificado corresponde a una actividad interna registrada en
   * Academia, enlaza con ella. Null para certificaciones externas/sueltas
   * (seccion 18 del pedido: capacitacion externa). */
  @Column({ type: 'uniqueidentifier', nullable: true })
  actividadAcademicaId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
