'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { BomberoResumen, cargarBomberos } from '@/lib/personal';
import { Vehiculo, cargarVehiculos } from '@/lib/vehiculos';
import {
  CategoriaEquipo,
  ESTADOS_EQUIPO,
  Equipo,
  EventoHistorialEquipo,
  MantenimientoEquipo,
  TIPOS_MANTENIMIENTO_EQUIPO,
  actualizarEquipo,
  asignarMovil,
  cargarCategorias,
  cargarEquipo,
  cargarHistorialEquipo,
  cargarMantenimientosEquipo,
  crearMantenimientoEquipo,
  devolverEquipo,
  prestarEquipo,
} from '@/lib/equipos';

type Vista = 'datos' | 'prestamo' | 'mantenimientos' | 'historial';
const SUBTABS: { id: Vista; label: string }[] = [
  { id: 'datos', label: 'Datos' },
  { id: 'prestamo', label: 'Prestamo' },
  { id: 'mantenimientos', label: 'Mantenimientos' },
  { id: 'historial', label: 'Historial' },
];

export default function EquipoDetallePage() {
  const params = useParams<{ id: string }>();
  const [vista, setVista] = useState<Vista>('datos');
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [categorias, setCategorias] = useState<CategoriaEquipo[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('equipos:editar');

  async function cargar() {
    try {
      setEquipo(await cargarEquipo(params.id));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    cargarCategorias().then(setCategorias).catch(() => undefined);
    cargarVehiculos().then(setVehiculos).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const categoria = useMemo(() => categorias.find((c) => c.id === equipo?.categoriaId), [categorias, equipo]);

  if (error) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!equipo) return <p style={{ color: '#94a3b8' }}>Cargando...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>
          {equipo.codigoInterno} — {equipo.nombre} {categoria && `(${categoria.nombre})`}
        </h2>
        <span
          className="badge"
          style={{ background: equipo.estado === 'OPERATIVO' ? '#166534' : equipo.estado === 'BAJA' || equipo.estado === 'DANIADO' ? '#7f1d1d' : '#854d0e' }}
        >
          {equipo.estado}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #1f2937' }}>
        {SUBTABS.map((t) => (
          <button type="button"
            key={t.id}
            onClick={() => setVista(t.id)}
            style={{
              padding: '8px 12px',
              fontSize: 13,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: vista === t.id ? '#e2e8f0' : '#94a3b8',
              fontWeight: vista === t.id ? 600 : 400,
              borderBottom: vista === t.id ? '2px solid #2563eb' : '2px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {vista === 'datos' && (
        <TabDatos equipo={equipo} categorias={categorias} vehiculos={vehiculos} puedeEditar={puedeEditar} onCambio={cargar} />
      )}
      {vista === 'prestamo' && <TabPrestamo equipo={equipo} puedeEditar={puedeEditar} onCambio={cargar} />}
      {vista === 'mantenimientos' && <TabMantenimientos equipoId={equipo.id} puedeEditar={puedeEditar} />}
      {vista === 'historial' && <TabHistorial equipoId={equipo.id} />}
    </div>
  );
}

function TabDatos({
  equipo,
  categorias,
  vehiculos,
  puedeEditar,
  onCambio,
}: {
  equipo: Equipo;
  categorias: CategoriaEquipo[];
  vehiculos: Vehiculo[];
  puedeEditar: boolean;
  onCambio: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [campos, setCampos] = useState(equipo);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(equipo.vehiculoAsignadoId ?? '');
  const [asignando, setAsignando] = useState(false);

  useEffect(() => {
    setCampos(equipo);
    setVehiculoSeleccionado(equipo.vehiculoAsignadoId ?? '');
  }, [equipo]);

  function campo<K extends keyof Equipo>(clave: K) {
    return (campos[clave] as string | number | null) ?? '';
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await actualizarEquipo(equipo.id, {
        categoriaId: campos.categoriaId,
        nombre: campos.nombre,
        descripcion: campos.descripcion || undefined,
        marca: campos.marca || undefined,
        modelo: campos.modelo || undefined,
        numeroSerie: campos.numeroSerie || undefined,
        estado: campos.estado,
        ubicacion: campos.ubicacion || undefined,
        fechaCompra: campos.fechaCompra || undefined,
        fechaVencimiento: campos.fechaVencimiento || undefined,
        vidaUtilMeses: campos.vidaUtilMeses || undefined,
      });
      setMensaje('Datos actualizados');
      setEditando(false);
      onCambio();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarMovil(vehiculoId: string) {
    setAsignando(true);
    setError(null);
    try {
      await asignarMovil(equipo.id, vehiculoId || null);
      setVehiculoSeleccionado(vehiculoId);
      onCambio();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAsignando(false);
    }
  }

  const vehiculoActual = vehiculos.find((v) => v.id === equipo.vehiculoAsignadoId);

  if (!editando) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}
        {error && <p style={{ color: '#f87171' }}>{error}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, fontSize: 13 }}>
          <div><b>Marca:</b> {equipo.marca ?? '—'}</div>
          <div><b>Modelo:</b> {equipo.modelo ?? '—'}</div>
          <div><b>N. serie:</b> {equipo.numeroSerie ?? '—'}</div>
          <div><b>Ubicacion (nota):</b> {equipo.ubicacion ?? '—'}</div>
          <div><b>Fecha compra:</b> {equipo.fechaCompra ?? '—'}</div>
          <div><b>Vencimiento:</b> {equipo.fechaVencimiento ?? '—'}</div>
        </div>

        {puedeEditar && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: 12 }}>Movil asignado:</label>
            <select className="input-field" style={{ maxWidth: 260 }} value={vehiculoSeleccionado} onChange={(e) => cambiarMovil(e.target.value)} disabled={asignando}>
              <option value="">-- sin asignar --</option>
              {vehiculos.filter((v) => v.estado !== 'BAJA').map((v) => (
                <option key={v.id} value={v.id}>{v.numeroInterno} — {v.tipo}</option>
              ))}
            </select>
          </div>
        )}
        {!puedeEditar && (
          <div style={{ fontSize: 13 }}><b>Movil asignado:</b> {vehiculoActual ? `${vehiculoActual.numeroInterno} — ${vehiculoActual.tipo}` : 'Sin asignar'}</div>
        )}

        {puedeEditar && (
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => setEditando(true)}>Editar datos</button>
        )}
      </div>
    );
  }

  return (
    <form className="card" onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Categoria</label>
          <select className="input-field" value={campos.categoriaId} onChange={(e) => setCampos({ ...campos, categoriaId: e.target.value })}>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label><input className="input-field" value={campo('nombre')} onChange={(e) => setCampos({ ...campos, nombre: e.target.value })} required /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Marca</label><input className="input-field" value={campo('marca')} onChange={(e) => setCampos({ ...campos, marca: e.target.value })} /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Modelo</label><input className="input-field" value={campo('modelo')} onChange={(e) => setCampos({ ...campos, modelo: e.target.value })} /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>N. serie</label><input className="input-field" value={campo('numeroSerie')} onChange={(e) => setCampos({ ...campos, numeroSerie: e.target.value })} /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
          <select className="input-field" value={campos.estado} onChange={(e) => setCampos({ ...campos, estado: e.target.value as Equipo['estado'] })}>
            {ESTADOS_EQUIPO.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Ubicacion (nota)</label><input className="input-field" value={campo('ubicacion')} onChange={(e) => setCampos({ ...campos, ubicacion: e.target.value })} /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha compra</label><input className="input-field" type="date" value={campo('fechaCompra')} onChange={(e) => setCampos({ ...campos, fechaCompra: e.target.value })} /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Vencimiento</label><input className="input-field" type="date" value={campo('fechaVencimiento')} onChange={(e) => setCampos({ ...campos, fechaVencimiento: e.target.value })} /></div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn-primary" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</button>
        <button type="button" style={{ background: '#475569', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px' }} onClick={() => setEditando(false)}>Cancelar</button>
      </div>
    </form>
  );
}

function TabPrestamo({ equipo, puedeEditar, onCambio }: { equipo: Equipo; puedeEditar: boolean; onCambio: () => void }) {
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [historial, setHistorial] = useState<EventoHistorialEquipo[] | null>(null);
  const [bomberoId, setBomberoId] = useState('');
  const [fechaCompromiso, setFechaCompromiso] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  const puedePrestar = !!obtenerSesion()?.usuario.permisos.includes('equipos:prestar');

  async function cargar() {
    try {
      setHistorial(await cargarHistorialEquipo(equipo.id));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarBomberos().then(setBomberos).catch(() => undefined);
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipo.id]);

  const opcionesBombero = useMemo(() => bomberos.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` })), [bomberos]);

  const prestamoActivo = historial?.find((ev) => ev.tipo === 'PRESTAMO' && (ev.registro as any).estado === 'PRESTADO');

  async function prestar(e: React.FormEvent) {
    e.preventDefault();
    if (!bomberoId) return;
    setError(null);
    setProcesando(true);
    try {
      await prestarEquipo(bomberoId, {
        equipoId: equipo.id,
        fechaDevolucionComprometida: fechaCompromiso || undefined,
        observaciones: observaciones || undefined,
      });
      setBomberoId('');
      setFechaCompromiso('');
      setObservaciones('');
      await cargar();
      onCambio();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  async function devolver() {
    if (!prestamoActivo) return;
    setError(null);
    setProcesando(true);
    try {
      await devolverEquipo((prestamoActivo.registro as any).id);
      await cargar();
      onCambio();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {prestamoActivo ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 13 }}>
            Actualmente prestado desde {new Date((prestamoActivo.registro as any).fechaPrestamo).toLocaleDateString()}
            {(prestamoActivo.registro as any).fechaDevolucionComprometida && ` — devolucion comprometida ${new Date((prestamoActivo.registro as any).fechaDevolucionComprometida).toLocaleDateString()}`}
          </p>
          {puedePrestar && (
            <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={procesando} onClick={devolver}>
              {procesando ? 'Procesando...' : 'Registrar devolucion'}
            </button>
          )}
        </div>
      ) : (
        puedePrestar && (
          <form className="card" onSubmit={prestar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: 10, alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Bombero</label>
                <ComboBuscable opciones={opcionesBombero} value={bomberoId} onChange={setBomberoId} placeholderBusqueda="Buscar por codigo o nombre..." />
              </div>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Devolucion comprometida</label>
                <input className="input-field" type="date" value={fechaCompromiso} onChange={(e) => setFechaCompromiso(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observaciones</label>
                <input className="input-field" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={!bomberoId || procesando} style={{ alignSelf: 'flex-start' }}>
              {procesando ? 'Guardando...' : 'Prestar equipo'}
            </button>
          </form>
        )
      )}

      {!puedePrestar && !prestamoActivo && <p style={{ color: '#94a3b8', fontSize: 13 }}>Este equipo no esta prestado actualmente.</p>}
    </div>
  );
}

function TabMantenimientos({ equipoId, puedeEditar }: { equipoId: string; puedeEditar: boolean }) {
  const [items, setItems] = useState<MantenimientoEquipo[] | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipo, setTipo] = useState<MantenimientoEquipo['tipo']>('PREVENTIVO');
  const [fecha, setFecha] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [costo, setCosto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    try { setItems(await cargarMantenimientosEquipo(equipoId)); } catch (err: any) { setError(err.message); }
  }
  useEffect(() => { cargar(); }, [equipoId]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await crearMantenimientoEquipo(equipoId, { tipo, fecha, descripcion, costo: costo ? Number(costo) : undefined });
      setFecha(''); setDescripcion(''); setCosto('');
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {puedeEditar && (
        <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : 'Registrar mantenimiento'}
        </button>
      )}
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mostrarForm && (
        <form className="card" onSubmit={crear} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo</label>
              <select className="input-field" value={tipo} onChange={(e) => setTipo(e.target.value as MantenimientoEquipo['tipo'])}>
                {TIPOS_MANTENIMIENTO_EQUIPO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label><input className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required /></div>
            <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Costo</label><input className="input-field" type="number" value={costo} onChange={(e) => setCosto(e.target.value)} /></div>
          </div>
          <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripcion</label><input className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required /></div>
          <button type="submit" className="btn-primary" disabled={guardando} style={{ alignSelf: 'flex-start' }}>{guardando ? 'Guardando...' : 'Guardar'}</button>
        </form>
      )}
      {items && items.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin mantenimientos registrados.</p>}
      {items && items.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
            <th style={{ padding: '6px 4px' }}>Fecha</th><th style={{ padding: '6px 4px' }}>Tipo</th><th style={{ padding: '6px 4px' }}>Descripcion</th><th style={{ padding: '6px 4px' }}>Costo</th>
          </tr></thead>
          <tbody>{items.map((m) => (
            <tr key={m.id} style={{ borderBottom: '1px solid #1f2937' }}>
              <td style={{ padding: '6px 4px' }}>{m.fecha}</td>
              <td style={{ padding: '6px 4px' }}><span className="badge">{m.tipo}</span></td>
              <td style={{ padding: '6px 4px' }}>{m.descripcion}</td>
              <td style={{ padding: '6px 4px' }}>{m.costo ?? '—'}</td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}

function TabHistorial({ equipoId }: { equipoId: string }) {
  const [eventos, setEventos] = useState<EventoHistorialEquipo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarHistorialEquipo(equipoId).then(setEventos).catch((err) => setError(err.message));
  }, [equipoId]);

  if (error) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!eventos) return <p style={{ color: '#94a3b8' }}>Cargando...</p>;
  if (eventos.length === 0) return <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin eventos registrados todavia.</p>;

  const colorTipo: Record<string, string> = { MANTENIMIENTO: '#854d0e', PRESTAMO: '#1d4ed8' };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {eventos.map((ev, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline', fontSize: 13, borderBottom: '1px solid #1f2937', paddingBottom: 8 }}>
          <span style={{ color: '#94a3b8', minWidth: 140 }}>{new Date(ev.fecha).toLocaleDateString()}</span>
          <span className="badge" style={{ background: colorTipo[ev.tipo] ?? '#334155' }}>{ev.tipo}</span>
          <span>{ev.detalle}</span>
        </div>
      ))}
    </div>
  );
}
