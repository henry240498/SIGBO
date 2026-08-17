import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type FormalidadIa = 'BAJA' | 'MEDIA' | 'ALTA';
export type EstadoConfiguracionIa = 'ACTIVA' | 'INACTIVA' | 'MANTENIMIENTO';

/** Configuracion del asistente institucional (fila unica por institucion,
 * mismo patron que IdentidadInstitucional/ConfiguracionSistema -- hoy una
 * sola fila porque SIGBO no tiene institucion_id real todavia). "Snoopy"
 * es simplemente el valor actual de `nombre`/`personaje`: nada del backend
 * asume ese nombre (seccion 1-2 del pedido). `modulosHabilitadosJson` es
 * una restriccion ADICIONAL sobre los permisos del usuario, no un
 * reemplazo: una herramienta solo se ejecuta si el modulo esta habilitado
 * aqui Y el usuario tiene el permiso especifico (seccion 35, "Modulos
 * consultables"). "Roles habilitados" no tiene columna propia: se resuelve
 * con el permiso `inteligencia:usar` ya asignado por rol -- evita dos
 * fuentes de verdad para lo mismo.
 *
 * Sin `proveedor`/`modelo`: el motor de razonamiento es local (IaMotorService),
 * no un cliente de un LLM externo -- no hay proveedor que configurar
 * (pivote de arquitectura, ver migracion 060). `limiteActivo` en false es
 * "sin limites" tal cual lo pidio la institucion: el limitador de
 * ia-rate-limit.guard.ts es una proteccion tecnica anti-abuso opcional,
 * nunca un presupuesto de costo. */
@Entity({ name: 'configuraciones', schema: 'ia' })
export class ConfiguracionIa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @Column({ type: 'nvarchar', length: 100, default: 'Snoopy' })
  nombre: string;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  personaje: string | null;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  descripcion: string | null;

  /** Avatar subido como archivo -- mutuamente excluyente con avatarEmoji
   * (ver seleccionarAvatarPredefinido/actualizarAvatar en el service: al
   * elegir uno se limpia el otro). */
  @Column({ type: 'nvarchar', length: 500, nullable: true })
  avatarUrl: string | null;

  /** Avatar predefinido (emoji + color): no depende de ningun archivo ni
   * de que el navegador arme bien una URL contra el backend -- se
   * renderiza al instante en el frontend. */
  @Column({ type: 'nvarchar', length: 20, nullable: true })
  avatarEmoji: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  avatarColorFondo: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  personalidad: string | null;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  saludo: string | null;

  @Column({ type: 'nvarchar', length: 10, default: 'MEDIA' })
  formalidad: FormalidadIa;

  @Column({ type: 'bit', default: true })
  permiteEmojis: boolean;

  @Column({ type: 'nvarchar', nullable: true })
  instruccionesInstitucionales: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVA' })
  estado: EstadoConfiguracionIa;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  motivoDesactivacion: string | null;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  mensajeMantenimiento: string | null;

  @Column({ type: 'int', default: 8 })
  limiteConsultasMinuto: number;

  @Column({ type: 'int', default: 60 })
  limiteConsultasHora: number;

  /** Apagado por defecto: "sin limites" es el comportamiento de fabrica.
   * Un administrador lo activa si necesita frenar un abuso puntual. */
  @Column({ type: 'bit', default: false })
  limiteActivo: boolean;

  /** JSON string: string[] de slugs de modulo (ej. ["personal","finanzas"]). */
  @Column({ type: 'nvarchar' })
  modulosHabilitadosJson: string;

  /** Antepone a la respuesta como se interpreto la consulta (modulo,
   * intencion, filtros detectados) -- ayuda de confianza/depuracion,
   * apagada por defecto. */
  @Column({ type: 'bit', default: false })
  explicarInterpretacion: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
