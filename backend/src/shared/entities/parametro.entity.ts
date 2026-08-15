import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type TipoParametro =
  | 'PAIS'
  | 'DEPARTAMENTO'
  | 'CIUDAD'
  | 'BARRIO'
  | 'PROFESION'
  | 'IDIOMA'
  | 'NIVEL_IDIOMA'
  | 'GRUPO_SANGUINEO'
  | 'FACTOR_RH'
  | 'TIPO_SEGURO'
  | 'ASEGURADORA'
  | 'TIPO_EVENTO_ASISTENCIA'
  | 'UBICACION_EQUIPO'
  | 'ESTADO_PRESENCIA_GUARDIA'
  | 'SECTOR_ESTACION'
  | 'TIPO_ACTIVIDAD_ACADEMICA'
  | 'MODALIDAD_ACADEMICA'
  | 'TIPO_EVALUACION_ACADEMICA'
  | 'RESULTADO_ACADEMICO'
  | 'TIPO_UBICACION_DEPOSITO'
  | 'TIPO_TENENCIA_DEPOSITO'
  | 'ESTADO_ELEMENTO_DEPOSITO'
  | 'TIPO_MOVIMIENTO_DEPOSITO'
  | 'UNIDAD_MEDIDA_DEPOSITO'
  | 'MOTIVO_BAJA_DEPOSITO'
  | 'TIPO_PRESTAMO_DEPOSITO'
  | 'TIPO_INGRESO_FINANZAS'
  | 'CATEGORIA_EGRESO_FINANZAS'
  | 'TIPO_CUENTA_BANCARIA_FINANZAS'
  | 'TIPO_DOCUMENTO_FINANZAS'
  | 'MOTIVO_ANULACION_FINANZAS'
  | 'TIPO_DOCUMENTO'
  | 'CATEGORIA_DOCUMENTO'
  | 'ESTADO_DOCUMENTO'
  | 'NIVEL_CONFIDENCIALIDAD_DOCUMENTO'
  | 'MOTIVO_ANULACION_DOCUMENTO'
  | 'ARCHIVO_FISICO_DOCUMENTO';

/** Catalogo generico de valores parametrizables administrados desde
 * Organizacion Institucional -> Parametros. `padreId` solo se usa en la
 * jerarquia geografica (DEPARTAMENTO->PAIS, CIUDAD->DEPARTAMENTO,
 * BARRIO->CIUDAD); el resto de los tipos son planos. */
@Entity({ name: 'parametros', schema: 'organizacion' })
export class Parametro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 40 })
  tipo: TipoParametro;

  @Column({ type: 'uniqueidentifier', nullable: true })
  padreId: string | null;

  @Column({ type: 'nvarchar', length: 200 })
  nombre: string;

  @Column({ type: 'nvarchar', length: 200 })
  nombreNormalizado: string;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  codigo: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  descripcion: string | null;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVO' })
  estado: 'ACTIVO' | 'INACTIVO';

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  eliminadoEn: Date | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
