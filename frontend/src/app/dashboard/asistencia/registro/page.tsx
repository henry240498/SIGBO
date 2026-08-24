'use client';

import { useEffect, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import {
  BomberoResumen,
  TipoBombero,
  cargarBomberos,
  cargarTiposBombero,
  compararBomberosInstitucional,
  construirTipoPorId,
} from '@/lib/personal';
import { listarMarcacionesDelDia, MarcacionAsistencia, registrarMarcacion } from '@/lib/asistencia';
import ImportarMarcador from './ImportarMarcador';
import ConsultaMarcaciones from './ConsultaMarcaciones';

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

type Vista = 'marcar' | 'importar' | 'consultar';

const SUBTABS: { id: Vista; label: string }[] = [
  { id: 'marcar', label: 'Marcar entrada/salida' },
  { id: 'importar', label: 'Importar Excel del marcador' },
  { id: 'consultar', label: 'Consultar marcaciones' },
];

export default function RegistroAsistenciaPage() {
  const [vista, setVista] = useState<Vista>('marcar');
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [tipos, setTipos] = useState<TipoBombero[]>([]);
  const [marcaciones, setMarcaciones] = useState<MarcacionAsistencia[] | null>(null);
  const [fecha, setFecha] = useState(hoyISO());

  const [bomberoId, setBomberoId] = useState('');
  const [tipoMarcacion, setTipoMarcacion] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const puedeCrear = !!obtenerSesion()?.usuario.permisos.includes('asistencia:asistencia_crear');

  const tipoPorId = useMemo(() => construirTipoPorId(tipos), [tipos]);
  const bomberoPorId = useMemo(() => new Map(bomberos.map((b) => [b.id, b])), [bomberos]);

  const opcionesBombero = useMemo(() => {
    const ordenados = [...bomberos].sort((a, b) => compararBomberosInstitucional(a, b, tipoPorId));
    return ordenados.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` }));
  }, [bomberos, tipoPorId]);

  async function cargarDelDia() {
    try {
      setMarcaciones(await listarMarcacionesDelDia(fecha));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarBomberos().then(setBomberos).catch(() => undefined);
    cargarTiposBombero().then(setTipos);
  }, []);

  useEffect(() => {
    cargarDelDia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    if (!bomberoId) {
      setError('Selecciona un bombero');
      return;
    }
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await registrarMarcacion({
        bomberoId,
        tipoMarcacion,
        motivo: motivo || undefined,
      });
      setMensaje('Marcacion registrada');
      setMotivo('');
      await cargarDelDia();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 16 }}>Registro de presencia (entrada / salida)</h2>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #1f2937' }}>
        {SUBTABS.map((t) => (
          <button type="button"
            key={t.id}
            onClick={() => setVista(t.id)}
            style={{
              padding: '8px 12px',
              fontSize: 13,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: vista === t.id ? '#e2e8f0' : '#94a3b8',
              fontWeight: vista === t.id ? 600 : 400,
              borderBottom: vista === t.id ? '2px solid #2563eb' : '2px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {vista === 'importar' && <ImportarMarcador />}
      {vista === 'consultar' && <ConsultaMarcaciones bomberos={bomberos} tipos={tipos} />}

      {vista === 'marcar' && (
        <>
      <p style={{ fontSize: 13, color: '#94a3b8' }}>
        Marcar entrada/salida no es obligatorio. Que una persona no marque no significa automaticamente que este
        ausente.
      </p>

      {puedeCrear && (
        <form onSubmit={registrar} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {error && <p style={{ color: '#f87171' }}>{error}</p>}
          {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: 10, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Bombero</label>
              <ComboBuscable
                opciones={opcionesBombero}
                value={bomberoId}
                onChange={setBomberoId}
                placeholderBusqueda="Buscar por codigo o nombre..."
              />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo</label>
              <select
                className="input-field"
                value={tipoMarcacion}
                onChange={(e) => setTipoMarcacion(e.target.value as 'ENTRADA' | 'SALIDA')}
              >
                <option value="ENTRADA">ENTRADA</option>
                <option value="SALIDA">SALIDA</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo (opcional)</label>
              <input className="input-field" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <label style={{ fontSize: 13 }}>Fecha:</label>
        <input className="input-field" style={{ maxWidth: 180 }} type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </div>

      {marcaciones && marcaciones.length === 0 && (
        <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin marcaciones registradas ese dia.</p>
      )}
      {marcaciones && marcaciones.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Hora</th>
              <th style={{ padding: '6px 4px' }}>Bombero</th>
              <th style={{ padding: '6px 4px' }}>Tipo</th>
              <th style={{ padding: '6px 4px' }}>Fuente</th>
              <th style={{ padding: '6px 4px' }}>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {marcaciones.map((m) => {
              const b = bomberoPorId.get(m.bomberoId);
              return (
                <tr key={m.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>{new Date(m.timestampMarcacion).toLocaleTimeString()}</td>
                  <td style={{ padding: '6px 4px' }}>{b ? `${b.numeroBombero} — ${b.nombre} ${b.apellido}` : m.bomberoId}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={{ background: m.tipoMarcacion === 'ENTRADA' ? '#166534' : '#7f1d1d' }}>
                      {m.tipoMarcacion}
                    </span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>{m.fuente}</td>
                  <td style={{ padding: '6px 4px' }}>{m.observaciones ?? m.motivo ?? ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
        </>
      )}
    </div>
  );
}
