import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'categorias_denuncia', schema: 'denuncias' })
export class CategoriaDenuncia {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'nvarchar', length: 120 }) nombre: string;
  @Column({ type: 'nvarchar', length: 120 }) nombreNormalizado: string;
  @Column({ type: 'int', default: 0 }) orden: number;
  @Column({ type: 'bit', default: true }) activo: boolean;
  @CreateDateColumn({ type: 'datetimeoffset', precision: 3 }) creadoEn: Date;
  @UpdateDateColumn({ type: 'datetimeoffset', precision: 3 }) actualizadoEn: Date;
}
