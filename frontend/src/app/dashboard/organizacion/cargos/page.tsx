'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { descargarArchivo } from '@/lib/exportar';

interface Cargo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  area: string | null;
  nivel: number | null;
  dependenciaCargoId: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  creadoEn: string;
  actualizadoEn: string;
  eliminadoEn: string | null;
}

export default function CargosPage() {
  const [cargos, setCargos] = useState<Cargo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [mostrarEliminados, setMostrarEliminados] = useState(false);

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [area, setArea] = useState('');
  const [nivel, setNivel] = useState('');
  const [dependenciaCargoId, setDependenciaCargoId] = useState('');
  const [estado, setEstado] = useState<'ACTIVO' | 'INACTIVO'>('ACTIVO');

  async function cargar() {
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (estadoFiltro) params.set('estado', estadoFiltro);
      if (mostrarEliminados) params.set('incluirEliminados', 'true');
      const res = await apiFetch(`/organizacion/cargos?${params.toString()}`);
      if (!res.ok) throw new Error('No se pudo cargar cargos');
      setCargos(await res.json());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, estadoFiltro, mostrarEliminados]);

  function limpiarFormulario() {
    setCodigo('');
    setNombre('');
    setDescripcion('');
    setArea('');
    setNivel('');
    setDependenciaCargoId('');
    setEstado('ACTIVO');
    setEditandoId(null);
  }

  function editar(c: Cargo) {
    setCodigo(c.codigo);
    setNombre(c.nombre);
    setDescripcion(c.descripcion ?? '');
    setArea(c.area ?? '');
    setNivel(c.nivel !== null ? String(c.nivel) : '');
    setDependenciaCargoId(c.dependenciaCargoId ?? '');
    setEstado(c.estado);
    setEditandoId(c.id);
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    const body = {
      codigo,
      nombre,
      descripcion: descripcion || undefined,
      area: area || undefined,
      nivel: nivel !== '' ? Number(nivel) : undefined,
      dependenciaCargoId: dependenciaCargoId || undefined,
      estado,
    };

    const res = editandoId
      ? await apiFetch(`/organizacion/cargos/${editandoId}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        })
      : await apiFetch('/organizacion/cargos', {
          method: 'POST',
          body: JSON.stringify(body),
        });

    if (!res.ok) {
      const body2 = await res.json().catch(() => ({}));
      setError(body2.message ?? 'No se pudo guardar el cargo');
      return;
    }

    setMensaje(editandoId ? 'Cargo actualizado' : 'Cargo creado');
    limpiarFormulario();
    setMostrarForm(false);
    await cargar();
  }

  function cancelar() {
    limpiarFormulario();
    setMostrarForm(false);
  }

  async function darBaja(id: string) {
    setError(null);
    if (!window.confirm('Dar de baja este cargo?')) return;
    const res = await apiFetch(`/organizacion/cargos/${id}/baja`, { method: 'PATCH' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo dar de baja el cargo');
      return;
    }
    await cargar();
  }

  async function reactivar(id: string) {
    setError(null);
    const res = await apiFetch(`/organizacion/cargos/${id}/reactivar`, { method: 'PATCH' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo reactivar el cargo');
      return;
    }
    await cargar();
  }



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontSize: 16 }}>Cargos ({cargos?.length ?? 0})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary" onClick={() => descargarArchivo('/organizacion/cargos/exportar/excel', 'cargos.xlsx')}>
            Exportar a Excel
          </button>
          <button className="btn-primary" onClick={() => descargarArchivo('/organizacion/cargos/exportar/pdf', 'cargos.pdf')}>
            Exportar a PDF
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              if (mostrarForm) {
                cancelar();
              } else {
                limpiarFormulario();
                setMostrarForm(true);
              }
            }}
          >
            {mostrarForm ? 'Cancelar' : 'Nuevo cargo'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="input-field"
          style={{ maxWidth: 260 }}
          placeholder="Buscar por nombre o codigo..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="input-field" style={{ maxWidth: 160 }} value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={mostrarEliminados} onChange={(e) => setMostrarEliminados(e.target.checked)} />
          Mostrar eliminados
        </label>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {mostrarForm && (
        <form className="card" onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Codigo</label>
              <input className="input-field" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
              <select className="input-field" value={estado} onChange={(e) => setEstado(e.target.value as 'ACTIVO' | 'INACTIVO')}>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Area</label>
              <input className="input-field" value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nivel</label>
              <input className="input-field" type="number" value={nivel} onChange={(e) => setNivel(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripcion</label>
              <input className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Depende de</label>
              <select className="input-field" value={dependenciaCargoId} onChange={(e) => setDependenciaCargoId(e.target.value)}>
                <option value="">-- sin dependencia --</option>
                {cargos
                  ?.filter((c) => c.id !== editandoId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <button className="btn-primary" style={{ alignSelf: 'flex-start' }}>
            {editandoId ? 'Guardar cambios' : 'Crear cargo'}
          </button>
        </form>
      )}

      {cargos && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Codigo</th>
              <th style={{ padding: '6px 4px' }}>Nombre</th>
              <th style={{ padding: '6px 4px' }}>Area</th>
              <th style={{ padding: '6px 4px' }}>Nivel</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargos.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{c.codigo}</td>
                <td style={{ padding: '6px 4px' }}>{c.nombre}</td>
                <td style={{ padding: '6px 4px', color: '#94a3b8' }}>{c.area ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>{c.nivel ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: c.estado === 'ACTIVO' ? '#166534' : '#7f1d1d' }}>
                    {c.estado}
                  </span>
                </td>
                <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(c)}>
                    Editar
                  </button>
                  {c.eliminadoEn === null ? (
                    <button
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }}
                      onClick={() => darBaja(c.id)}
                    >
                      Eliminar
                    </button>
                  ) : (
                    <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => reactivar(c.id)}>
                      Reactivar
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
