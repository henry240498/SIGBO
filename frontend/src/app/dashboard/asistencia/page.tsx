'use client';

import { useEffect, useState } from 'react';
import { cargarIndicadoresDashboard, IndicadoresDashboard } from '@/lib/asistencia';

function Tarjeta({ titulo, valor, color }: { titulo: string; valor: number | string; color?: string }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: color ?? '#e2e8f0' }}>{valor}</div>
      <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>{titulo}</div>
    </div>
  );
}

export default function DashboardAsistenciaPage() {
  const [indicadores, setIndicadores] = useState<IndicadoresDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarIndicadoresDashboard()
      .then(setIndicadores)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!indicadores) return <p style={{ color: '#94a3b8' }}>Cargando indicadores...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 16, marginBottom: 4 }}>Dashboard de Asistencia</h2>
        <p style={{ fontSize: 12, color: '#94a3b8' }}>
          Calculado al {new Date(indicadores.fechaCalculo).toLocaleString()}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <Tarjeta titulo="En cuartel ahora" valor={indicadores.enCuartel} color="#4ade80" />
        <Tarjeta titulo="Eventos activos" valor={indicadores.eventosActivos} color="#60a5fa" />
        <Tarjeta
          titulo="Ausentes de actividades de hoy ya finalizadas"
          valor={indicadores.ausentesDeActividadesFinalizadasHoy}
          color="#f87171"
        />
      </div>

      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 10 }}>Participantes activos por tipo de evento</h3>
        {Object.keys(indicadores.participantesActivosPorTipoEvento).length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 13 }}>No hay eventos en curso en este momento.</p>
        ) : (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {Object.entries(indicadores.participantesActivosPorTipoEvento).map(([tipo, cantidad]) => (
              <span key={tipo} className="badge">
                {tipo}: {cantidad}
              </span>
            ))}
          </div>
        )}
      </div>

      <p style={{ fontSize: 12, color: '#94a3b8' }}>
        &quot;Ausentes&quot; solo cuenta personal asignado a una actividad de hoy cuyo horario ya finalizo sin
        ninguna participacion registrada. No marcar entrada/salida en general nunca se interpreta como ausencia
        (la marcacion es una fuente de evidencia, no la unica fuente de asistencia).
      </p>
    </div>
  );
}
