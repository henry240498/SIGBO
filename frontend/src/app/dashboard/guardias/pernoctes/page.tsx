'use client';

import { useEffect, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { BomberoResumen, cargarBomberos } from '@/lib/personal';
import { Pernocte, crearPernocte, listarPernoctes } from '@/lib/guardias';
import { Aviso } from '@/app/components/Aviso';

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function PernoctesGeneralPage() {
  const [pernoctes, setPernoctes] = useState<Pernocte[] | null>(null);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [fecha, setFecha] = useState(hoyISO());
  const [bomberoId, setBomberoId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('guardias:editar');
  const opcionesBombero = useMemo(() => bomberos.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` })), [bomberos]);

  async function cargar() {
    try {
      setPernoctes(await listarPernoctes(fecha || undefined));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    cargarBomberos().then(setBomberos).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  async function agregar() {
    if (!bomberoId || !fecha) return;
    setError(null);
    try {
      await crearPernocte({ fecha, bomberoId, motivo: motivo || undefined });
      setBomberoId('');
      setMotivo('');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 16 }}>Pernoctes ({pernoctes?.length ?? 0})</h2>
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
        Personal que se queda a dormir en el cuartel, con o sin relacion a una guardia puntual.
      </p>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
        <div>
          <label htmlFor="fecha" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label>
          <input id="fecha" className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        {puedeEditar && (
          <>
            <div style={{ minWidth: 280 }}>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Bombero</label>
              <ComboBuscable ariaLabel="Bombero" opciones={opcionesBombero} value={bomberoId} onChange={setBomberoId} placeholderBusqueda="Buscar por codigo o nombre..." />
            </div>
            <div>
              <label htmlFor="motivo-opcional" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo (opcional)</label>
              <input id="motivo-opcional" className="input-field" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            </div>
            <button type="button" className="btn-primary" onClick={agregar} disabled={!bomberoId}>Registrar pernocte</button>
          </>
        )}
      </div>

      {error && <Aviso tipo="error" texto={error} />}

      {pernoctes && pernoctes.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin pernoctes para esta fecha.</p>}
      {pernoctes && pernoctes.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
            <th scope="col" style={{ padding: '6px 4px' }}>Bombero</th><th scope="col" style={{ padding: '6px 4px' }}>Fecha</th><th scope="col" style={{ padding: '6px 4px' }}>Motivo</th>
          </tr></thead>
          <tbody>{pernoctes.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
              <td style={{ padding: '6px 4px' }}>{p.codigoBombero ? `${p.codigoBombero} — ` : ''}{p.nombreCompleto}</td>
              <td style={{ padding: '6px 4px' }}>{p.fecha}</td>
              <td style={{ padding: '6px 4px' }}>{p.motivo ?? '—'}</td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}
