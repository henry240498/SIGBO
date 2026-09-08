'use client';

import { useEffect, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { apiFetch, obtenerSesion } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { Catalogo, formatearFechaHora } from '../expediente';
import { TabEquipamientoDeposito } from './TabEquipamientoDeposito';

export function TabEquipamiento({ bomberoId, puedeEditar }: { bomberoId: string; puedeEditar: boolean }) {
  const confirmar = useConfirmacion();
  const [items, setItems] = useState<Prestamo[] | null>(null);
  const [equipos, setEquipos] = useState<Catalogo[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [equipoId, setEquipoId] = useState('');
  const [fechaDevolucionComprometida, setFechaDevolucionComprometida] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const puedePrestar = !!obtenerSesion()?.usuario.permisos.includes('equipos:prestar');

  async function cargar() {
    const res = await apiFetch(`/personal/bomberos/${bomberoId}/equipamiento`);
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    cargar();
    apiFetch('/equipos/equipos?estado=OPERATIVO')
      .then(async (res) => (res.ok ? setEquipos(await res.json()) : []))
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomberoId]);

  async function prestar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      const res = await apiFetch(`/personal/bomberos/${bomberoId}/equipamiento`, {
        method: 'POST',
        body: JSON.stringify({
          equipoId,
          fechaDevolucionComprometida: fechaDevolucionComprometida
            ? new Date(fechaDevolucionComprometida).toISOString()
            : undefined,
          observaciones: observaciones || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo registrar el prestamo');
      }
      setMostrarForm(false);
      setEquipoId('');
      setFechaDevolucionComprometida('');
      setObservaciones('');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function devolver(prestamoId: string) {
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: 'Registrar devolucion de este equipo?', confirmar: 'Continuar', peligro: true })) return;
    const res = await apiFetch(`/personal/bomberos/equipamiento/${prestamoId}/devolucion`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo registrar la devolucion');
      return;
    }
    await cargar();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {puedeEditar && puedePrestar && (
        <button type="button" className="btn-primary" style={{ alignSelf: 'flex-end' }} onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : 'Registrar prestamo'}
        </button>
      )}
      {error && <Aviso tipo="error" texto={error} />}
      {mostrarForm && (
        <form className="card" onSubmit={prestar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label htmlFor="equipo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Equipo</label>
            <select id="equipo" className="input-field" value={equipoId} onChange={(e) => setEquipoId(e.target.value)} required>
              <option value="">Seleccionar...</option>
              {equipos.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.codigo ? `${eq.codigo} - ${eq.nombre}` : eq.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="devolucion-comprometida" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Devolución comprometida</label>
            <input id="devolucion-comprometida"
              className="input-field"
              type="datetime-local"
              value={fechaDevolucionComprometida}
              onChange={(e) => setFechaDevolucionComprometida(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="observaciones" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observaciones</label>
            <input id="observaciones" className="input-field" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Registrar prestamo'}
          </button>
        </form>
      )}

      <div className="card">
        {items && items.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin préstamos de equipos registrados.</p>}
        {items && items.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                <th scope="col" style={{ padding: '6px 4px' }}>Equipo</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Préstamo</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Devolución comprometida</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Devolución real</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '6px 4px' }}>{p.equipoCodigoInterno ? `${p.equipoCodigoInterno} - ${p.equipoNombre}` : p.equipoNombre}</td>
                  <td style={{ padding: '6px 4px' }}>{formatearFechaHora(p.fechaPrestamo)}</td>
                  <td style={{ padding: '6px 4px' }}>{formatearFechaHora(p.fechaDevolucionComprometida)}</td>
                  <td style={{ padding: '6px 4px' }}>{formatearFechaHora(p.fechaDevolucion)}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge">{p.estado}</span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    {puedeEditar && puedePrestar && p.estado === 'PRESTADO' && (
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => devolver(p.id)}>
                        Registrar devolucion
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <TabEquipamientoDeposito bomberoId={bomberoId} />
    </div>
  );
}

/** Historico de tenencias del modulo Deposito (seccion 8 del pedido de
 * Deposito) -- convive con el prestamo de Equipos de arriba sin
 * reemplazarlo: lo de arriba es "que tiene en uso ahora" via el sistema
 * viejo de Equipos; esto es de solo lectura y refleja el historico de
 * movimientos/tenencias de Deposito (incluye confiscaciones, donde el
 * elemento pasa a "En deposito" pero conserva quien lo tuvo antes). */


interface Prestamo {
  id: string;
  equipoId: string;
  equipoNombre: string | null;
  equipoCodigoInterno: string | null;
  fechaPrestamo: string;
  fechaDevolucionComprometida: string | null;
  fechaDevolucion: string | null;
  estado: string;
  observaciones: string | null;
}
