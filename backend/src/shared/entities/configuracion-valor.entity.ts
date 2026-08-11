import { Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'configuracion_valores', schema: 'seguridad' })
@Index(['clave', 'alcance', 'usuarioId'], { unique: true })
export class ConfiguracionValor {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'nvarchar', length: 160 }) clave: string;
  @Column({ type: 'nvarchar', length: 20 }) alcance: 'GLOBAL' | 'USUARIO';
  @Column({ name: 'usuario_id', type: 'uniqueidentifier', nullable: true }) usuarioId: string | null;
  @Column({ name: 'valor_json', type: 'nvarchar', length: 'MAX' }) valorJson: string;
  @Column({ type: 'int', default: 1 }) version: number;
  @Column({ name: 'actualizado_por', type: 'uniqueidentifier', nullable: true }) actualizadoPor: string | null;
  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 }) actualizadoEn: Date;
}
