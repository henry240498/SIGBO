import { apiFetch, API_ORIGIN, obtenerSesion } from './api';
import { cargarParametros } from './parametros';

async function mensajeError(res: Response, porDefecto: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return Array.isArray(body.message) ? body.message.join(', ') : body.message ?? porDefecto;
}

/* ------------------------------------------------------------------ */
/* Catalogos parametrizables                                            */
/* ------------------------------------------------------------------ */

export function cargarEstadosSocioProtector() {
  return cargarParametros('ESTADO_SOCIO_PROTECTOR');
}
export function cargarPeriodicidadesAporte() {
  return cargarParametros('PERIODICIDAD_APORTE');
}
export function cargarMediosPagoFinanzas() {
  return cargarParametros('MEDIO_PAGO_FINANZAS');
}
export function cargarTiposBeneficioSocio() {
  return cargarParametros('TIPO_BENEFICIO_SOCIO');
}
export function cargarMotivosNotaCredito() {
  return cargarParametros('MOTIVO_NOTA_CREDITO_FINANZAS');
}

/* ------------------------------------------------------------------ */
/* Tipos                                                                */
/* ------------------------------------------------------------------ */

export type TipoPersonaSocio = 'FISICA' | 'JURIDICA';

export interface SocioProtector {
  id: string;
  codigo: string;
  tipoPersona: TipoPersonaSocio;
  bomberoId: string | null;
  bomberoNumero?: string | null;
  nombre: string | null;
  apellido: string | null;
  ci: string | null;
  fechaNacimiento: string | null;
  razonSocial: string | null;
  ruc: string | null;
  nombreComercial: string | null;
  representanteNombre: string | null;
  representanteCi: string | null;
  telefono: string | null;
  celular: string | null;
  email: string | null;
  direccion: string | null;
  paisId: string | null;
  departamentoId: string | null;
  ciudadId: string | null;
  barrioId: string | null;
  estadoId: string;
  observaciones: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface SocioHistorialCodigo {
  id: string;
  socioProtectorId: string;
  codigoAnterior: string;
  codigoNuevo: string;
  motivo: string | null;
  fechaCambio: string;
}

export type EstadoAcuerdoAporte = 'ACTIVO' | 'FINALIZADO' | 'SUSPENDIDO' | 'CANCELADO';

export interface AcuerdoAporte {
  id: string;
  socioProtectorId: string;
  montoAcordado: number;
  moneda: string;
  periodicidadId: string;
  fechaInicio: string;
  fechaFin: string | null;
  estado: EstadoAcuerdoAporte;
  medioPagoPreferidoId: string | null;
  observaciones: string | null;
  creadoEn: string;
}

export type EstadoAporte = 'REGISTRADO' | 'ANULADO';

export interface Aporte {
  id: string;
  socioProtectorId: string;
  acuerdoAporteId: string | null;
  esExtraordinario: boolean;
  fecha: string;
  hora: string | null;
  monto: number;
  moneda: string;
  periodoCorrespondiente: string | null;
  concepto: string | null;
  medioPagoId: string | null;
  numeroComprobante: string | null;
  cajaId: string | null;
  cuentaBancariaId: string | null;
  facturaId: string | null;
  archivoUrl: string | null;
  movimientoFinancieroId: string | null;
  estado: EstadoAporte;
  motivoAnulacion: string | null;
  observaciones: string | null;
  creadoEn: string;
}

export type AmbitoBeneficioSocio = 'ACADEMIA' | 'SERVICIOS' | 'GENERAL';
export type EstadoBeneficioSocio = 'ACTIVO' | 'INACTIVO';

export interface BeneficioSocio {
  id: string;
  nombre: string;
  tipoId: string;
  porcentajeDescuento: number | null;
  montoFijoDescuento: number | null;
  ambito: AmbitoBeneficioSocio;
  actividadAcademicaId: string | null;
  tipoServicioId: string | null;
  fechaInicio: string;
  fechaFin: string | null;
  estado: EstadoBeneficioSocio;
  condiciones: string | null;
  observaciones: string | null;
  creadoEn: string;
}

export interface SimulacionBeneficio {
  beneficio: BeneficioSocio | null;
  descuentoAplicado: number;
  montoFinal: number;
}

export type OrigenFactura = 'MANUAL' | 'SIGBO';
export type EstadoFactura = 'EMITIDA' | 'ANULADA';

export interface Factura {
  id: string;
  origen: OrigenFactura;
  tipoComprobanteId: string;
  numero: string;
  establecimiento: string | null;
  puntoExpedicion: string | null;
  serie: string | null;
  timbrado: string | null;
  fecha: string;
  socioProtectorId: string | null;
  clienteNombre: string | null;
  clienteRucCi: string | null;
  concepto: string;
  detalle: string | null;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  impuestos: number;
  total: number;
  moneda: string;
  formaPagoId: string | null;
  aporteId: string | null;
  inscripcionAcademiaId: string | null;
  archivoUrl: string | null;
  estado: EstadoFactura;
  motivoAnulacion: string | null;
  creadoEn: string;
}

export interface NotaCredito {
  id: string;
  facturaId: string;
  numero: string;
  fecha: string;
  motivoId: string;
  concepto: string | null;
  importe: number;
  archivoUrl: string | null;
  estado: 'EMITIDA' | 'ANULADA';
  creadoEn: string;
}

export interface NumeracionComprobante {
  id: string;
  tipoComprobanteId: string;
  establecimiento: string;
  puntoExpedicion: string;
  serie: string | null;
  timbrado: string;
  numeracionDesde: number;
  numeracionHasta: number;
  ultimoNumero: number;
  vigenciaDesde: string;
  vigenciaHasta: string | null;
  estado: string;
  creadoEn: string;
}

export interface EstadoDeCuentaSocio {
  socio: SocioProtector;
  acuerdos: Array<{ acuerdo: AcuerdoAporte; aportadoAlAcuerdo: number }>;
  aportes: Aporte[];
  facturas: Factura[];
  totales: { totalAportado: number; totalExtraordinario: number; totalGeneral: number };
}

/* ------------------------------------------------------------------ */
/* Socios Protectores                                                   */
/* ------------------------------------------------------------------ */

export async function cargarSociosProtectores(filtros: { estadoId?: string; tipoPersona?: string; q?: string } = {}): Promise<SocioProtector[]> {
  const params = new URLSearchParams();
  if (filtros.estadoId) params.set('estadoId', filtros.estadoId);
  if (filtros.tipoPersona) params.set('tipoPersona', filtros.tipoPersona);
  if (filtros.q) params.set('q', filtros.q);
  const res = await apiFetch(`/finanzas/socios-protectores?${params.toString()}`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar el listado de socios protectores'));
  return res.json();
}

export async function obtenerSocioProtector(id: string): Promise<SocioProtector> {
  const res = await apiFetch(`/finanzas/socios-protectores/${id}`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar el socio protector'));
  return res.json();
}

export async function crearSocioProtector(payload: Record<string, unknown>): Promise<SocioProtector> {
  const res = await apiFetch('/finanzas/socios-protectores', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el socio protector'));
  return res.json();
}

export async function actualizarSocioProtector(id: string, payload: Record<string, unknown>): Promise<SocioProtector> {
  const res = await apiFetch(`/finanzas/socios-protectores/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar el socio protector'));
  return res.json();
}

export async function historialCodigoSocio(id: string): Promise<SocioHistorialCodigo[]> {
  const res = await apiFetch(`/finanzas/socios-protectores/${id}/historial-codigo`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar el historial de codigo'));
  return res.json();
}

export async function estadoDeCuentaSocio(id: string): Promise<EstadoDeCuentaSocio> {
  const res = await apiFetch(`/finanzas/socios-protectores/${id}/estado-de-cuenta`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar el estado de cuenta'));
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Acuerdos de aporte                                                   */
/* ------------------------------------------------------------------ */

export async function cargarAcuerdosAporte(filtros: { socioProtectorId?: string; estado?: string } = {}): Promise<AcuerdoAporte[]> {
  const params = new URLSearchParams();
  if (filtros.socioProtectorId) params.set('socioProtectorId', filtros.socioProtectorId);
  if (filtros.estado) params.set('estado', filtros.estado);
  const res = await apiFetch(`/finanzas/acuerdos-aporte?${params.toString()}`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar el listado de acuerdos'));
  return res.json();
}

export async function crearAcuerdoAporte(payload: Record<string, unknown>): Promise<AcuerdoAporte> {
  const res = await apiFetch('/finanzas/acuerdos-aporte', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el acuerdo de aporte'));
  return res.json();
}

export async function actualizarAcuerdoAporte(id: string, payload: Record<string, unknown>): Promise<AcuerdoAporte> {
  const res = await apiFetch(`/finanzas/acuerdos-aporte/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar el acuerdo de aporte'));
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Aportes                                                              */
/* ------------------------------------------------------------------ */

export async function cargarAportes(filtros: { socioProtectorId?: string; acuerdoAporteId?: string; esExtraordinario?: boolean; estado?: string; desde?: string; hasta?: string } = {}): Promise<Aporte[]> {
  const params = new URLSearchParams();
  if (filtros.socioProtectorId) params.set('socioProtectorId', filtros.socioProtectorId);
  if (filtros.acuerdoAporteId) params.set('acuerdoAporteId', filtros.acuerdoAporteId);
  if (filtros.esExtraordinario !== undefined) params.set('esExtraordinario', String(filtros.esExtraordinario));
  if (filtros.estado) params.set('estado', filtros.estado);
  if (filtros.desde) params.set('desde', filtros.desde);
  if (filtros.hasta) params.set('hasta', filtros.hasta);
  const res = await apiFetch(`/finanzas/aportes?${params.toString()}`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar el listado de aportes'));
  return res.json();
}

export async function registrarAporte(payload: Record<string, unknown>): Promise<Aporte> {
  const res = await apiFetch('/finanzas/aportes', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar el aporte'));
  return res.json();
}

export async function anularAporte(id: string, motivoAnulacionId: string, motivoAnulacionDetalle?: string): Promise<Aporte> {
  const res = await apiFetch(`/finanzas/aportes/${id}/anular`, { method: 'POST', body: JSON.stringify({ motivoAnulacionId, motivoAnulacionDetalle }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo anular el aporte'));
  return res.json();
}

export async function subirComprobanteAporte(archivo: File): Promise<{ archivoUrl: string }> {
  const formData = new FormData();
  formData.append('archivo', archivo);
  const sesion = obtenerSesion();
  const headers: HeadersInit = {};
  if (sesion) headers['Authorization'] = `Bearer ${sesion.accessToken}`;
  const res = await fetch(`${API_ORIGIN}/api/v1/finanzas/aportes/comprobante`, { method: 'POST', headers, body: formData });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo subir el comprobante'));
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Beneficios                                                           */
/* ------------------------------------------------------------------ */

export async function cargarBeneficiosSocios(filtros: { estado?: string; ambito?: string } = {}): Promise<BeneficioSocio[]> {
  const params = new URLSearchParams();
  if (filtros.estado) params.set('estado', filtros.estado);
  if (filtros.ambito) params.set('ambito', filtros.ambito);
  const res = await apiFetch(`/finanzas/beneficios?${params.toString()}`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar el listado de beneficios'));
  return res.json();
}

export async function crearBeneficioSocio(payload: Record<string, unknown>): Promise<BeneficioSocio> {
  const res = await apiFetch('/finanzas/beneficios', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el beneficio'));
  return res.json();
}

export async function actualizarBeneficioSocio(id: string, payload: Record<string, unknown>): Promise<BeneficioSocio> {
  const res = await apiFetch(`/finanzas/beneficios/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar el beneficio'));
  return res.json();
}

export async function simularBeneficioSocio(payload: { socioProtectorId: string; ambito: string; montoBase: number; referenciaId?: string }): Promise<SimulacionBeneficio> {
  const res = await apiFetch('/finanzas/beneficios/simular', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo simular el beneficio'));
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Facturacion                                                          */
/* ------------------------------------------------------------------ */

export async function cargarFacturas(filtros: { socioProtectorId?: string; estado?: string; origen?: string; desde?: string; hasta?: string } = {}): Promise<Factura[]> {
  const params = new URLSearchParams();
  if (filtros.socioProtectorId) params.set('socioProtectorId', filtros.socioProtectorId);
  if (filtros.estado) params.set('estado', filtros.estado);
  if (filtros.origen) params.set('origen', filtros.origen);
  if (filtros.desde) params.set('desde', filtros.desde);
  if (filtros.hasta) params.set('hasta', filtros.hasta);
  const res = await apiFetch(`/finanzas/facturas?${params.toString()}`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar el listado de facturas'));
  return res.json();
}

export async function crearFactura(payload: Record<string, unknown>): Promise<Factura> {
  const res = await apiFetch('/finanzas/facturas', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar la factura'));
  return res.json();
}

export async function anularFactura(id: string, motivo: string): Promise<Factura> {
  const res = await apiFetch(`/finanzas/facturas/${id}/anular`, { method: 'POST', body: JSON.stringify({ motivo }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo anular la factura'));
  return res.json();
}

export async function subirArchivoFactura(archivo: File): Promise<{ archivoUrl: string }> {
  const formData = new FormData();
  formData.append('archivo', archivo);
  const sesion = obtenerSesion();
  const headers: HeadersInit = {};
  if (sesion) headers['Authorization'] = `Bearer ${sesion.accessToken}`;
  const res = await fetch(`${API_ORIGIN}/api/v1/finanzas/facturas/archivo`, { method: 'POST', headers, body: formData });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo subir el archivo'));
  return res.json();
}

export async function cargarNotasCredito(filtros: { facturaId?: string } = {}): Promise<NotaCredito[]> {
  const params = new URLSearchParams();
  if (filtros.facturaId) params.set('facturaId', filtros.facturaId);
  const res = await apiFetch(`/finanzas/notas-credito?${params.toString()}`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar el listado de notas de credito'));
  return res.json();
}

export async function crearNotaCredito(payload: Record<string, unknown>): Promise<NotaCredito> {
  const res = await apiFetch('/finanzas/notas-credito', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la nota de credito'));
  return res.json();
}

export async function cargarNumeracionesComprobantes(): Promise<NumeracionComprobante[]> {
  const res = await apiFetch('/finanzas/numeraciones-comprobantes');
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar el listado de numeraciones'));
  return res.json();
}

export async function crearNumeracionComprobante(payload: Record<string, unknown>): Promise<NumeracionComprobante> {
  const res = await apiFetch('/finanzas/numeraciones-comprobantes', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la numeracion'));
  return res.json();
}

