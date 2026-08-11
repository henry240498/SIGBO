import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Entrada manual de la bitacora de una guardia (seccion 9). La bitacora
 * completa que ve el usuario combina esto con lecturas de otras tablas
 * (asistencia, servicios, prestamos, eventos...) sin duplicar datos --
 * ver BitacoraService en la Fase 4. */
@Entity({ name: 'novedades_guardia', schema: 'operaciones' })
export class NovedadGuardia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  guardiaId: string;

  @Column({ name: 'fecha_hora', type: 'datetimeoffset', precision: 3 })
  fechaHora: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  bomberoId: string | null;

  @Column({ type: 'nvarchar' })
  texto: string;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
