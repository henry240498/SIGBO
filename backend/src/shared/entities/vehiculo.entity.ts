import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoVehiculo = 'OPERATIVO' | 'EN_MANTENIMIENTO' | 'FUERA_SERVICIO' | 'BAJA';

@Entity({ name: 'vehiculos', schema: 'vehiculos' })
export class Vehiculo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 20 })
  numeroInterno: string;

  @Column({ type: 'nvarchar', length: 50 })
  tipo: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  marca: string | null;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  modelo: string | null;

  @Column({ type: 'int', nullable: true })
  anio: number | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  patente: string | null;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  color: string | null;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  numeroChasis: string | null;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  numeroMotor: string | null;

  @Column({ type: 'int', nullable: true })
  capacidadCarga: number | null;

  @Column({ type: 'int', nullable: true })
  capacidadPasajeros: number | null;

  @Column({ type: 'int', default: 0 })
  kilometrajeActual: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  combustibleActual: number;

  @Column({ type: 'nvarchar', length: 20, default: 'OPERATIVO' })
  estado: EstadoVehiculo;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  ubicacionActual: string | null;

  @Column({ type: 'date', nullable: true })
  itvFecha: string | null;

  @Column({ type: 'date', nullable: true })
  itvVencimiento: string | null;

  @Column({ type: 'date', nullable: true })
  seguroFecha: string | null;

  @Column({ type: 'date', nullable: true })
  seguroVencimiento: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  seguroEmpresa: string | null;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  seguroPoliza: string | null;

  @Column({ type: 'date', nullable: true })
  ultimoMantenimiento: string | null;

  @Column({ type: 'date', nullable: true })
  proximoMantenimiento: string | null;

  @Column({ type: 'date', nullable: true })
  ultimoCambioAceite: string | null;

  @Column({ type: 'date', nullable: true })
  ultimoCambioCubiertas: string | null;

  @Column({ type: 'date', nullable: true })
  ultimaRevisionBateria: string | null;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  qrCode: string | null;

  @Column({ type: 'nvarchar', default: '[]' })
  fotos: string;

  @Column({ type: 'nvarchar', default: '[]' })
  documentos: string;

  @Column({ type: 'nvarchar', nullable: true })
  metadata: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'date', nullable: true })
  fechaBaja: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  motivoBaja: string | null;
}
