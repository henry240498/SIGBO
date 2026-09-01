'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { BomberoResumen, cargarBomberos } from '@/lib/personal';
import { GrupoGuardia, cargarGruposGuardia, crearGrupoGuardia } from '@/lib/guardias';
import { Aviso } from '@/app/components/Aviso';

export default function GruposGuardiaPage() {
  const [grupos, setGrupos] = useState<GrupoGuardia[] | null>(null);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [nombre, setNombre] = useState('');
  const [oficialACargoId, setOficialACargoId] = useState('');
  const [choferId, setChoferId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [cicloRotacionDias, setCicloRotacionDias] = useState('');
  const [cantidadChoferes, setCantidadChoferes] = useState('');

  const puedeCrear = !!obtenerSesion()?.usuario.permisos.includes('guardias:crear');
  const opcionesBombero = bomberos.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` }));

  const opcionesChofer = opcionesBombero.filter((bombero) => bombero.value !== oficialACargoId);

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
    if (!oficialACargoId || !choferId) {
      setError('Indicá el responsable a cargo y un chofer habilitado para crear el grupo.');
      return;
    }
    setGuardando(true);
    try {
      await crearGrupoGuardia({
        nombre,
        oficialACargoId,
        choferId,
        observaciones: observaciones || undefined,
        cicloRotacionDias: cicloRotacionDias ? parseInt(cicloRotacionDias, 10) : undefined,
        cantidadChoferes: cantidadChoferes ? parseInt(cantidadChoferes, 10) : undefined,
      });
      setNombre('');
      setOficialACargoId('');
      setChoferId('');
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
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
        Cada grupo se crea con un responsable a cargo y un chofer habilitado. Luego se agrega el resto del
        personal normal; un mismo bombero puede integrar varios grupos.
      </p>

      {error && <Aviso tipo="error" texto={error} />}

      {mostrarForm && (
        <form className="card" onSubmit={crear} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="nombre" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input id="nombre" className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Grupo A" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Responsable a cargo *</label>
              <ComboBuscable ariaLabel="Responsable a cargo *" opciones={opcionesBombero} value={oficialACargoId} onChange={setOficialACargoId} placeholderBusqueda="Buscar por codigo o nombre..." />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Chofer habilitado *</label>
              <ComboBuscable ariaLabel="Chofer habilitado *" opciones={opcionesChofer} value={choferId} onChange={setChoferId} placeholderBusqueda="Buscar por codigo o nombre..." />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 10 }}>
            <div>
              <label htmlFor="ciclo-de-rotacion-dias" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Ciclo de rotación (días)</label>
              <input id="ciclo-de-rotacion-dias" className="input-field" type="number" min={1} value={cicloRotacionDias} onChange={(e) => setCicloRotacionDias(e.target.value)} placeholder="Sin rotacion automatica" />
            </div>
            <div>
              <label htmlFor="cant-choferes-requeridos" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cant. choferes requeridos</label>
              <input id="cant-choferes-requeridos" className="input-field" type="number" min={0} value={cantidadChoferes} onChange={(e) => setCantidadChoferes(e.target.value)} />
            </div>
            <div>
              <label htmlFor="observaciones" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observaciones</label>
              <input id="observaciones" className="input-field" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            El ciclo de rotacion es lo que le permite a la generacion automatica (Guardias → Generar) elegir este
            grupo cuando corresponda. Sin ciclo definido, el grupo nunca se elige automaticamente.
          </p>
          <button type="submit" className="btn-primary" disabled={guardando} style={{ alignSelf: 'flex-start' }}>
            {guardando ? 'Guardando...' : 'Crear grupo'}
          </button>
        </form>
      )}

      {grupos && grupos.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin grupos registrados.</p>}
      {grupos && grupos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Nombre</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Ciclo de rotación</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((g) => (
              <tr key={g.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>
                  <Link href={`/dashboard/guardias/grupos/${g.id}`} style={{ color: 'var(--signal)', textDecoration: 'none' }}>
                    {g.nombre}
                  </Link>
                </td>
                <td style={{ padding: '6px 4px' }}>{g.cicloRotacionDias ? `cada ${g.cicloRotacionDias} dias` : '— (manual)'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: g.estado === 'ACTIVO' ? 'var(--ok-fill)' : 'var(--bad-fill)' }}>{g.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
