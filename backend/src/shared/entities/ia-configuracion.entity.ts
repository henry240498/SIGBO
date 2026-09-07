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
 * Sin `proveedor` de LLM externo: el motor de razonamiento sigue siendo
 * local y deterministico (IaMotorService), nunca un cliente de un
 * proveedor por internet (pivote de arquitectura, ver migracion 060).
 * `limiteActivo` en false es "sin limites" tal cual lo pidio la
 * institucion: el limitador de ia-rate-limit.guard.ts es una proteccion
 * tecnica anti-abuso opcional, nunca un presupuesto de costo.
 *
 * Los campos `ollama*` (migracion 072) son la EXCEPCION deliberada y
 * acotada: Ollama corre en la misma red local (tipicamente la misma
 * maquina), nunca sale a internet, y solo se usa para (a) sugerir una
 * herramienta cuando el reconocimiento por patrones no encuentra
 * ninguna y (b) redactar en lenguaje mas natural un resultado que
 * SIGBO ya calculo y ya autorizo -- nunca decide que datos se
 * entregan. `ollamaHabilitado` nace en false: no cambia el
 * comportamiento de una instalacion existente sin que un administrador
 * lo prenda a proposito. */
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

  @Column({ type: 'bit', default: false })
  ollamaHabilitado: boolean;

  @Column({ type: 'nvarchar', length: 200, default: 'http://localhost' })
  ollamaUrl: string;

  @Column({ type: 'int', default: 11434 })
  ollamaPuerto: number;

  /** Nombre exacto del modelo tal como lo devuelve `ollama list` (ej.
   * "llama3.2:3b"). Null hasta que un administrador lo elija entre los
   * modelos instalados -- nunca se asume uno por defecto sin que lo
   * confirmen (seccion 10 del pedido de integracion). */
  @Column({ type: 'nvarchar', length: 100, nullable: true })
  ollamaModelo: string | null;

  @Column({ type: 'int', default: 8000 })
  ollamaTimeoutMs: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.3 })
  ollamaTemperatura: number;

  /** Campos `voz*`/`whisper*`/`piper*` (migracion 073, Etapa 2 "voz local"):
   * misma excepcion acotada que Ollama -- whisper.cpp/Piper corren en la
   * misma maquina/red local, nunca salen a internet. `vozHabilitada` nace
   * en false: instalar la migracion no cambia el comportamiento de una
   * instalacion existente. `entradaVoz`/`respuestaVoz` solo importan si
   * `vozHabilitada` esta prendido -- permiten, por ejemplo, dejar que el
   * usuario hable pero que Snoopy conteste siempre en texto. Volumen y
   * velocidad se aplican en el navegador sobre el audio ya generado, no
   * le piden a Piper que vuelva a sintetizar. */
  @Column({ type: 'bit', default: false })
  vozHabilitada: boolean;

  @Column({ type: 'bit', default: true })
  entradaVozHabilitada: boolean;

  @Column({ type: 'bit', default: true })
  respuestaVozHabilitada: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  vozVolumen: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  vozVelocidad: number;

  /** Nombre del archivo de voz de Piper (ej. "es_AR-daniela-high"), no la
   * ruta completa -- mismo patron que ollamaModelo (nombre, no ruta). */
  @Column({ type: 'nvarchar', length: 150, nullable: true })
  vozSeleccionada: string | null;

  @Column({ type: 'nvarchar', length: 10, default: 'es' })
  vozIdioma: string;

  @Column({ type: 'nvarchar', length: 200, default: 'http://localhost' })
  whisperUrl: string;

  @Column({ type: 'int', default: 8090 })
  whisperPuerto: number;

  @Column({ type: 'int', default: 15000 })
  whisperTimeoutMs: number;

  /** Rutas de archivo, no nombre+catalogo: whisper-server carga UN modelo
   * por linea de comando al arrancar (no tiene API de inventario como
   * `ollama list`), y Piper es un binario CLI, no un servicio persistente. */
  @Column({ type: 'nvarchar', length: 400, nullable: true })
  piperRutaBinario: string | null;

  @Column({ type: 'nvarchar', length: 400, nullable: true })
  piperRutaVoz: string | null;

  @Column({ type: 'int', default: 15000 })
  piperTimeoutMs: number;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
