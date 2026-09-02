'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { Catalogo, cargarCatalogo } from '../expediente';

export function TabEspecialidades({ bomberoId, puedeEditar }: { bomberoId: string; puedeEditar: boolean }) {
  const [items, setItems] = useState<EspecialidadAsignada[] | null>(null);
  const [catalogo, setCatalogo] = useState<Catalogo[]>([]);
  const [editando, setEditando] = useState<EspecialidadAsignada[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const res = await apiFetch(`/personal/bomberos/${bomberoId}/especialidades`);
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    cargar();
    cargarCatalogo('/organizacion/especialidades').then(setCatalogo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomberoId]);

  function iniciarEdicion() {
    setEditando(items ?? []);
  }

  function agregarFila() {
    if (!editando || catalogo.length === 0) return;
    setEditando([...editando, { especialidadId: catalogo[0].id, nombre: catalogo[0].nombre, fechaObtencion: null, nivel: null, institucionCertificadora: null, vigencia: null }]);
  }

  function quitarFila(idx: number) {
    if (!editando) return;
    setEditando(editando.filter((_, i) => i !== idx));
  }

  async function guardar() {
    if (!editando) return;
    setGuardando(true);
    setError(null);
    try {
      const res = await apiFetch(`/personal/bomberos/${bomberoId}/especialidades`, {
        method: 'PUT',
        body: JSON.stringify({
          especialidades: editando.map((e) => ({
            especialidadId: e.especialidadId,
            fechaObtencion: e.fechaObtencion || undefined,
            nivel: e.nivel || undefined,
            institucionCertificadora: e.institucionCertificadora || undefined,
            vigencia: e.vigencia || undefined,
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
        {editando.map((esp, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Especialidad</label>
              <select aria-label="Especialidad"
                className="input-field"
                value={esp.especialidadId}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], especialidadId: e.target.value };
                  setEditando(copia);
                }}
              >
                {catalogo.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Fecha obtencion</label>
              <input aria-label="Fecha obtencion"
                className="input-field"
                type="date"
                value={esp.fechaObtencion ?? ''}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], fechaObtencion: e.target.value };
                  setEditando(copia);
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Nivel</label>
              <input aria-label="Nivel"
                className="input-field"
                value={esp.nivel ?? ''}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], nivel: e.target.value };
                  setEditando(copia);
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Institución</label>
              <input aria-label="Institución"
                className="input-field"
                value={esp.institucionCertificadora ?? ''}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], institucionCertificadora: e.target.value };
                  setEditando(copia);
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Vigencia</label>
              <input aria-label="Vigencia"
                className="input-field"
                type="date"
                value={esp.vigencia ?? ''}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], vigencia: e.target.value };
                  setEditando(copia);
                }}
              />
            </div>
            <button type="button" className="btn-primary" style={{ background: '#7f1d1d' }} onClick={() => quitarFila(idx)}>
              Quitar
            </button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={agregarFila}>
            + Agregar especialidad
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
          Editar especialidades
        </button>
      )}
      {items && items.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin especialidades asignadas.</p>}
      {items && items.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Especialidad</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Nivel</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Institución</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Obtencion</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Vigencia</th>
            </tr>
          </thead>
          <tbody>
            {items.map((esp) => (
              <tr key={esp.especialidadId} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{esp.nombre}</td>
                <td style={{ padding: '6px 4px' }}>{esp.nivel ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>{esp.institucionCertificadora ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>{esp.fechaObtencion ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>{esp.vigencia ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Condicion institucional                                               */
/* ------------------------------------------------------------------ */



interface EspecialidadAsignada {
  especialidadId: string;
  nombre: string;
  fechaObtencion: string | null;
  nivel: string | null;
  institucionCertificadora: string | null;
  vigencia: string | null;
}
