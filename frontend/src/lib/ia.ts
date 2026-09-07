import { apiFetch, API_ORIGIN, obtenerSesion } from './api';

/* ------------------------------------------------------------------ */
/* Tipos                                                                */
/* ------------------------------------------------------------------ */

export type FormalidadIa = 'BAJA' | 'MEDIA' | 'ALTA';
export type EstadoConfiguracionIa = 'ACTIVA' | 'INACTIVA' | 'MANTENIMIENTO';
export type RolMensajeIa = 'USUARIO' | 'IA' | 'SISTEMA' | 'HERRAMIENTA';
export type ResultadoMensajeIa = 'OK' | 'DENEGADO' | 'ERROR' | 'BLOQUEADO';
export type EstadoPropuestaIa = 'BORRADOR' | 'PROPUESTA' | 'REVISION' | 'APROBADO' | 'RECHAZADO' | 'PUBLICADO';

export interface PerfilIa {
  nombre: string;
  personaje: string | null;
  descripcion: string | null;
  avatarUrl: string | null;
  avatarEmoji: string | null;
  avatarColorFondo: string | null;
  saludo: string | null;
  estado: EstadoConfiguracionIa;
  mensajeMantenimiento: string | null;
  vozHabilitada: boolean;
  entradaVozHabilitada: boolean;
  respuestaVozHabilitada: boolean;
  vozVolumen: number;
  vozVelocidad: number;
  vozIdioma: string;
}

export interface ConfiguracionIa extends PerfilIa {
  id: string;
  institucionId: string | null;
  personalidad: string | null;
  formalidad: FormalidadIa;
  permiteEmojis: boolean;
  instruccionesInstitucionales: string | null;
  motivoDesactivacion: string | null;
  limiteActivo: boolean;
  limiteConsultasMinuto: number;
  limiteConsultasHora: number;
  modulosHabilitadosJson: string;
  explicarInterpretacion: boolean;
  ollamaHabilitado: boolean;
  ollamaUrl: string;
  ollamaPuerto: number;
  ollamaModelo: string | null;
  ollamaTimeoutMs: number;
  ollamaTemperatura: number;
  vozHabilitada: boolean;
  entradaVozHabilitada: boolean;
  respuestaVozHabilitada: boolean;
  vozVolumen: number;
  vozVelocidad: number;
  vozSeleccionada: string | null;
  vozIdioma: string;
  whisperUrl: string;
  whisperPuerto: number;
  whisperTimeoutMs: number;
  piperRutaBinario: string | null;
  piperRutaVoz: string | null;
  piperTimeoutMs: number;
  creadoEn: string;
  actualizadoEn: string;
  actualizadoPor: string | null;
}

export interface FuenteCitada {
  documentoId: string;
  titulo: string;
  numeroDocumental: string | null;
  enlace: string;
}

export interface RespuestaChatIa {
  conversacionId: string;
  mensajeId: string | null;
  respuesta: string;
  fuentes: FuenteCitada[];
  error?: boolean;
  enMantenimiento?: boolean;
}

export interface ConversacionIa {
  id: string;
  institucionId: string | null;
  usuarioId: string;
  titulo: string | null;
  estado: 'ACTIVA' | 'CERRADA';
  ip: string | null;
  userAgent: string | null;
  iniciadaEn: string;
  ultimaActividadEn: string;
}

/** Version que devuelve el panel admin (`/ia/admin/conversaciones`): trae
 * el username ya resuelto, no el usuarioId crudo. */
export interface ConversacionIaAdmin extends ConversacionIa {
  usuarioUsername: string | null;
  usuarioEmail: string | null;
}

export interface MensajeIa {
  id: string;
  conversacionId: string;
  rol: RolMensajeIa;
  contenido: string;
  duracionMs: number | null;
  fuentesJson: string | null;
  resultado: ResultadoMensajeIa;
  errorDetalle: string | null;
  creadoEn: string;
}

export interface EjecucionHerramientaIa {
  id: string;
  mensajeId: string | null;
  conversacionId: string;
  usuarioId: string;
  herramienta: string;
  argumentosJson: string | null;
  permisoEvaluado: string | null;
  resultado: 'PERMITIDO' | 'DENEGADO' | 'ERROR';
  datosConsultadosResumen: string | null;
  errorDetalle: string | null;
  duracionMs: number | null;
  creadoEn: string;
}

export interface PropuestaMejoraIa {
  id: string;
  institucionId: string | null;
  origen: 'IA' | 'USUARIO';
  problemaDetectado: string;
  propuestaTexto: string;
  estado: EstadoPropuestaIa;
  creadoPor: string | null;
  revisadoPor: string | null;
  fechaRevision: string | null;
  motivoDecision: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface HistorialConfiguracionIa {
  id: string;
  configuracionId: string;
  valorAnteriorJson: string;
  valorNuevoJson: string;
  motivo: string | null;
  usuarioId: string;
  ip: string | null;
  creadoEn: string;
}

export interface IndicadoresIa {
  consultasHoy: number;
  consultasMes: number;
  errores: number;
  consultasBloqueadas: number;
  usuariosActivosMes: number;
  ultimosErrores: MensajeIa[];
  ultimosBloqueos: EjecucionHerramientaIa[];
}

export interface UsoPorHerramientaIa {
  herramienta: string;
  total: number;
  permitidas: number;
  denegadas: number;
}

export interface RegistroAuditoriaIa {
  id: string;
  usuarioId: string | null;
  accion: string;
  recurso: string;
  recursoId: string | null;
  ip: string | null;
  datosAntes: string | null;
  datosDespues: string | null;
  metadata: string | null;
  fecha: string;
}

async function mensajeError(res: Response, porDefecto: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return Array.isArray(body.message) ? body.message.join(', ') : body.message ?? porDefecto;
}

/* ------------------------------------------------------------------ */
/* Chat                                                                 */
/* ------------------------------------------------------------------ */

export async function cargarPerfilIa() {
  const res = await apiFetch('/ia/perfil');
  if (!res.ok) throw new Error('No se pudo cargar el perfil del asistente');
  return res.json() as Promise<PerfilIa>;
}

export async function enviarMensajeIa(mensaje: string, conversacionId?: string) {
  const res = await apiFetch('/ia/chat', { method: 'POST', body: JSON.stringify({ mensaje, conversacionId }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo enviar el mensaje'));
  return res.json() as Promise<RespuestaChatIa>;
}

/** Sube un audio grabado por el navegador (MediaRecorder produce webm/ogg
 * segun el navegador -- nunca WAV) y devuelve el texto transcrito por
 * whisper.cpp LOCAL. No usa apiFetch: FormData necesita que el navegador
 * arme su propio boundary de multipart, forzar 'Content-Type: application/
 * json' lo rompe (mismo motivo por el que subirAvatarIa tampoco lo usa). */
export async function transcribirVoz(audio: Blob): Promise<{ texto: string }> {
  const formData = new FormData();
  formData.append('audio', audio, 'audio.webm');
  const sesion = obtenerSesion();
  const headers: HeadersInit = {};
  if (sesion) headers['Authorization'] = `Bearer ${sesion.accessToken}`;
  const res = await fetch(`${API_ORIGIN}/api/v1/ia/voz/transcribir`, { method: 'POST', headers, body: formData });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo transcribir el audio'));
  return res.json();
}

/** Sintetiza en voz (Piper LOCAL) un mensaje que Snoopy YA dijo -- nunca
 * texto libre (ver comentario en HablarVozDto/IaVozService). Devuelve el
 * audio WAV como Blob, listo para reproducir. */
export async function hablarVoz(mensajeId: string): Promise<Blob> {
  const res = await apiFetch('/ia/voz/hablar', { method: 'POST', body: JSON.stringify({ mensajeId }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo generar el audio'));
  return res.blob();
}

export async function cargarMisConversaciones() {
  const res = await apiFetch('/ia/conversaciones');
  if (!res.ok) throw new Error('No se pudo cargar el historial de conversaciones');
  return res.json() as Promise<ConversacionIa[]>;
}

export async function cargarConversacion(id: string) {
  const res = await apiFetch(`/ia/conversaciones/${id}`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar la conversación'));
  return res.json() as Promise<{ conversacion: ConversacionIa; mensajes: MensajeIa[] }>;
}

/* ------------------------------------------------------------------ */
/* Administracion -- Seguridad -> Inteligencia Artificial               */
/* ------------------------------------------------------------------ */

export async function cargarConfiguracionIa() {
  const res = await apiFetch('/ia/admin/config');
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar la configuración'));
  return res.json() as Promise<ConfiguracionIa>;
}

export async function actualizarConfiguracionIa(payload: Record<string, unknown>) {
  const res = await apiFetch('/ia/admin/config', { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar la configuración'));
  return res.json() as Promise<ConfiguracionIa>;
}

export interface ModeloOllama {
  nombre: string;
  tamanoBytes: number;
}

export interface EstadoOllama {
  conectado: boolean;
  url: string;
  modelosInstalados: ModeloOllama[];
  modeloConfigurado: string | null;
  modeloDisponible: boolean;
  error: string | null;
}

export async function cargarEstadoOllama() {
  const res = await apiFetch('/ia/admin/config/ollama/estado');
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo consultar el estado de Ollama'));
  return res.json() as Promise<EstadoOllama>;
}

export async function probarConexionOllama() {
  const res = await apiFetch('/ia/admin/config/ollama/probar-conexion', { method: 'POST' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo probar la conexión'));
  return res.json() as Promise<{ conectado: boolean; version: string | null; error: string | null }>;
}

export async function probarGeneracionOllama(prompt?: string) {
  const res = await apiFetch('/ia/admin/config/ollama/probar-generacion', { method: 'POST', body: JSON.stringify({ prompt }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo probar la generación'));
  return res.json() as Promise<{ ok: boolean; respuesta: string | null; duracionMs: number | null; error: string | null }>;
}

export interface EstadoWhisper {
  conectado: boolean;
  url: string;
  error: string | null;
}

export async function cargarEstadoWhisper() {
  const res = await apiFetch('/ia/admin/config/whisper/estado');
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo consultar el estado de whisper.cpp'));
  return res.json() as Promise<EstadoWhisper>;
}

export interface EstadoPiper {
  disponible: boolean;
  rutaBinario: string | null;
  rutaVoz: string | null;
  error: string | null;
}

export async function cargarEstadoPiper() {
  const res = await apiFetch('/ia/admin/config/piper/estado');
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo consultar el estado de Piper'));
  return res.json() as Promise<EstadoPiper>;
}

export interface VozPiperDisponible {
  archivo: string;
  ruta: string;
  etiqueta: string;
}

/** Voces de Piper realmente instaladas en disco (Cierre de Snoopy) --
 * alimenta el combo de seleccion en vez de una ruta de archivo a mano. */
export async function cargarVocesPiper() {
  const res = await apiFetch('/ia/admin/config/piper/voces');
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo consultar las voces instaladas'));
  return res.json() as Promise<VozPiperDisponible[]>;
}

/** Prueba de sintesis real (seccion 9, mismo patron que probarGeneracionOllama):
 * devuelve el audio generado, no solo un booleano -- el admin lo escucha
 * directamente en el panel. */
export async function probarPiper(texto?: string): Promise<Blob> {
  const res = await apiFetch('/ia/admin/config/piper/probar', { method: 'POST', body: JSON.stringify({ texto }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo generar el audio de prueba'));
  return res.blob();
}

export async function cargarHistorialConfiguracionIa() {
  const res = await apiFetch('/ia/admin/config/historial');
  if (!res.ok) throw new Error('No se pudo cargar el historial de configuración');
  return res.json() as Promise<HistorialConfiguracionIa[]>;
}

export async function subirAvatarIa(archivo: File) {
  const formData = new FormData();
  formData.append('archivo', archivo);
  const sesion = obtenerSesion();
  const headers: HeadersInit = {};
  if (sesion) headers['Authorization'] = `Bearer ${sesion.accessToken}`;
  const res = await fetch(`${API_ORIGIN}/api/v1/ia/admin/config/avatar`, { method: 'POST', headers, body: formData });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo subir el avatar'));
  return res.json() as Promise<ConfiguracionIa>;
}

export async function seleccionarAvatarPredefinidoIa(emoji: string, colorFondo: string) {
  const res = await apiFetch('/ia/admin/config/avatar-predefinido', { method: 'POST', body: JSON.stringify({ emoji, colorFondo }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo aplicar el avatar predefinido'));
  return res.json() as Promise<ConfiguracionIa>;
}

/** Avatares sugeridos: emoji + color de la paleta oficial de SIGBO (ver
 * docs/GUIA-DE-ESTILO.md) -- no dependen de subir ningun archivo, se
 * renderizan al instante en el frontend. */
export const AVATARES_PREDEFINIDOS: Array<{ emoji: string; colorFondo: string; etiqueta: string }> = [
  { emoji: '🐶', colorFondo: '#334155', etiqueta: 'Snoopy' },
  { emoji: '🚒', colorFondo: '#7f1d1d', etiqueta: 'Camión de bomberos' },
  { emoji: '🔥', colorFondo: '#451a03', etiqueta: 'Llama' },
  { emoji: '🧯', colorFondo: '#2563eb', etiqueta: 'Extintor' },
  { emoji: '🐕‍🦺', colorFondo: '#166534', etiqueta: 'Perro de rescate' },
  { emoji: '🎖️', colorFondo: '#475569', etiqueta: 'Insignia' },
  { emoji: '🤖', colorFondo: '#0f172a', etiqueta: 'Robot asistente' },
  { emoji: '📋', colorFondo: '#1e293b', etiqueta: 'Asistente' },
  { emoji: '⚡', colorFondo: '#2563eb', etiqueta: 'Rayo' },
  { emoji: '🛟', colorFondo: '#166534', etiqueta: 'Salvavidas' },
];

export async function cambiarEstadoIa(estado: EstadoConfiguracionIa, motivo?: string, mensajeMantenimiento?: string) {
  const res = await apiFetch('/ia/admin/estado', { method: 'PATCH', body: JSON.stringify({ estado, motivo, mensajeMantenimiento }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cambiar el estado'));
  return res.json() as Promise<ConfiguracionIa>;
}

export async function cargarTodasLasConversaciones(filtros?: { usuarioId?: string; desde?: string; hasta?: string }) {
  const params = new URLSearchParams();
  if (filtros?.usuarioId) params.set('usuarioId', filtros.usuarioId);
  if (filtros?.desde) params.set('desde', filtros.desde);
  if (filtros?.hasta) params.set('hasta', filtros.hasta);
  const res = await apiFetch(`/ia/admin/conversaciones?${params.toString()}`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar las conversaciones'));
  return res.json() as Promise<ConversacionIaAdmin[]>;
}

export async function eliminarConversacionIa(id: string) {
  const res = await apiFetch(`/ia/admin/conversaciones/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo eliminar la conversación'));
  return res.json() as Promise<{ eliminado: boolean }>;
}

export async function cargarEjecucionesDeConversacion(id: string) {
  const res = await apiFetch(`/ia/admin/conversaciones/${id}/ejecuciones`);
  if (!res.ok) throw new Error('No se pudo cargar las herramientas usadas en esta conversación');
  return res.json() as Promise<EjecucionHerramientaIa[]>;
}

export async function cargarIndicadoresIa() {
  const res = await apiFetch('/ia/admin/dashboard');
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar el dashboard'));
  return res.json() as Promise<IndicadoresIa>;
}

export async function cargarUsoPorHerramientaIa(desde?: string, hasta?: string) {
  const params = new URLSearchParams();
  if (desde) params.set('desde', desde);
  if (hasta) params.set('hasta', hasta);
  const res = await apiFetch(`/ia/admin/dashboard/uso-por-herramienta?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el uso por herramienta');
  return res.json() as Promise<UsoPorHerramientaIa[]>;
}

/** Borrado definitivo (boton "Eliminar IA"): exige escribir "DELETE"
 * exacto, validado tambien en el backend (nunca solo en el frontend). */
export async function eliminarIaDefinitivamente(confirmacion: string, motivo?: string) {
  const res = await apiFetch('/ia/admin/config/eliminar-definitivamente', { method: 'POST', body: JSON.stringify({ confirmacion, motivo }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo eliminar la IA'));
  return res.json() as Promise<{ eliminado: true; resumen: Record<string, number> }>;
}

export async function cargarAuditoriaIa(filtros?: { accion?: string; desde?: string; hasta?: string }) {
  const params = new URLSearchParams();
  if (filtros?.accion) params.set('accion', filtros.accion);
  if (filtros?.desde) params.set('desde', filtros.desde);
  if (filtros?.hasta) params.set('hasta', filtros.hasta);
  const res = await apiFetch(`/ia/admin/auditoria?${params.toString()}`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar la auditoría'));
  return res.json() as Promise<{ items: RegistroAuditoriaIa[]; total: number }>;
}

/* ------------------------------------------------------------------ */
/* Propuestas de mejora                                                 */
/* ------------------------------------------------------------------ */

export async function cargarPropuestasMejora(estado?: string) {
  const params = new URLSearchParams();
  if (estado) params.set('estado', estado);
  const res = await apiFetch(`/ia/admin/propuestas?${params.toString()}`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar las propuestas'));
  return res.json() as Promise<PropuestaMejoraIa[]>;
}

export async function crearPropuestaMejora(problemaDetectado: string, propuestaTexto: string) {
  const res = await apiFetch('/ia/admin/propuestas', { method: 'POST', body: JSON.stringify({ problemaDetectado, propuestaTexto }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la propuesta'));
  return res.json() as Promise<PropuestaMejoraIa>;
}

export async function enviarPropuestaARevision(id: string) {
  const res = await apiFetch(`/ia/admin/propuestas/${id}/enviar-revision`, { method: 'POST' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo enviar a revisión'));
  return res.json() as Promise<PropuestaMejoraIa>;
}

export async function aprobarPropuestaMejora(id: string, motivoDecision?: string) {
  const res = await apiFetch(`/ia/admin/propuestas/${id}/aprobar`, { method: 'POST', body: JSON.stringify({ motivoDecision }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo aprobar la propuesta'));
  return res.json() as Promise<PropuestaMejoraIa>;
}

export async function rechazarPropuestaMejora(id: string, motivoDecision?: string) {
  const res = await apiFetch(`/ia/admin/propuestas/${id}/rechazar`, { method: 'POST', body: JSON.stringify({ motivoDecision }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo rechazar la propuesta'));
  return res.json() as Promise<PropuestaMejoraIa>;
}

export async function publicarPropuestaMejora(id: string) {
  const res = await apiFetch(`/ia/admin/propuestas/${id}/publicar`, { method: 'POST' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo publicar la propuesta'));
  return res.json() as Promise<PropuestaMejoraIa>;
}
