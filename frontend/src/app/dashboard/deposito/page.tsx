'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { resolverNombres } from '@/lib/parametros';
import { AlertasDeposito, IndicadoresDeposito, cargarAlertasDeposito, cargarIndicadoresDeposito } from '@/lib/deposito';

function Tarjeta({ titulo, valor, color }: { titulo: string; valor: number | string; color?: string }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: color ?? '#e2e8f0' }}>{valor}</div>
      <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>{titulo}</div>
    </div>
  );
}

export default function DashboardDepositoPage() {
  const [indicadores, setIndicadores] = useState<IndicadoresDeposito | null>(null);
  const [alertas, setAlertas] = useState<AlertasDeposito | null>(null);
  const [nombresEstado, setNombresEstado] = useState<Map<string, string>>(new Map());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([cargarIndicadoresDeposito(), cargarAlertasDeposito()])
      .then(async ([ind, ale]) => {
        setIndicadores(ind);
        setAlertas(ale);
        setNombresEstado(await resolverNombres(Object.keys(ind.porEstadoElemento)));
      })
      .catch((err) => setError(err.message));
  }, []);

  const disponibles = useMemo(() => {
    if (!indicadores) return 0;
    for (const [id, cantidad] of Object.entries(indicadores.porEstadoElemento)) {
      if ((nombresEstado.get(id) ?? '').toLowerCase() === 'disponible') return cantidad;
    }
    return 0;
  }, [indicadores, nombresEstado]);

  const asignados = useMemo(() => {
    if (!indicadores) return 0;
    for (const [id, cantidad] of Object.entries(indicadores.porEstadoElemento)) {
      if ((nombresEstado.get(id) ?? '').toLowerCase() === 'asignado') return cantidad;
    }
    return 0;
  }, [indicadores, nombresEstado]);

  const prestados = useMemo(() => {
    if (!indicadores) return 0;
    for (const [id, cantidad] of Object.entries(indicadores.porEstadoElemento)) {
      if ((nombresEstado.get(id) ?? '').toLowerCase() === 'prestado') return cantidad;
    }
    return 0;
  }, [indicadores, nombresEstado]);

  const enMantenimiento = useMemo(() => {
    if (!indicadores) return 0;
    for (const [id, cantidad] of Object.entries(indicadores.porEstadoElemento)) {
      if ((nombresEstado.get(id) ?? '').toLowerCase() === 'en mantenimiento') return cantidad;
    }
    return 0;
  }, [indicadores, nombresEstado]);

  if (error) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!indicadores || !alertas) return <p style={{ color: '#94a3b8' }}>Cargando indicadores...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ fontSize: 16 }}>Dashboard de Deposito</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        <Tarjeta titulo="Elementos inventariados" valor={indicadores.elementosInventariados} />
        <Tarjeta titulo="Disponibles" valor={disponibles} color="#4ade80" />
        <Tarjeta titulo="Asignados" valor={asignados} color="#60a5fa" />
        <Tarjeta titulo="Prestados" valor={prestados} color="#60a5fa" />
        <Tarjeta titulo="En mantenimiento" valor={enMantenimiento} />
        <Tarjeta titulo="Vencidos" valor={indicadores.vencidos} color={indicadores.vencidos > 0 ? '#f87171' : undefined} />
        <Tarjeta titulo="Con incidencia" valor={indicadores.conIncidencia} color={indicadores.conIncidencia > 0 ? '#f87171' : undefined} />
        <Tarjeta titulo="Stock bajo" valor={indicadores.stockBajo} color={indicadores.stockBajo > 0 ? '#f87171' : undefined} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>
            ⚠️ Stock bajo ({alertas.totales.stockBajo}) — <Link href="/dashboard/deposito/articulos" style={{ color: '#60a5fa', fontSize: 12 }}>ver articulos</Link>
          </h3>
          {alertas.stockBajo.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin alertas de stock bajo.</p>}
          {alertas.stockBajo.map((a) => (
            <div key={a.id} style={{ fontSize: 13, padding: '4px 0', borderBottom: '1px solid #1f2937' }}>
              {a.codigo} — {a.nombre}: <strong style={{ color: '#f87171' }}>{a.stockActual}</strong> / min {a.stockMinimo}
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>
            📅 Lotes por vencer ({alertas.totales.vencimientos})
          </h3>
          {alertas.vencimientos.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin lotes proximos a vencer.</p>}
          {alertas.vencimientos.map((l) => (
            <div key={l.id} style={{ fontSize: 13, padding: '4px 0', borderBottom: '1px solid #1f2937' }}>
              Lote {l.numeroLote} — vence {l.fechaVencimiento} ({l.cantidad})
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>
            ⏰ Prestamos vencidos ({alertas.totales.prestamosVencidos}) — <Link href="/dashboard/deposito/prestamos" style={{ color: '#60a5fa', fontSize: 12 }}>ver prestamos</Link>
          </h3>
          {alertas.prestamosVencidos.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin prestamos vencidos.</p>}
          {alertas.prestamosVencidos.map((p) => (
            <div key={p.id} style={{ fontSize: 13, padding: '4px 0', borderBottom: '1px solid #1f2937' }}>
              {p.solicitanteExterno ?? 'Personal'} — vencio {p.fechaDevolucionComprometida ? new Date(p.fechaDevolucionComprometida).toLocaleDateString() : '-'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
