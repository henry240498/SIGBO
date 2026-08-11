'use client';

import { useEffect, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { CategoriaEquipo, actualizarCategoria, cargarCategorias, crearCategoria, eliminarCategoria } from '@/lib/equipos';

export default function CategoriasEquipoPage() {
  const [categorias, setCategorias] = useState<CategoriaEquipo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);

  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('equipos:editar');
  const puedeCrear = !!obtenerSesion()?.usuario.permisos.includes('equipos:crear');
  const puedeEliminar = !!obtenerSesion()?.usuario.permisos.includes('equipos:eliminar');

  async function cargar() {
    try {
      setCategorias(await cargarCategorias());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function limpiarForm() {
    setNombre('');
    setDescripcion('');
    setEditandoId(null);
  }

  function editar(c: CategoriaEquipo) {
    setEditandoId(c.id);
    setNombre(c.nombre);
    setDescripcion(c.descripcion ?? '');
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      const payload = { nombre, descripcion: descripcion || undefined };
      if (editandoId) {
        await actualizarCategoria(editandoId, payload);
        setMensaje('Categoria actualizada');
      } else {
        await crearCategoria(payload);
        setMensaje('Categoria creada');
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

  async function eliminar(id: string) {
    if (!window.confirm('Eliminar esta categoria?')) return;
    try {
      await eliminarCategoria(id);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Categorias de equipo ({categorias?.length ?? 0})</h2>
        {puedeCrear && (
          <button className="btn-primary" onClick={() => (mostrarForm ? setMostrarForm(false) : (limpiarForm(), setMostrarForm(true)))}>
            {mostrarForm ? 'Cancelar' : 'Nueva categoria'}
          </button>
        )}
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {mostrarForm && (
        <form className="card" onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripcion</label>
              <input className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>
          </div>
          <button className="btn-primary" disabled={guardando} style={{ alignSelf: 'flex-start' }}>
            {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear categoria'}
          </button>
        </form>
      )}

      {categorias && categorias.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Nombre</th>
              <th style={{ padding: '6px 4px' }}>Descripcion</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{c.nombre}</td>
                <td style={{ padding: '6px 4px' }}>{c.descripcion ?? '—'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: c.activo ? '#166534' : '#7f1d1d' }}>
                    {c.activo ? 'ACTIVA' : 'INACTIVA'}
                  </span>
                </td>
                <td style={{ padding: '6px 4px', display: 'flex', gap: 6 }}>
                  {puedeEditar && (
                    <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(c)}>
                      Editar
                    </button>
                  )}
                  {puedeEliminar && (
                    <button
                      style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: 6 }}
                      onClick={() => eliminar(c.id)}
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
