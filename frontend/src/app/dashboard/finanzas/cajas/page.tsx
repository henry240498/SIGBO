'use client';

import { Fragment, useEffect, useId, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { ComboBuscable } from '@/components/ComboBuscable';
import { cargarBomberos, BomberoResumen } from '@/lib/personal';
import { Caja, TurnoCaja, abrirCaja, actualizarCaja, cargarCajas, cargarTurnoAbierto, cargarTurnosDeCaja, cerrarCaja, crearCaja } from '@/lib/finanzas';
import { Cargando } from '@/app/components/Cargando';
import { Aviso } from '@/app/components/Aviso';

function formatearGs(valor: number): string {
  return `Gs. ${Math.round(valor).toLocaleString('es-PY')}`;
}

function PanelTurno({ caja, onCambio }: { caja: Caja; onCambio: () => void }) {
  const idCampo = useId();
  const [turnoAbierto, setTurnoAbierto] = useState<TurnoCaja | null | undefined>(undefined);
  const [turnos, setTurnos] = useState<TurnoCaja[] | null>(null);
  const [mostrarAbrir, setMostrarAbrir] = useState(false);
  const [mostrarCerrar, setMostrarCerrar] = useState(false);
  const [saldoInicial, setSaldoInicial] = useState('');
  const [saldoFisico, setSaldoFisico] = useState('');
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCerrarCaja = permisos.includes('finanzas:cerrar_caja');

  async function cargar() {
    setTurnoAbierto(await cargarTurnoAbierto(caja.id));
    setTurnos(await cargarTurnosDeCaja(caja.id));
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caja.id]);

  async function abrir(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await abrirCaja(caja.id, Number(saldoInicial));
      setSaldoInicial('');
      setMostrarAbrir(false);
      await cargar();
      onCambio();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function cerrar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await cerrarCaja(caja.id, { saldoFisico: Number(saldoFisico), observacion: observacion || undefined });
      setSaldoFisico('');
      setObservacion('');
      setMostrarCerrar(false);
      await cargar();
      onCambio();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (turnoAbierto === undefined) return <Cargando texto="Cargando turnos…" />;

  return (
    <div style={{ padding: '10px 4px', background: 'var(--surface-soft)', borderRadius: 6 }}>
      {error && <Aviso tipo="error" texto={error} fontSize={12} />}
      {turnoAbierto ? (
        <div style={{ fontSize: 13 }}>
          Turno abierto desde {new Date(turnoAbierto.fechaApertura).toLocaleString()} (saldo inicial declarado {formatearGs(turnoAbierto.saldoInicial)}).
          {puedeCerrarCaja && (
            <button type="button" className="btn-primary" style={{ marginLeft: 10, padding: '4px 10px', fontSize: 12, background: '#7f1d1d' }} onClick={() => setMostrarCerrar(!mostrarCerrar)}>
              {mostrarCerrar ? 'Cancelar' : 'Cerrar caja'}
            </button>
          )}
        </div>
      ) : (
        <div style={{ fontSize: 13 }}>
          Sin turno abierto.
          {puedeCerrarCaja && (
            <button type="button" className="btn-primary" style={{ marginLeft: 10, padding: '4px 10px', fontSize: 12 }} onClick={() => setMostrarAbrir(!mostrarAbrir)}>
              {mostrarAbrir ? 'Cancelar' : 'Abrir caja'}
            </button>
          )}
        </div>
      )}

      {mostrarAbrir && (
        <form onSubmit={abrir} style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'flex-end' }}>
          <div>
            <label htmlFor={`${idCampo}-saldo-inicial-declarado`} style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Saldo inicial declarado</label>
            <input id={`${idCampo}-saldo-inicial-declarado`} className="input-field" type="number" min={0} step="1" value={saldoInicial} onChange={(e) => setSaldoInicial(e.target.value)} required />
          </div>
          <button type="button" className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Confirmar apertura'}
          </button>
        </form>
      )}

      {mostrarCerrar && (
        <form onSubmit={cerrar} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8, marginTop: 8, alignItems: 'flex-end' }}>
          <div>
            <label htmlFor={`${idCampo}-saldo-fisico-contado`} style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Saldo fisico contado</label>
            <input id={`${idCampo}-saldo-fisico-contado`} className="input-field" type="number" min={0} step="1" value={saldoFisico} onChange={(e) => setSaldoFisico(e.target.value)} required />
          </div>
          <div>
            <label htmlFor={`${idCampo}-observacion`} style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Observacion</label>
            <input id={`${idCampo}-observacion`} className="input-field" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
          </div>
          <button type="button" className="btn-primary" style={{ padding: '6px 12px', fontSize: 12, background: '#7f1d1d' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Confirmar cierre'}
          </button>
        </form>
      )}

      {turnos && turnos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginTop: 10 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '4px' }}>Apertura</th>
              <th scope="col" style={{ padding: '4px' }}>Cierre</th>
              <th scope="col" style={{ padding: '4px' }}>Saldo teorico</th>
              <th scope="col" style={{ padding: '4px' }}>Saldo fisico</th>
              <th scope="col" style={{ padding: '4px' }}>Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '4px' }}>{new Date(t.fechaApertura).toLocaleString()}</td>
                <td style={{ padding: '4px' }}>{t.fechaCierre ? new Date(t.fechaCierre).toLocaleString() : '-'}</td>
                <td style={{ padding: '4px' }}>{t.saldoTeorico != null ? formatearGs(t.saldoTeorico) : '-'}</td>
                <td style={{ padding: '4px' }}>{t.saldoFisico != null ? formatearGs(t.saldoFisico) : '-'}</td>
                <td style={{ padding: '4px', color: t.diferencia ? 'var(--danger)' : undefined, fontWeight: t.diferencia ? 600 : undefined }}>
                  {t.diferencia != null ? (t.diferencia !== 0 ? `⚠️ ${formatearGs(t.diferencia)}` : formatearGs(0)) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function CajasPage() {
  const idCampo = useId();
  const confirmar = useConfirmacion();
  const [cajas, setCajas] = useState<Caja[] | null>(null);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [expandidaId, setExpandidaId] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [responsableId, setResponsableId] = useState('');
  const [observacion, setObservacion] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeAdministrar = permisos.includes('finanzas:administrar_cajas');

  const opcionesBombero = useMemo(() => bomberos.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` })), [bomberos]);
  const bomberoPorId = useMemo(() => new Map(bomberos.map((b) => [b.id, `${b.nombre} ${b.apellido}`])), [bomberos]);

  async function cargar() {
    try {
      setCajas(await cargarCajas());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarBomberos().then(setBomberos).catch(() => undefined);
    cargar();
  }, []);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await crearCaja({ nombre, responsableId: responsableId || undefined, observacion: observacion || undefined });
      setMensaje('Caja creada.');
      setNombre('');
      setResponsableId('');
      setObservacion('');
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function inactivar(caja: Caja) {
    if (!await confirmar({ titulo: 'Desactivar caja', mensaje: `¿Marcar "${caja.nombre}" como inactiva?`, confirmar: 'Desactivar', peligro: true })) return;
    try {
      await actualizarCaja(caja.id, { estado: caja.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA' });
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Cajas ({cajas?.length ?? 0})</h2>
        {puedeAdministrar && (
          <button type="button" className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : '+ Nueva caja'}
          </button>
        )}
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor={`${idCampo}-nombre`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input id={`${idCampo}-nombre`} className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Responsable</label>
              <ComboBuscable ariaLabel="Responsable" opciones={opcionesBombero} value={responsableId} onChange={setResponsableId} ningunaLabel="Sin definir" />
            </div>
          </div>
          <div>
            <label htmlFor={`${idCampo}-observacion-2`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observacion</label>
            <input id={`${idCampo}-observacion-2`} className="input-field" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
          </div>
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Crear caja'}
          </button>
        </form>
      )}

      {cajas && cajas.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay cajas registradas.</p>}
      {cajas && cajas.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Nombre</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Responsable</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Saldo actual</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cajas.map((c) => (
              <Fragment key={c.id}>
                <tr style={{ borderBottom: expandidaId === c.id ? 'none' : '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '6px 4px' }}>{c.nombre}</td>
                  <td style={{ padding: '6px 4px' }}>{c.responsableId ? bomberoPorId.get(c.responsableId) ?? '-' : '-'}</td>
                  <td style={{ padding: '6px 4px', fontWeight: 600, color: c.saldoActual < 0 ? 'var(--danger)' : undefined }}>{formatearGs(c.saldoActual)}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={{ background: c.estado === 'ACTIVA' ? 'var(--ok-fill)' : 'var(--bad-fill)', color: c.estado === 'ACTIVA' ? 'var(--success)' : 'var(--danger)' }}>{c.estado}</span>
                  </td>
                  <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setExpandidaId(expandidaId === c.id ? null : c.id)}>
                      {expandidaId === c.id ? 'Ocultar turnos' : 'Ver turnos'}
                    </button>
                    {puedeAdministrar && (
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12, background: '#475569' }} onClick={() => inactivar(c)}>
                        {c.estado === 'ACTIVA' ? 'Inactivar' : 'Reactivar'}
                      </button>
                    )}
                  </td>
                </tr>
                {expandidaId === c.id && (
                  <tr style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td colSpan={5} style={{ padding: '4px' }}>
                      <PanelTurno caja={c} onCambio={cargar} />
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
