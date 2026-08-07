import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Personal que participo en un servicio (schema servicios). */
@Entity({ name: 'personal_servicio', schema: 'servicios' })
export class PersonalServicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  servicioId: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'nvarchar', length: 50 })
  rol: string;

  @Column({ type: 'int', default: 0 })
  horasServicio: number;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;
}
