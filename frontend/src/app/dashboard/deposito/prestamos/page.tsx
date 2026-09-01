'use client';

import { Fragment, useEffect, useId, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Parametro, resolverNombres } from '@/lib/parametros';
import { cargarBomberos, BomberoResumen } from '@/lib/personal';
import { cargarEquipos, Equipo } from '@/lib/equipos';
import {
  Articulo,
  PrestamoDeposito,
  PrestamoDepositoItem,
  UbicacionDeposito,
  cargarArticulos,
  cargarItemsPrestamoDeposito,
  cargarPrestamosDeposito,
  cargarPrestamosVencidosDeposito,
  cargarTiposPrestamoDeposito,
  cargarUbicacionesDeposito,
  crearPrestamoDeposito,
  devolverPrestamoDeposito,
} from '@/lib/deposito';
import { Cargando } from '@/app/components/Cargando';
import { Aviso } from '@/app/components/Aviso';

interface ItemForm {
  tipoElemento: 'EQUIPO' | 'ARTICULO';
  articuloId: string;
  equipoId: string;
  cantidad: string;
}

function itemVacio(): ItemForm {
  return { tipoElemento: 'EQUIPO', articuloId: '', equipoId: '', cantidad: '' };
}

const ESTADOS_PRESTAMO = [
  { value: 'ACTIVO', label: 'ACTIVO' },
  { value: 'DEVUELTO_PARCIAL', label: 'DEVUELTO_PARCIAL' },
  { value: 'DEVUELTO', label: 'DEVUELTO' },
  { value: 'EXTRAVIADO', label: 'EXTRAVIADO' },
];

function FilaDevolucion({ prestamo, ubicaciones, onDevuelto }: { prestamo: PrestamoDeposito; ubicaciones: UbicacionDeposito[]; onDevuelto: () => void }) {
  const [items, setItems] = useState<PrestamoDepositoItem[] | null>(null);
  const [estados, setEstados] = useState<Record<string, string>>({});
  const [ubicacionesDestino, setUbicacionesDestino] = useState<Record<string, string>>({});
  const [observaciones, setObservaciones] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opcionesUbicacion = useMemo(() => ubicaciones.map((u) => ({ value: u.id, label: u.nombre })), [ubicaciones]);

  useEffect(() => {
    cargarItemsPrestamoDeposito(prestamo.id).then((its) => {
      setItems(its);
      setEstados(Object.fromEntries(its.map((it) => [it.id, 'DEVUELTO'])));
    });
  }, [prestamo.id]);

  async function confirmar() {
    setError(null);
    setGuardando(true);
    try {
      const pendientes = (items ?? []).filter((it) => it.estadoItem === 'PENDIENTE');
      await devolverPrestamoDeposito(prestamo.id, {
        items: pendientes.map((it) => ({
          itemId: it.id,
          estadoItem: estados[it.id] ?? 'DEVUELTO',
          ubicacionDestinoId: estados[it.id] === 'DEVUELTO' ? ubicacionesDestino[it.id] : undefined,
          observacion: observaciones[it.id] || undefined,
        })),
      });
      onDevuelto();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (!items) return <Cargando texto="Cargando items…" />;
  const pendientes = items.filter((it) => it.estadoItem === 'PENDIENTE');

  return (
    <div style={{ padding: '10px 4px', background: 'var(--surface-soft)', borderRadius: 6 }}>
      {error && <Aviso tipo="error" texto={error} fontSize={12} />}
      {items.map((it) => (
        <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, alignItems: 'center', padding: '4px 0', fontSize: 12 }}>
          <span>
            {it.tipoElemento} — {it.tipoElemento === 'ARTICULO' ? `cantidad ${it.cantidad}` : ''} ({it.estadoItem})
          </span>
          {it.estadoItem === 'PENDIENTE' ? (
            <>
              <ComboBuscable
                opciones={[{ value: 'DEVUELTO', label: 'Devuelto' }, { value: 'EXTRAVIADO', label: 'Extraviado' }, { value: 'DANIADO', label: 'Danado' }]}
                value={estados[it.id] ?? 'DEVUELTO'}
                onChange={(v) => setEstados((s) => ({ ...s, [it.id]: v }))}
                ningunaLabel="Devuelto"
              />
              {estados[it.id] === 'DEVUELTO' || !estados[it.id] ? (
                <ComboBuscable
                  opciones={opcionesUbicacion}
                  value={ubicacionesDestino[it.id] ?? ''}
                  onChange={(v) => setUbicacionesDestino((s) => ({ ...s, [it.id]: v }))}
                  ningunaLabel="-- ubicacion destino --"
                />
              ) : (
                <span />
              )}
              <input
                className="input-field"
                placeholder="Observacion"
                value={observaciones[it.id] ?? ''}
                onChange={(e) => setObservaciones((s) => ({ ...s, [it.id]: e.target.value }))}
              />
            </>
          ) : (
            <span style={{ gridColumn: '2 / -1', color: 'var(--muted)' }}>Ya procesado</span>
          )}
        </div>
      ))}
      {pendientes.length > 0 && (
        <button type="button" className="btn-primary" style={{ marginTop: 8, padding: '4px 10px', fontSize: 12 }} onClick={confirmar} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Confirmar devolucion'}
        </button>
      )}
    </div>
  );
}

export default function PrestamosDepositoPage() {
  const idCampo = useId();
  const [prestamos, setPrestamos] = useState<PrestamoDeposito[] | null>(null);
  const [tipos, setTipos] = useState<Parametro[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [ubicaciones, setUbicaciones] = useState<UbicacionDeposito[]>([]);
  const [nombresTipo, setNombresTipo] = useState<Map<string, string>>(new Map());

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  const [filtroEstado, setFiltroEstado] = useState('');
  const [soloVencidos, setSoloVencidos] = useState(false);

  const [tipoPrestamoId, setTipoPrestamoId] = useState('');
  const [solicitanteBomberoId, setSolicitanteBomberoId] = useState('');
  const [solicitanteExterno, setSolicitanteExterno] = useState('');
  const [autorizadoPor, setAutorizadoPor] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [fechaDevolucionComprometida, setFechaDevolucionComprometida] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [items, setItems] = useState<ItemForm[]>([itemVacio()]);

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedePrestar = permisos.includes('deposito:prestar');

  const opcionesTipo = useMemo(() => tipos.map((t) => ({ value: t.id, label: t.nombre })), [tipos]);
  const opcionesArticulo = useMemo(() => articulos.map((a) => ({ value: a.id, label: `${a.codigo} — ${a.nombre}` })), [articulos]);
  const opcionesEquipo = useMemo(() => equipos.map((e) => ({ value: e.id, label: `${e.codigoInterno} — ${e.nombre}` })), [equipos]);
  const opcionesBombero = useMemo(() => bomberos.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` })), [bomberos]);
  const bomberoPorId = useMemo(() => new Map(bomberos.map((b) => [b.id, `${b.nombre} ${b.apellido}`])), [bomberos]);

  async function cargar() {
    try {
      const datos = soloVencidos ? await cargarPrestamosVencidosDeposito() : await cargarPrestamosDeposito({ estado: filtroEstado || undefined });
      setPrestamos(datos);
      setNombresTipo(await resolverNombres(datos.map((p) => p.tipoPrestamoId)));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarTiposPrestamoDeposito().then(setTipos);
    cargarArticulos().then(setArticulos).catch(() => undefined);
    cargarEquipos().then(setEquipos).catch(() => undefined);
    cargarBomberos().then(setBomberos).catch(() => undefined);
    cargarUbicacionesDeposito().then(setUbicaciones);
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado, soloVencidos]);

  function limpiarForm() {
    setTipoPrestamoId('');
    setSolicitanteBomberoId('');
    setSolicitanteExterno('');
    setAutorizadoPor('');
    setFechaEntrega('');
    setFechaDevolucionComprometida('');
    setObservaciones('');
    setItems([itemVacio()]);
  }

  function actualizarItem(idx: number, cambios: Partial<ItemForm>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...cambios } : it)));
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await crearPrestamoDeposito({
        tipoPrestamoId,
        solicitanteBomberoId: solicitanteBomberoId || undefined,
        solicitanteExterno: solicitanteExterno || undefined,
        autorizadoPor: autorizadoPor || undefined,
        fechaEntrega,
        fechaDevolucionComprometida: fechaDevolucionComprometida || undefined,
        observaciones: observaciones || undefined,
        items: items.map((it) => ({
          tipoElemento: it.tipoElemento,
          articuloId: it.tipoElemento === 'ARTICULO' ? it.articuloId : undefined,
          equipoId: it.tipoElemento === 'EQUIPO' ? it.equipoId : undefined,
          cantidad: it.tipoElemento === 'ARTICULO' ? Number(it.cantidad) : undefined,
        })),
      });
      setMensaje('Prestamo registrado.');
      limpiarForm();
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  function estaVencido(p: PrestamoDeposito): boolean {
    return (p.estado === 'ACTIVO' || p.estado === 'DEVUELTO_PARCIAL') && !!p.fechaDevolucionComprometida && new Date(p.fechaDevolucionComprometida) < new Date();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Prestamos ({prestamos?.length ?? 0})</h2>
        {puedePrestar && (
          <button type="button"
            className="btn-primary"
            onClick={() => {
              limpiarForm();
              setMostrarForm(!mostrarForm);
            }}
          >
            {mostrarForm ? 'Cancelar' : '+ Nuevo prestamo'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Estado</label>
          <ComboBuscable ariaLabel="Estado" opciones={ESTADOS_PRESTAMO} value={filtroEstado} onChange={setFiltroEstado} maxWidth={200} disabled={soloVencidos} />
        </div>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 10 }}>
          <input type="checkbox" checked={soloVencidos} onChange={(e) => setSoloVencidos(e.target.checked)} />
          Solo vencidos
        </label>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de préstamo</label>
              <ComboBuscable ariaLabel="Tipo de prestamo" opciones={opcionesTipo} value={tipoPrestamoId} onChange={setTipoPrestamoId} ningunaLabel="-- seleccionar --" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Solicitante (personal)</label>
              <ComboBuscable ariaLabel="Solicitante (personal)" opciones={opcionesBombero} value={solicitanteBomberoId} onChange={setSolicitanteBomberoId} ningunaLabel="No es personal propio" />
            </div>
            <div>
              <label htmlFor={`${idCampo}-entrega`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Entrega</label>
              <input id={`${idCampo}-entrega`} className="input-field" type="datetime-local" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} required />
            </div>
            <div>
              <label htmlFor={`${idCampo}-devolucion-comprometida`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Devolución comprometida</label>
              <input id={`${idCampo}-devolucion-comprometida`} className="input-field" type="datetime-local" value={fechaDevolucionComprometida} onChange={(e) => setFechaDevolucionComprometida(e.target.value)} />
            </div>
          </div>
          {!solicitanteBomberoId && (
            <div>
              <label htmlFor={`${idCampo}-solicitante-externo-otra-institucion-cap`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Solicitante externo (otra institución, capacitación, etc.)</label>
              <input id={`${idCampo}-solicitante-externo-otra-institucion-cap`} className="input-field" value={solicitanteExterno} onChange={(e) => setSolicitanteExterno(e.target.value)} />
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Autorizado por</label>
              <ComboBuscable ariaLabel="Autorizado por" opciones={opcionesBombero} value={autorizadoPor} onChange={setAutorizadoPor} ningunaLabel="Sin definir" />
            </div>
            <div>
              <label htmlFor={`${idCampo}-observaciones`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observaciones</label>
              <input id={`${idCampo}-observaciones`} className="input-field" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            </div>
          </div>

          <div>
            <strong style={{ fontSize: 13 }}>Items prestados</strong>
            {items.map((it, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto', gap: 8, alignItems: 'flex-end', marginTop: 8 }}>
                <ComboBuscable opciones={[{ value: 'EQUIPO', label: 'Equipo' }, { value: 'ARTICULO', label: 'Articulo' }]} value={it.tipoElemento} onChange={(v) => actualizarItem(idx, { tipoElemento: v as 'EQUIPO' | 'ARTICULO' })} />
                {it.tipoElemento === 'ARTICULO' ? (
                  <ComboBuscable opciones={opcionesArticulo} value={it.articuloId} onChange={(v) => actualizarItem(idx, { articuloId: v })} placeholderBusqueda="Buscar articulo..." />
                ) : (
                  <ComboBuscable opciones={opcionesEquipo} value={it.equipoId} onChange={(v) => actualizarItem(idx, { equipoId: v })} placeholderBusqueda="Buscar equipo..." />
                )}
                {it.tipoElemento === 'ARTICULO' ? (
                  <input className="input-field" type="number" min={0.01} step="0.01" placeholder="Cantidad" value={it.cantidad} onChange={(e) => actualizarItem(idx, { cantidad: e.target.value })} required />
                ) : (
                  <span />
                )}
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}
                  >
                    quitar
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn-primary" style={{ padding: '4px 10px', fontSize: 12, marginTop: 10 }} onClick={() => setItems((prev) => [...prev, itemVacio()])}>
              + Agregar item
            </button>
          </div>

          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Registrar prestamo'}
          </button>
        </form>
      )}

      {prestamos && prestamos.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay préstamos registrados.</p>}
      {prestamos && prestamos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Entrega</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Tipo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Solicitante</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Devolución comprometida</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {prestamos.map((p) => (
              <Fragment key={p.id}>
                <tr style={{ borderBottom: expandidoId === p.id ? 'none' : '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '6px 4px' }}>{new Date(p.fechaEntrega).toLocaleString()}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge">{nombresTipo.get(p.tipoPrestamoId) ?? '-'}</span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>{p.solicitanteBomberoId ? bomberoPorId.get(p.solicitanteBomberoId) ?? '-' : p.solicitanteExterno ?? '-'}</td>
                  <td style={{ padding: '6px 4px', color: estaVencido(p) ? 'var(--danger)' : undefined, fontWeight: estaVencido(p) ? 600 : undefined }}>
                    {p.fechaDevolucionComprometida ? new Date(p.fechaDevolucionComprometida).toLocaleString() : '-'}
                    {estaVencido(p) && ' — VENCIDO'}
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={{ background: p.estado === 'DEVUELTO' ? 'var(--ok-fill)' : p.estado === 'EXTRAVIADO' ? 'var(--bad-fill)' : 'var(--neutral-fill)' }}>
                      {p.estado}
                    </span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    {puedePrestar && p.estado !== 'DEVUELTO' && (
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setExpandidoId(expandidoId === p.id ? null : p.id)}>
                        {expandidoId === p.id ? 'Cerrar' : 'Devolver'}
                      </button>
                    )}
                  </td>
                </tr>
                {expandidoId === p.id && (
                  <tr style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td colSpan={6} style={{ padding: '4px' }}>
                      <FilaDevolucion
                        prestamo={p}
                        ubicaciones={ubicaciones}
                        onDevuelto={() => {
                          setExpandidoId(null);
                          setMensaje('Devolucion registrada.');
                          cargar();
                        }}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
