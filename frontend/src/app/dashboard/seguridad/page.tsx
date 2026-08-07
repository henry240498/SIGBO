'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface DashboardData {
  usuarios: { total: number; activos: number; inactivos: number; bloqueados: number; conectadosAhora: number };
  roles: { total: number };
  permisos: { total: number };
  sesiones: { activas: number };
  ultimosAccesos: { id: string; username: string; email: string; ultimoAcceso: string; ipUltimoAcceso: string | null }[];
  alertas: { id: string; username: string; intentosFallidos: number; bloqueadoHasta: string | null }[];
  auditoriaReciente: {
    id: string;
    usuarioId: string | null;
    accion: string;
    recurso: string;
    fecha: string;
    ip: string | null;
  }[];
}

function Tarjeta({ titulo, valor, color }: { titulo: string; valor: number; color?: string }) {
  return (
    <div className="card">
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{titulo}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color ?? '#e2e8f0' }}>{valor}</div>
    </div>
  );
}

export default function SeguridadDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/seguridad/dashboard')
      .then(async (res) => {
        if (!res.ok) throw new Error('No se pudo cargar el dashboard de seguridad');
        setData(await res.json());
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!data) return <p style={{ color: '#94a3b8' }}>Cargando...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 12,
        }}
      >
        <Tarjeta titulo="Usuarios totales" valor={data.usuarios.total} />
        <Tarjeta titulo="Activos" valor={data.usuarios.activos} color="#4ade80" />
        <Tarjeta titulo="Inactivos" valor={data.usuarios.inactivos} color="#94a3b8" />
        <Tarjeta titulo="Bloqueados" valor={data.usuarios.bloqueados} color="#f87171" />
        <Tarjeta titulo="Conectados ahora" valor={data.usuarios.conectadosAhora} color="#60a5fa" />
        <Tarjeta titulo="Sesiones activas" valor={data.sesiones.activas} />
        <Tarjeta titulo="Roles" valor={data.roles.total} />
        <Tarjeta titulo="Permisos" valor={data.permisos.total} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <section className="card">
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Ultimos accesos</h2>
          {data.ultimosAccesos.length === 0 && (
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Sin accesos registrados.</p>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              {data.ultimosAccesos.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>{u.username}</td>
                  <td style={{ padding: '6px 4px', color: '#94a3b8' }}>{u.ipUltimoAcceso}</td>
                  <td style={{ padding: '6px 4px', color: '#94a3b8', textAlign: 'right' }}>
                    {new Date(u.ultimoAcceso).toLocaleString('es-PY')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 style={{ fontSize: 15, marginBottom: 12 }}>Alertas de seguridad</h2>
          {data.alertas.length === 0 && (
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Sin intentos fallidos recientes.</p>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              {data.alertas.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>{a.username}</td>
                  <td style={{ padding: '6px 4px', color: '#f87171' }}>
                    {a.intentosFallidos} intento(s) fallido(s)
                  </td>
                  <td style={{ padding: '6px 4px', color: '#94a3b8', textAlign: 'right' }}>
                    {a.bloqueadoHasta ? 'Bloqueado' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="card">
        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Auditoria reciente</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Accion</th>
              <th style={{ padding: '6px 4px' }}>Recurso</th>
              <th style={{ padding: '6px 4px' }}>IP</th>
              <th style={{ padding: '6px 4px' }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {data.auditoriaReciente.map((l) => (
              <tr key={l.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge">{l.accion}</span>
                </td>
                <td style={{ padding: '6px 4px' }}>{l.recurso}</td>
                <td style={{ padding: '6px 4px', color: '#94a3b8' }}>{l.ip}</td>
                <td style={{ padding: '6px 4px', color: '#94a3b8' }}>
                  {new Date(l.fecha).toLocaleString('es-PY')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
