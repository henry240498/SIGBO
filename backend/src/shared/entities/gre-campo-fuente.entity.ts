import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado. */
@Entity({ name: 'gre_campos_fuente', schema: 'matpel' })
export class GreCampoFuente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'version_id', type: 'uniqueidentifier' })
  versionId: string;

  @Column({ name: 'campo', type: 'nvarchar', length: 80 })
  campo: string;

  @Column({ name: 'referencia_id', type: 'uniqueidentifier' })
  referenciaId: string;

  @Column({ name: 'seccion_id', type: 'uniqueidentifier', nullable: true })
  seccionId: string | null;

  @Column({ name: 'entrada_id', type: 'uniqueidentifier', nullable: true })
  entradaId: string | null;

  @Column({ name: 'alias_id', type: 'uniqueidentifier', nullable: true })
  aliasId: string | null;

  @Column({ name: 'guia_id', type: 'uniqueidentifier', nullable: true })
  guiaId: string | null;

  @Column({ name: 'bloque_id', type: 'uniqueidentifier', nullable: true })
  bloqueId: string | null;

  @Column({ name: 'tabla_id', type: 'uniqueidentifier', nullable: true })
  tablaId: string | null;

  @Column({ name: 'fila_id', type: 'uniqueidentifier', nullable: true })
  filaId: string | null;

  @Column({ name: 'celda_id', type: 'uniqueidentifier', nullable: true })
  celdaId: string | null;

  @Column({ name: 'regla_id', type: 'uniqueidentifier', nullable: true })
  reglaId: string | null;

}
