'use client';

import { useEffect, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { CuentaBancaria, MovimientoBancario, cargarCuentasBancarias, cargarMovimientosBancarios, conciliarMovimientoBancario, crearMovimientoBancario } from '@/lib/finanzas';

function formatearGs(valor: number): string {
  return `Gs. ${Math.round(valor).toLocaleString('es-PY')}`;
}

function colorConciliacion(estado: string) {
  if (estado === 'CONCILIADO') return { background: '#166534', color: '#4ade80' };
  if (estado === 'DIFERENCIA') return { background: '#7f1d1d', color: '#f87171' };
  return { background: '#334155', color: '#e2e8f0' };
}

const TIPOS = [
  { value: 'DEPOSITO', label: 'Deposito' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'DEBITO', label: 'Debito' },
  { value: 'CREDITO', label: 'Credito' },
  { value: 'COMISION', label: 'Comision' },
  { value: 'OTRO', label: 'Otro' },
];

export default function MovimientosBancariosPage() {
  const [movimientos, setMovimientos] = useState<MovimientoBancario[] | null>(null);
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [filtroCuentaId, setFiltroCuentaId] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const [cuentaBancariaId, setCuentaBancariaId] = useState('');
  const [tipo, setTipo] = useState('');
  const [fecha, setFecha] = useState('');
  const [importe, setImporte] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCrear = permisos.includes('finanzas:crear');
  const puedeConciliar = permisos.includes('finanzas:conciliar');

  const opcionesCuenta = useMemo(() => cuentas.map((c) => ({ value: c.id, label: `${c.banco} - ${c.numeroCuenta}` })), [cuentas]);
  const nombreCuenta = useMemo(() => new Map(cuentas.map((c) => [c.id, `${c.banco} - ${c.numeroCuenta}`])), [cuentas]);

  async function cargar() {
    try {
      setMovimientos(await cargarMovimientosBancarios({ cuentaBancariaId: filtroCuentaId || undefined, estadoConciliacion: filtroEstado || undefined }));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarCuentasBancarias('ACTIVA').then(setCuentas);
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroCuentaId, filtroEstado]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await crearMovimientoBancario({ cuentaBancariaId, tipo, fecha, importe: Number(importe), descripcion });
      setMensaje('Movimiento bancario cargado.');
      setCuentaBancariaId('');
      setTipo('');
      setFecha('');
      setImporte('');
      setDescripcion('');
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function conciliar(m: MovimientoBancario, estadoConciliacion: 'CONCILIADO' | 'DIFERENCIA') {
    try {
      await conciliarMovimientoBancario(m.id, { estadoConciliacion });
      setMensaje(estadoConciliacion === 'CONCILIADO' ? 'Movimiento conciliado.' : 'Diferencia registrada.');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Conciliacion bancaria ({movimientos?.length ?? 0})</h2>
        {puedeCrear && (
          <button type="button" className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : '+ Cargar movimiento de extracto'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Cuenta</label>
          <ComboBuscable opciones={opcionesCuenta} value={filtroCuentaId} onChange={setFiltroCuentaId} maxWidth={220} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Estado</label>
          <ComboBuscable
            opciones={[{ value: 'PENDIENTE', label: 'PENDIENTE' }, { value: 'CONCILIADO', label: 'CONCILIADO' }, { value: 'DIFERENCIA', label: 'DIFERENCIA' }]}
            value={filtroEstado}
            onChange={setFiltroEstado}
            maxWidth={180}
          />
        </div>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}
      <p style={{ fontSize: 12, color: '#64748b' }}>
        Comparacion manual contra el extracto bancario real. Nunca se ajusta un movimiento automaticamente para hacerlo
        coincidir -- la diferencia queda visible.
      </p>

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cuenta bancaria</label>
              <ComboBuscable opciones={opcionesCuenta} value={cuentaBancariaId} onChange={setCuentaBancariaId} ningunaLabel="-- seleccionar --" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo</label>
              <ComboBuscable opciones={TIPOS} value={tipo} onChange={setTipo} ningunaLabel="-- seleccionar --" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label>
              <input className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Importe</label>
              <input className="input-field" type="number" min={0.01} step="1" value={importe} onChange={(e) => setImporte(e.target.value)} required />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripcion</label>
            <input className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
          </div>
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Cargar movimiento'}
          </button>
        </form>
      )}

      {movimientos && movimientos.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No hay movimientos bancarios cargados.</p>}
      {movimientos && movimientos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Fecha</th>
              <th style={{ padding: '6px 4px' }}>Cuenta</th>
              <th style={{ padding: '6px 4px' }}>Tipo</th>
              <th style={{ padding: '6px 4px' }}>Descripcion</th>
              <th style={{ padding: '6px 4px' }}>Importe</th>
              <th style={{ padding: '6px 4px' }}>Conciliacion</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{m.fecha}</td>
                <td style={{ padding: '6px 4px' }}>{nombreCuenta.get(m.cuentaBancariaId) ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>{m.tipo}</td>
                <td style={{ padding: '6px 4px' }}>{m.descripcion}</td>
                <td style={{ padding: '6px 4px' }}>{formatearGs(m.importe)}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={colorConciliacion(m.estadoConciliacion)}>{m.estadoConciliacion}</span>
                </td>
                <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {puedeConciliar && m.estadoConciliacion === 'PENDIENTE' && (
                    <>
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12, background: '#16a34a' }} onClick={() => conciliar(m, 'CONCILIADO')}>
                        Conciliar
                      </button>
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }} onClick={() => conciliar(m, 'DIFERENCIA')}>
                        Marcar diferencia
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
