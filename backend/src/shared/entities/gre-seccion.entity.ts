import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado. */
@Entity({ name: 'gre_secciones', schema: 'matpel' })
export class GreSeccion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'version_id', type: 'uniqueidentifier' })
  versionId: string;

  @Column({ name: 'titulo_original', type: 'nvarchar', length: 500 })
  tituloOriginal: string;

  @Column({ name: 'orden', type: 'int' })
  orden: number;

  @Column({ name: 'pagina_desde', type: 'int' })
  paginaDesde: number;

  @Column({ name: 'pagina_hasta', type: 'int' })
  paginaHasta: number;

  @Column({ name: 'tratamiento', type: 'nvarchar', length: 80 })
  tratamiento: string;

}
