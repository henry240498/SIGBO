import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Cada cambio a ConfiguracionIa queda registrado con snapshot completo
 * antes/despues (seccion 38 del pedido): "valor anterior/valor nuevo/
 * usuario/fecha/hora/ip/motivo". Append-only, nunca se edita ni se borra. */
@Entity({ name: 'historial_configuracion', schema: 'ia' })
export class HistorialConfiguracionIa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  configuracionId: string;

  @Column({ type: 'nvarchar' })
  valorAnteriorJson: string;

  @Column({ type: 'nvarchar' })
  valorNuevoJson: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  motivo: string | null;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ type: 'nvarchar', length: 64, nullable: true })
  ip: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
