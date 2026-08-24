'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { BomberoResumen, cargarBomberos } from '@/lib/personal';
import { GrupoGuardia, cargarGruposGuardia, crearGrupoGuardia } from '@/lib/guardias';

export default function GruposGuardiaPage() {
  const [grupos, setGrupos] = useState<GrupoGuardia[] | null>(null);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [nombre, setNombre] = useState('');
  const [oficialACargoId, setOficialACargoId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [cicloRotacionDias, setCicloRotacionDias] = useState('');
  const [cantidadChoferes, setCantidadChoferes] = useState('');

  const puedeCrear = !!obtenerSesion()?.usuario.permisos.includes('guardias:crear');
  const opcionesBombero = bomberos.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` }));

  async function cargar() {
    try {
      setGrupos(await cargarGruposGuardia());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    cargarBomberos().then(setBomberos).catch(() => undefined);
  }, []);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await crearGrupoGuardia({
        nombre,
        oficialACargoId: oficialACargoId || undefined,
        observaciones: observaciones || undefined,
        cicloRotacionDias: cicloRotacionDias ? parseInt(cicloRotacionDias, 10) : undefined,
        cantidadChoferes: cantidadChoferes ? parseInt(cantidadChoferes, 10) : undefined,
      });
      setNombre('');
      setOficialACargoId('');
      setObservaciones('');
      setCicloRotacionDias('');
      setCantidadChoferes('');
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Grupos de guardia ({grupos?.length ?? 0})</h2>
        {puedeCrear && (
          <button type="button" className="btn-primary" onClick={() => setMostrarForm((v) => !v)}>
            {mostrarForm ? 'Cancelar' : 'Nuevo grupo'}
          </button>
        )}
      </div>
      <p style={{ fontSize: 13, color: '#94a3b8' }}>
        La composicion de cada grupo queda definida de antemano. Al crear una guardia a partir de un grupo, el
        personal titular se recupera automaticamente sin tener que volver a cargarlo.
      </p>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {mostrarForm && (
        <form className="card" onSubmit={crear} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Grupo A" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Oficial a cargo (opcional)</label>
              <ComboBuscable opciones={opcionesBombero} value={oficialACargoId} onChange={setOficialACargoId} placeholderBusqueda="Buscar por codigo o nombre..." />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Ciclo de rotacion (dias)</label>
              <input className="input-field" type="number" min={1} value={cicloRotacionDias} onChange={(e) => setCicloRotacionDias(e.target.value)} placeholder="Sin rotacion automatica" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cant. choferes requeridos</label>
              <input className="input-field" type="number" min={0} value={cantidadChoferes} onChange={(e) => setCantidadChoferes(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observaciones</label>
              <input className="input-field" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>
            El ciclo de rotacion es lo que le permite a la generacion automatica (Guardias → Generar) elegir este
            grupo cuando corresponda. Sin ciclo definido, el grupo nunca se elige automaticamente.
          </p>
          <button type="submit" className="btn-primary" disabled={guardando} style={{ alignSelf: 'flex-start' }}>
            {guardando ? 'Guardando...' : 'Crear grupo'}
          </button>
        </form>
      )}

      {grupos && grupos.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin grupos registrados.</p>}
      {grupos && grupos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Nombre</th>
              <th style={{ padding: '6px 4px' }}>Ciclo de rotacion</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((g) => (
              <tr key={g.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>
                  <Link href={`/dashboard/guardias/grupos/${g.id}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>
                    {g.nombre}
                  </Link>
                </td>
                <td style={{ padding: '6px 4px' }}>{g.cicloRotacionDias ? `cada ${g.cicloRotacionDias} dias` : '— (manual)'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: g.estado === 'ACTIVO' ? '#166534' : '#7f1d1d' }}>{g.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
