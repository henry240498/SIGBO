'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { cargarBomberos, BomberoResumen } from '@/lib/personal';
import { cargarEquipos, Equipo } from '@/lib/equipos';
import {
  Articulo,
  MantenimientoDeposito,
  UbicacionDeposito,
  cargarArticulos,
  cargarMantenimientosDeposito,
  cargarUbicacionesDeposito,
  crearMantenimientoDeposito,
  finalizarMantenimientoDeposito,
} from '@/lib/deposito';

const RESULTADOS = [
  { value: 'Disponible', label: 'Disponible' },
  { value: 'Danado', label: 'Danado' },
  { value: 'Fuera de servicio', label: 'Fuera de servicio' },
  { value: 'Perdido', label: 'Perdido' },
];

function FilaFinalizar({ mantenimiento, ubicaciones, onFinalizado }: { mantenimiento: MantenimientoDeposito; ubicaciones: UbicacionDeposito[]; onFinalizado: () => void }) {
  const [ubicacionDestinoId, setUbicacionDestinoId] = useState(mantenimiento.ubicacionOrigenId ?? '');
  const [costo, setCosto] = useState(mantenimiento.costo != null ? String(mantenimiento.costo) : '');
  const [resultado, setResultado] = useState('Disponible');
  const [observacion, setObservacion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opcionesUbicacion = useMemo(() => ubicaciones.map((u) => ({ value: u.id, label: u.nombre })), [ubicaciones]);

  async function confirmar() {
    setError(null);
    setGuardando(true);
    try {
      await finalizarMantenimientoDeposito(mantenimiento.id, {
        ubicacionDestinoId: ubicacionDestinoId || undefined,
        costo: costo ? Number(costo) : undefined,
        resultado,
        observacion: observacion || undefined,
      });
      onFinalizado();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ padding: '10px 4px', background: '#0f172a', borderRadius: 6, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr auto', gap: 8, alignItems: 'flex-end' }}>
      {error && <p style={{ color: '#f87171', fontSize: 12, gridColumn: '1 / -1' }}>{error}</p>}
      <div>
        <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Ubicacion destino</label>
        <ComboBuscable opciones={opcionesUbicacion} value={ubicacionDestinoId} onChange={setUbicacionDestinoId} />
      </div>
      <div>
        <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Resultado</label>
        <ComboBuscable opciones={RESULTADOS} value={resultado} onChange={setResultado} ningunaLabel="Disponible" />
      </div>
      <div>
        <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Costo</label>
        <input className="input-field" type="number" min={0} step="0.01" value={costo} onChange={(e) => setCosto(e.target.value)} />
      </div>
      <div>
        <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Observacion</label>
        <input className="input-field" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
      </div>
      <button type="button" className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={confirmar} disabled={guardando}>
        {guardando ? 'Guardando...' : 'Finalizar'}
      </button>
    </div>
  );
}

export default function MantenimientosDepositoPage() {
  const [mantenimientos, setMantenimientos] = useState<MantenimientoDeposito[] | null>(null);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [ubicaciones, setUbicaciones] = useState<UbicacionDeposito[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState('EN_PROCESO');

  const [tipoElemento, setTipoElemento] = useState<'EQUIPO' | 'ARTICULO'>('EQUIPO');
  const [equipoId, setEquipoId] = useState('');
  const [articuloId, setArticuloId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [responsableId, setResponsableId] = useState('');
  const [tallerExterno, setTallerExterno] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [fechaEstimadaSalida, setFechaEstimadaSalida] = useState('');
  const [origenUbicacionId, setOrigenUbicacionId] = useState('');
  const [origenBomberoId, setOrigenBomberoId] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeRegistrar = permisos.includes('deposito:mantenimiento');

  const opcionesArticulo = useMemo(() => articulos.map((a) => ({ value: a.id, label: `${a.codigo} — ${a.nombre}` })), [articulos]);
  const opcionesEquipo = useMemo(() => equipos.map((e) => ({ value: e.id, label: `${e.codigoInterno} — ${e.nombre}` })), [equipos]);
  const opcionesBombero = useMemo(() => bomberos.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` })), [bomberos]);
  const opcionesUbicacion = useMemo(() => ubicaciones.map((u) => ({ value: u.id, label: u.nombre })), [ubicaciones]);
  const articuloPorId = useMemo(() => new Map(articulos.map((a) => [a.id, `${a.codigo} — ${a.nombre}`])), [articulos]);
  const equipoPorId = useMemo(() => new Map(equipos.map((e) => [e.id, `${e.codigoInterno} — ${e.nombre}`])), [equipos]);

  async function cargar() {
    try {
      setMantenimientos(await cargarMantenimientosDeposito({ estado: filtroEstado || undefined }));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarArticulos().then(setArticulos).catch(() => undefined);
    cargarEquipos().then(setEquipos).catch(() => undefined);
    cargarBomberos().then(setBomberos).catch(() => undefined);
    cargarUbicacionesDeposito().then(setUbicaciones);
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado]);

  function limpiarForm() {
    setTipoElemento('EQUIPO');
    setEquipoId('');
    setArticuloId('');
    setCantidad('');
    setMotivo('');
    setResponsableId('');
    setTallerExterno('');
    setFechaIngreso('');
    setFechaEstimadaSalida('');
    setOrigenUbicacionId('');
    setOrigenBomberoId('');
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await crearMantenimientoDeposito({
        tipoElemento,
        equipoId: tipoElemento === 'EQUIPO' ? equipoId : undefined,
        articuloId: tipoElemento === 'ARTICULO' ? articuloId : undefined,
        cantidad: tipoElemento === 'ARTICULO' ? Number(cantidad) : undefined,
        motivo,
        responsableId: responsableId || undefined,
        tallerExterno: tallerExterno || undefined,
        fechaIngreso,
        fechaEstimadaSalida: fechaEstimadaSalida || undefined,
        origenUbicacionId: tipoElemento === 'ARTICULO' ? origenUbicacionId || undefined : undefined,
        origenBomberoId: tipoElemento === 'ARTICULO' ? origenBomberoId || undefined : undefined,
      });
      setMensaje('Ingreso a mantenimiento registrado.');
      limpiarForm();
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
        <h2 style={{ fontSize: 16 }}>Mantenimientos ({mantenimientos?.length ?? 0})</h2>
        {puedeRegistrar && (
          <button type="button"
            className="btn-primary"
            onClick={() => {
              limpiarForm();
              setMostrarForm(!mostrarForm);
            }}
          >
            {mostrarForm ? 'Cancelar' : '+ Ingresar a mantenimiento'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Estado</label>
          <ComboBuscable opciones={[{ value: 'EN_PROCESO', label: 'EN_PROCESO' }, { value: 'FINALIZADO', label: 'FINALIZADO' }]} value={filtroEstado} onChange={setFiltroEstado} maxWidth={180} />
        </div>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de elemento</label>
              <ComboBuscable opciones={[{ value: 'EQUIPO', label: 'Equipo' }, { value: 'ARTICULO', label: 'Articulo' }]} value={tipoElemento} onChange={(v) => setTipoElemento(v as 'EQUIPO' | 'ARTICULO')} ningunaLabel="-- seleccionar --" />
            </div>
            {tipoElemento === 'EQUIPO' ? (
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Equipo</label>
                <ComboBuscable opciones={opcionesEquipo} value={equipoId} onChange={setEquipoId} ningunaLabel="-- seleccionar --" placeholderBusqueda="Buscar equipo..." />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Articulo</label>
                  <ComboBuscable opciones={opcionesArticulo} value={articuloId} onChange={setArticuloId} ningunaLabel="-- seleccionar --" placeholderBusqueda="Buscar articulo..." />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cantidad</label>
                  <input className="input-field" type="number" min={0.01} step="0.01" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required />
                </div>
              </div>
            )}
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de ingreso</label>
              <input className="input-field" type="date" value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} required />
            </div>
          </div>

          {tipoElemento === 'ARTICULO' && (
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Origen del articulo</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <ComboBuscable opciones={opcionesUbicacion} value={origenUbicacionId} onChange={setOrigenUbicacionId} ningunaLabel="Sin ubicacion" />
                <ComboBuscable opciones={opcionesBombero} value={origenBomberoId} onChange={setOrigenBomberoId} ningunaLabel="Sin personal" />
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo</label>
              <input className="input-field" value={motivo} onChange={(e) => setMotivo(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Responsable interno</label>
              <ComboBuscable opciones={opcionesBombero} value={responsableId} onChange={setResponsableId} ningunaLabel="Sin definir" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Taller externo</label>
              <input className="input-field" value={tallerExterno} onChange={(e) => setTallerExterno(e.target.value)} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha estimada de salida</label>
            <input className="input-field" type="date" style={{ maxWidth: 220 }} value={fechaEstimadaSalida} onChange={(e) => setFechaEstimadaSalida(e.target.value)} />
          </div>

          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Registrar ingreso'}
          </button>
        </form>
      )}

      {mantenimientos && mantenimientos.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No hay mantenimientos registrados.</p>}
      {mantenimientos && mantenimientos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Ingreso</th>
              <th style={{ padding: '6px 4px' }}>Elemento</th>
              <th style={{ padding: '6px 4px' }}>Motivo</th>
              <th style={{ padding: '6px 4px' }}>Taller / Responsable</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mantenimientos.map((m) => (
              <Fragment key={m.id}>
                <tr style={{ borderBottom: expandidoId === m.id ? 'none' : '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>{m.fechaIngreso}</td>
                  <td style={{ padding: '6px 4px' }}>
                    {m.tipoElemento === 'EQUIPO' ? (m.equipoId ? equipoPorId.get(m.equipoId) ?? m.equipoId : '-') : `${m.articuloId ? articuloPorId.get(m.articuloId) ?? m.articuloId : '-'} (${m.cantidad ?? '-'})`}
                  </td>
                  <td style={{ padding: '6px 4px' }}>{m.motivo}</td>
                  <td style={{ padding: '6px 4px' }}>{m.tallerExterno ?? (m.responsableId ? 'Personal propio' : '-')}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={{ background: m.estado === 'FINALIZADO' ? '#166534' : '#334155' }}>{m.estado}</span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    {puedeRegistrar && m.estado === 'EN_PROCESO' && (
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setExpandidoId(expandidoId === m.id ? null : m.id)}>
                        {expandidoId === m.id ? 'Cerrar' : 'Finalizar'}
                      </button>
                    )}
                  </td>
                </tr>
                {expandidoId === m.id && (
                  <tr style={{ borderBottom: '1px solid #1f2937' }}>
                    <td colSpan={6} style={{ padding: '4px' }}>
                      <FilaFinalizar
                        mantenimiento={m}
                        ubicaciones={ubicaciones}
                        onFinalizado={() => {
                          setExpandidoId(null);
                          setMensaje('Mantenimiento finalizado.');
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
