import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Relacion polimorfica documento <-> cualquier entidad de SIGBO
 * (secciones 14-15, 48 del pedido). Mismo patron ya validado en
 * produccion por seguridad.log_auditoria (`recurso`/`recursoId`): sin
 * FK tipada por modulo, `modulo`+`entidad`+`registroId` identifican el
 * registro relacionado. Un documento puede tener muchas filas (una
 * resolucion puede involucrar a 5 bomberos + la institucion + un
 * cargo). `etiqueta` es una copia legible congelada al momento de
 * crear la relacion (ej. "BC-102"), para listar sin tener que resolver
 * el nombre actual de cada entidad relacionada en cada consulta. */
@Entity({ name: 'relaciones', schema: 'documentos' })
export class DocumentoRelacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  documentoId: string;

  @Column({ type: 'nvarchar', length: 50 })
  modulo: string;

  @Column({ type: 'nvarchar', length: 50 })
  entidad: string;

  @Column({ type: 'uniqueidentifier' })
  registroId: string;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  etiqueta: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
