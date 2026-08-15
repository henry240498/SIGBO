'use client';

import { useEffect, useState } from 'react';
import { IndicadoresIa, UsoPorHerramientaIa, cargarIndicadoresIa, cargarUsoPorHerramientaIa } from '@/lib/ia';

function formatearFechaHora(iso: string) {
  return new Date(iso).toLocaleString('es-PY');
}

function Tarjeta({ titulo, valor, color }: { titulo: string; valor: number | string; color?: string }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: color ?? '#e2e8f0' }}>{valor}</div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>{titulo}</div>
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

  if (error) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!indicadores) return <p style={{ color: '#94a3b8' }}>Cargando indicadores...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 16 }}>Monitoreo de Inteligencia Artificial</h2>
      <p style={{ fontSize: 12, color: '#94a3b8' }}>Motor de razonamiento local -- sin proveedor externo, sin tokens ni costo por consulta.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
        <Tarjeta titulo="Consultas hoy" valor={indicadores.consultasHoy} />
        <Tarjeta titulo="Consultas este mes" valor={indicadores.consultasMes} />
        <Tarjeta titulo="Usuarios activos (mes)" valor={indicadores.usuariosActivosMes} />
        <Tarjeta titulo="Errores (mes)" valor={indicadores.errores} color={indicadores.errores > 0 ? '#f87171' : undefined} />
        <Tarjeta titulo="Consultas bloqueadas" valor={indicadores.consultasBloqueadas} color={indicadores.consultasBloqueadas > 0 ? '#451a03' : undefined} />
      </div>

      {indicadores.consultasBloqueadas > 0 && (
        <div className="card" style={{ borderColor: '#b45309', background: '#451a03' }}>
          ⚠ Hubo {indicadores.consultasBloqueadas} intento(s) de usar una herramienta sin permiso suficiente este mes. Revisá la pestaña Auditoría.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>Uso por herramienta</h3>
          {uso && uso.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin actividad registrada todavía.</p>}
          {uso && uso.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '4px' }}>Herramienta</th>
                  <th style={{ padding: '4px' }}>Total</th>
                  <th style={{ padding: '4px' }}>Permitidas</th>
                  <th style={{ padding: '4px' }}>Denegadas</th>
                </tr>
              </thead>
              <tbody>
                {uso.map((u) => (
                  <tr key={u.herramienta} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '4px' }}>{u.herramienta}</td>
                    <td style={{ padding: '4px' }}>{u.total}</td>
                    <td style={{ padding: '4px', color: '#4ade80' }}>{u.permitidas}</td>
                    <td style={{ padding: '4px', color: u.denegadas > 0 ? '#f87171' : undefined }}>{u.denegadas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>Últimos errores</h3>
          {indicadores.ultimosErrores.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin errores registrados.</p>}
          {indicadores.ultimosErrores.map((e) => (
            <div key={e.id} style={{ fontSize: 12, padding: '5px 0', borderBottom: '1px solid #1f2937', color: '#94a3b8' }}>
              {formatearFechaHora(e.creadoEn)} — {e.errorDetalle ?? e.contenido}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
