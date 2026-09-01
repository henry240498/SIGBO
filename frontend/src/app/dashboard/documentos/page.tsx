'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IndicadoresDocumentos, cargarIndicadoresDocumentos } from '@/lib/documentos';
import { Cargando } from '@/app/components/Cargando';

function Tarjeta({ titulo, valor, color }: { titulo: string; valor: number | string; color?: string }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: color ?? 'var(--ink)' }}>{valor}</div>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>{titulo}</div>
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

  if (error) return <p style={{ color: 'var(--danger)' }}>{error}</p>;
  if (!indicadores) return <Cargando texto="Cargando indicadores…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 16 }}>Dashboard de Documentos</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        <Tarjeta titulo="Total de documentos" valor={indicadores.total} />
        <Tarjeta titulo="Vigentes" valor={indicadores.vigentes} color="var(--success)" />
        <Tarjeta titulo="Borradores" valor={indicadores.borradores} />
        <Tarjeta titulo="Proximos a vencer" valor={indicadores.proximosAVencer} color={indicadores.proximosAVencer > 0 ? 'var(--warning)' : undefined} />
        <Tarjeta titulo="Vencidos" valor={indicadores.vencidos} color={indicadores.vencidos > 0 ? 'var(--danger)' : undefined} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>
            📅 Proximos a vencer — <Link href="/dashboard/documentos/vencimientos" style={{ color: 'var(--signal)', fontSize: 12 }}>ver todos</Link>
          </h3>
          {indicadores.proximosAVencerDetalle.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin documentos próximos a vencer.</p>}
          {indicadores.proximosAVencerDetalle.map((d) => (
            <Link key={d.id} href={`/dashboard/documentos/${d.id}`} style={{ display: 'block', fontSize: 13, padding: '4px 0', borderBottom: '1px solid var(--line-soft)', color: 'var(--ink)', textDecoration: 'none' }}>
              {d.numeroDocumental ? `${d.numeroDocumental} — ` : ''}{d.titulo}: <strong style={{ color: 'var(--warning)' }}>vence {d.fechaVencimiento}</strong>
            </Link>
          ))}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>
            🕓 Recientes — <Link href="/dashboard/documentos/listado" style={{ color: 'var(--signal)', fontSize: 12 }}>ver listado</Link>
          </h3>
          {indicadores.recientes.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin documentos cargados todavía.</p>}
          {indicadores.recientes.map((d) => (
            <Link key={d.id} href={`/dashboard/documentos/${d.id}`} style={{ display: 'block', fontSize: 13, padding: '4px 0', borderBottom: '1px solid var(--line-soft)', color: 'var(--ink)', textDecoration: 'none' }}>
              {d.numeroDocumental ? `${d.numeroDocumental} — ` : ''}{d.titulo}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
