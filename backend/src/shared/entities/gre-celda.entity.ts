import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado. */
@Entity({ name: 'gre_celdas', schema: 'matpel' })
export class GreCelda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'version_id', type: 'uniqueidentifier' })
  versionId: string;

  @Column({ name: 'fila_id', type: 'uniqueidentifier' })
  filaId: string;

  @Column({ name: 'columna_codigo', type: 'nvarchar', length: 80 })
  columnaCodigo: string;

  @Column({ name: 'orden', type: 'int' })
  orden: number;

  @Column({ name: 'texto_original', type: 'nvarchar', length: 'MAX' })
  textoOriginal: string;

  /** Decimal canónico textual: conserva precisión sin redondeo SQL; validar antes de uso. */
  @Column({ name: 'valor_decimal', type: 'nvarchar', length: 120, nullable: true })
  valorDecimal: string | null;

  @Column({ name: 'unidad_original', type: 'nvarchar', length: 80, nullable: true })
  unidadOriginal: string | null;

  @Column({ name: 'modificador', type: 'nvarchar', length: 40, nullable: true })
  modificador: string | null;

  @Column({ name: 'estado_dato', type: 'nvarchar', length: 20 })
  estadoDato: string;

  @Column({ name: 'condiciones_json', type: 'nvarchar', length: 'MAX', nullable: true })
  condicionesJson: string | null;

  @Column({ name: 'referencia_id', type: 'uniqueidentifier' })
  referenciaId: string;

}
