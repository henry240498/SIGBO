'use client';

import { useEffect, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Parametro } from '@/lib/parametros';
import { cargarBomberos, BomberoResumen } from '@/lib/personal';
import { CuentaBancaria, actualizarCuentaBancaria, cargarCuentasBancarias, cargarTiposCuentaBancariaFinanzas, crearCuentaBancaria } from '@/lib/finanzas';

function formatearGs(valor: number): string {
  return `Gs. ${Math.round(valor).toLocaleString('es-PY')}`;
}

export default function CuentasBancariasPage() {
  const [cuentas, setCuentas] = useState<CuentaBancaria[] | null>(null);
  const [tipos, setTipos] = useState<Parametro[]>([]);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [banco, setBanco] = useState('');
  const [numeroCuenta, setNumeroCuenta] = useState('');
  const [tipoCuentaId, setTipoCuentaId] = useState('');
  const [responsableId, setResponsableId] = useState('');
  const [observacion, setObservacion] = useState('');
  const [estado, setEstado] = useState('ACTIVA');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeAdministrar = permisos.includes('finanzas:administrar_cajas');

  const opcionesTipo = useMemo(() => tipos.map((t) => ({ value: t.id, label: t.nombre })), [tipos]);
  const opcionesBombero = useMemo(() => bomberos.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` })), [bomberos]);
  const nombreTipo = useMemo(() => new Map(tipos.map((t) => [t.id, t.nombre])), [tipos]);

  async function cargar() {
    try {
      setCuentas(await cargarCuentasBancarias());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarTiposCuentaBancariaFinanzas().then(setTipos);
    cargarBomberos().then(setBomberos).catch(() => undefined);
    cargar();
  }, []);

  function limpiarForm() {
    setBanco('');
    setNumeroCuenta('');
    setTipoCuentaId('');
    setResponsableId('');
    setObservacion('');
    setEstado('ACTIVA');
    setEditandoId(null);
  }

  function editar(c: CuentaBancaria) {
    setEditandoId(c.id);
    setBanco(c.banco);
    setNumeroCuenta(c.numeroCuenta);
    setTipoCuentaId(c.tipoCuentaId ?? '');
    setResponsableId(c.responsableId ?? '');
    setObservacion(c.observacion ?? '');
    setEstado(c.estado);
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      const payload = {
        banco,
        numeroCuenta,
        tipoCuentaId: tipoCuentaId || undefined,
        responsableId: responsableId || undefined,
        observacion: observacion || undefined,
        estado,
      };
      if (editandoId) {
        await actualizarCuentaBancaria(editandoId, payload);
        setMensaje('Cuenta bancaria actualizada.');
      } else {
        await crearCuentaBancaria(payload);
        setMensaje('Cuenta bancaria creada.');
      }
      limpiarForm();
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
        <h2 style={{ fontSize: 16 }}>Cuentas bancarias ({cuentas?.length ?? 0})</h2>
        {puedeAdministrar && (
          <button type="button"
            className="btn-primary"
            onClick={() => {
              limpiarForm();
              setMostrarForm(!mostrarForm);
            }}
          >
            {mostrarForm ? 'Cancelar' : '+ Nueva cuenta'}
          </button>
        )}
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {mostrarForm && (
        <form onSubmit={guardar} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Banco</label>
              <input className="input-field" value={banco} onChange={(e) => setBanco(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Numero de cuenta</label>
              <input className="input-field" value={numeroCuenta} onChange={(e) => setNumeroCuenta(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de cuenta</label>
              <ComboBuscable opciones={opcionesTipo} value={tipoCuentaId} onChange={setTipoCuentaId} ningunaLabel="Sin definir" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Responsable</label>
              <ComboBuscable opciones={opcionesBombero} value={responsableId} onChange={setResponsableId} ningunaLabel="Sin definir" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observacion</label>
              <input className="input-field" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
            </div>
          </div>
          {editandoId && (
            <div style={{ maxWidth: 200 }}>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
              <ComboBuscable opciones={[{ value: 'ACTIVA', label: 'ACTIVA' }, { value: 'INACTIVA', label: 'INACTIVA' }]} value={estado} onChange={setEstado} ningunaLabel="ACTIVA" />
            </div>
          )}
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear cuenta'}
          </button>
        </form>
      )}

      {cuentas && cuentas.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No hay cuentas bancarias registradas.</p>}
      {cuentas && cuentas.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Banco</th>
              <th style={{ padding: '6px 4px' }}>N° cuenta</th>
              <th style={{ padding: '6px 4px' }}>Tipo</th>
              <th style={{ padding: '6px 4px' }}>Saldo actual</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cuentas.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{c.banco}</td>
                <td style={{ padding: '6px 4px' }}>{c.numeroCuenta}</td>
                <td style={{ padding: '6px 4px' }}>{c.tipoCuentaId ? nombreTipo.get(c.tipoCuentaId) ?? '-' : '-'}</td>
                <td style={{ padding: '6px 4px', fontWeight: 600 }}>{formatearGs(c.saldoActual)}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: c.estado === 'ACTIVA' ? '#166534' : '#7f1d1d', color: c.estado === 'ACTIVA' ? '#4ade80' : '#f87171' }}>{c.estado}</span>
                </td>
                <td style={{ padding: '6px 4px' }}>
                  {puedeAdministrar && (
                    <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(c)}>
                      Editar
                    </button>
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
