import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type ResultadoEjecucionHerramientaIa = 'PERMITIDO' | 'DENEGADO' | 'ERROR';

/** Cada llamada a una herramienta de la lista blanca (secciones 8/12/45
 * del pedido) queda auditada aca, exista o no la respuesta final del
 * modelo: usuario -> permiso evaluado -> resultado -> que se le devolvio
 * al modelo (resumen, nunca el payload completo con datos sensibles). */
@Entity({ name: 'ejecuciones_herramientas', schema: 'ia' })
export class EjecucionHerramientaIa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  mensajeId: string | null;

  @Column({ type: 'uniqueidentifier' })
  conversacionId: string;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ type: 'nvarchar', length: 60 })
  herramienta: string;

  @Column({ type: 'nvarchar', nullable: true })
  argumentosJson: string | null;

  @Column({ type: 'nvarchar', length: 60, nullable: true })
  permisoEvaluado: string | null;

  @Column({ type: 'nvarchar', length: 20 })
  resultado: ResultadoEjecucionHerramientaIa;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  datosConsultadosResumen: string | null;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  errorDetalle: string | null;

  @Column({ type: 'int', nullable: true })
  duracionMs: number | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
