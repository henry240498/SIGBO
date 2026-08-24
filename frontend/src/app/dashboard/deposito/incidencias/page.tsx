'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { cargarEquipos, Equipo } from '@/lib/equipos';
import { cargarVehiculos, Vehiculo } from '@/lib/vehiculos';
import { Articulo, IncidenciaDeposito, cargarArticulos, cargarIncidenciasDeposito, crearIncidenciaDeposito, resolverIncidenciaDeposito } from '@/lib/deposito';

const ORIGENES = [
  { value: 'INSPECCION_VEHICULO', label: 'Inspeccion de vehiculo' },
  { value: 'INVENTARIO_FISICO', label: 'Inventario fisico' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'OTRO', label: 'Otro' },
];
const GRAVEDADES = [{ value: 'BAJA', label: 'BAJA' }, { value: 'MEDIA', label: 'MEDIA' }, { value: 'ALTA', label: 'ALTA' }];
const ESTADOS = [
  { value: 'ABIERTA', label: 'ABIERTA' },
  { value: 'EN_REVISION', label: 'EN_REVISION' },
  { value: 'RESUELTA', label: 'RESUELTA' },
  { value: 'DESCARTADA', label: 'DESCARTADA' },
];

function colorGravedad(g: string) {
  if (g === 'ALTA') return { background: '#7f1d1d', color: '#f87171' };
  if (g === 'MEDIA') return { background: '#451a03', color: '#fbbf24' };
  return { background: '#334155', color: '#e2e8f0' };
}

function FilaResolver({ incidencia, onResuelta }: { incidencia: IncidenciaDeposito; onResuelta: () => void }) {
  const [resolucion, setResolucion] = useState('');
  const [estado, setEstado] = useState('RESUELTA');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmar() {
    setError(null);
    setGuardando(true);
    try {
      await resolverIncidenciaDeposito(incidencia.id, { resolucion, estado });
      onResuelta();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ padding: '10px 4px', background: '#0f172a', borderRadius: 6, display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8, alignItems: 'flex-end' }}>
      {error && <p style={{ color: '#f87171', fontSize: 12, gridColumn: '1 / -1' }}>{error}</p>}
      <ComboBuscable opciones={[{ value: 'RESUELTA', label: 'Resuelta' }, { value: 'DESCARTADA', label: 'Descartada' }]} value={estado} onChange={setEstado} ningunaLabel="Resuelta" />
      <input className="input-field" placeholder="Resolucion" value={resolucion} onChange={(e) => setResolucion(e.target.value)} />
      <button type="button" className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={confirmar} disabled={guardando || !resolucion}>
        {guardando ? 'Guardando...' : 'Confirmar'}
      </button>
    </div>
  );
}

export default function IncidenciasDepositoPage() {
  const [incidencias, setIncidencias] = useState<IncidenciaDeposito[] | null>(null);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [expandidaId, setExpandidaId] = useState<string | null>(null);

  const [filtroEstado, setFiltroEstado] = useState('ABIERTA');

  const [tipoElemento, setTipoElemento] = useState('');
  const [articuloId, setArticuloId] = useState('');
  const [equipoId, setEquipoId] = useState('');
  const [vehiculoId, setVehiculoId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [gravedad, setGravedad] = useState('MEDIA');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCrear = permisos.includes('deposito:crear');
  const puedeResolver = permisos.includes('deposito:editar');

  const opcionesArticulo = useMemo(() => articulos.map((a) => ({ value: a.id, label: `${a.codigo} — ${a.nombre}` })), [articulos]);
  const opcionesEquipo = useMemo(() => equipos.map((e) => ({ value: e.id, label: `${e.codigoInterno} — ${e.nombre}` })), [equipos]);
  const opcionesVehiculo = useMemo(() => vehiculos.map((v) => ({ value: v.id, label: v.numeroInterno })), [vehiculos]);
  const articuloPorId = useMemo(() => new Map(articulos.map((a) => [a.id, `${a.codigo} — ${a.nombre}`])), [articulos]);
  const equipoPorId = useMemo(() => new Map(equipos.map((e) => [e.id, `${e.codigoInterno} — ${e.nombre}`])), [equipos]);
  const vehiculoPorId = useMemo(() => new Map(vehiculos.map((v) => [v.id, v.numeroInterno])), [vehiculos]);

  async function cargar() {
    try {
      setIncidencias(await cargarIncidenciasDeposito({ estado: filtroEstado || undefined }));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarArticulos().then(setArticulos).catch(() => undefined);
    cargarEquipos().then(setEquipos).catch(() => undefined);
    cargarVehiculos().then(setVehiculos).catch(() => undefined);
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado]);

  function limpiarForm() {
    setTipoElemento('');
    setArticuloId('');
    setEquipoId('');
    setVehiculoId('');
    setDescripcion('');
    setGravedad('MEDIA');
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await crearIncidenciaDeposito({
        tipoElemento: tipoElemento || undefined,
        articuloId: tipoElemento === 'ARTICULO' ? articuloId || undefined : undefined,
        equipoId: tipoElemento === 'EQUIPO' ? equipoId || undefined : undefined,
        vehiculoId: vehiculoId || undefined,
        descripcion,
        gravedad,
      });
      setMensaje('Incidencia registrada.');
      limpiarForm();
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  function descripcionElemento(i: IncidenciaDeposito): string {
    if (i.tipoElemento === 'EQUIPO' && i.equipoId) return equipoPorId.get(i.equipoId) ?? i.equipoId;
    if (i.tipoElemento === 'ARTICULO' && i.articuloId) return articuloPorId.get(i.articuloId) ?? i.articuloId;
    if (i.vehiculoId) return `Vehiculo ${vehiculoPorId.get(i.vehiculoId) ?? i.vehiculoId}`;
    return '-';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Incidencias ({incidencias?.length ?? 0})</h2>
        {puedeCrear && (
          <button type="button"
            className="btn-primary"
            onClick={() => {
              limpiarForm();
              setMostrarForm(!mostrarForm);
            }}
          >
            {mostrarForm ? 'Cancelar' : '+ Reportar incidencia'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Estado</label>
          <ComboBuscable opciones={ESTADOS} value={filtroEstado} onChange={setFiltroEstado} maxWidth={200} />
        </div>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de elemento</label>
              <ComboBuscable opciones={[{ value: 'EQUIPO', label: 'Equipo' }, { value: 'ARTICULO', label: 'Articulo' }]} value={tipoElemento} onChange={setTipoElemento} ningunaLabel="No aplica" />
            </div>
            {tipoElemento === 'EQUIPO' && (
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Equipo</label>
                <ComboBuscable opciones={opcionesEquipo} value={equipoId} onChange={setEquipoId} ningunaLabel="-- seleccionar --" placeholderBusqueda="Buscar equipo..." />
              </div>
            )}
            {tipoElemento === 'ARTICULO' && (
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Articulo</label>
                <ComboBuscable opciones={opcionesArticulo} value={articuloId} onChange={setArticuloId} ningunaLabel="-- seleccionar --" placeholderBusqueda="Buscar articulo..." />
              </div>
            )}
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Vehiculo relacionado (opcional)</label>
              <ComboBuscable opciones={opcionesVehiculo} value={vehiculoId} onChange={setVehiculoId} ningunaLabel="No aplica" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripcion</label>
            <input className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Gravedad</label>
            <ComboBuscable opciones={GRAVEDADES} value={gravedad} onChange={setGravedad} ningunaLabel="MEDIA" maxWidth={160} />
          </div>
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Registrar incidencia'}
          </button>
        </form>
      )}

      {incidencias && incidencias.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No hay incidencias registradas.</p>}
      {incidencias && incidencias.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Apertura</th>
              <th style={{ padding: '6px 4px' }}>Origen</th>
              <th style={{ padding: '6px 4px' }}>Elemento</th>
              <th style={{ padding: '6px 4px' }}>Descripcion</th>
              <th style={{ padding: '6px 4px' }}>Gravedad</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {incidencias.map((i) => (
              <Fragment key={i.id}>
                <tr style={{ borderBottom: expandidaId === i.id ? 'none' : '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>{new Date(i.fechaApertura).toLocaleString()}</td>
                  <td style={{ padding: '6px 4px' }}>{ORIGENES.find((o) => o.value === i.origenTipo)?.label ?? i.origenTipo}</td>
                  <td style={{ padding: '6px 4px' }}>{descripcionElemento(i)}</td>
                  <td style={{ padding: '6px 4px' }}>{i.descripcion}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={colorGravedad(i.gravedad)}>{i.gravedad}</span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={{ background: i.estado === 'RESUELTA' ? '#166534' : i.estado === 'DESCARTADA' ? '#334155' : '#7f1d1d' }}>{i.estado}</span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    {puedeResolver && (i.estado === 'ABIERTA' || i.estado === 'EN_REVISION') && (
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setExpandidaId(expandidaId === i.id ? null : i.id)}>
                        {expandidaId === i.id ? 'Cerrar' : 'Resolver'}
                      </button>
                    )}
                  </td>
                </tr>
                {expandidaId === i.id && (
                  <tr style={{ borderBottom: '1px solid #1f2937' }}>
                    <td colSpan={7} style={{ padding: '4px' }}>
                      <FilaResolver
                        incidencia={i}
                        onResuelta={() => {
                          setExpandidaId(null);
                          setMensaje('Incidencia resuelta.');
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
