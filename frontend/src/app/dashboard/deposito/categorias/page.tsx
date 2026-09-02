'use client';

import { useEffect, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { ComboBuscable } from '@/components/ComboBuscable';
import {
  CategoriaArticulo,
  actualizarCategoriaArticulo,
  cargarCategoriasArticulo,
  crearCategoriaArticulo,
  eliminarCategoriaArticulo,
} from '@/lib/deposito';
import { Aviso } from '@/app/components/Aviso';

export default function CategoriasArticuloPage() {
  const confirmar = useConfirmacion();
  const [categorias, setCategorias] = useState<CategoriaArticulo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [q, setQ] = useState('');

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [padreId, setPadreId] = useState('');
  const [activo, setActivo] = useState(true);

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCrear = permisos.includes('deposito:crear');
  const puedeEditar = permisos.includes('deposito:editar');
  const puedeEliminar = permisos.includes('deposito:eliminar');

  const opcionesPadre = useMemo(
    () => (categorias ?? []).filter((c) => c.id !== editandoId).map((c) => ({ value: c.id, label: c.nombre })),
    [categorias, editandoId],
  );
  const nombrePorId = useMemo(() => new Map((categorias ?? []).map((c) => [c.id, c.nombre])), [categorias]);

  async function cargar() {
    try {
      setCategorias(await cargarCategoriasArticulo(q || undefined));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function limpiarForm() {
    setCodigo('');
    setNombre('');
    setDescripcion('');
    setPadreId('');
    setActivo(true);
    setEditandoId(null);
  }

  function editar(c: CategoriaArticulo) {
    setEditandoId(c.id);
    setCodigo(c.codigo ?? '');
    setNombre(c.nombre);
    setDescripcion(c.descripcion ?? '');
    setPadreId(c.padreId ?? '');
    setActivo(c.activo);
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
        descripcion: descripcion || undefined,
        padreId: padreId || undefined,
        activo,
      };
      if (editandoId) {
        await actualizarCategoriaArticulo(editandoId, payload);
        setMensaje('Categoria actualizada.');
      } else {
        await crearCategoriaArticulo(payload);
        setMensaje('Categoria creada.');
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

  async function eliminar(c: CategoriaArticulo) {
    if (!await confirmar({ titulo: 'Eliminar categoría', mensaje: `¿Eliminar la categoría "${c.nombre}"?`, confirmar: 'Eliminar', peligro: true })) return;
    setError(null);
    try {
      await eliminarCategoriaArticulo(c.id);
      setMensaje('Categoria eliminada.');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Categorías de artículo ({categorias?.length ?? 0})</h2>
        {puedeCrear && (
          <button type="button"
            className="btn-primary"
            onClick={() => {
              limpiarForm();
              setMostrarForm(!mostrarForm);
            }}
          >
            {mostrarForm ? 'Cancelar' : '+ Nueva categoria'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="buscar" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Buscar</label>
          <input id="buscar" className="input-field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre o código..." />
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
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Categoría padre</label>
              <ComboBuscable ariaLabel="Categoría padre" opciones={opcionesPadre} value={padreId} onChange={setPadreId} ningunaLabel="Sin categoria padre" />
            </div>
          </div>
          <div>
            <label htmlFor="descripcion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripción</label>
            <input id="descripcion" className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
            Activa
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
              {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear categoria'}
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

      {categorias && categorias.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay categorías registradas.</p>}
      {categorias && categorias.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Código</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Nombre</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Categoría padre</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{c.codigo ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>{c.nombre}</td>
                <td style={{ padding: '6px 4px' }}>{c.padreId ? nombrePorId.get(c.padreId) ?? '-' : '-'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: c.activo ? 'var(--ok-fill)' : 'var(--bad-fill)', color: c.activo ? 'var(--success)' : 'var(--danger)' }}>
                    {c.activo ? 'ACTIVA' : 'INACTIVA'}
                  </span>
                </td>
                <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {puedeEditar && (
                    <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(c)}>
                      Editar
                    </button>
                  )}
                  {puedeEliminar && (
                    <button type="button"
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }}
                      onClick={() => eliminar(c)}
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
