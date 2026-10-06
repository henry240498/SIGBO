'use client';

import { useEffect, useId, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import {
  EntradaBitacora,
  Faltante,
  DatosPendientes,
  ItemDotacion,
  MovilTablero,
  cargarDatosPendientes,
  cargarBitacora,
  cargarDotacion,
  cargarFaltantes,
  cargarTablero,
  crearItemDotacion,
  darDeBajaItemDotacion,
  registrarControlDotacion,
} from '@/lib/flota';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import { Adjuntos } from '@/components/Adjuntos';

const BOTON_NEUTRO: React.CSSProperties = {
  background: 'var(--neutral-fill)',
  color: 'var(--ink)',
  border: '1px solid var(--line)',
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 13,
  cursor: 'pointer',
};

export default function DotacionPage() {
  const id = useId();
  const [moviles, setMoviles] = useState<MovilTablero[] | null>(null);
  const [movilId, setMovilId] = useState('');
  const [items, setItems] = useState<ItemDotacion[] | null>(null);
  const [lecturas, setLecturas] = useState<Record<string, string>>({});
  const [faltantes, setFaltantes] = useState<Faltante[]>([]);
  const [pendientes, setPendientes] = useState<DatosPendientes[]>([]);
  const [bitacora, setBitacora] = useState<EntradaBitacora[]>([]);
  const [descripcion, setDescripcion] = useState('');
  const [objetivo, setObjetivo] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const puedeGestionar = !!obtenerSesion()?.usuario.permisos.includes('vehiculos:dotacion');

  async function cargarGeneral() {
    try {
      const [m, f, p] = await Promise.all([cargarTablero(), cargarFaltantes(), cargarDatosPendientes()]);
      setMoviles(m);
      setPendientes(p);
      setFaltantes(f);
      setMovilId((actual) => actual || m[0]?.id || '');
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function cargarMovil(id: string) {
    if (!id) return;
    try {
      const [d, b] = await Promise.all([cargarDotacion(id), cargarBitacora(id)]);
      setItems(d);
      setBitacora(b);
      setLecturas({});
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarGeneral();
  }, []);

  useEffect(() => {
    setItems(null);
    cargarMovil(movilId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movilId]);

  async function ejecutar(accion: () => Promise<unknown>, ok: string) {
    setError(null);
    setMensaje(null);
    try {
      await accion();
      setMensaje(ok);
      await Promise.all([cargarGeneral(), cargarMovil(movilId)]);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    await ejecutar(async () => {
      await crearItemDotacion(movilId, descripcion, Number(objetivo));
      setDescripcion('');
      setObjetivo('1');
    }, 'Item agregado a la dotación');
  }

  async function controlar(e: React.FormEvent) {
    e.preventDefault();
    const completas = Object.entries(lecturas).filter(([, v]) => v.trim() !== '');
    if (completas.length === 0) {
      setError('Cargue la cantidad hallada de al menos un item.');
      return;
    }
    const datos = completas.map(([itemId, v]) => ({ itemId, cantidadActual: Number(v) }));
    if (datos.some((d) => !Number.isInteger(d.cantidadActual) || d.cantidadActual < 0)) {
      setError('Las cantidades deben ser números enteros, 0 o más.');
      return;
    }
    await ejecutar(() => registrarControlDotacion(movilId, datos), 'Control registrado');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 16 }}>Dotación y bitácora de uso</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Lo que cada móvil debe llevar, lo hallado en el último control y el historial de cada salida.
        </p>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <strong style={{ fontSize: 14 }}>Datos de móviles sin completar ({pendientes.length})</strong>
        {pendientes.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Todas las fichas están completas.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
            {pendientes.map((p) => (
              <li key={p.vehiculoId}>
                Móvil {p.numeroInterno}: falta {p.faltantes.join(', ')}
              </li>
            ))}
          </ul>
        )}
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Se completan en Vehículos → ficha del móvil; el pendiente desaparece solo.</span>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <strong style={{ fontSize: 14 }}>Reposición pendiente ({faltantes.length})</strong>
        {faltantes.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Ningún móvil tiene faltantes en su último control.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
            {faltantes.map((f) => (
              <li key={f.itemId} style={{ color: 'var(--danger)' }}>
                Móvil {f.numeroInterno}: faltan {f.faltante} de «{f.descripcion}» (hay {f.actual}, debe haber {f.objetivo})
              </li>
            ))}
          </ul>
        )}
      </div>

      {moviles === null ? (
        <Cargando texto="Cargando móviles…" />
      ) : moviles.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay móviles registrados.</p>
      ) : (
        <>
          <div>
            <label htmlFor={`${id}-movil`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Móvil</label>
            <select id={`${id}-movil`} className="input-field" style={{ width: 'auto' }} value={movilId} onChange={(e) => setMovilId(e.target.value)}>
              {moviles.map((m) => (
                <option key={m.id} value={m.id}>{m.numeroInterno}{m.alias ? ` · ${m.alias}` : ''}</option>
              ))}
            </select>
          </div>

          {movilId && <Adjuntos entidad="VEHICULO" entidadId={movilId} titulo="Fotos y firmas del móvil" />}

          {items === null ? (
            <Cargando texto="Cargando dotación…" />
          ) : (
            <form className="card" onSubmit={controlar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <strong style={{ fontSize: 14 }}>Dotación del móvil ({items.length})</strong>
              {items.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Este móvil todavía no tiene dotación definida.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Item</th>
                      <th scope="col">Debe haber</th>
                      <th scope="col">Último control</th>
                      {puedeGestionar && <th scope="col">Hallado ahora</th>}
                      {puedeGestionar && <th scope="col" />}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i) => (
                      <tr key={i.id}>
                        <td>{i.descripcion}</td>
                        <td>{i.cantidadObjetivo}</td>
                        <td style={{ color: (i.faltante ?? 0) > 0 ? 'var(--danger)' : 'var(--ink)' }}>
                          {i.cantidadActual === null ? 'Sin controlar' : `${i.cantidadActual}${(i.faltante ?? 0) > 0 ? ` (faltan ${i.faltante})` : ''}`}
                          {i.controladoEn && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(i.controladoEn).toLocaleDateString('es-PY')}</div>}
                        </td>
                        {puedeGestionar && (
                          <td>
                            <input
                              aria-label={`Cantidad hallada de ${i.descripcion}`}
                              className="input-field"
                              style={{ width: 90 }}
                              type="number"
                              min={0}
                              value={lecturas[i.id] ?? ''}
                              onChange={(e) => setLecturas((l) => ({ ...l, [i.id]: e.target.value }))}
                            />
                          </td>
                        )}
                        {puedeGestionar && (
                          <td>
                            <button type="button" style={BOTON_NEUTRO} onClick={() => ejecutar(() => darDeBajaItemDotacion(i.id), 'Item dado de baja')}>
                              Quitar
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {puedeGestionar && items.length > 0 && (
                <div><button type="submit" className="btn-primary">Registrar control</button></div>
              )}
            </form>
          )}

          {puedeGestionar && (
            <form className="card" onSubmit={agregar} style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 220px' }}>
                <label htmlFor={`${id}-desc`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Agregar a la dotación</label>
                <input id={`${id}-desc`} className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required minLength={2} maxLength={200} placeholder="Ej.: Hacha, linterna, botiquín" />
              </div>
              <div>
                <label htmlFor={`${id}-obj`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cantidad</label>
                <input id={`${id}-obj`} className="input-field" style={{ width: 90 }} type="number" min={1} value={objetivo} onChange={(e) => setObjetivo(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary">Agregar</button>
            </form>
          )}

          <div className="card" style={{ overflowX: 'auto' }}>
            <strong style={{ fontSize: 14 }}>Bitácora de uso</strong>
            {bitacora.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '6px 0 0' }}>Este móvil todavía no salió a ningún servicio.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th scope="col">Salida</th>
                    <th scope="col">Servicio</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Regreso</th>
                    <th scope="col">Km</th>
                  </tr>
                </thead>
                <tbody>
                  {bitacora.map((b) => (
                    <tr key={b.despachoId}>
                      <td>{new Date(b.horaSalida).toLocaleString('es-PY')}</td>
                      <td>{b.numeroServicio ?? '—'}{b.direccion ? <div style={{ fontSize: 12, color: 'var(--muted)' }}>{b.direccion}</div> : null}</td>
                      <td>{b.estado.replace('_', ' ')}</td>
                      <td>{b.horaRegreso ? new Date(b.horaRegreso).toLocaleString('es-PY') : '—'}</td>
                      <td>{b.kmRecorridos !== null ? `${b.kmRecorridos} km` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
