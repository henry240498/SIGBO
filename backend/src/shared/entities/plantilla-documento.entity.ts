import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** Plantilla documental con placeholders {{CAMPO}} (seccion 40). El
 * firmante por defecto se define por Cargo, nunca por el nombre de una
 * persona fija (seccion 41) -- se resuelve en el momento de generar
 * cada documento via resolverFirmante(), asi que si cambia quien ocupa
 * el cargo, los documentos NUEVOS usan al nuevo responsable pero los
 * ya generados no cambian retroactivamente (quedan con el snapshot que
 * ya se le trabajo en su DocumentoFirma). */
@Entity({ name: 'plantillas', schema: 'documentos' })
export class PlantillaDocumento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 200 })
  nombre: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  tipoDocumentoId: string | null;

  @Column({ type: 'nvarchar' })
  contenido: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  cargoFirmanteId: string | null;

  @Column({ type: 'bit', default: true })
  activa: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
