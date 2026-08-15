import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TipoElementoDeposito } from './tenencia-deposito.entity';

export type OrigenIncidenciaDeposito = 'INSPECCION_VEHICULO' | 'INVENTARIO_FISICO' | 'MANUAL' | 'OTRO';
export type GravedadIncidenciaDeposito = 'BAJA' | 'MEDIA' | 'ALTA';
export type EstadoIncidenciaDeposito = 'ABIERTA' | 'EN_REVISION' | 'RESUELTA' | 'DESCARTADA';

/** Unica entidad de incidencias de Deposito -- no existia ningun mecanismo
 * equivalente en el sistema (ni en Vehiculos ni en la inspeccion de guardia,
 * confirmado por auditoria previa). Cubre tanto una diferencia de
 * inventario fisico como un item faltante/danado detectado en una
 * inspeccion de movil (seccion 9 y 15 del pedido), enlazando por FK a la
 * inspeccion/item de origen sin duplicar esos datos. */
@Entity({ name: 'incidencias', schema: 'deposito' })
export class IncidenciaDeposito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 30 })
  origenTipo: OrigenIncidenciaDeposito;

  @Column({ type: 'nvarchar', length: 10, nullable: true })
  tipoElemento: TipoElementoDeposito | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  articuloId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  equipoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  vehiculoId: string | null;

  /** Referencia a operaciones.inspecciones_movil -- reutilizada, no duplicada. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  inspeccionMovilId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  inventarioFisicoItemId: string | null;

  @Column({ type: 'nvarchar' })
  descripcion: string;

  @Column({ type: 'nvarchar', length: 10, default: 'MEDIA' })
  gravedad: GravedadIncidenciaDeposito;

  @Column({ type: 'nvarchar', length: 20, default: 'ABIERTA' })
  estado: EstadoIncidenciaDeposito;

  @Column({ type: 'datetimeoffset', precision: 3 })
  fechaApertura: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  reportadoPor: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  resueltoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaResolucion: Date | null;

  @Column({ type: 'nvarchar', nullable: true })
  resolucion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;
}
