'use client';

import { useEffect, useMemo, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { BomberoResumen, cargarBomberos } from '@/lib/personal';
import {
  Guardia,
  GrupoGuardia,
  GrupoGuardiaMiembro,
  RolGrupoGuardia,
  actualizarGrupoGuardia,
  agregarMiembroGrupo,
  cargarGrupoGuardia,
  cargarHistorialGrupo,
  listarMiembrosGrupo,
  quitarMiembroGrupo,
} from '@/lib/guardias';
import { Cargando } from '@/app/components/Cargando';
import { Aviso } from '@/app/components/Aviso';

export default function DetalleGrupoGuardiaPage() {
  const confirmar = useConfirmacion();
  const params = useParams();
  const router = useRouter();
  const grupoId = params.id as string;

  const [grupo, setGrupo] = useState<GrupoGuardia | null>(null);
  const [miembros, setMiembros] = useState<GrupoGuardiaMiembro[] | null>(null);
  const [historial, setHistorial] = useState<Guardia[] | null>(null);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [bomberoId, setBomberoId] = useState('');
  const [rol, setRol] = useState<RolGrupoGuardia>('TITULAR');
  const [error, setError] = useState<string | null>(null);

  const [editandoConfig, setEditandoConfig] = useState(false);
  const [cicloRotacionDias, setCicloRotacionDias] = useState('');
  const [cantidadMinima, setCantidadMinima] = useState('');
  const [cantidadMaxima, setCantidadMaxima] = useState('');
  const [cantidadOficiales, setCantidadOficiales] = useState('');
  const [cantidadChoferes, setCantidadChoferes] = useState('');
  const [guardandoConfig, setGuardandoConfig] = useState(false);

  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('guardias:editar');

  function abrirConfig() {
    if (!grupo) return;
    setCicloRotacionDias(grupo.cicloRotacionDias != null ? String(grupo.cicloRotacionDias) : '');
    setCantidadMinima(grupo.cantidadMinima != null ? String(grupo.cantidadMinima) : '');
    setCantidadMaxima(grupo.cantidadMaxima != null ? String(grupo.cantidadMaxima) : '');
    setCantidadOficiales(grupo.cantidadOficiales != null ? String(grupo.cantidadOficiales) : '');
    setCantidadChoferes(grupo.cantidadChoferes != null ? String(grupo.cantidadChoferes) : '');
    setEditandoConfig(true);
  }

  async function guardarConfig() {
    setError(null);
    setGuardandoConfig(true);
    try {
      await actualizarGrupoGuardia(grupoId, {
        cicloRotacionDias: cicloRotacionDias ? parseInt(cicloRotacionDias, 10) : null,
        cantidadMinima: cantidadMinima ? parseInt(cantidadMinima, 10) : null,
        cantidadMaxima: cantidadMaxima ? parseInt(cantidadMaxima, 10) : null,
        cantidadOficiales: cantidadOficiales ? parseInt(cantidadOficiales, 10) : null,
        cantidadChoferes: cantidadChoferes ? parseInt(cantidadChoferes, 10) : null,
      });
      setEditandoConfig(false);
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardandoConfig(false);
    }
  }

  const opcionesBombero = useMemo(() => {
    const yaAsignados = new Set((miembros ?? []).map((m) => m.bomberoId));
    return bomberos
      .filter((b) => !yaAsignados.has(b.id))
      .map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` }));
  }, [bomberos, miembros]);

  async function cargarTodo() {
    try {
      setGrupo(await cargarGrupoGuardia(grupoId));
      setMiembros(await listarMiembrosGrupo(grupoId));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarTodo();
    cargarBomberos().then(setBomberos).catch(() => undefined);
    cargarHistorialGrupo(grupoId).then(setHistorial).catch(() => setHistorial([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupoId]);

  async function agregar() {
    if (!bomberoId) return;
    setError(null);
    try {
      await agregarMiembroGrupo(grupoId, { bomberoId, rol });
      setBomberoId('');
      setRol('TITULAR');
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function quitar(miembroId: string) {
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: 'Quitar este miembro del grupo?', confirmar: 'Continuar', peligro: true })) return;
    setError(null);
    try {
      await quitarMiembroGrupo(grupoId, miembroId);
      await cargarTodo();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (error && !grupo) return <p style={{ color: 'var(--danger)' }}>{error}</p>;
  if (!grupo) return <Cargando texto="Cargando…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 18 }}>{grupo.nombre}</h2>
            <span className="badge" style={{ marginTop: 6, display: 'inline-block' }}>{grupo.estado}</span>
          </div>
          <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={() => router.push('/dashboard/guardias/grupos')}>
            Volver
          </button>
        </div>
      </div>

      {error && <Aviso tipo="error" texto={error} />}

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 14 }}>Configuración de rotación / capacidad</h3>
          {puedeEditar && !editandoConfig && (
            <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={abrirConfig}>Editar</button>
          )}
        </div>
        {!editandoConfig && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
            <div>
              <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>Ciclo de rotación</span>
              {grupo.cicloRotacionDias ? `cada ${grupo.cicloRotacionDias} dias` : '— (no elegible para generacion automatica)'}
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>Cant. minima</span>
              {grupo.cantidadMinima ?? '—'}
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>Cant. maxima</span>
              {grupo.cantidadMaxima ?? '—'}
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>Cant. oficiales</span>
              {grupo.cantidadOficiales ?? '—'}
            </div>
            <div>
              <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>Cant. choferes</span>
              {grupo.cantidadChoferes ?? '—'}
            </div>
          </div>
        )}
        {editandoConfig && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
              <div>
                <label htmlFor="ciclo-de-rotacion-dias" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Ciclo de rotación (días)</label>
                <input id="ciclo-de-rotacion-dias" className="input-field" type="number" min={1} value={cicloRotacionDias} onChange={(e) => setCicloRotacionDias(e.target.value)} placeholder="Sin rotacion" />
              </div>
              <div>
                <label htmlFor="cant-minima" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cant. minima</label>
                <input id="cant-minima" className="input-field" type="number" min={0} value={cantidadMinima} onChange={(e) => setCantidadMinima(e.target.value)} />
              </div>
              <div>
                <label htmlFor="cant-maxima" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cant. maxima</label>
                <input id="cant-maxima" className="input-field" type="number" min={0} value={cantidadMaxima} onChange={(e) => setCantidadMaxima(e.target.value)} />
              </div>
              <div>
                <label htmlFor="cant-oficiales" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cant. oficiales</label>
                <input id="cant-oficiales" className="input-field" type="number" min={0} value={cantidadOficiales} onChange={(e) => setCantidadOficiales(e.target.value)} />
              </div>
              <div>
                <label htmlFor="cant-choferes" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cant. choferes</label>
                <input id="cant-choferes" className="input-field" type="number" min={0} value={cantidadChoferes} onChange={(e) => setCantidadChoferes(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn-primary" disabled={guardandoConfig} onClick={guardarConfig}>{guardandoConfig ? 'Guardando...' : 'Guardar cambios'}</button>
              <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={() => setEditandoConfig(false)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>

      {puedeEditar && (
        <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 280 }}>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Bombero</label>
            <ComboBuscable ariaLabel="Bombero" opciones={opcionesBombero} value={bomberoId} onChange={setBomberoId} placeholderBusqueda="Buscar por codigo o nombre..." />
          </div>
          <div>
            <label htmlFor="rol" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Rol</label>
            <select id="rol" className="input-field" value={rol} onChange={(e) => setRol(e.target.value as RolGrupoGuardia)}>
              <option value="TITULAR">TITULAR</option>
              <option value="CHOFER">CHOFER</option>
            </select>
          </div>
          <button type="button" className="btn-primary" onClick={agregar} disabled={!bomberoId}>Agregar</button>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 10 }}>Miembros ({miembros?.length ?? 0})</h3>
        {miembros && miembros.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin miembros en este grupo.</p>}
        {miembros && miembros.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                <th scope="col" style={{ padding: '6px 4px' }}>Bombero</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Rol</th>
                {puedeEditar && <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {miembros.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '6px 4px' }}>{m.codigoBombero ? `${m.codigoBombero} — ` : ''}{m.nombreCompleto}</td>
                  <td style={{ padding: '6px 4px' }}><span className="badge">{m.rol}</span></td>
                  {puedeEditar && (
                    <td style={{ padding: '6px 4px' }}>
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }} onClick={() => quitar(m.id)}>
                        Quitar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 10 }}>Historial de guardias ({historial?.length ?? 0})</h3>
        {historial && historial.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin guardias registradas para este grupo.</p>}
        {historial && historial.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                <th scope="col" style={{ padding: '6px 4px' }}>Fecha</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Turno</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Tipo</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((g) => (
                <tr key={g.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '6px 4px' }}>
                    <Link href={`/dashboard/guardias/${g.id}`} style={{ color: 'var(--signal)', textDecoration: 'none' }}>
                      {g.fecha}
                    </Link>
                  </td>
                  <td style={{ padding: '6px 4px' }}>{g.turno}</td>
                  <td style={{ padding: '6px 4px' }}>{g.tipo}</td>
                  <td style={{ padding: '6px 4px' }}><span className="badge">{g.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
