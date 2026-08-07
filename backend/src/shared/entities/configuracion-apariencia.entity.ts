import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'configuracion_apariencia', schema: 'seguridad' })
export class ConfiguracionApariencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', nullable: true })
  logoUrl: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  fondoUrl: string | null;

  @Column({ type: 'bit', default: false })
  mostrarTexto: boolean;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  textoDebajoLogo: string | null;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
