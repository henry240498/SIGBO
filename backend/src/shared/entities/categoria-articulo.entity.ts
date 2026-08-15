import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Categoria jerarquica para articulos de inventario por cantidad (guantes,
 * insumos medicos, limpieza, etc). Separada de equipos.categorias_equipo
 * porque ese catalogo es especifico de equipamiento con ficha individual;
 * Deposito cubre un universo mas amplio (consumibles que Equipos nunca
 * modelo). */
@Entity({ name: 'categorias_articulo', schema: 'deposito' })
export class CategoriaArticulo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  codigo: string | null;

  @Column({ type: 'nvarchar', length: 150 })
  nombre: string;

  @Column({ type: 'nvarchar', nullable: true })
  descripcion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  padreId: string | null;

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
