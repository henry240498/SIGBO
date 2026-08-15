'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IndicadoresDocumentos, cargarIndicadoresDocumentos } from '@/lib/documentos';

function Tarjeta({ titulo, valor, color }: { titulo: string; valor: number | string; color?: string }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: color ?? '#e2e8f0' }}>{valor}</div>
      <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>{titulo}</div>
    </div>
  );
}

export default function DashboardDocumentosPage() {
  const [indicadores, setIndicadores] = useState<IndicadoresDocumentos | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarIndicadoresDocumentos()
      .then(setIndicadores)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!indicadores) return <p style={{ color: '#94a3b8' }}>Cargando indicadores...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 16 }}>Dashboard de Documentos</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        <Tarjeta titulo="Total de documentos" valor={indicadores.total} />
        <Tarjeta titulo="Vigentes" valor={indicadores.vigentes} color="#4ade80" />
        <Tarjeta titulo="Borradores" valor={indicadores.borradores} />
        <Tarjeta titulo="Proximos a vencer" valor={indicadores.proximosAVencer} color={indicadores.proximosAVencer > 0 ? '#facc15' : undefined} />
        <Tarjeta titulo="Vencidos" valor={indicadores.vencidos} color={indicadores.vencidos > 0 ? '#f87171' : undefined} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>
            📅 Proximos a vencer — <Link href="/dashboard/documentos/vencimientos" style={{ color: '#60a5fa', fontSize: 12 }}>ver todos</Link>
          </h3>
          {indicadores.proximosAVencerDetalle.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin documentos proximos a vencer.</p>}
          {indicadores.proximosAVencerDetalle.map((d) => (
            <Link key={d.id} href={`/dashboard/documentos/${d.id}`} style={{ display: 'block', fontSize: 13, padding: '4px 0', borderBottom: '1px solid #1f2937', color: '#e2e8f0', textDecoration: 'none' }}>
              {d.numeroDocumental ? `${d.numeroDocumental} — ` : ''}{d.titulo}: <strong style={{ color: '#facc15' }}>vence {d.fechaVencimiento}</strong>
            </Link>
          ))}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>
            🕓 Recientes — <Link href="/dashboard/documentos/listado" style={{ color: '#60a5fa', fontSize: 12 }}>ver listado</Link>
          </h3>
          {indicadores.recientes.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin documentos cargados todavia.</p>}
          {indicadores.recientes.map((d) => (
            <Link key={d.id} href={`/dashboard/documentos/${d.id}`} style={{ display: 'block', fontSize: 13, padding: '4px 0', borderBottom: '1px solid #1f2937', color: '#e2e8f0', textDecoration: 'none' }}>
              {d.numeroDocumental ? `${d.numeroDocumental} — ` : ''}{d.titulo}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
