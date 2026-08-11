'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { BomberoResumen, cargarBomberos } from '@/lib/personal';
import {
  GrupoGuardia,
  GrupoGuardiaMiembro,
  RolGrupoGuardia,
  agregarMiembroGrupo,
  cargarGrupoGuardia,
  listarMiembrosGrupo,
  quitarMiembroGrupo,
} from '@/lib/guardias';

export default function DetalleGrupoGuardiaPage() {
  const params = useParams();
  const router = useRouter();
  const grupoId = params.id as string;

  const [grupo, setGrupo] = useState<GrupoGuardia | null>(null);
  const [miembros, setMiembros] = useState<GrupoGuardiaMiembro[] | null>(null);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [bomberoId, setBomberoId] = useState('');
  const [rol, setRol] = useState<RolGrupoGuardia>('TITULAR');
  const [error, setError] = useState<string | null>(null);

  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('guardias:editar');

  const opcionesBombero = useMemo(() => {
    const yaAsignados = new Set((miembros ?? []).map((m) => m.bomberoId));
    return bomberos
      .filter((b) => !yaAsignados.has(b.id))
      .map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` }));
  }, [bomberos, miembros]);

  async function cargarTodo() {
    try {
      setGrupo(await cargarGrupoGuardia(grupoId));
      setMiembros(await listarMiembrosGrupo(grupoId));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarTodo();
    cargarBomberos().then(setBomberos).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupoId]);

  async function agregar() {
    if (!bomberoId) return;
    setError(null);
    try {
      await agregarMiembroGrupo(grupoId, { bomberoId, rol });
      setBomberoId('');
      setRol('TITULAR');
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function quitar(miembroId: string) {
    if (!window.confirm('Quitar este miembro del grupo?')) return;
    setError(null);
    try {
      await quitarMiembroGrupo(grupoId, miembroId);
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (error && !grupo) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!grupo) return <p style={{ color: '#94a3b8' }}>Cargando...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 18 }}>{grupo.nombre}</h2>
            <span className="badge" style={{ marginTop: 6, display: 'inline-block' }}>{grupo.estado}</span>
          </div>
          <button className="btn-primary" style={{ background: '#475569' }} onClick={() => router.push('/dashboard/guardias/grupos')}>
            Volver
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {puedeEditar && (
        <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 280 }}>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Bombero</label>
            <ComboBuscable opciones={opcionesBombero} value={bomberoId} onChange={setBomberoId} placeholderBusqueda="Buscar por codigo o nombre..." />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Rol</label>
            <select className="input-field" value={rol} onChange={(e) => setRol(e.target.value as RolGrupoGuardia)}>
              <option value="TITULAR">TITULAR</option>
              <option value="CHOFER">CHOFER</option>
            </select>
          </div>
          <button className="btn-primary" onClick={agregar} disabled={!bomberoId}>Agregar</button>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 10 }}>Miembros ({miembros?.length ?? 0})</h3>
        {miembros && miembros.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin miembros en este grupo.</p>}
        {miembros && miembros.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '6px 4px' }}>Bombero</th>
                <th style={{ padding: '6px 4px' }}>Rol</th>
                {puedeEditar && <th style={{ padding: '6px 4px' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {miembros.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>{m.codigoBombero ? `${m.codigoBombero} — ` : ''}{m.nombreCompleto}</td>
                  <td style={{ padding: '6px 4px' }}><span className="badge">{m.rol}</span></td>
                  {puedeEditar && (
                    <td style={{ padding: '6px 4px' }}>
                      <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }} onClick={() => quitar(m.id)}>
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
