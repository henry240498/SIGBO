'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useConfirmacion } from '@/app/components/ConfirmProvider';

interface SesionActiva {
  id: string;
  usuarioId: string;
  username: string | null;
  email: string | null;
  ip: string | null;
  userAgent: string | null;
  fechaInicio: string;
  fechaUltimaActividad: string;
}

export default function SesionesPage() {
  const confirmar = useConfirmacion();
  const [sesiones, setSesiones] = useState<SesionActiva[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargar = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await apiFetch('/seguridad/sesiones', { signal });
      if (!res.ok) throw new Error('No se pudo cargar las sesiones activas');
      setSesiones(await res.json());
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    cargar(controller.signal);
    return () => controller.abort();
  }, [cargar]);

  async function cerrar(id: string) {
    setError(null);
    const res = await apiFetch(`/seguridad/sesiones/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setError('No se pudo cerrar la sesion');
      return;
    }
    await cargar();
  }

  async function cerrarTodasDeUsuario(usuarioId: string, username: string | null) {
    if (!await confirmar({titulo:'Cerrar sesiones del usuario',mensaje:`Se cerrarán todas las sesiones activas de ${username ?? usuarioId}.`,confirmar:'Cerrar todas',peligro:true})) return;
    setError(null);
    const res = await apiFetch(`/seguridad/usuarios/${usuarioId}/cerrar-sesiones`, { method: 'POST' });
    if (!res.ok) {
      setError('No se pudieron cerrar las sesiones');
      return;
    }
    setMensaje(`Sesiones de ${username ?? usuarioId} cerradas`);
    await cargar();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 16 }}>Sesiones activas ({sesiones?.length ?? 0})</h2>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {sesiones && sesiones.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No hay sesiones activas.</p>}

      {sesiones && sesiones.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Usuario</th>
              <th style={{ padding: '6px 4px' }}>IP</th>
              <th style={{ padding: '6px 4px' }}>Navegador</th>
              <th style={{ padding: '6px 4px' }}>Ultima actividad</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sesiones.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{s.username ?? s.usuarioId}</td>
                <td style={{ padding: '6px 4px', color: '#94a3b8' }}>{s.ip}</td>
                <td style={{ padding: '6px 4px', color: '#94a3b8', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.userAgent}
                </td>
                <td style={{ padding: '6px 4px', color: '#94a3b8' }}>
                  {new Date(s.fechaUltimaActividad).toLocaleString('es-PY')}
                </td>
                <td style={{ padding: '6px 4px', display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => cerrar(s.id)}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}
                  >
                    cerrar
                  </button>
                  <button
                    type="button"
                    onClick={() => cerrarTodasDeUsuario(s.usuarioId, s.username)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}
                  >
                    cerrar todas de este usuario
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
