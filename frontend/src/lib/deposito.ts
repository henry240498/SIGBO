import { apiFetch } from './api';
import { cargarParametros } from './parametros';

/* ------------------------------------------------------------------ */
/* Catalogos parametrizables (Organizacion -> Parametros)               */
/* ------------------------------------------------------------------ */

export function cargarTiposUbicacionDeposito() {
  return cargarParametros('TIPO_UBICACION_DEPOSITO');
}
export function cargarTiposTenenciaDeposito() {
  return cargarParametros('TIPO_TENENCIA_DEPOSITO');
}
export function cargarEstadosElementoDeposito() {
  return cargarParametros('ESTADO_ELEMENTO_DEPOSITO');
}
export function cargarTiposMovimientoDeposito() {
  return cargarParametros('TIPO_MOVIMIENTO_DEPOSITO');
}
export function cargarUnidadesMedidaDeposito() {
  return cargarParametros('UNIDAD_MEDIDA_DEPOSITO');
}
export function cargarMotivosBajaDeposito() {
  return cargarParametros('MOTIVO_BAJA_DEPOSITO');
}
export function cargarTiposPrestamoDeposito() {
  return cargarParametros('TIPO_PRESTAMO_DEPOSITO');
}

/* ------------------------------------------------------------------ */
/* Tipos                                                                */
/* ------------------------------------------------------------------ */

export type TipoElementoDeposito = 'EQUIPO' | 'ARTICULO';

export interface CategoriaArticulo {
  id: string;
  codigo: string | null;
  nombre: string;
  descripcion: string | null;
  padreId: string | null;
  activo: boolean;
  creadoEn: string;
}

export interface Articulo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoriaArticuloId: string;
  unidadMedidaId: string | null;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number | null;
  controlaLote: boolean;
  controlaVencimiento: boolean;
  estado: 'ACTIVO' | 'INACTIVO';
  creadoEn: string;
  actualizadoEn: string;
}

export interface LoteArticulo {
  id: string;
  articuloId: string;
  numeroLote: string;
  fechaFabricacion: string | null;
  fechaVencimiento: string | null;
  cantidad: number;
  estado: 'VIGENTE' | 'VENCIDO' | 'AGOTADO';
  creadoEn: string;
  actualizadoEn: string;
}

export interface UbicacionDeposito {
  id: string;
  codigo: string | null;
  nombre: string;
  tipoUbicacionId: string;
  padreId: string | null;
  cuartelId: string | null;
  estado: 'ACTIVA' | 'INACTIVA';
  creadoEn: string;
  actualizadoEn: string;
}

export interface TenenciaDeposito {
  id: string;
  tipoElemento: TipoElementoDeposito;
  equipoId: string | null;
  articuloId: string | null;
  loteId: string | null;
  cantidad: number | null;
  tipoTenenciaId: string;
  ubicacionId: string | null;
  vehiculoId: string | null;
  bomberoId: string | null;
  servicioId: string | null;
  estadoElementoId: string;
  observacion: string | null;
  actualizadoEn: string;
  actualizadoPor: string | null;
}

export interface MovimientoDeposito {
  id: string;
  tipoMovimientoId: string;
  tipoElemento: TipoElementoDeposito;
  equipoId: string | null;
  articuloId: string | null;
  loteId: string | null;
  cantidad: number | null;
  ubicacionOrigenId: string | null;
  ubicacionDestinoId: string | null;
  vehiculoOrigenId: string | null;
  vehiculoDestinoId: string | null;
  bomberoOrigenId: string | null;
  bomberoDestinoId: string | null;
  servicioOrigenId: string | null;
  servicioDestinoId: string | null;
  responsableId: string | null;
  motivo: string | null;
  observacion: string | null;
  documentoUrl: string | null;
  creadoEn: string;
  creadoPor: string | null;
}

export interface ProveedorDeposito {
  id: string;
  razonSocial: string;
  nombreComercial: string | null;
  ruc: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  contacto: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  observaciones: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface EntradaDeposito {
  id: string;
  tipoEntradaId: string;
  fecha: string;
  proveedorId: string | null;
  donanteNombre: string | null;
  donanteDocumento: string | null;
  numeroDocumento: string | null;
  valorTotal: number | null;
  ubicacionDestinoId: string;
  observacion: string | null;
  creadoEn: string;
  creadoPor: string | null;
}

export interface EntradaDepositoItem {
  id: string;
  entradaId: string;
  tipoElemento: TipoElementoDeposito;
  articuloId: string | null;
  equipoId: string | null;
  cantidad: number;
  precioUnitario: number | null;
  subtotal: number | null;
  movimientoId: string | null;
}

export interface BajaDeposito {
  id: string;
  tipoElemento: TipoElementoDeposito;
  articuloId: string | null;
  equipoId: string | null;
  cantidad: number | null;
  motivoBajaId: string;
  fecha: string;
  responsableId: string | null;
  autorizadoPor: string | null;
  documentoUrl: string | null;
  observacion: string | null;
  movimientoId: string | null;
  creadoEn: string;
  creadoPor: string | null;
}

export type EstadoPrestamoDeposito = 'ACTIVO' | 'DEVUELTO_PARCIAL' | 'DEVUELTO' | 'EXTRAVIADO';

export interface PrestamoDeposito {
  id: string;
  tipoPrestamoId: string;
  solicitanteBomberoId: string | null;
  solicitanteExterno: string | null;
  servicioDestinoId: string | null;
  autorizadoPor: string | null;
  fechaEntrega: string;
  fechaDevolucionComprometida: string | null;
  fechaDevolucionReal: string | null;
  estado: EstadoPrestamoDeposito;
  observaciones: string | null;
  creadoEn: string;
  creadoPor: string | null;
}

export interface PrestamoDepositoItem {
  id: string;
  prestamoId: string;
  tipoElemento: TipoElementoDeposito;
  articuloId: string | null;
  equipoId: string | null;
  cantidad: number | null;
  estadoItem: 'PENDIENTE' | 'DEVUELTO' | 'EXTRAVIADO' | 'DANIADO';
  observacion: string | null;
  movimientoEntregaId: string | null;
  movimientoDevolucionId: string | null;
}

export type EstadoMantenimientoDeposito = 'EN_PROCESO' | 'FINALIZADO';

export interface MantenimientoDeposito {
  id: string;
  tipoElemento: TipoElementoDeposito;
  articuloId: string | null;
  equipoId: string | null;
  cantidad: number | null;
  motivo: string;
  responsableId: string | null;
  tallerExterno: string | null;
  fechaIngreso: string;
  fechaEstimadaSalida: string | null;
  fechaSalidaReal: string | null;
  costo: number | null;
  estado: EstadoMantenimientoDeposito;
  observacion: string | null;
  ubicacionOrigenId: string | null;
  movimientoIngresoId: string | null;
  movimientoSalidaId: string | null;
  creadoEn: string;
  creadoPor: string | null;
}

export interface InventarioFisicoDeposito {
  id: string;
  fecha: string;
  ubicacionId: string | null;
  responsableId: string | null;
  estado: 'EN_PROCESO' | 'FINALIZADO';
  observacion: string | null;
  creadoEn: string;
  creadoPor: string | null;
}

export interface InventarioFisicoItemDeposito {
  id: string;
  inventarioFisicoId: string;
  tipoElemento: TipoElementoDeposito;
  articuloId: string | null;
  equipoId: string | null;
  cantidadSistema: number;
  cantidadFisica: number;
  diferencia: number;
  generaIncidencia: boolean;
  observacion: string | null;
  creadoEn: string;
}

export interface IncidenciaDeposito {
  id: string;
  origenTipo: 'INSPECCION_VEHICULO' | 'INVENTARIO_FISICO' | 'MANUAL' | 'OTRO';
  tipoElemento: TipoElementoDeposito | null;
  articuloId: string | null;
  equipoId: string | null;
  vehiculoId: string | null;
  inspeccionMovilId: string | null;
  inventarioFisicoItemId: string | null;
  descripcion: string;
  gravedad: 'BAJA' | 'MEDIA' | 'ALTA';
  estado: 'ABIERTA' | 'EN_REVISION' | 'RESUELTA' | 'DESCARTADA';
  fechaApertura: string;
  reportadoPor: string | null;
  resueltoPor: string | null;
  fechaResolucion: string | null;
  resolucion: string | null;
}

export interface IndicadoresDeposito {
  elementosInventariados: number;
  totalArticulos: number;
  porEstadoElemento: Record<string, number>;
  vencidos: number;
  conIncidencia: number;
  stockBajo: number;
  prestamosVencidos: number;
  lotesProximosAVencer: number;
}

export interface AlertasDeposito {
  stockBajo: Array<{ id: string; codigo: string; nombre: string; stockActual: number; stockMinimo: number }>;
  vencimientos: Array<{ id: string; articuloId: string; numeroLote: string; fechaVencimiento: string | null; cantidad: number }>;
  prestamosVencidos: Array<{ id: string; solicitanteBomberoId: string | null; solicitanteExterno: string | null; fechaDevolucionComprometida: string | null }>;
  totales: { stockBajo: number; vencimientos: number; prestamosVencidos: number };
}

export interface UbicacionDeEquipo {
  equipoId: string;
  tenenciaId?: string;
  ubicacionActual: string | null;
  responsable: { id: string; nombreCompleto: string; numeroBombero: string } | null;
  vehiculo: { id: string; numeroInterno: string } | null;
  estadoElementoId: string | null;
  actualizadoEn?: string;
}

export interface EquipamientoDeBomberoItem {
  tipoElemento: TipoElementoDeposito;
  equipoId?: string | null;
  articuloId?: string | null;
  codigo: string | null;
  nombre: string;
  cantidad?: number | null;
  estadoElementoId: string;
  actualizadoEn: string;
}

export interface EquipamientoDeVehiculo {
  vehiculoId: string;
  esperado: Array<{ id: string; codigoInterno: string; nombre: string; estado: string }>;
  real: Array<{ equipoId: string | null | undefined; estadoElementoId: string }>;
  faltantes: Array<{ id: string; codigoInterno: string; nombre: string }>;
  noRegistradosComoAsignados: Array<string | null | undefined>;
}

async function mensajeError(res: Response, porDefecto: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return Array.isArray(body.message) ? body.message.join(', ') : body.message ?? porDefecto;
}

/* ------------------------------------------------------------------ */
/* Categorias de articulo                                               */
/* ------------------------------------------------------------------ */

export async function cargarCategoriasArticulo(q?: string, activo?: string) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (activo) params.set('activo', activo);
  const res = await apiFetch(`/deposito/categorias?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de categorias');
  return res.json() as Promise<CategoriaArticulo[]>;
}

export async function crearCategoriaArticulo(payload: Record<string, unknown>) {
  const res = await apiFetch('/deposito/categorias', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la categoria'));
  return res.json() as Promise<CategoriaArticulo>;
}

export async function actualizarCategoriaArticulo(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/deposito/categorias/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar la categoria'));
  return res.json() as Promise<CategoriaArticulo>;
}

export async function eliminarCategoriaArticulo(id: string) {
  const res = await apiFetch(`/deposito/categorias/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo eliminar la categoria'));
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Articulos                                                            */
/* ------------------------------------------------------------------ */

export async function cargarArticulos(filtros?: { q?: string; categoriaArticuloId?: string; estado?: string; stockBajo?: boolean }) {
  const params = new URLSearchParams();
  if (filtros?.q) params.set('q', filtros.q);
  if (filtros?.categoriaArticuloId) params.set('categoriaArticuloId', filtros.categoriaArticuloId);
  if (filtros?.estado) params.set('estado', filtros.estado);
  if (filtros?.stockBajo) params.set('stockBajo', 'true');
  const res = await apiFetch(`/deposito/articulos?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de articulos');
  return res.json() as Promise<Articulo[]>;
}

export async function cargarArticulo(id: string) {
  const res = await apiFetch(`/deposito/articulos/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar el articulo');
  return res.json() as Promise<Articulo>;
}

export async function cargarTenenciasArticulo(id: string) {
  const res = await apiFetch(`/deposito/articulos/${id}/tenencias`);
  if (!res.ok) throw new Error('No se pudo cargar las tenencias del articulo');
  return res.json() as Promise<TenenciaDeposito[]>;
}

export async function crearArticulo(payload: Record<string, unknown>) {
  const res = await apiFetch('/deposito/articulos', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el articulo'));
  return res.json() as Promise<Articulo>;
}

export async function actualizarArticulo(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/deposito/articulos/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar el articulo'));
  return res.json() as Promise<Articulo>;
}

/* ------------------------------------------------------------------ */
/* Lotes / vencimientos                                                 */
/* ------------------------------------------------------------------ */

export async function cargarLotesArticulo(articuloId?: string, estado?: string) {
  const params = new URLSearchParams();
  if (articuloId) params.set('articuloId', articuloId);
  if (estado) params.set('estado', estado);
  const res = await apiFetch(`/deposito/lotes?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de lotes');
  return res.json() as Promise<LoteArticulo[]>;
}

export async function cargarLotesProximosAVencer(dias?: number) {
  const params = dias ? `?dias=${dias}` : '';
  const res = await apiFetch(`/deposito/lotes/proximos-a-vencer${params}`);
  if (!res.ok) throw new Error('No se pudo cargar los lotes proximos a vencer');
  return res.json() as Promise<LoteArticulo[]>;
}

export async function crearLoteArticulo(payload: Record<string, unknown>) {
  const res = await apiFetch('/deposito/lotes', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el lote'));
  return res.json() as Promise<LoteArticulo>;
}

/* ------------------------------------------------------------------ */
/* Ubicaciones                                                          */
/* ------------------------------------------------------------------ */

export async function cargarUbicacionesDeposito(q?: string, tipoUbicacionId?: string, estado?: string) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (tipoUbicacionId) params.set('tipoUbicacionId', tipoUbicacionId);
  if (estado) params.set('estado', estado);
  const res = await apiFetch(`/deposito/ubicaciones?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de ubicaciones');
  return res.json() as Promise<UbicacionDeposito[]>;
}

export async function crearUbicacionDeposito(payload: Record<string, unknown>) {
  const res = await apiFetch('/deposito/ubicaciones', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la ubicacion'));
  return res.json() as Promise<UbicacionDeposito>;
}

export async function actualizarUbicacionDeposito(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/deposito/ubicaciones/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar la ubicacion'));
  return res.json() as Promise<UbicacionDeposito>;
}

export async function eliminarUbicacionDeposito(id: string) {
  const res = await apiFetch(`/deposito/ubicaciones/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo eliminar la ubicacion'));
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Proveedores                                                          */
/* ------------------------------------------------------------------ */

export async function cargarProveedoresDeposito(q?: string, estado?: string) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (estado) params.set('estado', estado);
  const res = await apiFetch(`/deposito/proveedores?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de proveedores');
  return res.json() as Promise<ProveedorDeposito[]>;
}

export async function crearProveedorDeposito(payload: Record<string, unknown>) {
  const res = await apiFetch('/deposito/proveedores', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el proveedor'));
  return res.json() as Promise<ProveedorDeposito>;
}

export async function actualizarProveedorDeposito(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/deposito/proveedores/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar el proveedor'));
  return res.json() as Promise<ProveedorDeposito>;
}

/* ------------------------------------------------------------------ */
/* Movimientos                                                          */
/* ------------------------------------------------------------------ */

export async function cargarMovimientosDeposito(filtros?: {
  tipoElemento?: string;
  equipoId?: string;
  articuloId?: string;
  tipoMovimientoId?: string;
  desde?: string;
  hasta?: string;
}) {
  const params = new URLSearchParams();
  if (filtros?.tipoElemento) params.set('tipoElemento', filtros.tipoElemento);
  if (filtros?.equipoId) params.set('equipoId', filtros.equipoId);
  if (filtros?.articuloId) params.set('articuloId', filtros.articuloId);
  if (filtros?.tipoMovimientoId) params.set('tipoMovimientoId', filtros.tipoMovimientoId);
  if (filtros?.desde) params.set('desde', filtros.desde);
  if (filtros?.hasta) params.set('hasta', filtros.hasta);
  const res = await apiFetch(`/deposito/movimientos?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de movimientos');
  return res.json() as Promise<MovimientoDeposito[]>;
}

export async function registrarMovimientoDeposito(payload: Record<string, unknown>) {
  const res = await apiFetch('/deposito/movimientos', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar el movimiento'));
  return res.json() as Promise<MovimientoDeposito>;
}

export async function cargarTenenciaEquipo(equipoId: string) {
  const res = await apiFetch(`/deposito/movimientos/tenencia-equipo/${equipoId}`);
  if (!res.ok) throw new Error('No se pudo cargar la tenencia del equipo');
  return res.json() as Promise<TenenciaDeposito | null>;
}

/* ------------------------------------------------------------------ */
/* Entradas (compra/donacion/transferencia/devolucion/recuperacion)     */
/* ------------------------------------------------------------------ */

export async function cargarEntradasDeposito(filtros?: { proveedorId?: string; tipoEntradaId?: string; desde?: string; hasta?: string }) {
  const params = new URLSearchParams();
  if (filtros?.proveedorId) params.set('proveedorId', filtros.proveedorId);
  if (filtros?.tipoEntradaId) params.set('tipoEntradaId', filtros.tipoEntradaId);
  if (filtros?.desde) params.set('desde', filtros.desde);
  if (filtros?.hasta) params.set('hasta', filtros.hasta);
  const res = await apiFetch(`/deposito/entradas?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de entradas');
  return res.json() as Promise<EntradaDeposito[]>;
}

export async function cargarEntradaDeposito(id: string) {
  const res = await apiFetch(`/deposito/entradas/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar la entrada');
  return res.json() as Promise<EntradaDeposito>;
}

export async function cargarItemsEntradaDeposito(id: string) {
  const res = await apiFetch(`/deposito/entradas/${id}/items`);
  if (!res.ok) throw new Error('No se pudo cargar los items de la entrada');
  return res.json() as Promise<EntradaDepositoItem[]>;
}

export async function crearEntradaDeposito(payload: Record<string, unknown>) {
  const res = await apiFetch('/deposito/entradas', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear la entrada'));
  return res.json() as Promise<EntradaDeposito>;
}

/* ------------------------------------------------------------------ */
/* Bajas                                                                 */
/* ------------------------------------------------------------------ */

export async function cargarBajasDeposito(filtros?: { tipoElemento?: string; motivoBajaId?: string; desde?: string; hasta?: string }) {
  const params = new URLSearchParams();
  if (filtros?.tipoElemento) params.set('tipoElemento', filtros.tipoElemento);
  if (filtros?.motivoBajaId) params.set('motivoBajaId', filtros.motivoBajaId);
  if (filtros?.desde) params.set('desde', filtros.desde);
  if (filtros?.hasta) params.set('hasta', filtros.hasta);
  const res = await apiFetch(`/deposito/bajas?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de bajas');
  return res.json() as Promise<BajaDeposito[]>;
}

export async function crearBajaDeposito(payload: Record<string, unknown>) {
  const res = await apiFetch('/deposito/bajas', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar la baja'));
  return res.json() as Promise<BajaDeposito>;
}

/* ------------------------------------------------------------------ */
/* Prestamos                                                            */
/* ------------------------------------------------------------------ */

export async function cargarPrestamosDeposito(filtros?: { estado?: string; solicitanteBomberoId?: string }) {
  const params = new URLSearchParams();
  if (filtros?.estado) params.set('estado', filtros.estado);
  if (filtros?.solicitanteBomberoId) params.set('solicitanteBomberoId', filtros.solicitanteBomberoId);
  const res = await apiFetch(`/deposito/prestamos?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de prestamos');
  return res.json() as Promise<PrestamoDeposito[]>;
}

export async function cargarPrestamosVencidosDeposito() {
  const res = await apiFetch('/deposito/prestamos/vencidos');
  if (!res.ok) throw new Error('No se pudo cargar los prestamos vencidos');
  return res.json() as Promise<PrestamoDeposito[]>;
}

export async function cargarPrestamoDeposito(id: string) {
  const res = await apiFetch(`/deposito/prestamos/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar el prestamo');
  return res.json() as Promise<PrestamoDeposito>;
}

export async function cargarItemsPrestamoDeposito(id: string) {
  const res = await apiFetch(`/deposito/prestamos/${id}/items`);
  if (!res.ok) throw new Error('No se pudo cargar los items del prestamo');
  return res.json() as Promise<PrestamoDepositoItem[]>;
}

export async function crearPrestamoDeposito(payload: Record<string, unknown>) {
  const res = await apiFetch('/deposito/prestamos', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el prestamo'));
  return res.json() as Promise<PrestamoDeposito>;
}

export async function devolverPrestamoDeposito(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/deposito/prestamos/${id}/devolver`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar la devolucion'));
  return res.json() as Promise<PrestamoDeposito>;
}

/* ------------------------------------------------------------------ */
/* Mantenimientos                                                       */
/* ------------------------------------------------------------------ */

export async function cargarMantenimientosDeposito(filtros?: { estado?: string; equipoId?: string; articuloId?: string }) {
  const params = new URLSearchParams();
  if (filtros?.estado) params.set('estado', filtros.estado);
  if (filtros?.equipoId) params.set('equipoId', filtros.equipoId);
  if (filtros?.articuloId) params.set('articuloId', filtros.articuloId);
  const res = await apiFetch(`/deposito/mantenimientos?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de mantenimientos');
  return res.json() as Promise<MantenimientoDeposito[]>;
}

export async function cargarMantenimientoDeposito(id: string) {
  const res = await apiFetch(`/deposito/mantenimientos/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar el mantenimiento');
  return res.json() as Promise<MantenimientoDeposito>;
}

export async function crearMantenimientoDeposito(payload: Record<string, unknown>) {
  const res = await apiFetch('/deposito/mantenimientos', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar el ingreso a mantenimiento'));
  return res.json() as Promise<MantenimientoDeposito>;
}

export async function finalizarMantenimientoDeposito(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/deposito/mantenimientos/${id}/finalizar`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo finalizar el mantenimiento'));
  return res.json() as Promise<MantenimientoDeposito>;
}

/* ------------------------------------------------------------------ */
/* Inventarios fisicos                                                  */
/* ------------------------------------------------------------------ */

export async function cargarInventariosFisicos(filtros?: { estado?: string; ubicacionId?: string }) {
  const params = new URLSearchParams();
  if (filtros?.estado) params.set('estado', filtros.estado);
  if (filtros?.ubicacionId) params.set('ubicacionId', filtros.ubicacionId);
  const res = await apiFetch(`/deposito/inventarios-fisicos?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de inventarios fisicos');
  return res.json() as Promise<InventarioFisicoDeposito[]>;
}

export async function cargarInventarioFisico(id: string) {
  const res = await apiFetch(`/deposito/inventarios-fisicos/${id}`);
  if (!res.ok) throw new Error('No se pudo cargar el inventario fisico');
  return res.json() as Promise<InventarioFisicoDeposito>;
}

export async function cargarItemsInventarioFisico(id: string) {
  const res = await apiFetch(`/deposito/inventarios-fisicos/${id}/items`);
  if (!res.ok) throw new Error('No se pudo cargar los items del inventario fisico');
  return res.json() as Promise<InventarioFisicoItemDeposito[]>;
}

export async function crearInventarioFisico(payload: Record<string, unknown>) {
  const res = await apiFetch('/deposito/inventarios-fisicos', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo crear el inventario fisico'));
  return res.json() as Promise<InventarioFisicoDeposito>;
}

export async function agregarItemInventarioFisico(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/deposito/inventarios-fisicos/${id}/items`, { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo agregar el item'));
  return res.json() as Promise<InventarioFisicoItemDeposito>;
}

export async function finalizarInventarioFisico(id: string) {
  const res = await apiFetch(`/deposito/inventarios-fisicos/${id}/finalizar`, { method: 'PATCH' });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo finalizar el inventario fisico'));
  return res.json() as Promise<InventarioFisicoDeposito>;
}

/* ------------------------------------------------------------------ */
/* Incidencias                                                          */
/* ------------------------------------------------------------------ */

export async function cargarIncidenciasDeposito(filtros?: { estado?: string; origenTipo?: string; gravedad?: string }) {
  const params = new URLSearchParams();
  if (filtros?.estado) params.set('estado', filtros.estado);
  if (filtros?.origenTipo) params.set('origenTipo', filtros.origenTipo);
  if (filtros?.gravedad) params.set('gravedad', filtros.gravedad);
  const res = await apiFetch(`/deposito/incidencias?${params.toString()}`);
  if (!res.ok) throw new Error('No se pudo cargar el listado de incidencias');
  return res.json() as Promise<IncidenciaDeposito[]>;
}

export async function crearIncidenciaDeposito(payload: Record<string, unknown>) {
  const res = await apiFetch('/deposito/incidencias', { method: 'POST', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo registrar la incidencia'));
  return res.json() as Promise<IncidenciaDeposito>;
}

export async function resolverIncidenciaDeposito(id: string, payload: Record<string, unknown>) {
  const res = await apiFetch(`/deposito/incidencias/${id}/resolver`, { method: 'PATCH', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo resolver la incidencia'));
  return res.json() as Promise<IncidenciaDeposito>;
}

/* ------------------------------------------------------------------ */
/* Dashboard y alertas                                                  */
/* ------------------------------------------------------------------ */

export async function cargarIndicadoresDeposito() {
  const res = await apiFetch('/deposito/dashboard');
  if (!res.ok) throw new Error('No se pudo cargar los indicadores');
  return res.json() as Promise<IndicadoresDeposito>;
}

export async function cargarAlertasDeposito() {
  const res = await apiFetch('/deposito/alertas');
  if (!res.ok) throw new Error('No se pudo cargar las alertas');
  return res.json() as Promise<AlertasDeposito>;
}

/* ------------------------------------------------------------------ */
/* Integracion con Equipos / Vehiculos / Personal                       */
/* ------------------------------------------------------------------ */

export async function cargarUbicacionDeEquipo(equipoId: string) {
  const res = await apiFetch(`/deposito/equipos/${equipoId}/ubicacion`);
  if (!res.ok) throw new Error('No se pudo cargar la ubicacion del equipo');
  return res.json() as Promise<UbicacionDeEquipo>;
}

export async function cargarEquipamientoDeVehiculo(vehiculoId: string) {
  const res = await apiFetch(`/deposito/vehiculos/${vehiculoId}/equipamiento`);
  if (!res.ok) throw new Error('No se pudo cargar el equipamiento del vehiculo');
  return res.json() as Promise<EquipamientoDeVehiculo>;
}

export async function cargarEquipamientoDeBombero(bomberoId: string) {
  const res = await apiFetch(`/deposito/personal/${bomberoId}/equipamiento`);
  if (!res.ok) throw new Error('No se pudo cargar el equipamiento del bombero');
  return res.json() as Promise<EquipamientoDeBomberoItem[]>;
}
