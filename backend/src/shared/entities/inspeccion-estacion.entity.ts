import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoInspeccionEstacion = 'OK' | 'NO_OK';

/** Checklist de condicion de la estacion por guardia (seccion 10). `sector`
 * referencia organizacion.parametros (tipo SECTOR_ESTACION). */
@Entity({ name: 'inspecciones_estacion', schema: 'operaciones' })
export class InspeccionEstacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  guardiaId: string;

  @Column({ type: 'uniqueidentifier' })
  sector: string;

  @Column({ type: 'nvarchar', length: 10 })
  estado: EstadoInspeccionEstacion;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  responsableId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
