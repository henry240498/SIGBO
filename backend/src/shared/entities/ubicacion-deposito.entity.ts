import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoUbicacionDeposito = 'ACTIVA' | 'INACTIVA';

/** Jerarquia fisica de ubicaciones de deposito: Institucion (implicita) ->
 * Cuartel -> Deposito -> Sector -> Estanteria -> Ubicacion (seccion 5 del
 * pedido). `tipoUbicacionId` referencia organizacion.parametros (tipo
 * TIPO_UBICACION_DEPOSITO). `padreId` arma la jerarquia; `cuartelId` ancla
 * la raiz a un organizacion.cuarteles real (reutilizado, no duplicado).
 * Las ubicaciones "externas o especiales" (vehiculo, personal, servicio,
 * otra institucion) NO son filas aca -- se registran en
 * deposito.tenencias/movimientos via sus propias FKs (vehiculoId,
 * bomberoId, servicioId), evitando una jerarquia polimorfica confusa. */
@Entity({ name: 'ubicaciones', schema: 'deposito' })
export class UbicacionDeposito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  codigo: string | null;

  @Column({ type: 'nvarchar', length: 150 })
  nombre: string;

  @Column({ type: 'uniqueidentifier' })
  tipoUbicacionId: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  padreId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  cuartelId: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVA' })
  estado: EstadoUbicacionDeposito;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
