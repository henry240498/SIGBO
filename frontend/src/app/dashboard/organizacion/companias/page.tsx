'use client';

import { useEffect, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { apiFetch } from '@/lib/api';
import { descargarArchivo } from '@/lib/exportar';

interface Compania {
  id: string;
  codigo: string;
  nombre: string;
  ciudad: string | null;
  direccion: string | null;
  fechaCreacion: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  eliminadoEn: string | null;
}

export default function CompaniasPage() {
  const confirmar = useConfirmacion();
  const [companias, setCompanias] = useState<Compania[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [mostrarEliminados, setMostrarEliminados] = useState(false);

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [direccion, setDireccion] = useState('');
  const [fechaCreacion, setFechaCreacion] = useState('');
  const [estado, setEstado] = useState<'ACTIVO' | 'INACTIVO'>('ACTIVO');
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (filtroEstado) params.set('estado', filtroEstado);
      if (mostrarEliminados) params.set('incluirEliminados', 'true');
      const res = await apiFetch(`/organizacion/companias?${params.toString()}`);
      if (!res.ok) throw new Error('No se pudo cargar companias');
      setCompanias(await res.json());
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
    setCiudad('');
    setDireccion('');
    setFechaCreacion('');
    setEstado('ACTIVO');
    setEditandoId(null);
  }

  function editar(c: Compania) {
    setEditandoId(c.id);
    setCodigo(c.codigo);
    setNombre(c.nombre);
    setCiudad(c.ciudad ?? '');
    setDireccion(c.direccion ?? '');
    setFechaCreacion(c.fechaCreacion ?? '');
    setEstado(c.estado);
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      const payload = {
        codigo,
        nombre,
        ciudad: ciudad || undefined,
        direccion: direccion || undefined,
        fechaCreacion: fechaCreacion || undefined,
        estado,
      };
      const res = editandoId
        ? await apiFetch(`/organizacion/companias/${editandoId}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          })
        : await apiFetch('/organizacion/companias', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo guardar la compania');
      }
      setMensaje(editandoId ? 'Compania actualizada' : 'Compania creada');
      limpiarForm();
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function darBaja(id: string) {
    setError(null);
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: 'Dar de baja esta compania?', confirmar: 'Continuar', peligro: true })) return;
    const res = await apiFetch(`/organizacion/companias/${id}/baja`, { method: 'PATCH' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo dar de baja la compania');
      return;
    }
    await cargar();
  }

  async function reactivar(id: string) {
    setError(null);
    const res = await apiFetch(`/organizacion/companias/${id}/reactivar`, { method: 'PATCH' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo reactivar la compania');
      return;
    }
    await cargar();
  }



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Companias ({companias?.length ?? 0})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-primary" onClick={() => descargarArchivo('/organizacion/companias/exportar/excel', 'companias.xlsx')}>
            Exportar a Excel
          </button>
          <button type="button" className="btn-primary" onClick={() => descargarArchivo('/organizacion/companias/exportar/pdf', 'companias.pdf')}>
            Exportar a PDF
          </button>
          <button type="button"
            className="btn-primary"
            onClick={() => {
              if (mostrarForm) {
                limpiarForm();
              }
              setMostrarForm((v) => !v);
            }}
          >
            {mostrarForm ? 'Cancelar' : 'Nueva compania'}
          </button>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="input-field"
          style={{ maxWidth: 260 }}
          placeholder="Buscar por codigo o nombre..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="input-field" style={{ maxWidth: 180 }} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="ACTIVO">ACTIVO</option>
          <option value="INACTIVO">INACTIVO</option>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Codigo</label>
              <input className="input-field" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Ciudad</label>
              <input className="input-field" value={ciudad} onChange={(e) => setCiudad(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de creacion</label>
              <input
                className="input-field"
                type="date"
                value={fechaCreacion}
                onChange={(e) => setFechaCreacion(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
              <select className="input-field" value={estado} onChange={(e) => setEstado(e.target.value as 'ACTIVO' | 'INACTIVO')}>
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Direccion</label>
            <input className="input-field" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn-primary" disabled={guardando} style={{ alignSelf: 'flex-start' }}>
              {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear compania'}
            </button>
            {editandoId && (
              <button
                type="button"
                className="btn-primary"
                style={{ alignSelf: 'flex-start', background: '#475569' }}
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

      {companias && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Codigo</th>
              <th style={{ padding: '6px 4px' }}>Nombre</th>
              <th style={{ padding: '6px 4px' }}>Ciudad</th>
              <th style={{ padding: '6px 4px' }}>Fecha creacion</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {companias.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{c.codigo}</td>
                <td style={{ padding: '6px 4px' }}>{c.nombre}</td>
                <td style={{ padding: '6px 4px' }}>{c.ciudad ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>{c.fechaCreacion ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: c.estado === 'ACTIVO' ? '#166534' : '#7f1d1d' }}>
                    {c.estado}
                  </span>
                </td>
                <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(c)}>
                    Editar
                  </button>
                  {c.eliminadoEn === null ? (
                    <button type="button"
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }}
                      onClick={() => darBaja(c.id)}
                    >
                      Eliminar
                    </button>
                  ) : (
                    <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => reactivar(c.id)}>
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
