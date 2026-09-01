'use client';

import { useEffect, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { apiFetch } from '@/lib/api';
import { descargarArchivo } from '@/lib/exportar';
import { Aviso } from '@/app/components/Aviso';

interface Brigada {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  eliminadoEn: string | null;
}

export default function BrigadasPage() {
  const confirmar = useConfirmacion();
  const [brigadas, setBrigadas] = useState<Brigada[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [mostrarEliminados, setMostrarEliminados] = useState(false);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState<'ACTIVO' | 'INACTIVO'>('ACTIVO');

  async function cargar() {
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (filtroEstado) params.set('estado', filtroEstado);
      if (mostrarEliminados) params.set('incluirEliminados', 'true');
      const query = params.toString();
      const res = await apiFetch(`/organizacion/brigadas${query ? `?${query}` : ''}`);
      if (!res.ok) throw new Error('No se pudo cargar las brigadas');
      setBrigadas(await res.json());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filtroEstado, mostrarEliminados]);

  function limpiarForm() {
    setCodigo('');
    setNombre('');
    setDescripcion('');
    setEstado('ACTIVO');
    setEditandoId(null);
  }

  function iniciarEdicion(b: Brigada) {
    setCodigo(b.codigo);
    setNombre(b.nombre);
    setDescripcion(b.descripcion ?? '');
    setEstado(b.estado);
    setEditandoId(b.id);
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    const payload = { codigo, nombre, descripcion: descripcion || undefined, estado };
    const res = editandoId
      ? await apiFetch(`/organizacion/brigadas/${editandoId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      : await apiFetch('/organizacion/brigadas', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo guardar la brigada');
      return;
    }
    setMensaje(editandoId ? 'Brigada actualizada' : 'Brigada creada');
    limpiarForm();
    setMostrarForm(false);
    await cargar();
  }

  function cancelar() {
    limpiarForm();
    setMostrarForm(false);
  }

  async function darBaja(id: string) {
    setError(null);
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: 'Dar de baja esta brigada?', confirmar: 'Continuar', peligro: true })) return;
    const res = await apiFetch(`/organizacion/brigadas/${id}/baja`, { method: 'PATCH' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo dar de baja la brigada');
      return;
    }
    await cargar();
  }

  async function reactivar(id: string) {
    setError(null);
    const res = await apiFetch(`/organizacion/brigadas/${id}/reactivar`, { method: 'PATCH' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo reactivar la brigada');
      return;
    }
    await cargar();
  }



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <h2 style={{ fontSize: 16 }}>Brigadas ({brigadas?.length ?? 0})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-primary" onClick={() => descargarArchivo('/organizacion/brigadas/exportar/excel', 'brigadas.xlsx')}>
            Exportar a Excel
          </button>
          <button type="button" className="btn-primary" onClick={() => descargarArchivo('/organizacion/brigadas/exportar/pdf', 'brigadas.pdf')}>
            Exportar a PDF
          </button>
          <button type="button"
            className="btn-primary"
            onClick={() => {
              if (mostrarForm) {
                cancelar();
              } else {
                limpiarForm();
                setMostrarForm(true);
              }
            }}
          >
            {mostrarForm ? 'Cancelar' : 'Nueva brigada'}
          </button>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
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
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
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

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form className="card" onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="codigo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Codigo</label>
              <input id="codigo" className="input-field" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="nombre" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input id="nombre" className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="estado" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
              <select id="estado"
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
            <label htmlFor="descripcion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripcion</label>
            <input id="descripcion" className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
            {editandoId ? 'Guardar cambios' : 'Crear brigada'}
          </button>
        </form>
      )}

      {brigadas && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Codigo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Nombre</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Descripcion</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {brigadas.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{b.codigo}</td>
                <td style={{ padding: '6px 4px' }}>{b.nombre}</td>
                <td style={{ padding: '6px 4px', color: 'var(--muted)' }}>
                  {b.descripcion
                    ? b.descripcion.length > 60
                      ? `${b.descripcion.slice(0, 60)}...`
                      : b.descripcion
                    : ''}
                </td>
                <td style={{ padding: '6px 4px' }}>
                  <span
                    className="badge"
                    style={{ background: b.estado === 'ACTIVO' ? 'var(--ok-fill)' : 'var(--bad-fill)' }}
                  >
                    {b.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button type="button"
                    className="btn-primary"
                    style={{ padding: '4px 8px', fontSize: 12 }}
                    onClick={() => iniciarEdicion(b)}
                  >
                    Editar
                  </button>
                  {b.eliminadoEn === null ? (
                    <button type="button"
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }}
                      onClick={() => darBaja(b.id)}
                    >
                      Eliminar
                    </button>
                  ) : (
                    <button type="button"
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 12, background: '#166534' }}
                      onClick={() => reactivar(b.id)}
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
