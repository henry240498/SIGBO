'use client';

import { Fragment, useEffect, useId, useMemo, useState } from 'react';
import { obtenerSesion, API_ORIGIN } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Parametro, resolverNombres } from '@/lib/parametros';
import { cargarBomberos, BomberoResumen } from '@/lib/personal';
import { cargarProveedoresDeposito, ProveedorDeposito } from '@/lib/deposito';
import {
  Caja,
  CuentaBancaria,
  MovimientoFinanciero,
  anularMovimientoFinanciero,
  cargarCajas,
  cargarCategoriasEgresoFinanzas,
  cargarCuentasBancarias,
  cargarMovimientosFinancieros,
  cargarMotivosAnulacionFinanzas,
  cargarTiposDocumentoFinanzas,
  cargarTiposIngresoFinanzas,
  generarComprobantePdf,
  registrarMovimientoFinanciero,
} from '@/lib/finanzas';
import { Aviso } from '@/app/components/Aviso';
import { Paginador, usePaginacion } from '@/app/components/Paginador';

function formatearGs(valor: number): string {
  return `Gs. ${Math.round(valor).toLocaleString('es-PY')}`;
}

function FilaAnular({ movimiento, motivos, onAnulado }: { movimiento: MovimientoFinanciero; motivos: Parametro[]; onAnulado: () => void }) {
  const [motivoAnulacionId, setMotivoAnulacionId] = useState('');
  const [detalle, setDetalle] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opcionesMotivo = useMemo(() => motivos.map((m) => ({ value: m.id, label: m.nombre })), [motivos]);

  async function confirmar() {
    if (!motivoAnulacionId) {
      setError('Debe seleccionar un motivo');
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      await anularMovimientoFinanciero(movimiento.id, { motivoAnulacionId, motivoAnulacionDetalle: detalle || undefined });
      onAnulado();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ padding: '10px 4px', background: 'var(--surface-soft)', borderRadius: 6, display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8, alignItems: 'flex-end' }}>
      {error && <p style={{ color: 'var(--danger)', fontSize: 12, gridColumn: '1 / -1' }}>{error}</p>}
      <ComboBuscable opciones={opcionesMotivo} value={motivoAnulacionId} onChange={setMotivoAnulacionId} ningunaLabel="-- motivo --" />
      <input className="input-field" placeholder="Detalle (opcional)" value={detalle} onChange={(e) => setDetalle(e.target.value)} />
      <button type="button" className="btn-primary" style={{ padding: '6px 12px', fontSize: 12, background: '#7f1d1d' }} onClick={confirmar} disabled={guardando}>
        {guardando ? 'Guardando...' : 'Confirmar anulacion'}
      </button>
    </div>
  );
}

export default function MovimientosFinancierosPage() {
  const idCampo = useId();
  const [movimientos, setMovimientos] = useState<MovimientoFinanciero[] | null>(null);
  const [tiposIngreso, setTiposIngreso] = useState<Parametro[]>([]);
  const [categoriasEgreso, setCategoriasEgreso] = useState<Parametro[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<Parametro[]>([]);
  const [motivosAnulacion, setMotivosAnulacion] = useState<Parametro[]>([]);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorDeposito[]>([]);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [nombresClasificacion, setNombresClasificacion] = useState<Map<string, string>>(new Map());

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const [tipo, setTipo] = useState<'INGRESO' | 'EGRESO'>('INGRESO');
  const [fecha, setFecha] = useState('');
  const [tipoIngresoId, setTipoIngresoId] = useState('');
  const [categoriaEgresoId, setCategoriaEgresoId] = useState('');
  const [concepto, setConcepto] = useState('');
  const [importe, setImporte] = useState('');
  const [origen, setOrigen] = useState<'CAJA' | 'CUENTA'>('CAJA');
  const [cajaId, setCajaId] = useState('');
  const [cuentaBancariaId, setCuentaBancariaId] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [bomberoId, setBomberoId] = useState('');
  const [entidadExterna, setEntidadExterna] = useState('');
  const [responsableId, setResponsableId] = useState('');
  const [observacion, setObservacion] = useState('');
  const [conDocumento, setConDocumento] = useState(false);
  const [docTipoId, setDocTipoId] = useState('');
  const [docNumero, setDocNumero] = useState('');
  const [docTimbrado, setDocTimbrado] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCrear = permisos.includes('finanzas:crear');
  const puedeAnular = permisos.includes('finanzas:anular');
  const puedeVerReportes = permisos.includes('finanzas:reportes');

  const opcionesTipoIngreso = useMemo(() => tiposIngreso.map((t) => ({ value: t.id, label: t.nombre })), [tiposIngreso]);
  const opcionesCategoriaEgreso = useMemo(() => categoriasEgreso.map((c) => ({ value: c.id, label: c.nombre })), [categoriasEgreso]);
  const opcionesDocTipo = useMemo(() => tiposDocumento.map((t) => ({ value: t.id, label: t.nombre })), [tiposDocumento]);
  const opcionesCaja = useMemo(() => cajas.map((c) => ({ value: c.id, label: c.nombre })), [cajas]);
  const opcionesCuenta = useMemo(() => cuentas.map((c) => ({ value: c.id, label: `${c.banco} - ${c.numeroCuenta}` })), [cuentas]);
  const opcionesProveedor = useMemo(() => proveedores.map((p) => ({ value: p.id, label: p.razonSocial })), [proveedores]);
  const opcionesBombero = useMemo(() => bomberos.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` })), [bomberos]);

  const nombreCaja = useMemo(() => new Map(cajas.map((c) => [c.id, c.nombre])), [cajas]);
  const nombreCuenta = useMemo(() => new Map(cuentas.map((c) => [c.id, `${c.banco} - ${c.numeroCuenta}`])), [cuentas]);

  // El listado trae el conjunto completo: se muestra de a paginas.
  const paginado = usePaginacion(movimientos ?? []);

  async function cargar() {
    try {
      const datos = await cargarMovimientosFinancieros({ tipo: filtroTipo || undefined, estado: filtroEstado || undefined, desde: desde || undefined, hasta: hasta || undefined });
      setMovimientos(datos);
      setNombresClasificacion(await resolverNombres(datos.map((m) => m.tipoIngresoId ?? m.categoriaEgresoId)));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarTiposIngresoFinanzas().then(setTiposIngreso);
    cargarCategoriasEgresoFinanzas().then(setCategoriasEgreso);
    cargarTiposDocumentoFinanzas().then(setTiposDocumento);
    cargarMotivosAnulacionFinanzas().then(setMotivosAnulacion);
    cargarCajas('ACTIVA').then(setCajas);
    cargarCuentasBancarias('ACTIVA').then(setCuentas);
    cargarProveedoresDeposito().then(setProveedores).catch(() => undefined);
    cargarBomberos().then(setBomberos).catch(() => undefined);
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroTipo, filtroEstado, desde, hasta]);

  function limpiarForm() {
    setTipo('INGRESO');
    setFecha('');
    setTipoIngresoId('');
    setCategoriaEgresoId('');
    setConcepto('');
    setImporte('');
    setOrigen('CAJA');
    setCajaId('');
    setCuentaBancariaId('');
    setProveedorId('');
    setBomberoId('');
    setEntidadExterna('');
    setResponsableId('');
    setObservacion('');
    setConDocumento(false);
    setDocTipoId('');
    setDocNumero('');
    setDocTimbrado('');
  }

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await registrarMovimientoFinanciero({
        tipo,
        fecha,
        tipoIngresoId: tipo === 'INGRESO' ? tipoIngresoId : undefined,
        categoriaEgresoId: tipo === 'EGRESO' ? categoriaEgresoId : undefined,
        concepto,
        importe: Number(importe),
        cajaId: origen === 'CAJA' ? cajaId : undefined,
        cuentaBancariaId: origen === 'CUENTA' ? cuentaBancariaId : undefined,
        proveedorId: proveedorId || undefined,
        bomberoId: bomberoId || undefined,
        entidadExterna: entidadExterna || undefined,
        responsableId: responsableId || undefined,
        observacion: observacion || undefined,
        documento: conDocumento && docTipoId ? { tipoDocumentoId: docTipoId, numero: docNumero || undefined, timbrado: docTimbrado || undefined } : undefined,
      });
      setMensaje('Movimiento registrado.');
      limpiarForm();
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function verComprobante(id: string) {
    try {
      const { url } = await generarComprobantePdf(id);
      window.open(`${API_ORIGIN}${url}`, '_blank');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Movimientos ({movimientos?.length ?? 0})</h2>
        {puedeCrear && (
          <button type="button"
            className="btn-primary"
            onClick={() => {
              limpiarForm();
              setMostrarForm(!mostrarForm);
            }}
          >
            {mostrarForm ? 'Cancelar' : '+ Registrar movimiento'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Tipo</label>
          <ComboBuscable ariaLabel="Tipo" opciones={[{ value: 'INGRESO', label: 'Ingreso' }, { value: 'EGRESO', label: 'Egreso' }]} value={filtroTipo} onChange={setFiltroTipo} maxWidth={160} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Estado</label>
          <ComboBuscable ariaLabel="Estado" opciones={[{ value: 'REGISTRADO', label: 'REGISTRADO' }, { value: 'ANULADO', label: 'ANULADO' }]} value={filtroEstado} onChange={setFiltroEstado} maxWidth={160} />
        </div>
        <div>
          <label htmlFor={`${idCampo}-desde`} style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Desde</label>
          <input id={`${idCampo}-desde`} className="input-field" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <label htmlFor={`${idCampo}-hasta`} style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Hasta</label>
          <input id={`${idCampo}-hasta`} className="input-field" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form onSubmit={registrar} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo</label>
              <ComboBuscable ariaLabel="Tipo" opciones={[{ value: 'INGRESO', label: 'Ingreso' }, { value: 'EGRESO', label: 'Egreso' }]} value={tipo} onChange={(v) => setTipo(v as 'INGRESO' | 'EGRESO')} ningunaLabel="-- seleccionar --" />
            </div>
            <div>
              <label htmlFor={`${idCampo}-fecha`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label>
              <input id={`${idCampo}-fecha`} className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>{tipo === 'INGRESO' ? 'Tipo de ingreso' : 'Categoria de egreso'}</label>
              {tipo === 'INGRESO' ? (
                <ComboBuscable opciones={opcionesTipoIngreso} value={tipoIngresoId} onChange={setTipoIngresoId} ningunaLabel="-- seleccionar --" />
              ) : (
                <ComboBuscable opciones={opcionesCategoriaEgreso} value={categoriaEgresoId} onChange={setCategoriaEgresoId} ningunaLabel="-- seleccionar --" />
              )}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor={`${idCampo}-concepto`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Concepto</label>
              <input id={`${idCampo}-concepto`} className="input-field" value={concepto} onChange={(e) => setConcepto(e.target.value)} required />
            </div>
            <div>
              <label htmlFor={`${idCampo}-importe`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Importe</label>
              <input id={`${idCampo}-importe`} className="input-field" type="number" min={0.01} step="1" value={importe} onChange={(e) => setImporte(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Caja o cuenta bancaria</label>
              <ComboBuscable ariaLabel="Caja o cuenta bancaria" opciones={[{ value: 'CAJA', label: 'Caja' }, { value: 'CUENTA', label: 'Cuenta bancaria' }]} value={origen} onChange={(v) => setOrigen(v as 'CAJA' | 'CUENTA')} ningunaLabel="-- seleccionar --" />
            </div>
            {origen === 'CAJA' ? (
              <ComboBuscable opciones={opcionesCaja} value={cajaId} onChange={setCajaId} ningunaLabel="-- seleccionar caja --" />
            ) : (
              <ComboBuscable opciones={opcionesCuenta} value={cuentaBancariaId} onChange={setCuentaBancariaId} ningunaLabel="-- seleccionar cuenta --" />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Proveedor</label>
              <ComboBuscable ariaLabel="Proveedor" opciones={opcionesProveedor} value={proveedorId} onChange={setProveedorId} ningunaLabel="Sin proveedor" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Persona (personal)</label>
              <ComboBuscable ariaLabel="Persona (personal)" opciones={opcionesBombero} value={bomberoId} onChange={setBomberoId} ningunaLabel="No aplica" />
            </div>
            <div>
              <label htmlFor={`${idCampo}-entidad-externa`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Entidad externa</label>
              <input id={`${idCampo}-entidad-externa`} className="input-field" value={entidadExterna} onChange={(e) => setEntidadExterna(e.target.value)} disabled={!!bomberoId} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Responsable</label>
              <ComboBuscable ariaLabel="Responsable" opciones={opcionesBombero} value={responsableId} onChange={setResponsableId} ningunaLabel="Sin definir" />
            </div>
            <div>
              <label htmlFor={`${idCampo}-observacion`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observación</label>
              <input id={`${idCampo}-observacion`} className="input-field" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
            </div>
          </div>

          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={conDocumento} onChange={(e) => setConDocumento(e.target.checked)} />
            Adjuntar documento respaldatorio
          </label>
          {conDocumento && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <ComboBuscable opciones={opcionesDocTipo} value={docTipoId} onChange={setDocTipoId} ningunaLabel="-- tipo de documento --" />
              <input className="input-field" placeholder="Número" value={docNumero} onChange={(e) => setDocNumero(e.target.value)} />
              <input className="input-field" placeholder="Timbrado" value={docTimbrado} onChange={(e) => setDocTimbrado(e.target.value)} />
            </div>
          )}

          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Registrar movimiento'}
          </button>
        </form>
      )}

      {movimientos && movimientos.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay movimientos registrados.</p>}
      {movimientos && movimientos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Fecha</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Tipo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Concepto</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Caja/Cuenta</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Importe</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginado.visibles.map((m) => (
              <Fragment key={m.id}>
                <tr style={{ borderBottom: expandidoId === m.id ? 'none' : '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '6px 4px' }}>{m.fecha}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={{ background: m.tipo === 'INGRESO' ? 'var(--ok-fill)' : 'var(--bad-fill)', color: m.tipo === 'INGRESO' ? 'var(--success)' : 'var(--danger)' }}>{m.tipo}</span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    {m.concepto}
                    <span style={{ color: 'var(--muted)' }}> ({nombresClasificacion.get(m.tipoIngresoId ?? m.categoriaEgresoId ?? '') ?? '-'})</span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>{m.cajaId ? nombreCaja.get(m.cajaId) ?? '-' : nombreCuenta.get(m.cuentaBancariaId ?? '') ?? '-'}</td>
                  <td style={{ padding: '6px 4px', fontWeight: 600 }}>{formatearGs(m.importe)}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={{ background: m.estado === 'ANULADO' ? 'var(--bad-fill)' : 'var(--neutral-fill)', color: m.estado === 'ANULADO' ? 'var(--danger)' : 'var(--ink)' }}>{m.estado}</span>
                  </td>
                  <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {puedeVerReportes && (
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => verComprobante(m.id)}>
                        Comprobante
                      </button>
                    )}
                    {puedeAnular && m.estado === 'REGISTRADO' && (
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }} onClick={() => setExpandidoId(expandidoId === m.id ? null : m.id)}>
                        {expandidoId === m.id ? 'Cerrar' : 'Anular'}
                      </button>
                    )}
                  </td>
                </tr>
                {expandidoId === m.id && (
                  <tr style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td colSpan={7} style={{ padding: '4px' }}>
                      <FilaAnular
                        movimiento={m}
                        motivos={motivosAnulacion}
                        onAnulado={() => {
                          setExpandidoId(null);
                          setMensaje('Movimiento anulado.');
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
      {movimientos && movimientos.length > 0 && (
        <Paginador {...paginado} mostrados={paginado.visibles.length} etiqueta="movimientos" />
      )}
    </div>
  );
}
