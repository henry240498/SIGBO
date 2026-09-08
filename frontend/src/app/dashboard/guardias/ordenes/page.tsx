'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { obtenerSesion } from '@/lib/api';
import { OrdenGuardia, cargarOrdenesGuardia } from '@/lib/guardias';
import { Aviso } from '@/app/components/Aviso';

const NOMBRES_MES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const COLOR_ESTADO: Record<string, string> = {
  BORRADOR: 'var(--neutral-fill)',
  REVISADA: 'var(--info-fill)',
  APROBADA: 'var(--warn-fill)',
  PUBLICADA: 'var(--ok-fill)',
  ANULADA: 'var(--bad-fill)',
};

export default function OrdenesGuardiaPage() {
  const [ordenes, setOrdenes] = useState<OrdenGuardia[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState('');

  const puedeCrear = !!obtenerSesion()?.usuario.permisos.includes('guardias:ordenes_crear');
  const puedeConfigurar = !!obtenerSesion()?.usuario.permisos.includes('guardias:ordenes_configurar');

  async function cargar() {
    try {
      setOrdenes(await cargarOrdenesGuardia(undefined, undefined, estadoFiltro || undefined));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoFiltro]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontSize: 16 }}>Órdenes de Guardia ({ordenes?.length ?? 0})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {puedeConfigurar && (
            <Link href="/dashboard/guardias/ordenes/configuracion" className="btn-primary" style={{ background: '#475569', textDecoration: 'none' }}>
              Configuracion
            </Link>
          )}
          {puedeCrear && (
            <Link href="/dashboard/guardias/ordenes/nueva" className="btn-primary" style={{ textDecoration: 'none' }}>
              Nueva orden
            </Link>
          )}
        </div>
      </div>

      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
        Documento oficial generado a partir de la planificacion ya aprobada. La planificacion puede cambiar mientras
        esta en borrador; una vez publicada, la Orden representa la planificacion oficial de ese momento y queda
        congelada.
      </p>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <select className="input-field" style={{ maxWidth: 200 }} value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="BORRADOR">Borrador</option>
          <option value="REVISADA">Revisada</option>
          <option value="APROBADA">Aprobada</option>
          <option value="PUBLICADA">Publicada</option>
          <option value="ANULADA">Anulada</option>
        </select>
      </div>

      {error && <Aviso tipo="error" texto={error} />}

      {ordenes && ordenes.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin ordenes registradas.</p>}
      {ordenes && ordenes.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Número</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Período</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Fecha de emisión</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((o) => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--line-soft)', cursor: 'pointer' }}>
                <td style={{ padding: '6px 4px' }}>
                  <Link href={`/dashboard/guardias/ordenes/${o.id}`} style={{ color: 'var(--signal)', textDecoration: 'none' }}>
                    N° {o.numero}/{o.anio}
                  </Link>
                </td>
                <td style={{ padding: '6px 4px' }}>{NOMBRES_MES[o.mes]} {o.anio}</td>
                <td style={{ padding: '6px 4px' }}>{o.fechaEmision}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: COLOR_ESTADO[o.estado] }}>{o.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
