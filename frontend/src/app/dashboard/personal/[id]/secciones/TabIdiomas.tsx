'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { cargarParametros, Parametro } from '@/lib/parametros';
import { Certificacion } from '@/lib/academia';
import { Aviso } from '@/app/components/Aviso';

export function TabIdiomas({ bomberoId, puedeEditar }: { bomberoId: string; puedeEditar: boolean }) {
  const [items, setItems] = useState<Idioma[] | null>(null);
  const [editando, setEditando] = useState<IdiomaEdicion[] | null>(null);
  const [idiomasCatalogo, setIdiomasCatalogo] = useState<Parametro[]>([]);
  const [nivelesCatalogo, setNivelesCatalogo] = useState<Parametro[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const res = await apiFetch(`/personal/bomberos/${bomberoId}/idiomas`);
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomberoId]);

  function iniciarEdicion() {
    Promise.all([cargarParametros('IDIOMA'), cargarParametros('NIVEL_IDIOMA')]).then(([idiomas, niveles]) => {
      setIdiomasCatalogo(idiomas);
      setNivelesCatalogo(niveles);
    });
    setEditando(
      (items ?? []).map((i) => ({
        idiomaId: i.idiomaId,
        nivelIdiomaId: i.nivelIdiomaId ?? '',
        certificacion: i.certificacion ?? '',
      })),
    );
  }

  async function guardar() {
    if (!editando) return;
    const idiomaIds = editando.map((i) => i.idiomaId).filter(Boolean);
    if (new Set(idiomaIds).size !== idiomaIds.length) {
      setError('No se puede asignar el mismo idioma dos veces.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const res = await apiFetch(`/personal/bomberos/${bomberoId}/idiomas`, {
        method: 'PUT',
        body: JSON.stringify({
          idiomas: editando
            .filter((i) => i.idiomaId)
            .map((i) => ({
              idiomaId: i.idiomaId,
              nivelIdiomaId: i.nivelIdiomaId || undefined,
              certificacion: i.certificacion || undefined,
            })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo guardar');
      }
      setEditando(null);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (editando) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {error && <Aviso tipo="error" texto={error} />}
        {editando.map((idi, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Idioma</label>
              <select aria-label="Idioma"
                className="input-field"
                value={idi.idiomaId}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], idiomaId: e.target.value };
                  setEditando(copia);
                }}
              >
                <option value="">Seleccionar...</option>
                {idiomasCatalogo.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Nivel</label>
              <select aria-label="Nivel"
                className="input-field"
                value={idi.nivelIdiomaId}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], nivelIdiomaId: e.target.value };
                  setEditando(copia);
                }}
              >
                <option value="">NINGUNA</option>
                {nivelesCatalogo.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Certificación</label>
              <input aria-label="Certificacion"
                className="input-field"
                value={idi.certificacion}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], certificacion: e.target.value };
                  setEditando(copia);
                }}
              />
            </div>
            <button
              type="button"
              className="btn-primary"
              style={{ background: '#7f1d1d' }}
              onClick={() => setEditando(editando.filter((_, i) => i !== idx))}
            >
              Quitar
            </button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn-primary"
            style={{ background: '#475569' }}
            onClick={() => setEditando([...editando, { idiomaId: '', nivelIdiomaId: '', certificacion: '' }])}
          >
            + Agregar idioma
          </button>
          <button type="button" className="btn-primary" disabled={guardando} onClick={guardar}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={() => setEditando(null)}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {puedeEditar && (
        <button type="button" className="btn-primary" style={{ alignSelf: 'flex-end' }} onClick={iniciarEdicion}>
          Editar idiomas
        </button>
      )}
      {items && items.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin idiomas registrados.</p>}
      {items && items.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Idioma</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Nivel</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Certificación</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{i.idioma}</td>
                <td style={{ padding: '6px 4px' }}>{i.nivel ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>{i.certificacion ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Servicios / Guardias (solo lectura - Operaciones/Servicios sin modulo) */
/* ------------------------------------------------------------------ */



interface Idioma {
  idiomaId: string;
  idioma: string;
  nivelIdiomaId: string | null;
  nivel: string | null;
  certificacion: string | null;
}



interface IdiomaEdicion {
  idiomaId: string;
  nivelIdiomaId: string;
  certificacion: string;
}
