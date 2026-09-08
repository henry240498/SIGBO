'use client';

import { useEffect, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { ComboBuscable } from '@/components/ComboBuscable';
import { cargarCatalogo, Catalogo } from '@/lib/personal';
import { Parametro } from '@/lib/parametros';
import {
  UbicacionDeposito,
  actualizarUbicacionDeposito,
  cargarTiposUbicacionDeposito,
  cargarUbicacionesDeposito,
  crearUbicacionDeposito,
  eliminarUbicacionDeposito,
} from '@/lib/deposito';
import { Aviso } from '@/app/components/Aviso';

export default function UbicacionesDepositoPage() {
  const confirmar = useConfirmacion();
  const [ubicaciones, setUbicaciones] = useState<UbicacionDeposito[] | null>(null);
  const [tipos, setTipos] = useState<Parametro[]>([]);
  const [cuarteles, setCuarteles] = useState<Catalogo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [filtroTipoId, setFiltroTipoId] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [tipoUbicacionId, setTipoUbicacionId] = useState('');
  const [padreId, setPadreId] = useState('');
  const [cuartelId, setCuartelId] = useState('');
  const [estado, setEstado] = useState('ACTIVA');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCrear = permisos.includes('deposito:crear');
  const puedeEditar = permisos.includes('deposito:editar');
  const puedeEliminar = permisos.includes('deposito:eliminar');

  const tipoPorId = useMemo(() => new Map(tipos.map((t) => [t.id, t.nombre])), [tipos]);
  const cuartelPorId = useMemo(() => new Map(cuarteles.map((c) => [c.id, c.nombre])), [cuarteles]);
  const nombrePorId = useMemo(() => new Map((ubicaciones ?? []).map((u) => [u.id, u.nombre])), [ubicaciones]);
  const opcionesTipo = useMemo(() => tipos.map((t) => ({ value: t.id, label: t.nombre })), [tipos]);
  const opcionesCuartel = useMemo(() => cuarteles.map((c) => ({ value: c.id, label: c.nombre })), [cuarteles]);
  const opcionesPadre = useMemo(
    () => (ubicaciones ?? []).filter((u) => u.id !== editandoId).map((u) => ({ value: u.id, label: u.nombre })),
    [ubicaciones, editandoId],
  );
  const opcionesEstado = useMemo(() => [{ value: 'ACTIVA', label: 'ACTIVA' }, { value: 'INACTIVA', label: 'INACTIVA' }], []);

  async function cargar() {
    try {
      setUbicaciones(await cargarUbicacionesDeposito(q || undefined, filtroTipoId || undefined, filtroEstado || undefined));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarTiposUbicacionDeposito().then(setTipos);
    cargarCatalogo('/organizacion/cuarteles').then(setCuarteles);
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filtroTipoId, filtroEstado]);

  function limpiarForm() {
    setCodigo('');
    setNombre('');
    setTipoUbicacionId('');
    setPadreId('');
    setCuartelId('');
    setEstado('ACTIVA');
    setEditandoId(null);
  }

  function editar(u: UbicacionDeposito) {
    setEditandoId(u.id);
    setCodigo(u.codigo ?? '');
    setNombre(u.nombre);
    setTipoUbicacionId(u.tipoUbicacionId);
    setPadreId(u.padreId ?? '');
    setCuartelId(u.cuartelId ?? '');
    setEstado(u.estado);
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      const payload = {
        codigo: codigo || undefined,
        nombre,
        tipoUbicacionId,
        padreId: padreId || undefined,
        cuartelId: cuartelId || undefined,
        estado,
      };
      if (editandoId) {
        await actualizarUbicacionDeposito(editandoId, payload);
        setMensaje('Ubicacion actualizada.');
      } else {
        await crearUbicacionDeposito(payload);
        setMensaje('Ubicacion creada.');
      }
      limpiarForm();
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(u: UbicacionDeposito) {
    if (!await confirmar({ titulo: 'Eliminar ubicación', mensaje: `¿Eliminar la ubicación "${u.nombre}"?`, confirmar: 'Eliminar', peligro: true })) return;
    setError(null);
    try {
      await eliminarUbicacionDeposito(u.id);
      setMensaje('Ubicacion eliminada.');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Ubicaciones ({ubicaciones?.length ?? 0})</h2>
        {puedeCrear && (
          <button type="button"
            className="btn-primary"
            onClick={() => {
              limpiarForm();
              setMostrarForm(!mostrarForm);
            }}
          >
            {mostrarForm ? 'Cancelar' : '+ Nueva ubicacion'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="buscar" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Buscar</label>
          <input id="buscar" className="input-field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre o código..." />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Tipo</label>
          <ComboBuscable ariaLabel="Tipo" opciones={opcionesTipo} value={filtroTipoId} onChange={setFiltroTipoId} maxWidth={200} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Estado</label>
          <ComboBuscable ariaLabel="Estado" opciones={opcionesEstado} value={filtroEstado} onChange={setFiltroEstado} maxWidth={160} />
        </div>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form onSubmit={guardar} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="codigo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Código</label>
              <input id="codigo" className="input-field" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
            </div>
            <div>
              <label htmlFor="nombre" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input id="nombre" className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de ubicación</label>
              <ComboBuscable ariaLabel="Tipo de ubicación" opciones={opcionesTipo} value={tipoUbicacionId} onChange={setTipoUbicacionId} ningunaLabel="-- seleccionar --" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Ubicación padre</label>
              <ComboBuscable ariaLabel="Ubicación padre" opciones={opcionesPadre} value={padreId} onChange={setPadreId} ningunaLabel="Sin padre (raiz)" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cuartel</label>
              <ComboBuscable ariaLabel="Cuartel" opciones={opcionesCuartel} value={cuartelId} onChange={setCuartelId} ningunaLabel="Sin definir" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
              <ComboBuscable ariaLabel="Estado" opciones={opcionesEstado} value={estado} onChange={setEstado} ningunaLabel="ACTIVA" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
              {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear ubicacion'}
            </button>
            {editandoId && (
              <button
                type="button"
                className="btn-primary"
                style={{ background: '#475569' }}
                onClick={() => {
                  limpiarForm();
                  setMostrarForm(false);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      {ubicaciones && ubicaciones.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay ubicaciones registradas.</p>}
      {ubicaciones && ubicaciones.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Código</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Nombre</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Tipo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Padre</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Cuartel</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ubicaciones.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{u.codigo ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>{u.nombre}</td>
                <td style={{ padding: '6px 4px' }}>{tipoPorId.get(u.tipoUbicacionId) ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>{u.padreId ? nombrePorId.get(u.padreId) ?? '-' : '-'}</td>
                <td style={{ padding: '6px 4px' }}>{u.cuartelId ? cuartelPorId.get(u.cuartelId) ?? '-' : '-'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: u.estado === 'ACTIVA' ? 'var(--ok-fill)' : 'var(--bad-fill)', color: u.estado === 'ACTIVA' ? 'var(--success)' : 'var(--danger)' }}>
                    {u.estado}
                  </span>
                </td>
                <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {puedeEditar && (
                    <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(u)}>
                      Editar
                    </button>
                  )}
                  {puedeEliminar && (
                    <button type="button"
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }}
                      onClick={() => eliminar(u)}
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
