'use client';

import { Fragment, useEffect, useId, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Parametro, resolverNombres } from '@/lib/parametros';
import { cargarProveedoresDeposito, ProveedorDeposito } from '@/lib/deposito';
import {
  Caja,
  CuentaBancaria,
  OrdenPago,
  anularOrdenPago,
  autorizarOrdenPago,
  cargarCajas,
  cargarCategoriasEgresoFinanzas,
  cargarCuentasBancarias,
  cargarOrdenesPago,
  crearOrdenPago,
  enviarAutorizacionOrdenPago,
  pagarOrdenPago,
  reabrirOrdenPago,
  rechazarOrdenPago,
  solicitarOrdenPago,
} from '@/lib/finanzas';
import { Aviso } from '@/app/components/Aviso';

function formatearGs(valor: number): string {
  return `Gs. ${Math.round(valor).toLocaleString('es-PY')}`;
}

function colorEstado(estado: string) {
  if (estado === 'PAGADO') return { background: 'var(--ok-fill)', color: 'var(--success)' };
  if (estado === 'RECHAZADO' || estado === 'ANULADO') return { background: 'var(--bad-fill)', color: 'var(--danger)' };
  if (estado === 'AUTORIZADO') return { background: 'var(--info-fill)', color: 'var(--signal-dark)' };
  return { background: 'var(--neutral-fill)', color: 'var(--ink)' };
}

function PanelAcciones({
  orden,
  cajas,
  cuentas,
  onCambio,
}: {
  orden: OrdenPago;
  cajas: Caja[];
  cuentas: CuentaBancaria[];
  onCambio: () => void;
}) {
  const idCampo = useId();
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [mostrarRechazar, setMostrarRechazar] = useState(false);
  const [mostrarAnular, setMostrarAnular] = useState(false);
  const [mostrarPagar, setMostrarPagar] = useState(false);
  const [fechaPago, setFechaPago] = useState('');
  const [origenPago, setOrigenPago] = useState<'CAJA' | 'CUENTA'>('CAJA');
  const [cajaId, setCajaId] = useState('');
  const [cuentaBancariaId, setCuentaBancariaId] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCrear = permisos.includes('finanzas:crear');
  const puedeAutorizar = permisos.includes('finanzas:autorizar');
  const puedeAnular = permisos.includes('finanzas:anular');

  const opcionesCaja = useMemo(() => cajas.map((c) => ({ value: c.id, label: c.nombre })), [cajas]);
  const opcionesCuenta = useMemo(() => cuentas.map((c) => ({ value: c.id, label: `${c.banco} - ${c.numeroCuenta}` })), [cuentas]);

  async function ejecutar(fn: () => Promise<unknown>) {
    setError(null);
    setGuardando(true);
    try {
      await fn();
      onCambio();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ padding: '10px 4px', background: 'var(--surface-soft)', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {error && <Aviso tipo="error" texto={error} fontSize={12} />}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {puedeCrear && orden.estado === 'BORRADOR' && (
          <button type="button" className="btn-primary" style={{ padding: '4px 10px', fontSize: 12 }} disabled={guardando} onClick={() => ejecutar(() => solicitarOrdenPago(orden.id, orden.version))}>
            Solicitar
          </button>
        )}
        {puedeCrear && orden.estado === 'SOLICITADO' && (
          <button type="button" className="btn-primary" style={{ padding: '4px 10px', fontSize: 12 }} disabled={guardando} onClick={() => ejecutar(() => enviarAutorizacionOrdenPago(orden.id, orden.version))}>
            Enviar a autorizacion
          </button>
        )}
        {puedeAutorizar && orden.estado === 'PENDIENTE_AUTORIZACION' && (
          <button type="button" className="btn-primary" style={{ padding: '4px 10px', fontSize: 12, background: '#16a34a' }} disabled={guardando} onClick={() => ejecutar(() => autorizarOrdenPago(orden.id, orden.version))}>
            Autorizar
          </button>
        )}
        {puedeAutorizar && orden.estado === 'PENDIENTE_AUTORIZACION' && (
          <button type="button" className="btn-primary" style={{ padding: '4px 10px', fontSize: 12, background: '#7f1d1d' }} onClick={() => setMostrarRechazar(!mostrarRechazar)}>
            Rechazar
          </button>
        )}
        {puedeCrear && orden.estado === 'RECHAZADO' && (
          <button type="button" className="btn-primary" style={{ padding: '4px 10px', fontSize: 12, background: '#475569' }} disabled={guardando} onClick={() => ejecutar(() => reabrirOrdenPago(orden.id, orden.version))}>
            Volver a borrador
          </button>
        )}
        {puedeCrear && orden.estado === 'AUTORIZADO' && (
          <button type="button" className="btn-primary" style={{ padding: '4px 10px', fontSize: 12, background: '#16a34a' }} onClick={() => setMostrarPagar(!mostrarPagar)}>
            Pagar
          </button>
        )}
        {puedeAnular && !['PAGADO', 'ANULADO', 'RECHAZADO'].includes(orden.estado) && (
          <button type="button" className="btn-primary" style={{ padding: '4px 10px', fontSize: 12, background: '#7f1d1d' }} onClick={() => setMostrarAnular(!mostrarAnular)}>
            Anular
          </button>
        )}
      </div>

      {mostrarRechazar && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input-field" placeholder="Motivo del rechazo" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          <button type="button"
            className="btn-primary"
            style={{ padding: '4px 10px', fontSize: 12, background: '#7f1d1d' }}
            disabled={guardando || !motivo}
            onClick={() => ejecutar(() => rechazarOrdenPago(orden.id, orden.version, motivo))}
          >
            Confirmar rechazo
          </button>
        </div>
      )}

      {mostrarAnular && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input-field" placeholder="Motivo de anulacion" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          <button type="button"
            className="btn-primary"
            style={{ padding: '4px 10px', fontSize: 12, background: '#7f1d1d' }}
            disabled={guardando || !motivo}
            onClick={() => ejecutar(() => anularOrdenPago(orden.id, orden.version, motivo))}
          >
            Confirmar anulacion
          </button>
        </div>
      )}

      {mostrarPagar && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: 8, alignItems: 'flex-end' }}>
          <div>
            <label htmlFor={`${idCampo}-fecha-de-pago`} style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Fecha de pago</label>
            <input id={`${idCampo}-fecha-de-pago`} className="input-field" type="date" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} />
          </div>
          <ComboBuscable opciones={[{ value: 'CAJA', label: 'Caja' }, { value: 'CUENTA', label: 'Cuenta' }]} value={origenPago} onChange={(v) => setOrigenPago(v as 'CAJA' | 'CUENTA')} />
          {origenPago === 'CAJA' ? (
            <ComboBuscable opciones={opcionesCaja} value={cajaId} onChange={setCajaId} ningunaLabel="-- caja --" />
          ) : (
            <ComboBuscable opciones={opcionesCuenta} value={cuentaBancariaId} onChange={setCuentaBancariaId} ningunaLabel="-- cuenta --" />
          )}
          <button type="button"
            className="btn-primary"
            style={{ padding: '4px 10px', fontSize: 12, background: '#16a34a' }}
            disabled={guardando || !fechaPago || (!cajaId && !cuentaBancariaId)}
            onClick={() =>
              ejecutar(() =>
                pagarOrdenPago(orden.id, {
                  version: orden.version,
                  fecha: fechaPago,
                  cajaId: origenPago === 'CAJA' ? cajaId : undefined,
                  cuentaBancariaId: origenPago === 'CUENTA' ? cuentaBancariaId : undefined,
                }),
              )
            }
          >
            Confirmar pago
          </button>
        </div>
      )}
    </div>
  );
}

export default function OrdenesPagoPage() {
  const idCampo = useId();
  const [ordenes, setOrdenes] = useState<OrdenPago[] | null>(null);
  const [categorias, setCategorias] = useState<Parametro[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorDeposito[]>([]);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [nombresCategoria, setNombresCategoria] = useState<Map<string, string>>(new Map());

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [expandidaId, setExpandidaId] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState('');

  const [concepto, setConcepto] = useState('');
  const [importe, setImporte] = useState('');
  const [categoriaEgresoId, setCategoriaEgresoId] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [observacion, setObservacion] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCrear = permisos.includes('finanzas:crear');

  const opcionesCategoria = useMemo(() => categorias.map((c) => ({ value: c.id, label: c.nombre })), [categorias]);
  const opcionesProveedor = useMemo(() => proveedores.map((p) => ({ value: p.id, label: p.razonSocial })), [proveedores]);

  const ESTADOS = [
    { value: 'BORRADOR', label: 'BORRADOR' },
    { value: 'SOLICITADO', label: 'SOLICITADO' },
    { value: 'PENDIENTE_AUTORIZACION', label: 'PENDIENTE_AUTORIZACION' },
    { value: 'AUTORIZADO', label: 'AUTORIZADO' },
    { value: 'RECHAZADO', label: 'RECHAZADO' },
    { value: 'PAGADO', label: 'PAGADO' },
    { value: 'ANULADO', label: 'ANULADO' },
  ];

  async function cargar() {
    try {
      const datos = await cargarOrdenesPago(filtroEstado || undefined);
      setOrdenes(datos);
      setNombresCategoria(await resolverNombres(datos.map((o) => o.categoriaEgresoId)));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarCategoriasEgresoFinanzas().then(setCategorias);
    cargarProveedoresDeposito().then(setProveedores).catch(() => undefined);
    cargarCajas('ACTIVA').then(setCajas);
    cargarCuentasBancarias('ACTIVA').then(setCuentas);
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await crearOrdenPago({ concepto, importe: Number(importe), categoriaEgresoId, proveedorId: proveedorId || undefined, observacion: observacion || undefined });
      setMensaje('Orden de pago creada en BORRADOR.');
      setConcepto('');
      setImporte('');
      setCategoriaEgresoId('');
      setProveedorId('');
      setObservacion('');
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Ordenes de pago ({ordenes?.length ?? 0})</h2>
        {puedeCrear && (
          <button type="button" className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : '+ Nueva orden'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Estado</label>
          <ComboBuscable ariaLabel="Estado" opciones={ESTADOS} value={filtroEstado} onChange={setFiltroEstado} maxWidth={260} />
        </div>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}
      <p style={{ fontSize: 12, color: 'var(--muted)' }}>
        Flujo: Borrador → Solicitado → Pendiente de autorizacion → Autorizado → Pagado (con ramas Rechazado/Anulado). Quien
        solicita no es quien autoriza.
      </p>

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor={`${idCampo}-concepto`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Concepto</label>
              <input id={`${idCampo}-concepto`} className="input-field" value={concepto} onChange={(e) => setConcepto(e.target.value)} required />
            </div>
            <div>
              <label htmlFor={`${idCampo}-importe`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Importe</label>
              <input id={`${idCampo}-importe`} className="input-field" type="number" min={0.01} step="1" value={importe} onChange={(e) => setImporte(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Categoría de egreso</label>
              <ComboBuscable ariaLabel="Categoria de egreso" opciones={opcionesCategoria} value={categoriaEgresoId} onChange={setCategoriaEgresoId} ningunaLabel="-- seleccionar --" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Proveedor</label>
              <ComboBuscable ariaLabel="Proveedor" opciones={opcionesProveedor} value={proveedorId} onChange={setProveedorId} ningunaLabel="Sin proveedor" />
            </div>
            <div>
              <label htmlFor={`${idCampo}-observacion`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observación</label>
              <input id={`${idCampo}-observacion`} className="input-field" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
            </div>
          </div>
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Crear orden (Borrador)'}
          </button>
        </form>
      )}

      {ordenes && ordenes.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay ordenes de pago registradas.</p>}
      {ordenes && ordenes.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Concepto</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Categoría</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Importe</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((o) => (
              <Fragment key={o.id}>
                <tr style={{ borderBottom: expandidaId === o.id ? 'none' : '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '6px 4px' }}>{o.concepto}</td>
                  <td style={{ padding: '6px 4px' }}>{nombresCategoria.get(o.categoriaEgresoId) ?? '-'}</td>
                  <td style={{ padding: '6px 4px', fontWeight: 600 }}>{formatearGs(o.importe)}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={colorEstado(o.estado)}>{o.estado}</span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setExpandidaId(expandidaId === o.id ? null : o.id)}>
                      {expandidaId === o.id ? 'Ocultar' : 'Gestionar'}
                    </button>
                  </td>
                </tr>
                {expandidaId === o.id && (
                  <tr style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td colSpan={5} style={{ padding: '4px' }}>
                      <PanelAcciones
                        orden={o}
                        cajas={cajas}
                        cuentas={cuentas}
                        onCambio={() => {
                          setMensaje('Accion aplicada.');
                          cargar();
                        }}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
