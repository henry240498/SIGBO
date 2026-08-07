import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'fojas_servicio', schema: 'personal' })
export class FojaServicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'int' })
  anio: number;

  @Column({ type: 'datetimeoffset', precision: 3 })
  generadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  generadoPor: string | null;

  @Column({ type: 'nvarchar' })
  contenidoJson: string;

  @Column({ type: 'nvarchar', nullable: true })
  archivoPdfUrl: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  archivoDocxUrl: string | null;
}
