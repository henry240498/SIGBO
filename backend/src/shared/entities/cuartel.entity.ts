import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'cuarteles', schema: 'organizacion' })
export class Cuartel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 20 })
  codigo: string;

  @Column({ type: 'nvarchar', length: 100 })
  nombre: string;

  @Column({ type: 'uniqueidentifier' })
  companiaId: string;

  @Column({ type: 'nvarchar', nullable: true })
  direccion: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  telefono: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  responsableBomberoId: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVO' })
  estado: 'ACTIVO' | 'INACTIVO';

  /** Referencia geografica del cuartel -- marcador "Cuartel" y punto de
   * origen para la distancia de las pruebas de comunicacion (Servicios
   * > Seguimiento Geografico). Nulo hasta que alguien la cargue. */
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitud: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitud: number | null;

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
