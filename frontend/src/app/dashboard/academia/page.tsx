'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Parametro } from '@/lib/parametros';
import { ActividadAcademica, cargarActividades, cargarModalidadesAcademicas, cargarTiposActividadAcademica, crearActividad } from '@/lib/academia';
import { Aviso } from '@/app/components/Aviso';

const ESTADOS_ACTIVIDAD = ['PLANIFICADA', 'ABIERTA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA'];

export default function ActividadesAcademicasPage() {
  const router = useRouter();
  const [actividades, setActividades] = useState<ActividadAcademica[] | null>(null);
  const [tipos, setTipos] = useState<Parametro[]>([]);
  const [modalidades, setModalidades] = useState<Parametro[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [filtroTipoId, setFiltroTipoId] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [tipoActividadId, setTipoActividadId] = useState('');
  const [modalidadId, setModalidadId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [lugar, setLugar] = useState('');
  const [esExterna, setEsExterna] = useState(false);
  const [costo, setCosto] = useState('');

  const puedeCrear = !!obtenerSesion()?.usuario.permisos.includes('academia:crear_curso');

  const tipoPorId = useMemo(() => new Map(tipos.map((t) => [t.id, t.nombre])), [tipos]);
  const opcionesTipo = useMemo(() => tipos.map((t) => ({ value: t.id, label: t.nombre })), [tipos]);
  const opcionesModalidad = useMemo(() => modalidades.map((m) => ({ value: m.id, label: m.nombre })), [modalidades]);
  const opcionesEstado = useMemo(() => ESTADOS_ACTIVIDAD.map((e) => ({ value: e, label: e })), []);

  async function cargar() {
    try {
      setActividades(await cargarActividades({ tipoActividadId: filtroTipoId || undefined, estado: filtroEstado || undefined }));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarTiposActividadAcademica().then(setTipos);
    cargarModalidadesAcademicas().then(setModalidades);
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroTipoId, filtroEstado]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      const creada = await crearActividad({
        nombre,
        codigo: codigo || undefined,
        tipoActividadId,
        modalidadId: modalidadId || undefined,
        descripcion: descripcion || undefined,
        fechaInicio,
        fechaFin,
        lugar: lugar || undefined,
        esExterna,
        costo: costo ? Number(costo) : undefined,
      });
      router.push(`/dashboard/academia/${creada.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Actividades académicas ({actividades?.length ?? 0})</h2>
        {puedeCrear && (
          <button type="button" className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : '+ Nueva actividad'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Tipo de actividad</label>
          <ComboBuscable ariaLabel="Tipo de actividad" opciones={opcionesTipo} value={filtroTipoId} onChange={setFiltroTipoId} maxWidth={220} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Estado</label>
          <ComboBuscable ariaLabel="Estado" opciones={opcionesEstado} value={filtroEstado} onChange={setFiltroEstado} maxWidth={180} />
        </div>
      </div>

      {error && <Aviso tipo="error" texto={error} />}

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="nombre" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input id="nombre" className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="codigo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Código</label>
              <input id="codigo" className="input-field" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de actividad</label>
              <ComboBuscable ariaLabel="Tipo de actividad" opciones={opcionesTipo} value={tipoActividadId} onChange={setTipoActividadId} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="inicio" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Inicio</label>
              <input id="inicio" className="input-field" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="fin" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fin</label>
              <input id="fin" className="input-field" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Modalidad</label>
              <ComboBuscable ariaLabel="Modalidad" opciones={opcionesModalidad} value={modalidadId} onChange={setModalidadId} ningunaLabel="Sin definir" />
            </div>
            <div>
              <label htmlFor="lugar" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Lugar</label>
              <input id="lugar" className="input-field" value={lugar} onChange={(e) => setLugar(e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="descripcion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripción</label>
            <input id="descripcion" className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <div style={{ maxWidth: 220 }}>
            <label htmlFor="costo-vacio-si-no-cobra" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Costo (vacio si no cobra)</label>
            <input id="costo-vacio-si-no-cobra" className="input-field" type="number" min={0} step="1" value={costo} onChange={(e) => setCosto(e.target.value)} />
          </div>
          <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={esExterna} onChange={(e) => setEsExterna(e.target.checked)} />
            Capacitación externa (realizada fuera de la institución)
          </label>
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Crear actividad'}
          </button>
        </form>
      )}

      {actividades && actividades.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay actividades registradas.</p>}
      {actividades && actividades.length > 0 && (
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
            {actividades.map((a) => (
              <tr
                key={a.id}
                onClick={() => router.push(`/dashboard/academia/${a.id}`)}
                style={{ borderBottom: '1px solid var(--line-soft)', cursor: 'pointer' }}
              >
                <td style={{ padding: '6px 4px' }}>
                  {a.nombre}
                  {a.esExterna && <span className="badge" style={{ marginLeft: 6, background: 'var(--neutral-fill)' }}>externa</span>}
                </td>
                <td style={{ padding: '6px 4px' }}>{tipoPorId.get(a.tipoActividadId) ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>{a.fechaInicio}</td>
                <td style={{ padding: '6px 4px' }}>{a.fechaFin}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge">{a.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
