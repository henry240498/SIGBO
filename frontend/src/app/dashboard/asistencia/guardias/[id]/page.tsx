'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import {
  BomberoResumen,
  TipoBombero,
  cargarBomberos,
  cargarTiposBombero,
  compararBomberosInstitucional,
  construirTipoPorId,
} from '@/lib/personal';
import {
  asignarBomberoGuardia,
  AsignacionGuardia,
  Guardia,
  listarAsignacionesGuardia,
  quitarAsignacionGuardia,
} from '@/lib/asistencia';

export default function DetalleGuardiaPage() {
  const params = useParams();
  const router = useRouter();
  const guardiaId = params.id as string;

  const [guardia, setGuardia] = useState<Guardia | null>(null);
  const [asignaciones, setAsignaciones] = useState<AsignacionGuardia[] | null>(null);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [tiposBombero, setTiposBombero] = useState<TipoBombero[]>([]);
  const [bomberoSeleccionado, setBomberoSeleccionado] = useState('');
  const [rol, setRol] = useState('');
  const [error, setError] = useState<string | null>(null);

  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('asistencia:guardias_editar');
  const tipoBomberoPorId = useMemo(() => construirTipoPorId(tiposBombero), [tiposBombero]);

  const opcionesBombero = useMemo(() => {
    const yaAsignados = new Set((asignaciones ?? []).map((a) => a.bomberoId));
    const disponibles = bomberos.filter((b) => !yaAsignados.has(b.id));
    const ordenados = [...disponibles].sort((a, b) => compararBomberosInstitucional(a, b, tipoBomberoPorId));
    return ordenados.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` }));
  }, [bomberos, asignaciones, tipoBomberoPorId]);

  async function cargarTodo() {
    try {
      const res = await apiFetch(`/operaciones/guardias/${guardiaId}`);
      if (!res.ok) throw new Error('No se pudo cargar la guardia');
      setGuardia(await res.json());
      setAsignaciones(await listarAsignacionesGuardia(guardiaId));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarTodo();
    cargarBomberos().then(setBomberos).catch(() => undefined);
    cargarTiposBombero().then(setTiposBombero);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardiaId]);

  async function asignar() {
    if (!bomberoSeleccionado) return;
    setError(null);
    try {
      await asignarBomberoGuardia(guardiaId, bomberoSeleccionado, rol || undefined);
      setBomberoSeleccionado('');
      setRol('');
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function quitar(asignacionId: string) {
    if (!window.confirm('Quitar esta asignacion?')) return;
    setError(null);
    try {
      await quitarAsignacionGuardia(guardiaId, asignacionId);
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (error && !guardia) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!guardia) return <p style={{ color: '#94a3b8' }}>Cargando guardia...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 18 }}>
              Guardia {guardia.fecha} — {guardia.turno}
            </h2>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <span className="badge">
                {guardia.horaInicio} - {guardia.horaFin}
              </span>
              <span className="badge">{guardia.tipo}</span>
              <span className="badge">{guardia.estado}</span>
            </div>
          </div>
          <button className="btn-primary" style={{ background: '#475569' }} onClick={() => router.push('/dashboard/asistencia/guardias')}>
            Volver
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {puedeEditar && (
        <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 280 }}>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Bombero</label>
            <ComboBuscable
              opciones={opcionesBombero}
              value={bomberoSeleccionado}
              onChange={setBomberoSeleccionado}
              placeholderBusqueda="Buscar por codigo o nombre..."
            />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Rol (opcional)</label>
            <input className="input-field" value={rol} onChange={(e) => setRol(e.target.value)} placeholder="Jefe de Guardia..." />
          </div>
          <button className="btn-primary" onClick={asignar} disabled={!bomberoSeleccionado}>
            Asignar
          </button>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 10 }}>Personal asignado ({asignaciones?.length ?? 0})</h3>
        {asignaciones && asignaciones.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin personal asignado.</p>}
        {asignaciones && asignaciones.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '6px 4px' }}>Bombero</th>
                <th style={{ padding: '6px 4px' }}>Rol</th>
                <th style={{ padding: '6px 4px' }}>Estado</th>
                {puedeEditar && <th style={{ padding: '6px 4px' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {asignaciones.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>
                    {a.codigoBombero ? `${a.codigoBombero} — ` : ''}
                    {a.nombreCompleto}
                  </td>
                  <td style={{ padding: '6px 4px' }}>{a.rol ?? ''}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge">{a.estado}</span>
                  </td>
                  {puedeEditar && (
                    <td style={{ padding: '6px 4px' }}>
                      <button
                        className="btn-primary"
                        style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }}
                        onClick={() => quitar(a.id)}
                      >
                        Quitar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
