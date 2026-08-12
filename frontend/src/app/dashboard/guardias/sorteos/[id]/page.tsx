'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import {
  DetalleSorteo,
  EsquemaHorarioGuardia,
  cargarDetalleSorteo,
  cargarEsquemasHorario,
  crearGuardiaDesdeSorteo,
} from '@/lib/guardias';

export default function DetalleSorteoPage() {
  const params = useParams();
  const router = useRouter();
  const sorteoId = params.id as string;

  const [detalle, setDetalle] = useState<DetalleSorteo | null>(null);
  const [esquemas, setEsquemas] = useState<EsquemaHorarioGuardia[]>([]);
  const [esquemaHorarioId, setEsquemaHorarioId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  const puedeCrear = !!obtenerSesion()?.usuario.permisos.includes('guardias:crear');
  const opcionesEsquema = useMemo(() => esquemas.filter((e) => e.esEspecial).map((e) => ({ value: e.id, label: e.nombre })), [esquemas]);

  async function cargar() {
    try {
      setDetalle(await cargarDetalleSorteo(sorteoId));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    cargarEsquemasHorario(true).then(setEsquemas).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorteoId]);

  async function crearGuardia() {
    setError(null);
    setCreando(true);
    try {
      const resultado = await crearGuardiaDesdeSorteo(sorteoId, esquemaHorarioId || undefined);
      router.push(`/dashboard/guardias/${resultado.guardia.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreando(false);
    }
  }

  if (error && !detalle) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!detalle) return <p style={{ color: '#94a3b8' }}>Cargando sorteo...</p>;

  const { sorteo, participantes } = detalle;
  const seleccionados = participantes.filter((p) => p.seleccionado);
  const noSeleccionados = participantes.filter((p) => !p.seleccionado);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 18 }}>{sorteo.motivo}</h2>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <span className="badge">{sorteo.fecha}</span>
              <span className="badge">{sorteo.cantidadASeleccionar} a seleccionar</span>
              <span className="badge" style={{ background: sorteo.guardiaId ? '#166534' : '#334155' }}>
                {sorteo.guardiaId ? 'Guardia creada' : 'Sin guardia'}
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
              Ejecutado {new Date(sorteo.ejecutadoEn).toLocaleString()}
            </p>
          </div>
          <button className="btn-primary" style={{ background: '#475569' }} onClick={() => router.push('/dashboard/guardias/sorteos')}>
            Volver
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {sorteo.guardiaId ? (
        <div className="card">
          <Link href={`/dashboard/guardias/${sorteo.guardiaId}`} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Ver guardia creada
          </Link>
        </div>
      ) : (
        puedeCrear && (
          <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
            <div style={{ minWidth: 280 }}>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Esquema de horario especial</label>
              <ComboBuscable
                opciones={opcionesEsquema}
                value={esquemaHorarioId || sorteo.esquemaHorarioId || ''}
                onChange={setEsquemaHorarioId}
                placeholderBusqueda="Buscar esquema..."
              />
            </div>
            <button className="btn-primary" onClick={crearGuardia} disabled={creando || (!esquemaHorarioId && !sorteo.esquemaHorarioId)}>
              {creando ? 'Creando...' : 'Crear guardia con los seleccionados'}
            </button>
          </div>
        )
      )}

      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 10 }}>Seleccionados ({seleccionados.length})</h3>
        {seleccionados.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin seleccionados.</p>}
        {seleccionados.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '6px 4px' }}>Orden</th>
                <th style={{ padding: '6px 4px' }}>Bombero</th>
              </tr>
            </thead>
            <tbody>
              {seleccionados.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>{p.orden + 1}</td>
                  <td style={{ padding: '6px 4px' }}>{p.codigoBombero ? `${p.codigoBombero} — ` : ''}{p.nombreCompleto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 10 }}>No seleccionados ({noSeleccionados.length})</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
          Candidatos elegibles que participaron del sorteo pero no resultaron seleccionados.
        </p>
        {noSeleccionados.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>—</p>}
        {noSeleccionados.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {noSeleccionados.map((p) => (
              <span key={p.id} className="badge">{p.codigoBombero ? `${p.codigoBombero} — ` : ''}{p.nombreCompleto}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
