import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'vehiculos_autorizados', schema: 'personal' })
export class VehiculoAutorizado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'uniqueidentifier' })
  vehiculoId: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  categoria: string | null;

  @Column({ type: 'date', nullable: true })
  fechaAutorizacion: string | null;

  @Column({ type: 'date', nullable: true })
  vigencia: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  capacitaciones: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
