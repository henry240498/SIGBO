import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'configuracion_sistema', schema: 'seguridad' })
export class ConfiguracionSistema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', nullable: true })
  logoLogin: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  fondoLogin: string | null;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  textoBajoLogo: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  nombreSistemaMenu: string | null;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  subtituloMenu: string | null;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  logoMenu: string | null;

  @Column({ type: 'bit', default: true })
  perfilEdicionLibre: boolean;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
