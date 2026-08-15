import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoConversacionIa = 'ACTIVA' | 'CERRADA';

/** Una sesion de chat con el asistente (seccion 6 del pedido): contenedor
 * de MensajeIa, nunca un texto unico gigante (seccion 7). `usuarioId` es
 * siempre quien conversa -- Snoopy nunca actua ni conversa "como" otro
 * usuario. */
@Entity({ name: 'conversaciones', schema: 'ia' })
export class ConversacionIa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  titulo: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVA' })
  estado: EstadoConversacionIa;

  @Column({ type: 'nvarchar', length: 64, nullable: true })
  ip: string | null;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  userAgent: string | null;

  /** JSON string: { herramienta, argumentos } del ultimo llamado exitoso --
   * permite resolver preguntas de seguimiento ("y a que hora termina") sin
   * un LLM que retenga contexto por si solo (seccion 51 del pedido). */
  @Column({ type: 'nvarchar', nullable: true })
  ultimoContextoJson: string | null;

  @CreateDateColumn({ name: 'iniciada_en', type: 'datetimeoffset', precision: 3 })
  iniciadaEn: Date;

  @UpdateDateColumn({ name: 'ultima_actividad_en', type: 'datetimeoffset', precision: 3 })
  ultimaActividadEn: Date;
}
