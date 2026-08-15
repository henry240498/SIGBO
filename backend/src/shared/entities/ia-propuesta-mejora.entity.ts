import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type OrigenPropuestaIa = 'IA' | 'USUARIO';
export type EstadoPropuestaIa = 'BORRADOR' | 'PROPUESTA' | 'REVISION' | 'APROBADO' | 'RECHAZADO' | 'PUBLICADO';

/** Propuesta de mejora de comportamiento del asistente (secciones 36-39
 * del pedido). La IA puede ORIGINAR una propuesta analizando conversaciones,
 * nunca aplicarla: el estado solo avanza via accion humana explicita
 * (aprobar/rechazar), y "PUBLICADO" no reprograma nada automaticamente --
 * es responsabilidad de un usuario autorizado trasladar la mejora aprobada
 * a `ConfiguracionIa.instruccionesInstitucionales` u otro campo, dejando
 * el cambio real registrado tambien en HistorialConfiguracionIa. */
@Entity({ name: 'propuestas_mejora', schema: 'ia' })
export class PropuestaMejoraIa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @Column({ type: 'nvarchar', length: 10 })
  origen: OrigenPropuestaIa;

  @Column({ type: 'nvarchar' })
  problemaDetectado: string;

  @Column({ type: 'nvarchar' })
  propuestaTexto: string;

  @Column({ type: 'nvarchar', length: 20, default: 'BORRADOR' })
  estado: EstadoPropuestaIa;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  revisadoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaRevision: Date | null;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  motivoDecision: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
