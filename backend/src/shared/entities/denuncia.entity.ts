import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoDenuncia = 'NUEVA' | 'EN_REVISION' | 'ASIGNADA' | 'EN_INVESTIGACION' | 'RESUELTA' | 'CERRADA' | 'DESCARTADA' | 'DUPLICADA';

@Entity({ name: 'denuncias', schema: 'denuncias' })
export class Denuncia {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'nvarchar', length: 30 }) codigo: string;
  @Column({ type: 'uniqueidentifier', nullable: true }) claveIdempotencia: string | null;
  @Column({ type: 'uniqueidentifier', nullable: true }) usuarioId: string | null;
  @Column({ type: 'nvarchar', length: 160 }) nombreDenunciante: string;
  @Column({ type: 'nvarchar', length: 20 }) telefono: string;
  @Column({ type: 'uniqueidentifier' }) categoriaId: string;
  @Column({ type: 'nvarchar', length: 180, nullable: true }) asuntoOtro: string | null;
  @Column({ type: 'nvarchar', nullable: true }) descripcion: string | null;
  @Column({ type: 'uniqueidentifier', nullable: true }) servicioId: string | null;
  @Column({ type: 'uniqueidentifier', nullable: true }) vehiculoId: string | null;
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true }) latitud: number | null;
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true }) longitud: number | null;
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true }) precisionUbicacion: number | null;
  @Column({ type: 'datetimeoffset', precision: 3, nullable: true }) ubicacionCapturadaEn: Date | null;
  @Column({ type: 'varchar', length: 45, nullable: true }) ip: string | null;
  @Column({ type: 'nvarchar', length: 500, nullable: true }) userAgent: string | null;
  @Column({ type: 'nvarchar', length: 20, nullable: true }) tipoDispositivo: string | null;
  @Column({ type: 'nvarchar', length: 25, default: 'NUEVA' }) estado: EstadoDenuncia;
  @Column({ type: 'uniqueidentifier', nullable: true }) asignadoA: string | null;
  @CreateDateColumn({ type: 'datetimeoffset', precision: 3 }) creadoEn: Date;
  @UpdateDateColumn({ type: 'datetimeoffset', precision: 3 }) actualizadoEn: Date;
}
