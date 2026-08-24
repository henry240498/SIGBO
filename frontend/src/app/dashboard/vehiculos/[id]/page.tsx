'use client';

import { useEffect, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { useParams } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';
import {
  ConsumoCombustible,
  ESTADOS_VEHICULO,
  EventoHistorialVehiculo,
  MantenimientoVehiculo,
  TIPOS_MANTENIMIENTO,
  Vehiculo,
  actualizarVehiculo,
  cargarCombustible,
  cargarHistorialVehiculo,
  cargarMantenimientos,
  cargarVehiculo,
  crearCombustible,
  crearMantenimiento,
  darBajaVehiculo,
} from '@/lib/vehiculos';

type Vista = 'datos' | 'mantenimientos' | 'combustible' | 'historial';
const SUBTABS: { id: Vista; label: string }[] = [
  { id: 'datos', label: 'Datos' },
  { id: 'mantenimientos', label: 'Mantenimientos' },
  { id: 'combustible', label: 'Combustible' },
  { id: 'historial', label: 'Historial' },
];

export default function VehiculoDetallePage() {
  const params = useParams<{ id: string }>();
  const [vista, setVista] = useState<Vista>('datos');
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('vehiculos:editar');

  async function cargar() {
    try {
      setVehiculo(await cargarVehiculo(params.id));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (error) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!vehiculo) return <p style={{ color: '#94a3b8' }}>Cargando...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>
          {vehiculo.numeroInterno} — {vehiculo.tipo}
          {[vehiculo.marca, vehiculo.modelo].filter(Boolean).length > 0 && ` (${[vehiculo.marca, vehiculo.modelo].filter(Boolean).join(' ')})`}
        </h2>
        <span
          className="badge"
          style={{ background: vehiculo.estado === 'OPERATIVO' ? '#166534' : vehiculo.estado === 'BAJA' ? '#7f1d1d' : '#854d0e' }}
        >
          {vehiculo.estado}
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

      {vista === 'datos' && <TabDatos vehiculo={vehiculo} puedeEditar={puedeEditar} onCambio={cargar} />}
      {vista === 'mantenimientos' && <TabMantenimientos vehiculoId={vehiculo.id} puedeEditar={puedeEditar} />}
      {vista === 'combustible' && <TabCombustible vehiculoId={vehiculo.id} puedeEditar={puedeEditar} />}
      {vista === 'historial' && <TabHistorial vehiculoId={vehiculo.id} />}
    </div>
  );
}

function TabDatos({ vehiculo, puedeEditar, onCambio }: { vehiculo: Vehiculo; puedeEditar: boolean; onCambio: () => void }) {
  const confirmar = useConfirmacion();
  const [editando, setEditando] = useState(false);
  const [campos, setCampos] = useState(vehiculo);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [motivoBaja, setMotivoBaja] = useState('');

  useEffect(() => setCampos(vehiculo), [vehiculo]);

  function campo<K extends keyof Vehiculo>(clave: K) {
    return (campos[clave] as string | number | null) ?? '';
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await actualizarVehiculo(vehiculo.id, {
        tipo: campos.tipo,
        marca: campos.marca || undefined,
        modelo: campos.modelo || undefined,
        anio: campos.anio || undefined,
        patente: campos.patente || undefined,
        color: campos.color || undefined,
        numeroChasis: campos.numeroChasis || undefined,
        numeroMotor: campos.numeroMotor || undefined,
        capacidadCarga: campos.capacidadCarga || undefined,
        capacidadPasajeros: campos.capacidadPasajeros || undefined,
        estado: campos.estado,
        ubicacionActual: campos.ubicacionActual || undefined,
        itvFecha: campos.itvFecha || undefined,
        itvVencimiento: campos.itvVencimiento || undefined,
        seguroFecha: campos.seguroFecha || undefined,
        seguroVencimiento: campos.seguroVencimiento || undefined,
        seguroEmpresa: campos.seguroEmpresa || undefined,
        seguroPoliza: campos.seguroPoliza || undefined,
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

  async function baja() {
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: 'Dar de baja este movil?', confirmar: 'Continuar', peligro: true })) return;
    try {
      await darBajaVehiculo(vehiculo.id, motivoBaja || undefined);
      onCambio();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (!editando) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, fontSize: 13 }}>
          <div><b>Marca:</b> {vehiculo.marca ?? '—'}</div>
          <div><b>Modelo:</b> {vehiculo.modelo ?? '—'}</div>
          <div><b>Anio:</b> {vehiculo.anio ?? '—'}</div>
          <div><b>Patente:</b> {vehiculo.patente ?? '—'}</div>
          <div><b>Color:</b> {vehiculo.color ?? '—'}</div>
          <div><b>Chasis:</b> {vehiculo.numeroChasis ?? '—'}</div>
          <div><b>Motor:</b> {vehiculo.numeroMotor ?? '—'}</div>
          <div><b>Capacidad carga:</b> {vehiculo.capacidadCarga ?? '—'}</div>
          <div><b>Capacidad pasajeros:</b> {vehiculo.capacidadPasajeros ?? '—'}</div>
          <div><b>Km actual:</b> {vehiculo.kilometrajeActual.toLocaleString()}</div>
          <div><b>Ubicacion actual:</b> {vehiculo.ubicacionActual ?? '—'}</div>
          <div><b>ITV vencimiento:</b> {vehiculo.itvVencimiento ?? '—'}</div>
          <div><b>Seguro empresa:</b> {vehiculo.seguroEmpresa ?? '—'}</div>
          <div><b>Seguro poliza:</b> {vehiculo.seguroPoliza ?? '—'}</div>
          <div><b>Seguro vencimiento:</b> {vehiculo.seguroVencimiento ?? '—'}</div>
        </div>
        {vehiculo.estado === 'BAJA' && (
          <p style={{ fontSize: 13, color: '#f87171' }}>
            Dado de baja el {vehiculo.fechaBaja} {vehiculo.motivoBaja ? `— ${vehiculo.motivoBaja}` : ''}
          </p>
        )}
        {puedeEditar && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-primary" onClick={() => setEditando(true)}>Editar datos</button>
            {vehiculo.estado !== 'BAJA' && (
              <>
                <input
                  className="input-field"
                  style={{ maxWidth: 240 }}
                  placeholder="Motivo de baja (opcional)"
                  value={motivoBaja}
                  onChange={(e) => setMotivoBaja(e.target.value)}
                />
                <button type="button" style={{ background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px' }} onClick={baja}>
                  Dar de baja
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <form className="card" onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo</label><input className="input-field" value={campo('tipo')} onChange={(e) => setCampos({ ...campos, tipo: e.target.value })} required /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Marca</label><input className="input-field" value={campo('marca')} onChange={(e) => setCampos({ ...campos, marca: e.target.value })} /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Modelo</label><input className="input-field" value={campo('modelo')} onChange={(e) => setCampos({ ...campos, modelo: e.target.value })} /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Anio</label><input className="input-field" type="number" value={campo('anio')} onChange={(e) => setCampos({ ...campos, anio: e.target.value ? Number(e.target.value) : null })} /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Patente</label><input className="input-field" value={campo('patente')} onChange={(e) => setCampos({ ...campos, patente: e.target.value })} /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Color</label><input className="input-field" value={campo('color')} onChange={(e) => setCampos({ ...campos, color: e.target.value })} /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>N. chasis</label><input className="input-field" value={campo('numeroChasis')} onChange={(e) => setCampos({ ...campos, numeroChasis: e.target.value })} /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>N. motor</label><input className="input-field" value={campo('numeroMotor')} onChange={(e) => setCampos({ ...campos, numeroMotor: e.target.value })} /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Capacidad carga</label><input className="input-field" type="number" value={campo('capacidadCarga')} onChange={(e) => setCampos({ ...campos, capacidadCarga: e.target.value ? Number(e.target.value) : null })} /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Capacidad pasajeros</label><input className="input-field" type="number" value={campo('capacidadPasajeros')} onChange={(e) => setCampos({ ...campos, capacidadPasajeros: e.target.value ? Number(e.target.value) : null })} /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
          <select className="input-field" value={campos.estado} onChange={(e) => setCampos({ ...campos, estado: e.target.value as Vehiculo['estado'] })}>
            {ESTADOS_VEHICULO.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Ubicacion actual</label><input className="input-field" value={campo('ubicacionActual')} onChange={(e) => setCampos({ ...campos, ubicacionActual: e.target.value })} /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>ITV vencimiento</label><input className="input-field" type="date" value={campo('itvVencimiento')} onChange={(e) => setCampos({ ...campos, itvVencimiento: e.target.value })} /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Seguro empresa</label><input className="input-field" value={campo('seguroEmpresa')} onChange={(e) => setCampos({ ...campos, seguroEmpresa: e.target.value })} /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Seguro poliza</label><input className="input-field" value={campo('seguroPoliza')} onChange={(e) => setCampos({ ...campos, seguroPoliza: e.target.value })} /></div>
        <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Seguro vencimiento</label><input className="input-field" type="date" value={campo('seguroVencimiento')} onChange={(e) => setCampos({ ...campos, seguroVencimiento: e.target.value })} /></div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn-primary" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</button>
        <button type="button" style={{ background: '#475569', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px' }} onClick={() => setEditando(false)}>Cancelar</button>
      </div>
    </form>
  );
}

function TabMantenimientos({ vehiculoId, puedeEditar }: { vehiculoId: string; puedeEditar: boolean }) {
  const [items, setItems] = useState<MantenimientoVehiculo[] | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipo, setTipo] = useState<MantenimientoVehiculo['tipo']>('PREVENTIVO');
  const [fecha, setFecha] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [costo, setCosto] = useState('');
  const [kilometraje, setKilometraje] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    try { setItems(await cargarMantenimientos(vehiculoId)); } catch (err: any) { setError(err.message); }
  }
  useEffect(() => { cargar(); }, [vehiculoId]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await crearMantenimiento(vehiculoId, {
        tipo,
        fecha,
        descripcion,
        costo: costo ? Number(costo) : undefined,
        kilometraje: kilometraje ? Number(kilometraje) : undefined,
      });
      setFecha(''); setDescripcion(''); setCosto(''); setKilometraje('');
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo</label>
              <select className="input-field" value={tipo} onChange={(e) => setTipo(e.target.value as MantenimientoVehiculo['tipo'])}>
                {TIPOS_MANTENIMIENTO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label><input className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required /></div>
            <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Costo</label><input className="input-field" type="number" value={costo} onChange={(e) => setCosto(e.target.value)} /></div>
            <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Kilometraje</label><input className="input-field" type="number" value={kilometraje} onChange={(e) => setKilometraje(e.target.value)} /></div>
          </div>
          <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripcion</label><input className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required /></div>
          <button type="submit" className="btn-primary" disabled={guardando} style={{ alignSelf: 'flex-start' }}>{guardando ? 'Guardando...' : 'Guardar'}</button>
        </form>
      )}
      {items && items.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin mantenimientos registrados.</p>}
      {items && items.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
            <th style={{ padding: '6px 4px' }}>Fecha</th><th style={{ padding: '6px 4px' }}>Tipo</th><th style={{ padding: '6px 4px' }}>Descripcion</th><th style={{ padding: '6px 4px' }}>Costo</th><th style={{ padding: '6px 4px' }}>Km</th>
          </tr></thead>
          <tbody>{items.map((m) => (
            <tr key={m.id} style={{ borderBottom: '1px solid #1f2937' }}>
              <td style={{ padding: '6px 4px' }}>{m.fecha}</td>
              <td style={{ padding: '6px 4px' }}><span className="badge">{m.tipo}</span></td>
              <td style={{ padding: '6px 4px' }}>{m.descripcion}</td>
              <td style={{ padding: '6px 4px' }}>{m.costo ?? '—'}</td>
              <td style={{ padding: '6px 4px' }}>{m.kilometraje ?? '—'}</td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}

function TabCombustible({ vehiculoId, puedeEditar }: { vehiculoId: string; puedeEditar: boolean }) {
  const [items, setItems] = useState<ConsumoCombustible[] | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [fecha, setFecha] = useState('');
  const [galones, setGalones] = useState('');
  const [kilometrajeActual, setKilometrajeActual] = useState('');
  const [costo, setCosto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    try { setItems(await cargarCombustible(vehiculoId)); } catch (err: any) { setError(err.message); }
  }
  useEffect(() => { cargar(); }, [vehiculoId]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await crearCombustible(vehiculoId, {
        fecha,
        galones: Number(galones),
        kilometrajeActual: Number(kilometrajeActual),
        costo: costo ? Number(costo) : undefined,
      });
      setFecha(''); setGalones(''); setKilometrajeActual(''); setCosto('');
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
          {mostrarForm ? 'Cancelar' : 'Registrar carga de combustible'}
        </button>
      )}
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mostrarForm && (
        <form className="card" onSubmit={crear} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label><input className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required /></div>
            <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Galones</label><input className="input-field" type="number" step="0.01" value={galones} onChange={(e) => setGalones(e.target.value)} required /></div>
            <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Kilometraje actual</label><input className="input-field" type="number" value={kilometrajeActual} onChange={(e) => setKilometrajeActual(e.target.value)} required /></div>
            <div><label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Costo</label><input className="input-field" type="number" value={costo} onChange={(e) => setCosto(e.target.value)} /></div>
          </div>
          <button type="submit" className="btn-primary" disabled={guardando} style={{ alignSelf: 'flex-start' }}>{guardando ? 'Guardando...' : 'Guardar'}</button>
        </form>
      )}
      {items && items.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin cargas de combustible registradas.</p>}
      {items && items.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
            <th style={{ padding: '6px 4px' }}>Fecha</th><th style={{ padding: '6px 4px' }}>Galones</th><th style={{ padding: '6px 4px' }}>Tipo</th><th style={{ padding: '6px 4px' }}>Km</th><th style={{ padding: '6px 4px' }}>Costo</th>
          </tr></thead>
          <tbody>{items.map((c) => (
            <tr key={c.id} style={{ borderBottom: '1px solid #1f2937' }}>
              <td style={{ padding: '6px 4px' }}>{c.fecha}</td>
              <td style={{ padding: '6px 4px' }}>{c.galones}</td>
              <td style={{ padding: '6px 4px' }}>{c.tipoCombustible}</td>
              <td style={{ padding: '6px 4px' }}>{c.kilometrajeActual}</td>
              <td style={{ padding: '6px 4px' }}>{c.costo ?? '—'}</td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}

function TabHistorial({ vehiculoId }: { vehiculoId: string }) {
  const [eventos, setEventos] = useState<EventoHistorialVehiculo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarHistorialVehiculo(vehiculoId).then(setEventos).catch((err) => setError(err.message));
  }, [vehiculoId]);

  if (error) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!eventos) return <p style={{ color: '#94a3b8' }}>Cargando...</p>;
  if (eventos.length === 0) return <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin eventos registrados todavia.</p>;

  const colorTipo: Record<string, string> = { MANTENIMIENTO: '#854d0e', COMBUSTIBLE: '#1d4ed8', SERVICIO: '#166534' };

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
