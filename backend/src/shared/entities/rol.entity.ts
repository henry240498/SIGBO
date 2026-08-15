import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'roles', schema: 'seguridad' })
export class Rol {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 100 })
  nombre: string;

  @Column({ type: 'nvarchar', nullable: true })
  descripcion: string | null;

  @Column({ type: 'nvarchar', length: 7, default: '#6B7280' })
  color: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  icono: string | null;

  @Column({ type: 'int', default: 0 })
  prioridad: number;

  @Column({ type: 'int', default: 0 })
  jerarquia: number;

  @Column({ name: 'es_administrativo', type: 'bit', default: false })
  esAdministrativo: boolean;

  @Column({ name: 'es_operativo', type: 'bit', default: true })
  esOperativo: boolean;

  @Column({ name: 'es_predeterminado', type: 'bit', default: false })
  esPredeterminado: boolean;

  @Column({ name: 'es_sistema', type: 'bit', default: false })
  esSistema: boolean;

  /** Si esta activo, el rol tiene TODOS los permisos existentes -- presentes
   * y futuros -- sin depender de que cada migracion que agregue un permiso
   * nuevo recuerde asignarselo explicitamente (ver PolicyEngineService). */
  @Column({ name: 'acceso_total', type: 'bit', default: false })
  accesoTotal: boolean;

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @Column({ type: 'nvarchar', nullable: true })
  metadata: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
