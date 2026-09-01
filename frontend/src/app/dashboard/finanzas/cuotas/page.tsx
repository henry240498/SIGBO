'use client';

import { Fragment, useEffect, useId, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { useEntradaConfirmada } from '@/app/components/InputProvider';
import { ComboBuscable } from '@/components/ComboBuscable';
import { cargarBomberos, BomberoResumen } from '@/lib/personal';
import { Caja, CuentaBancaria, Cuota, anularCuota, cargarCajas, cargarCuentasBancarias, cargarCuotas, crearCuota, exonerarCuota, pagarCuota } from '@/lib/finanzas';
import { Aviso } from '@/app/components/Aviso';

function formatearGs(valor: number): string {
  return `Gs. ${Math.round(valor).toLocaleString('es-PY')}`;
}

function colorEstado(estado: string) {
  if (estado === 'PAGADA') return { background: 'var(--ok-fill)', color: 'var(--success)' };
  if (estado === 'ANULADA') return { background: 'var(--bad-fill)', color: 'var(--danger)' };
  if (estado === 'PARCIAL') return { background: 'var(--warn-fill)', color: 'var(--warning)' };
  if (estado === 'EXONERADA') return { background: 'var(--neutral-fill)', color: 'var(--muted)' };
  return { background: 'var(--neutral-fill)', color: 'var(--ink)' };
}

function FilaPago({ cuota, cajas, cuentas, onPagada }: { cuota: Cuota; cajas: Caja[]; cuentas: CuentaBancaria[]; onPagada: () => void }) {
  const idCampo = useId();
  const [fecha, setFecha] = useState('');
  const [origen, setOrigen] = useState<'CAJA' | 'CUENTA'>('CAJA');
  const [cajaId, setCajaId] = useState('');
  const [cuentaBancariaId, setCuentaBancariaId] = useState('');
  const [importe, setImporte] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opcionesCaja = useMemo(() => cajas.map((c) => ({ value: c.id, label: c.nombre })), [cajas]);
  const opcionesCuenta = useMemo(() => cuentas.map((c) => ({ value: c.id, label: `${c.banco} - ${c.numeroCuenta}` })), [cuentas]);
  const pendiente = cuota.importe - cuota.importePagado;

  async function confirmar() {
    setError(null);
    setGuardando(true);
    try {
      await pagarCuota(cuota.id, {
        fecha,
        importe: importe ? Number(importe) : undefined,
        cajaId: origen === 'CAJA' ? cajaId : undefined,
        cuentaBancariaId: origen === 'CUENTA' ? cuentaBancariaId : undefined,
      });
      onPagada();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ padding: '10px 4px', background: 'var(--surface-soft)', borderRadius: 6, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'flex-end' }}>
      {error && <p style={{ color: 'var(--danger)', fontSize: 12, gridColumn: '1 / -1' }}>{error}</p>}
      <div>
        <label htmlFor={`${idCampo}-fecha`} style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Fecha</label>
        <input id={`${idCampo}-fecha`} className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </div>
      <div>
        <label htmlFor={`${idCampo}-importe-pendiente`} style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Importe (pendiente {formatearGs(pendiente)})</label>
        <input id={`${idCampo}-importe-pendiente`} className="input-field" type="number" min={0.01} step="1" placeholder={String(pendiente)} value={importe} onChange={(e) => setImporte(e.target.value)} />
      </div>
      <ComboBuscable opciones={[{ value: 'CAJA', label: 'Caja' }, { value: 'CUENTA', label: 'Cuenta' }]} value={origen} onChange={(v) => setOrigen(v as 'CAJA' | 'CUENTA')} />
      {origen === 'CAJA' ? (
        <ComboBuscable opciones={opcionesCaja} value={cajaId} onChange={setCajaId} ningunaLabel="-- caja --" />
      ) : (
        <ComboBuscable opciones={opcionesCuenta} value={cuentaBancariaId} onChange={setCuentaBancariaId} ningunaLabel="-- cuenta --" />
      )}
      <button type="button" className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} disabled={guardando || !fecha || (!cajaId && !cuentaBancariaId)} onClick={confirmar}>
        {guardando ? 'Guardando...' : 'Confirmar pago'}
      </button>
    </div>
  );
}

export default function CuotasPage() {
  const idCampo = useId();
  const solicitarEntrada = useEntradaConfirmada();
  const [cuotas, setCuotas] = useState<Cuota[] | null>(null);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [expandidaId, setExpandidaId] = useState<string | null>(null);

  const [filtroBomberoId, setFiltroBomberoId] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const [bomberoId, setBomberoId] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [importe, setImporte] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [observacion, setObservacion] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCrear = permisos.includes('finanzas:crear');
  const puedeAnular = permisos.includes('finanzas:anular');
  const puedeEditar = permisos.includes('finanzas:editar');

  const opcionesBombero = useMemo(() => bomberos.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` })), [bomberos]);
  const bomberoPorId = useMemo(() => new Map(bomberos.map((b) => [b.id, `${b.numeroBombero} — ${b.nombre} ${b.apellido}`])), [bomberos]);

  async function cargar() {
    try {
      setCuotas(await cargarCuotas({ bomberoId: filtroBomberoId || undefined, estado: filtroEstado || undefined }));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarBomberos().then(setBomberos).catch(() => undefined);
    cargarCajas('ACTIVA').then(setCajas);
    cargarCuentasBancarias('ACTIVA').then(setCuentas);
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroBomberoId, filtroEstado]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await crearCuota({ bomberoId, periodo, importe: Number(importe), fechaVencimiento: fechaVencimiento || undefined, observacion: observacion || undefined });
      setMensaje('Cuota creada.');
      setBomberoId('');
      setPeriodo('');
      setImporte('');
      setFechaVencimiento('');
      setObservacion('');
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function anular(c: Cuota) {
    const motivo = await solicitarEntrada({ titulo: 'Anular cuota', mensaje: 'Indique el motivo de la anulación.', etiqueta: 'Motivo', confirmar: 'Anular', requerida: true, peligro: true });
    if (!motivo) return;
    try {
      await anularCuota(c.id, motivo);
      setMensaje('Cuota anulada.');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function exonerar(c: Cuota) {
    const motivo = await solicitarEntrada({ titulo: 'Exonerar cuota', mensaje: 'Indique el motivo de la exoneración.', etiqueta: 'Motivo', confirmar: 'Exonerar', requerida: true });
    if (!motivo) return;
    try {
      await exonerarCuota(c.id, motivo);
      setMensaje('Cuota exonerada.');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Cuotas ({cuotas?.length ?? 0})</h2>
        {puedeCrear && (
          <button type="button" className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : '+ Nueva cuota'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div style={{ minWidth: 240 }}>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Personal</label>
          <ComboBuscable ariaLabel="Personal" opciones={opcionesBombero} value={filtroBomberoId} onChange={setFiltroBomberoId} placeholderBusqueda="Buscar..." />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Estado</label>
          <ComboBuscable ariaLabel="Estado"
            opciones={[
              { value: 'PENDIENTE', label: 'PENDIENTE' },
              { value: 'PARCIAL', label: 'PARCIAL' },
              { value: 'PAGADA', label: 'PAGADA' },
              { value: 'ANULADA', label: 'ANULADA' },
              { value: 'EXONERADA', label: 'EXONERADA' },
            ]}
            value={filtroEstado}
            onChange={setFiltroEstado}
            maxWidth={180}
          />
        </div>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Personal</label>
              <ComboBuscable ariaLabel="Personal" opciones={opcionesBombero} value={bomberoId} onChange={setBomberoId} placeholderBusqueda="Buscar..." ningunaLabel="-- seleccionar --" />
            </div>
            <div>
              <label htmlFor={`${idCampo}-periodo-yyyy-mm`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Periodo (YYYY-MM)</label>
              <input id={`${idCampo}-periodo-yyyy-mm`} className="input-field" placeholder="2026-08" value={periodo} onChange={(e) => setPeriodo(e.target.value)} required />
            </div>
            <div>
              <label htmlFor={`${idCampo}-importe`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Importe</label>
              <input id={`${idCampo}-importe`} className="input-field" type="number" min={0.01} step="1" value={importe} onChange={(e) => setImporte(e.target.value)} required />
            </div>
            <div>
              <label htmlFor={`${idCampo}-vencimiento`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Vencimiento</label>
              <input id={`${idCampo}-vencimiento`} className="input-field" type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor={`${idCampo}-observacion`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observacion</label>
            <input id={`${idCampo}-observacion`} className="input-field" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
          </div>
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Crear cuota'}
          </button>
        </form>
      )}

      {cuotas && cuotas.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay cuotas registradas.</p>}
      {cuotas && cuotas.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Personal</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Periodo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Importe</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Pagado</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cuotas.map((c) => (
              <Fragment key={c.id}>
                <tr style={{ borderBottom: expandidaId === c.id ? 'none' : '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '6px 4px' }}>{bomberoPorId.get(c.bomberoId) ?? '-'}</td>
                  <td style={{ padding: '6px 4px' }}>{c.periodo}</td>
                  <td style={{ padding: '6px 4px' }}>{formatearGs(c.importe)}</td>
                  <td style={{ padding: '6px 4px' }}>{formatearGs(c.importePagado)}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={colorEstado(c.estado)}>{c.estado}</span>
                  </td>
                  <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {puedeCrear && (c.estado === 'PENDIENTE' || c.estado === 'PARCIAL') && (
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setExpandidaId(expandidaId === c.id ? null : c.id)}>
                        {expandidaId === c.id ? 'Cerrar' : 'Pagar'}
                      </button>
                    )}
                    {puedeEditar && c.estado === 'PENDIENTE' && (
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12, background: '#475569' }} onClick={() => exonerar(c)}>
                        Exonerar
                      </button>
                    )}
                    {puedeAnular && c.estado === 'PENDIENTE' && (
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }} onClick={() => anular(c)}>
                        Anular
                      </button>
                    )}
                  </td>
                </tr>
                {expandidaId === c.id && (
                  <tr style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td colSpan={6} style={{ padding: '4px' }}>
                      <FilaPago
                        cuota={c}
                        cajas={cajas}
                        cuentas={cuentas}
                        onPagada={() => {
                          setExpandidaId(null);
                          setMensaje('Pago registrado.');
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
