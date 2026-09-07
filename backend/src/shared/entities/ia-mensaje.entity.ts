import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type RolMensajeIa = 'USUARIO' | 'IA' | 'SISTEMA' | 'HERRAMIENTA';
export type ResultadoMensajeIa = 'OK' | 'DENEGADO' | 'ERROR' | 'BLOQUEADO';

/** Un turno dentro de una conversacion (seccion 7 del pedido). `duracionMs`
 * y `fuentesJson` viven en la fila de rol IA -- son propiedades de generar
 * esa respuesta, no de la conversacion completa. Sin tokens de proveedor:
 * el motor de razonamiento sigue siendo local y deterministico
 * (IaMotorService), nadie factura por token (pivote de arquitectura,
 * migracion 060). `modeloUtilizado` (migracion 072) es solo informativo:
 * que modelo local de Ollama, si alguno, ayudo a redactar esta respuesta
 * puntual -- queda NULL en todo mensaje que no paso por Ollama. */
@Entity({ name: 'mensajes', schema: 'ia' })
export class MensajeIa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  conversacionId: string;

  @Column({ type: 'nvarchar', length: 20 })
  rol: RolMensajeIa;

  @Column({ type: 'nvarchar' })
  contenido: string;

  @Column({ type: 'int', nullable: true })
  duracionMs: number | null;

  /** JSON string: Array<{ documentoId, titulo, numeroDocumental, enlace }> --
   * seccion 18, "citacion de fuentes" cuando la respuesta se basa en Documentos. */
  @Column({ type: 'nvarchar', nullable: true })
  fuentesJson: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'OK' })
  resultado: ResultadoMensajeIa;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  errorDetalle: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  modeloUtilizado: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
