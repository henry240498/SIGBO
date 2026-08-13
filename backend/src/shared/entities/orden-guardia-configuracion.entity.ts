import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** Configuracion institucional de la Orden de Guardia (fila unica, patron
 * ConfiguracionSistema/AparienciaService): textos de plantilla, reglas de
 * reemplazo (tambien enforced como validacion real, no solo texto), pie de
 * pagina y los dos cargos firmantes -- nunca nombres fijos en codigo, se
 * resuelven contra `organizacion.designaciones` al generar el snapshot. */
@Entity({ name: 'orden_guardia_configuracion', schema: 'operaciones' })
export class OrdenGuardiaConfiguracion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 300 })
  tituloDocumento: string;

  @Column({ type: 'nvarchar', nullable: true })
  textoIntroPlantilla: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  reglaTextoOficial: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  reglaTextoChofer: string | null;

  @Column({ type: 'bit', default: true })
  exigirRangoIgualOSuperiorOficial: boolean;

  @Column({ type: 'nvarchar', nullable: true })
  textoPie: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  firmante1CargoId: string | null;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  firmante1Etiqueta: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  firmante2CargoId: string | null;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  firmante2Etiqueta: string | null;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
