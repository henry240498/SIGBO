'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Parametro } from '@/lib/parametros';
import { cargarEventos, cargarTiposEvento, crearEvento, ESTADOS_EVENTO, EventoAsistencia } from '@/lib/asistencia';
import { Aviso } from '@/app/components/Aviso';

export default function EventosPage() {
  const router = useRouter();
  const [eventos, setEventos] = useState<EventoAsistencia[] | null>(null);
  const [tipos, setTipos] = useState<Parametro[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [filtroTipoId, setFiltroTipoId] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [tipoEventoId, setTipoEventoId] = useState('');

  const puedeCrear = !!obtenerSesion()?.usuario.permisos.includes('asistencia:eventos_crear');

  const tipoPorId = useMemo(() => new Map(tipos.map((t) => [t.id, t.nombre])), [tipos]);
  const opcionesTipo = useMemo(() => tipos.map((t) => ({ value: t.id, label: t.nombre })), [tipos]);
  const opcionesEstado = useMemo(() => ESTADOS_EVENTO.map((e) => ({ value: e, label: e })), []);

  async function cargar() {
    try {
      setEventos(await cargarEventos({ tipoEventoId: filtroTipoId || undefined, estado: filtroEstado || undefined }));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarTiposEvento().then(setTipos);
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroTipoId, filtroEstado]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      const creado = await crearEvento({
        nombre,
        descripcion: descripcion || undefined,
        fechaInicio: new Date(fechaInicio).toISOString(),
        fechaFin: new Date(fechaFin).toISOString(),
        ubicacion: ubicacion || undefined,
        tipoEventoId: tipoEventoId || undefined,
      });
      router.push(`/dashboard/asistencia/eventos/${creado.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Eventos ({eventos?.length ?? 0})</h2>
        {puedeCrear && (
          <button type="button" className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : '+ Nuevo evento'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Tipo de evento</label>
          <ComboBuscable ariaLabel="Tipo de evento" opciones={opcionesTipo} value={filtroTipoId} onChange={setFiltroTipoId} maxWidth={220} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Estado</label>
          <ComboBuscable ariaLabel="Estado" opciones={opcionesEstado} value={filtroEstado} onChange={setFiltroEstado} maxWidth={180} />
        </div>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="nombre" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input id="nombre" className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de evento</label>
              <ComboBuscable ariaLabel="Tipo de evento" opciones={opcionesTipo} value={tipoEventoId} onChange={setTipoEventoId} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="inicio" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Inicio</label>
              <input id="inicio"
                className="input-field"
                type="datetime-local"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="fin" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fin</label>
              <input id="fin"
                className="input-field"
                type="datetime-local"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="ubicacion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Ubicación</label>
              <input id="ubicacion" className="input-field" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="descripcion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripción</label>
            <input id="descripcion" className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Crear evento'}
          </button>
        </form>
      )}

      {eventos && eventos.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay eventos registrados.</p>}
      {eventos && eventos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Nombre</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Tipo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Inicio</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Fin</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {eventos.map((ev) => (
              <tr
                key={ev.id}
                onClick={() => router.push(`/dashboard/asistencia/eventos/${ev.id}`)}
                style={{ borderBottom: '1px solid var(--line-soft)', cursor: 'pointer' }}
              >
                <td style={{ padding: '6px 4px' }}>{ev.nombre}</td>
                <td style={{ padding: '6px 4px' }}>{ev.tipoEventoId ? tipoPorId.get(ev.tipoEventoId) ?? '-' : '-'}</td>
                <td style={{ padding: '6px 4px' }}>{new Date(ev.fechaInicio).toLocaleString()}</td>
                <td style={{ padding: '6px 4px' }}>{new Date(ev.fechaFin).toLocaleString()}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge">{ev.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
