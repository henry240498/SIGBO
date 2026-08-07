'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { descargarArchivo } from '@/lib/exportar';

interface Departamento {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  eliminadoEn: string | null;
}

function truncar(texto: string | null, largo = 60): string {
  if (!texto) return '';
  return texto.length > largo ? `${texto.slice(0, largo)}...` : texto;
}

export default function DepartamentosPage() {
  const [departamentos, setDepartamentos] = useState<Departamento[] | null>(null);
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
  const [estado, setEstado] = useState<'ACTIVO' | 'INACTIVO'>('ACTIVO');

  async function cargar() {
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (estadoFiltro) params.set('estado', estadoFiltro);
      if (mostrarEliminados) params.set('incluirEliminados', 'true');

      const res = await apiFetch(`/organizacion/departamentos?${params.toString()}`);
      if (!res.ok) throw new Error('No se pudo cargar los departamentos');
      setDepartamentos(await res.json());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, estadoFiltro, mostrarEliminados]);

  function limpiarForm() {
    setCodigo('');
    setNombre('');
    setDescripcion('');
    setEstado('ACTIVO');
    setEditandoId(null);
  }

  function abrirNuevo() {
    limpiarForm();
    setMostrarForm(true);
  }

  function cancelarForm() {
    limpiarForm();
    setMostrarForm(false);
  }

  function editar(d: Departamento) {
    setCodigo(d.codigo);
    setNombre(d.nombre);
    setDescripcion(d.descripcion ?? '');
    setEstado(d.estado);
    setEditandoId(d.id);
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    const body = JSON.stringify({
      codigo,
      nombre,
      descripcion: descripcion || undefined,
      estado,
    });

    const res = editandoId
      ? await apiFetch(`/organizacion/departamentos/${editandoId}`, { method: 'PATCH', body })
      : await apiFetch('/organizacion/departamentos', { method: 'POST', body });

    if (!res.ok) {
      const body2 = await res.json().catch(() => ({}));
      setError(body2.message ?? 'No se pudo guardar el departamento');
      return;
    }

    setMensaje(editandoId ? 'Departamento actualizado' : 'Departamento creado');
    limpiarForm();
    setMostrarForm(false);
    await cargar();
  }

  async function darBaja(id: string) {
    setError(null);
    if (!window.confirm('Dar de baja este departamento?')) return;
    const res = await apiFetch(`/organizacion/departamentos/${id}/baja`, { method: 'PATCH' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo dar de baja el departamento');
      return;
    }
    await cargar();
  }

  async function reactivar(id: string) {
    setError(null);
    const res = await apiFetch(`/organizacion/departamentos/${id}/reactivar`, { method: 'PATCH' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo reactivar el departamento');
      return;
    }
    await cargar();
  }



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Departamentos ({departamentos?.length ?? 0})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary" onClick={() => descargarArchivo('/organizacion/departamentos/exportar/excel', 'departamentos.xlsx')}>
            Exportar a Excel
          </button>
          <button className="btn-primary" onClick={() => descargarArchivo('/organizacion/departamentos/exportar/pdf', 'departamentos.pdf')}>
            Exportar a PDF
          </button>
          <button className="btn-primary" onClick={mostrarForm ? cancelarForm : abrirNuevo}>
            {mostrarForm ? 'Cancelar' : 'Nuevo departamento'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="input-field"
          style={{ maxWidth: 260 }}
          placeholder="Buscar por codigo o nombre..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="input-field"
          style={{ maxWidth: 160 }}
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            checked={mostrarEliminados}
            onChange={(e) => setMostrarEliminados(e.target.checked)}
          />
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
              <select
                className="input-field"
                value={estado}
                onChange={(e) => setEstado(e.target.value as 'ACTIVO' | 'INACTIVO')}
              >
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripcion</label>
            <input className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <button className="btn-primary" style={{ alignSelf: 'flex-start' }}>
            {editandoId ? 'Guardar cambios' : 'Crear departamento'}
          </button>
        </form>
      )}

      {departamentos && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Codigo</th>
              <th style={{ padding: '6px 4px' }}>Nombre</th>
              <th style={{ padding: '6px 4px' }}>Descripcion</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {departamentos.map((d) => (
              <tr key={d.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{d.codigo}</td>
                <td style={{ padding: '6px 4px' }}>{d.nombre}</td>
                <td style={{ padding: '6px 4px', color: '#94a3b8' }}>{truncar(d.descripcion)}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span
                    className="badge"
                    style={{ background: d.estado === 'ACTIVO' ? '#166534' : '#7f1d1d' }}
                  >
                    {d.estado}
                  </span>
                </td>
                <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(d)}>
                    Editar
                  </button>
                  {d.eliminadoEn === null ? (
                    <button
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }}
                      onClick={() => darBaja(d.id)}
                    >
                      Eliminar
                    </button>
                  ) : (
                    <button
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 12, background: '#166534' }}
                      onClick={() => reactivar(d.id)}
                    >
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
