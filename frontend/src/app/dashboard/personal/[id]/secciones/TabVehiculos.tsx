'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { Catalogo } from '../expediente';

export function TabVehiculos({ bomberoId, puedeEditar }: { bomberoId: string; puedeEditar: boolean }) {
  const [items, setItems] = useState<VehiculoAutorizado[] | null>(null);
  const [vehiculos, setVehiculos] = useState<Catalogo[]>([]);
  const [editando, setEditando] = useState<Array<{ vehiculoId: string; categoria: string; fechaAutorizacion: string; vigencia: string; capacitaciones: string }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const res = await apiFetch(`/personal/bomberos/${bomberoId}/vehiculos-autorizados`);
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    cargar();
    apiFetch('/vehiculos/vehiculos?estado=OPERATIVO')
      .then(async (res) => (res.ok ? setVehiculos((await res.json()).map((v: any) => ({ id: v.id, nombre: `${v.numeroInterno} - ${v.tipo}` }))) : undefined))
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomberoId]);

  function iniciarEdicion() {
    setEditando(
      (items ?? []).map((i) => ({
        vehiculoId: i.vehiculoId,
        categoria: i.categoria ?? '',
        fechaAutorizacion: i.fechaAutorizacion ?? '',
        vigencia: i.vigencia ?? '',
        capacitaciones: i.capacitaciones ?? '',
      })),
    );
  }

  async function guardar() {
    if (!editando) return;
    setGuardando(true);
    setError(null);
    try {
      const res = await apiFetch(`/personal/bomberos/${bomberoId}/vehiculos-autorizados`, {
        method: 'PUT',
        body: JSON.stringify({
          vehiculos: editando
            .filter((v) => v.vehiculoId)
            .map((v) => ({
              vehiculoId: v.vehiculoId,
              categoria: v.categoria || undefined,
              fechaAutorizacion: v.fechaAutorizacion || undefined,
              vigencia: v.vigencia || undefined,
              capacitaciones: v.capacitaciones || undefined,
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
        {editando.map((v, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Vehículo</label>
              <select aria-label="Vehículo"
                className="input-field"
                value={v.vehiculoId}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], vehiculoId: e.target.value };
                  setEditando(copia);
                }}
              >
                <option value="">Seleccionar...</option>
                {vehiculos.map((veh) => (
                  <option key={veh.id} value={veh.id}>
                    {veh.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Categoría</label>
              <input aria-label="Categoría"
                className="input-field"
                value={v.categoria}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], categoria: e.target.value };
                  setEditando(copia);
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Fecha autorización</label>
              <input aria-label="Fecha autorizacion"
                className="input-field"
                type="date"
                value={v.fechaAutorizacion}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], fechaAutorizacion: e.target.value };
                  setEditando(copia);
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Vigencia</label>
              <input aria-label="Vigencia"
                className="input-field"
                type="date"
                value={v.vigencia}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], vigencia: e.target.value };
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
            onClick={() => setEditando([...editando, { vehiculoId: '', categoria: '', fechaAutorizacion: '', vigencia: '', capacitaciones: '' }])}
          >
            + Agregar vehiculo
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
          Editar vehiculos autorizados
        </button>
      )}
      {items && items.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin vehículos autorizados.</p>}
      {items && items.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Vehículo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Categoría</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Autorización</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Vigencia</th>
            </tr>
          </thead>
          <tbody>
            {items.map((v) => (
              <tr key={v.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{v.numeroInterno ? `${v.numeroInterno} (${v.patente ?? '-'})` : v.vehiculoId}</td>
                <td style={{ padding: '6px 4px' }}>{v.categoria ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>{v.fechaAutorizacion ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>{v.vigencia ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Salud                                                                 */
/* ------------------------------------------------------------------ */

/* Matriz de compatibilidad de globulos rojos (informativa, no reemplaza
 * protocolos medicos). Filas = receptor, columnas = donante. */


interface VehiculoAutorizado {
  id: string;
  vehiculoId: string;
  numeroInterno: string | null;
  patente: string | null;
  categoria: string | null;
  fechaAutorizacion: string | null;
  vigencia: string | null;
  capacitaciones: string | null;
}
