import { apiFetch } from './api';
import { cargarParametros } from './parametros';

/* ------------------------------------------------------------------ */
/* Catalogos parametrizables (Organizacion -> Parametros)               */
/* ------------------------------------------------------------------ */

export function cargarTiposIngresoFinanzas() {
  return cargarParametros('TIPO_INGRESO_FINANZAS');
}
export function cargarCategoriasEgresoFinanzas() {
  return cargarParametros('CATEGORIA_EGRESO_FINANZAS');
}
export function cargarTiposCuentaBancariaFinanzas() {
  return cargarParametros('TIPO_CUENTA_BANCARIA_FINANZAS');
}
export function cargarTiposDocumentoFinanzas() {
  return cargarParametros('TIPO_DOCUMENTO_FINANZAS');
}
export function cargarMotivosAnulacionFinanzas() {
  return cargarParametros('MOTIVO_ANULACION_FINANZAS');
}

/* ------------------------------------------------------------------ */
/* Tipos                                                                */
/* ------------------------------------------------------------------ */

export type EstadoEjercicioFiscal = 'ABIERTO' | 'CERRADO';

export interface EjercicioFiscal {
  id: string;
  anio: number;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoEjercicioFiscal;
  creadoEn: string;
}

export type EstadoCaja = 'ACTIVA' | 'INACTIVA';

export interface Caja {
  id: string;
  nombre: string;
  responsableId: string | null;
  estado: EstadoCaja;
  saldoActual: number;
  moneda: string;
  observacion: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export type EstadoTurnoCaja = 'ABIERTO' | 'CERRADO';

export interface TurnoCaja {
  id: string;
  cajaId: string;
  fechaApertura: string;
  usuarioApertura: string | null;
  saldoInicial: number;
  fechaCierre: string | null;
  usuarioCierre: string | null;
  saldoTeorico: number | null;
  saldoFisico: number | null;
  diferencia: number | null;
  observacionCierre: string | null;
  estado: EstadoTurnoCaja;
  creadoEn: string;
}

export type EstadoCuentaBancaria = 'ACTIVA' | 'INACTIVA';

export interface CuentaBancaria {
  id: string;
  banco: string;
  numeroCuenta: string;
  tipoCuentaId: string | null;
  moneda: string;
  responsableId: string | null;
  estado: EstadoCuentaBancaria;
  saldoActual: number;
  observacion: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export type TipoMovimientoFinanciero = 'INGRESO' | 'EGRESO';
export type EstadoMovimientoFinanciero = 'REGISTRADO' | 'ANULADO';

export interface MovimientoFinanciero {
  id: string;
  tipo: TipoMovimientoFinanciero;
  fecha: string;
  tipoIngresoId: string | null;
  categoriaEgresoId: string | null;
  concepto: string;
  importe: number;
  moneda: string;
  cajaId: string | null;
  cuentaBancariaId: string | null;
  turnoCajaId: string | null;
  proveedorId: string | null;
  bomberoId: string | null;
  entidadExterna: string | null;
  responsableId: string | null;
  cuotaId: string | null;
  ordenPagoId: string | null;
  depositoEntradaId: string | null;
  ejercicioId: string;
  observacion: string | null;
  estado: EstadoMovimientoFinanciero;
  anuladoPor: string | null;
  fechaAnulacion: string | null;
  motivoAnulacionId: string | null;
  motivoAnulacionDetalle: string | null;
  creadoEn: string;
  creadoPor: string | null;
}

export interface DocumentoRespaldoInput {
  tipoDocumentoId: string;
  numero?: string;
  timbrado?: string;
  fecha?: string;
  proveedorId?: string;
  importe?: number;
  archivoUrl?: string;
  observacion?: string;
}

export interface DocumentoRespaldo extends DocumentoRespaldoInput {
  id: string;
  movimientoId: string | null;
  ordenPagoId: string | null;
  creadoEn: string;
}

export type EstadoCuota = 'PENDIENTE' | 'PAGADA' | 'PARCIAL' | 'ANULADA' | 'EXONERADA';

export interface Cuota {
  id: string;
  bomberoId: string;
  periodo: string;
  importe: number;
  importePagado: number;
  estado: EstadoCuota;
  fechaVencimiento: string | null;
  movimientoId: string | null;
  observacion: string | null;
  creadoEn: string;
}

export type TipoMovimientoBancario = 'DEPOSITO' | 'TRANSFERENCIA' | 'DEBITO' | 'CREDITO' | 'COMISION' | 'OTRO';
export type EstadoConciliacion = 'PENDIENTE' | 'CONCILIADO' | 'DIFERENCIA';

export interface MovimientoBancario {
  id: string;
  cuentaBancariaId: string;
  tipo: TipoMovimientoBancario;
  fecha: string;
  importe: number;
  descripcion: string;
  movimientoFinancieroId: string | null;
  estadoConciliacion: EstadoConciliacion;
  fechaConciliacion: string | null;
  conciliadoPor: string | null;
  observacion: string | null;
  creadoEn: string;
}

export interface Presupuesto {
  id: string;
  ejercicioId: string;
  categoriaEgresoId: string;
  montoPresupuestado: number;
  observacion: string | null;
  ejecutado: number;
  disponible: number;
  porcentajeEjecutado: number;
  creadoEn: string;
  actualizadoEn: string;
}

export type EstadoOrdenPago = 'BORRADOR' | 'SOLICITADO' | 'PENDIENTE_AUTORIZACION' | 'AUTORIZADO' | 'RECHAZADO' | 'PAGADO' | 'ANULADO';

export interface OrdenPago {
  id: string;
  concepto: string;
  importe: number;
  categoriaEgresoId: string;
  proveedorId: string | null;
  cajaId: string | null;
  cuentaBancariaId: string | null;
  ejercicioId: string;
  estado: EstadoOrdenPago;
  solicitadoPor: string | null;
  fechaSolicitud: string | null;
  autorizadoPor: string | null;
  fechaAutorizacion: string | null;
  rechazadoPor: string | null;
  fechaRechazo: string | null;
  motivoRechazo: string | null;
  anuladoPor: string | null;
  fechaAnulacion: string | null;
  motivoAnulacion: string | null;
  movimientoId: string | null;
  version: number;
  observacion: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface IndicadoresFinanzas {
  saldoTotal: number;
  saldoCajas: number;
  saldoCuentasBancarias: number;
  ingresosMes: number;
  egresosMes: number;
  saldoMes: number;
  pendienteDePago: number;
  movimientosRecientes: MovimientoFinanciero[];
  sociosProtectores: { activos: number; sinAporteEsteMes: number; aportesMes: number; aportesExtraordinariosMes: number };
  facturacion: { totalMes: number; notasCreditoMes: number };
  ingresosPorOrigen: { servicios: number; academia: number };
}

async function mensajeError(res: Response, porDefecto: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return Array.isArray(body.message) ? body.message.join(', ') : body.message ?? porDefecto;
}

/* ------------------------------------------------------------------ */
/* Ejercicios fiscales                                                  */
/* ------------------------------------------------------------------ */

export async function cargarEjerciciosFiscales() {
  const res = await apiFetch('/finanzas/ejercicios-fiscales');
  if (!res.ok) throw new Error('No se pudo cargar el listado de ejercicios fiscales');
  return res.json() as Promise<EjercicioFiscal[]>;
}

export async function crearEjercicioFiscal(payload: { anio: number; fechaInicio: string; fechaFin: string }) {
  const res = await apiFetch('/finanzas/ejercicios-fiscales', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el ejercicio fiscal'));
  return res.json() as Promise<EjercicioFiscal>;
}

export async function cerrarEjercicioFiscal(id: string) {
  const res = await apiFetch(`/finanzas/ejercicios-fiscales/${id}/cerrar`, { method: 'PATCH' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cerrar el ejercicio'));
  return res.json() as Promise<EjercicioFiscal>;
}

export async function reabrirEjercicioFiscal(id: string) {
  const res = await apiFetch(`/finanzas/ejercicios-fiscales/${id}/reabrir`, { method: 'PATCH' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo reabrir el ejercicio'));
  return res.json() as Promise<EjercicioFiscal>;
}

/* ------------------------------------------------------------------ */
/* Cajas                                                                 */
/* ------------------------------------------------------------------ */

export async function cargarCajas(estado?: string) {
  const params = estado ? `?estado=${estado}` : '';
  const res = await apiFetch(`/finanzas/cajas${params}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de cajas');
  return res.json() as Promise<Caja[]>;
}

export async function crearCaja(payload: Record<string, unknown>) {
  const res = await apiFetch('/finanzas/cajas', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la caja'));
  return res.json() as Promise<Caja>;
}

export async function actualizarCaja(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/finanzas/cajas/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar la caja'));
  return res.json() as Promise<Caja>;
}

export async function cargarTurnosDeCaja(cajaId: string) {
  const res = await apiFetch(`/finanzas/cajas/${cajaId}/turnos`);
  if (!res.ok) throw new Error('No se pudo cargar los turnos de la caja');
  return res.json() as Promise<TurnoCaja[]>;
}

export async function cargarTurnoAbierto(cajaId: string) {
  const res = await apiFetch(`/finanzas/cajas/${cajaId}/turno-abierto`);
  if (!res.ok) throw new Error('No se pudo cargar el turno abierto');
  return res.json() as Promise<TurnoCaja | null>;
}

export async function abrirCaja(cajaId: string, saldoInicial: number) {
  const res = await apiFetch(`/finanzas/cajas/${cajaId}/abrir`, { method: 'POST', body: JSON.stringify({ saldoInicial }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo abrir la caja'));
  return res.json() as Promise<TurnoCaja>;
}

export async function cerrarCaja(cajaId: string, payload: { saldoFisico: number; observacion?: string }) {
  const res = await apiFetch(`/finanzas/cajas/${cajaId}/cerrar`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cerrar la caja'));
  return res.json() as Promise<TurnoCaja>;
}

/* ------------------------------------------------------------------ */
/* Cuentas bancarias                                                    */
/* ------------------------------------------------------------------ */

export async function cargarCuentasBancarias(estado?: string) {
  const params = estado ? `?estado=${estado}` : '';
  const res = await apiFetch(`/finanzas/cuentas-bancarias${params}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de cuentas bancarias');
  return res.json() as Promise<CuentaBancaria[]>;
}

export async function crearCuentaBancaria(payload: Record<string, unknown>) {
  const res = await apiFetch('/finanzas/cuentas-bancarias', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la cuenta bancaria'));
  return res.json() as Promise<CuentaBancaria>;
}

export async function actualizarCuentaBancaria(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/finanzas/cuentas-bancarias/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar la cuenta bancaria'));
  return res.json() as Promise<CuentaBancaria>;
}

/* ------------------------------------------------------------------ */
/* Movimientos financieros                                              */
/* ------------------------------------------------------------------ */

export async function cargarMovimientosFinancieros(filtros?: {
  tipo?: string;
  estado?: string;
  cajaId?: string;
  cuentaBancariaId?: string;
  proveedorId?: string;
  bomberoId?: string;
  desde?: string;
  hasta?: string;
}) {
  const params = new URLSearchParams();
  if (filtros?.tipo) params.set('tipo', filtros.tipo);
  if (filtros?.estado) params.set('estado', filtros.estado);
  if (filtros?.cajaId) params.set('cajaId', filtros.cajaId);
  if (filtros?.cuentaBancariaId) params.set('cuentaBancariaId', filtros.cuentaBancariaId);
  if (filtros?.proveedorId) params.set('proveedorId', filtros.proveedorId);
  if (filtros?.bomberoId) params.set('bomberoId', filtros.bomberoId);
  if (filtros?.desde) params.set('desde', filtros.desde);
  if (filtros?.hasta) params.set('hasta', filtros.hasta);
  const res = await apiFetch(`/finanzas/movimientos?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de movimientos');
  return res.json() as Promise<MovimientoFinanciero[]>;
}

export async function cargarDocumentoDeMovimiento(id: string) {
  const res = await apiFetch(`/finanzas/movimientos/${id}/documento`);
  if (!res.ok) throw new Error('No se pudo cargar el documento del movimiento');
  return res.json() as Promise<DocumentoRespaldo | null>;
}

export async function registrarMovimientoFinanciero(payload: Record<string, unknown>) {
  const res = await apiFetch('/finanzas/movimientos', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar el movimiento'));
  return res.json() as Promise<MovimientoFinanciero>;
}

export async function anularMovimientoFinanciero(id: string, payload: { motivoAnulacionId: string; motivoAnulacionDetalle?: string }) {
  const res = await apiFetch(`/finanzas/movimientos/${id}/anular`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo anular el movimiento'));
  return res.json() as Promise<MovimientoFinanciero>;
}

/* ------------------------------------------------------------------ */
/* Cuotas                                                               */
/* ------------------------------------------------------------------ */

export async function cargarCuotas(filtros?: { bomberoId?: string; periodo?: string; estado?: string }) {
  const params = new URLSearchParams();
  if (filtros?.bomberoId) params.set('bomberoId', filtros.bomberoId);
  if (filtros?.periodo) params.set('periodo', filtros.periodo);
  if (filtros?.estado) params.set('estado', filtros.estado);
  const res = await apiFetch(`/finanzas/cuotas?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de cuotas');
  return res.json() as Promise<Cuota[]>;
}

export async function crearCuota(payload: Record<string, unknown>) {
  const res = await apiFetch('/finanzas/cuotas', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la cuota'));
  return res.json() as Promise<Cuota>;
}

export async function pagarCuota(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/finanzas/cuotas/${id}/pagar`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar el pago'));
  return res.json() as Promise<Cuota>;
}

export async function anularCuota(id: string, motivo: string) {
  const res = await apiFetch(`/finanzas/cuotas/${id}/anular`, { method: 'POST', body: JSON.stringify({ motivo }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo anular la cuota'));
  return res.json() as Promise<Cuota>;
}

export async function exonerarCuota(id: string, motivo: string) {
  const res = await apiFetch(`/finanzas/cuotas/${id}/exonerar`, { method: 'POST', body: JSON.stringify({ motivo }) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo exonerar la cuota'));
  return res.json() as Promise<Cuota>;
}

/* ------------------------------------------------------------------ */
/* Movimientos bancarios / conciliacion                                 */
/* ------------------------------------------------------------------ */

export async function cargarMovimientosBancarios(filtros?: { cuentaBancariaId?: string; estadoConciliacion?: string; desde?: string; hasta?: string }) {
  const params = new URLSearchParams();
  if (filtros?.cuentaBancariaId) params.set('cuentaBancariaId', filtros.cuentaBancariaId);
  if (filtros?.estadoConciliacion) params.set('estadoConciliacion', filtros.estadoConciliacion);
  if (filtros?.desde) params.set('desde', filtros.desde);
  if (filtros?.hasta) params.set('hasta', filtros.hasta);
  const res = await apiFetch(`/finanzas/movimientos-bancarios?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de movimientos bancarios');
  return res.json() as Promise<MovimientoBancario[]>;
}

export async function crearMovimientoBancario(payload: Record<string, unknown>) {
  const res = await apiFetch('/finanzas/movimientos-bancarios', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el movimiento bancario'));
  return res.json() as Promise<MovimientoBancario>;
}

export async function conciliarMovimientoBancario(id: string, payload: { estadoConciliacion: string; observacion?: string }) {
  const res = await apiFetch(`/finanzas/movimientos-bancarios/${id}/conciliar`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo conciliar el movimiento'));
  return res.json() as Promise<MovimientoBancario>;
}

/* ------------------------------------------------------------------ */
/* Presupuestos                                                         */
/* ------------------------------------------------------------------ */

export async function cargarPresupuestos(ejercicioId: string) {
  const res = await apiFetch(`/finanzas/presupuestos?ejercicioId=${ejercicioId}`);
  if (!res.ok) throw new Error('No se pudo cargar el presupuesto');
  return res.json() as Promise<Presupuesto[]>;
}

export async function crearPresupuesto(payload: Record<string, unknown>) {
  const res = await apiFetch('/finanzas/presupuestos', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el presupuesto'));
  return res.json() as Promise<Presupuesto>;
}

export async function actualizarPresupuesto(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/finanzas/presupuestos/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar el presupuesto'));
  return res.json() as Promise<Presupuesto>;
}

/* ------------------------------------------------------------------ */
/* Ordenes de pago                                                      */
/* ------------------------------------------------------------------ */

export async function cargarOrdenesPago(estado?: string) {
  const params = estado ? `?estado=${estado}` : '';
  const res = await apiFetch(`/finanzas/ordenes-pago${params}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de ordenes de pago');
  return res.json() as Promise<OrdenPago[]>;
}

export async function crearOrdenPago(payload: Record<string, unknown>) {
  const res = await apiFetch('/finanzas/ordenes-pago', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la orden de pago'));
  return res.json() as Promise<OrdenPago>;
}

async function transicionOrdenPago(id: string, accion: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/finanzas/ordenes-pago/${id}/${accion}`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, `No se pudo ejecutar la accion '${accion}'`));
  return res.json() as Promise<OrdenPago>;
}

export const solicitarOrdenPago = (id: string, version: number) => transicionOrdenPago(id, 'solicitar', { version });
export const enviarAutorizacionOrdenPago = (id: string, version: number) => transicionOrdenPago(id, 'enviar-autorizacion', { version });
export const autorizarOrdenPago = (id: string, version: number) => transicionOrdenPago(id, 'autorizar', { version });
export const rechazarOrdenPago = (id: string, version: number, motivo: string) => transicionOrdenPago(id, 'rechazar', { version, motivo });
export const reabrirOrdenPago = (id: string, version: number) => transicionOrdenPago(id, 'reabrir', { version });
export const anularOrdenPago = (id: string, version: number, motivo: string) => transicionOrdenPago(id, 'anular', { version, motivo });
export const pagarOrdenPago = (id: string, payload: { version: number; fecha: string; cajaId?: string; cuentaBancariaId?: string; responsableId?: string }) =>
  transicionOrdenPago(id, 'pagar', payload);

/* ------------------------------------------------------------------ */
/* Dashboard                                                            */
/* ------------------------------------------------------------------ */

export async function cargarIndicadoresFinanzas() {
  const res = await apiFetch('/finanzas/dashboard');
  if (!res.ok) throw new Error('No se pudo cargar los indicadores');
  return res.json() as Promise<IndicadoresFinanzas>;
}

/* ------------------------------------------------------------------ */
/* Integracion con Deposito                                             */
/* ------------------------------------------------------------------ */

export async function cargarEntradasDepositoSinRegistrar() {
  const res = await apiFetch('/finanzas/deposito/entradas-sin-registrar');
  if (!res.ok) throw new Error('No se pudo cargar las entradas de deposito sin registrar');
  return res.json();
}

export async function registrarDesdeEntradaDeposito(entradaId: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/finanzas/deposito/entradas/${entradaId}/registrar`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar el valor financiero de esta entrada'));
  return res.json() as Promise<MovimientoFinanciero>;
}

/* ------------------------------------------------------------------ */
/* Reportes                                                              */
/* ------------------------------------------------------------------ */

export async function generarComprobantePdf(movimientoId: string, cargoFirmanteId?: string) {
  const params = cargoFirmanteId ? `?cargoFirmanteId=${cargoFirmanteId}` : '';
  const res = await apiFetch(`/finanzas/reportes/movimientos/${movimientoId}/comprobante.pdf${params}`);
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo generar el comprobante'));
  return (await res.json()) as { url: string };
}
