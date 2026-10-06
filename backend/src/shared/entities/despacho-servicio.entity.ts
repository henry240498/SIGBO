import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoParticipante = 'EN_CAMINO' | 'EN_SITIO' | 'RETIRADO';
export type EstadoFormulario = 'BORRADOR' | 'COMPLETADO' | 'ANULADO';
export type AccionFormulario = 'CREAR' | 'MODIFICAR' | 'COMPLETAR' | 'ANULAR';
export type SujetoPantalla = 'ROL' | 'USUARIO' | 'RANGO' | 'CARGO';

/** Quien participa en un servicio activo y en que situacion esta (migracion 090). */
@Entity({ name: 'servicio_participantes', schema: 'servicios' })
export class ServicioParticipante {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  servicioId: string;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ type: 'nvarchar', length: 120 })
  usuarioNombre: string;

  @Column({ type: 'nvarchar', length: 60, nullable: true })
  rol: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'EN_CAMINO' })
  estado: EstadoParticipante;

  @Column({ type: 'uniqueidentifier', nullable: true })
  solicitudId: string | null;

  @Column({ type: 'datetimeoffset', precision: 3 })
  desde: Date;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  llegadaEn: Date | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  hasta: Date | null;

  @Column({ type: 'int', default: 0 })
  version: number;
}

/** Chat operativo: mensajes cortos asociados al servicio. Inmutable (disparador en la base). */
@Entity({ name: 'servicio_mensajes', schema: 'servicios' })
export class ServicioMensaje {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'uniqueidentifier' })
  servicioId: string;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ type: 'nvarchar', length: 120 })
  usuarioNombre: string;

  @Column({ type: 'nvarchar', length: 500 })
  texto: string;

  @Column({ type: 'datetimeoffset', precision: 3 })
  ocurridoEn: Date;

  @Column({ type: 'datetimeoffset', precision: 3 })
  registradoEn: Date;

  @Column({ type: 'nvarchar', length: 64, nullable: true })
  claveIdempotencia: string | null;
}

@Entity({ name: 'formulario_definiciones', schema: 'servicios' })
export class FormularioDefinicion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 40 })
  codigo: string;

  @Column({ type: 'nvarchar', length: 120 })
  nombre: string;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  descripcion: string | null;

  /** JSON: lista de campos (ver CampoFormulario en servicio-activo.logica.ts). */
  @Column({ type: 'nvarchar', length: 'MAX' })
  campos: string;

  /** JSON: ids de tipo de servicio. NULL = todos. */
  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  tiposServicio: string | null;

  /** JSON: nombres de rol. NULL = cualquiera. */
  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  roles: string | null;

  @Column({ type: 'nvarchar', length: 80, nullable: true })
  permisoRequerido: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  etapa: 'EN_CURSO' | 'CIERRE' | null;

  @Column({ type: 'bit', default: false })
  confidencial: boolean;

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @Column({ type: 'int', default: 1 })
  version: number;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}

@Entity({ name: 'formulario_respuestas', schema: 'servicios' })
export class FormularioRespuesta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  servicioId: string;

  @Column({ type: 'uniqueidentifier' })
  definicionId: string;

  @Column({ type: 'int' })
  definicionVersion: number;

  @Column({ type: 'nvarchar', length: 20, default: 'BORRADOR' })
  estado: EstadoFormulario;

  /** JSON {clave: valor}. */
  @Column({ type: 'nvarchar', length: 'MAX' })
  datos: string;

  @Column({ type: 'uniqueidentifier' })
  creadoPor: string;

  @Column({ type: 'nvarchar', length: 120 })
  creadoPorNombre: string;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'int', default: 0 })
  version: number;
}

/** Cada alta o cambio de un formulario. Inmutable. */
@Entity({ name: 'formulario_historial', schema: 'servicios' })
export class FormularioHistorial {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'uniqueidentifier' })
  respuestaId: string;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ type: 'nvarchar', length: 120 })
  usuarioNombre: string;

  @Column({ type: 'nvarchar', length: 20 })
  accion: AccionFormulario;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  datosAntes: string | null;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  datosDespues: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  estadoAntes: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  estadoDespues: string | null;

  @Column({ type: 'datetimeoffset', precision: 3 })
  ocurridoEn: Date;

  @Column({ type: 'datetimeoffset', precision: 3 })
  registradoEn: Date;
}

/** Catalogo de pantallas con su codigo hexadecimal (0xA001...). */
@Entity({ name: 'pantallas', schema: 'seguridad' })
export class Pantalla {
  @PrimaryColumn({ type: 'nvarchar', length: 10 })
  codigo: string;

  @Column({ type: 'nvarchar', length: 80 })
  nombre: string;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  descripcion: string | null;

  @Column({ type: 'bit', default: false })
  confidencialAplica: boolean;

  @Column({ type: 'bit', default: true })
  activa: boolean;
}

/** Matriz de permisos por pantalla para un rol, usuario, rango o cargo. */
@Entity({ name: 'pantalla_permisos', schema: 'seguridad' })
export class PantallaPermiso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 10 })
  pantallaCodigo: string;

  @Column({ type: 'nvarchar', length: 10 })
  sujetoTipo: SujetoPantalla;

  @Column({ type: 'nvarchar', length: 100 })
  sujetoId: string;

  @Column({ type: 'bit', default: false })
  ver: boolean;

  @Column({ type: 'bit', default: false })
  crear: boolean;

  @Column({ type: 'bit', default: false })
  editar: boolean;

  @Column({ type: 'bit', default: false })
  eliminar: boolean;

  @Column({ type: 'bit', default: false })
  confidencial: boolean;

  @Column({ type: 'bit', default: false })
  denegar: boolean;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}

/** Una visita a una pantalla: cuando entro, cuando salio y cuanto duro. Inmutable. */
@Entity({ name: 'navegacion_eventos', schema: 'seguridad' })
export class NavegacionEvento {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ type: 'nvarchar', length: 120, nullable: true })
  usuarioNombre: string | null;

  @Column({ type: 'nvarchar', length: 10 })
  pantallaCodigo: string;

  @Column({ type: 'datetimeoffset', precision: 3 })
  entrada: Date;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  salida: Date | null;

  @Column({ type: 'int', nullable: true })
  duracionSeg: number | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  servicioId: string | null;

  @Column({ type: 'nvarchar', length: 120, nullable: true })
  accion: string | null;

  @Column({ type: 'nvarchar', length: 160, nullable: true })
  dispositivo: string | null;

  @Column({ type: 'bit', default: true })
  conectado: boolean;

  @Column({ type: 'nvarchar', length: 45, nullable: true })
  ip: string | null;

  @Column({ type: 'datetimeoffset', precision: 3 })
  registradoEn: Date;

  @Column({ type: 'nvarchar', length: 64, nullable: true })
  claveIdempotencia: string | null;
}
