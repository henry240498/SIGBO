'use client';

import { useEffect, useState } from 'react';
import { IndicadoresIa, UsoPorHerramientaIa, cargarIndicadoresIa, cargarUsoPorHerramientaIa } from '@/lib/ia';
import { Cargando } from '@/app/components/Cargando';

function formatearFechaHora(iso: string) {
  return new Date(iso).toLocaleString('es-PY');
}

function Tarjeta({ titulo, valor, color }: { titulo: string; valor: number | string; color?: string }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: color ?? 'var(--ink)' }}>{valor}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{titulo}</div>
    </div>
  );
}

export default function DashboardIaPage() {
  const [indicadores, setIndicadores] = useState<IndicadoresIa | null>(null);
  const [uso, setUso] = useState<UsoPorHerramientaIa[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([cargarIndicadoresIa(), cargarUsoPorHerramientaIa()])
      .then(([ind, u]) => {
        setIndicadores(ind);
        setUso(u);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ color: 'var(--danger)' }}>{error}</p>;
  if (!indicadores) return <Cargando texto="Cargando indicadores…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 16 }}>Monitoreo de Inteligencia Artificial</h2>
      <p style={{ fontSize: 12, color: 'var(--muted)' }}>Motor de razonamiento local -- sin proveedor externo, sin tokens ni costo por consulta.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
        <Tarjeta titulo="Consultas hoy" valor={indicadores.consultasHoy} />
        <Tarjeta titulo="Consultas este mes" valor={indicadores.consultasMes} />
        <Tarjeta titulo="Usuarios activos (mes)" valor={indicadores.usuariosActivosMes} />
        <Tarjeta titulo="Errores (mes)" valor={indicadores.errores} color={indicadores.errores > 0 ? 'var(--danger)' : undefined} />
        <Tarjeta titulo="Consultas bloqueadas" valor={indicadores.consultasBloqueadas} color={indicadores.consultasBloqueadas > 0 ? 'var(--warn-fill)' : undefined} />
      </div>

      {indicadores.consultasBloqueadas > 0 && (
        <div className="card" style={{ borderColor: '#b45309', background: 'var(--warn-fill)' }}>
          ⚠ Hubo {indicadores.consultasBloqueadas} intento(s) de usar una herramienta sin permiso suficiente este mes. Revisá la pestaña Auditoría.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>Uso por herramienta</h3>
          {uso && uso.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin actividad registrada todavía.</p>}
          {uso && uso.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                  <th scope="col" style={{ padding: '4px' }}>Herramienta</th>
                  <th scope="col" style={{ padding: '4px' }}>Total</th>
                  <th scope="col" style={{ padding: '4px' }}>Permitidas</th>
                  <th scope="col" style={{ padding: '4px' }}>Denegadas</th>
                </tr>
              </thead>
              <tbody>
                {uso.map((u) => (
                  <tr key={u.herramienta} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td style={{ padding: '4px' }}>{u.herramienta}</td>
                    <td style={{ padding: '4px' }}>{u.total}</td>
                    <td style={{ padding: '4px', color: 'var(--success)' }}>{u.permitidas}</td>
                    <td style={{ padding: '4px', color: u.denegadas > 0 ? 'var(--danger)' : undefined }}>{u.denegadas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>Últimos errores</h3>
          {indicadores.ultimosErrores.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin errores registrados.</p>}
          {indicadores.ultimosErrores.map((e) => (
            <div key={e.id} style={{ fontSize: 12, padding: '5px 0', borderBottom: '1px solid var(--line-soft)', color: 'var(--muted)' }}>
              {formatearFechaHora(e.creadoEn)} — {e.errorDetalle ?? e.contenido}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
