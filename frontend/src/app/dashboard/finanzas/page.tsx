'use client';

import { useEffect, useState } from 'react';
import { resolverNombres } from '@/lib/parametros';
import { IndicadoresFinanzas, cargarIndicadoresFinanzas } from '@/lib/finanzas';

function formatearGs(valor: number): string {
  return `Gs. ${Math.round(valor).toLocaleString('es-PY')}`;
}

function Tarjeta({ titulo, valor, color }: { titulo: string; valor: string; color?: string }) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: color ?? '#e2e8f0' }}>{valor}</div>
      <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>{titulo}</div>
    </div>
  );
}

export default function DashboardFinanzasPage() {
  const [indicadores, setIndicadores] = useState<IndicadoresFinanzas | null>(null);
  const [nombresClasificacion, setNombresClasificacion] = useState<Map<string, string>>(new Map());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarIndicadoresFinanzas()
      .then(async (ind) => {
        setIndicadores(ind);
        const ids = ind.movimientosRecientes.map((m) => m.tipoIngresoId ?? m.categoriaEgresoId).filter((id): id is string => !!id);
        setNombresClasificacion(await resolverNombres(ids));
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!indicadores) return <p style={{ color: '#94a3b8' }}>Cargando indicadores...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card" style={{ textAlign: 'center', padding: '20px 24px' }}>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>SALDO TOTAL</div>
        <div style={{ fontSize: 34, fontWeight: 700 }}>{formatearGs(indicadores.saldoTotal)}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <Tarjeta titulo="Ingresos del mes" valor={formatearGs(indicadores.ingresosMes)} color="#4ade80" />
        <Tarjeta titulo="Egresos del mes" valor={formatearGs(indicadores.egresosMes)} color="#f87171" />
        <Tarjeta titulo="Saldo del mes" valor={formatearGs(indicadores.saldoMes)} color={indicadores.saldoMes >= 0 ? '#4ade80' : '#f87171'} />
        <Tarjeta titulo="Cuentas bancarias" valor={formatearGs(indicadores.saldoCuentasBancarias)} color="#60a5fa" />
        <Tarjeta titulo="Caja" valor={formatearGs(indicadores.saldoCajas)} color="#60a5fa" />
        <Tarjeta titulo="Pendiente de pago" valor={formatearGs(indicadores.pendienteDePago)} color={indicadores.pendienteDePago > 0 ? '#fbbf24' : undefined} />
      </div>

      <div>
        <h2 style={{ fontSize: 15, marginBottom: 10 }}>Socios Protectores y Facturacion</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <Tarjeta titulo="Socios activos" valor={String(indicadores.sociosProtectores.activos)} color="#60a5fa" />
          <Tarjeta titulo="Socios sin aporte este mes" valor={String(indicadores.sociosProtectores.sinAporteEsteMes)} color={indicadores.sociosProtectores.sinAporteEsteMes > 0 ? '#fbbf24' : undefined} />
          <Tarjeta titulo="Aportes del mes" valor={formatearGs(indicadores.sociosProtectores.aportesMes)} color="#4ade80" />
          <Tarjeta titulo="Aportes extraordinarios del mes" valor={formatearGs(indicadores.sociosProtectores.aportesExtraordinariosMes)} color="#4ade80" />
          <Tarjeta titulo="Facturacion del mes" valor={formatearGs(indicadores.facturacion.totalMes)} />
          <Tarjeta titulo="Notas de credito del mes" valor={formatearGs(indicadores.facturacion.notasCreditoMes)} color="#f87171" />
          <Tarjeta titulo="Ingresos por Academia" valor={formatearGs(indicadores.ingresosPorOrigen.academia)} />
          <Tarjeta titulo="Ingresos por Servicios" valor={formatearGs(indicadores.ingresosPorOrigen.servicios)} />
        </div>
      </div>

      <section className="card">
        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Movimientos recientes</h2>
        {indicadores.movimientosRecientes.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No hay movimientos registrados.</p>}
        {indicadores.movimientosRecientes.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '6px 4px' }}>Fecha</th>
                <th style={{ padding: '6px 4px' }}>Tipo</th>
                <th style={{ padding: '6px 4px' }}>Concepto</th>
                <th style={{ padding: '6px 4px' }}>Importe</th>
                <th style={{ padding: '6px 4px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {indicadores.movimientosRecientes.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>{m.fecha}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={{ background: m.tipo === 'INGRESO' ? '#166534' : '#7f1d1d', color: m.tipo === 'INGRESO' ? '#4ade80' : '#f87171' }}>
                      {m.tipo}
                    </span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    {m.concepto}
                    <span style={{ color: '#64748b' }}> ({nombresClasificacion.get(m.tipoIngresoId ?? m.categoriaEgresoId ?? '') ?? '-'})</span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>{formatearGs(m.importe)}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge">{m.estado}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
