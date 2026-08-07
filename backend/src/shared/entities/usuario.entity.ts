import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'usuarios', schema: 'seguridad' })
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  bomberoId: string | null;

  @Column({ type: 'nvarchar', length: 255 })
  email: string;

  @Column({ type: 'nvarchar', length: 100 })
  username: string;

  @Column({ type: 'nvarchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'nvarchar', length: 64 })
  salt: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  twoFactorSecret: string | null;

  @Column({ type: 'bit', default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'nvarchar', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'nvarchar', length: 10, default: 'es' })
  idioma: string;

  @Column({ type: 'nvarchar', length: 50, default: 'America/Asuncion' })
  zonaHoraria: string;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  ultimoAcceso: Date | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipUltimoAcceso: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  userAgent: string | null;

  @Column({ type: 'int', default: 0 })
  intentosFallidos: number;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  bloqueadoHasta: Date | null;

  @Column({ type: 'nvarchar', length: 30, default: 'ACTIVO' })
  estado: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO' | 'PENDIENTE_VERIFICACION';

  @Column({ name: 'debe_cambiar_password', type: 'bit', default: false })
  debeCambiarPassword: boolean;

  @Column({ name: 'password_expira_en', type: 'datetimeoffset', precision: 3, nullable: true })
  passwordExpiraEn: Date | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  /* --- Mi Perfil: redes sociales (campo unico cada una) --- */
  @Column({ type: 'nvarchar', length: 30, nullable: true })
  whatsapp: string | null;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  facebookUrl: string | null;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  instagramUrl: string | null;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  xUrl: string | null;
}
