'use client';

import { useEffect, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import {
  InstructorExterno,
  InstructorExternoInput,
  actualizarInstructorExterno,
  cargarInstructoresExternos,
} from '@/lib/academia';

const VACIO: InstructorExternoInput = {
  nombre: '',
  apellido: '',
  documento: '',
  institucion: '',
  especialidad: '',
  telefono: '',
  email: '',
  observaciones: '',
};

export default function InstructoresExternosPage() {
  const [instructores, setInstructores] = useState<InstructorExterno[] | null>(null);
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<InstructorExternoInput>(VACIO);
  const [guardando, setGuardando] = useState(false);

  const puedeGestionar = !!obtenerSesion()?.usuario.permisos.includes('academia:gestionar_instructores');

  async function cargar() {
    try {
      setInstructores(await cargarInstructoresExternos(q || undefined));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function iniciarEdicion(i: InstructorExterno) {
    setEditandoId(i.id);
    setForm({
      nombre: i.nombre,
      apellido: i.apellido ?? '',
      documento: i.documento ?? '',
      institucion: i.institucion ?? '',
      especialidad: i.especialidad ?? '',
      telefono: i.telefono ?? '',
      email: i.email ?? '',
      observaciones: i.observaciones ?? '',
      activo: i.activo,
    });
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!editandoId) return;
    setError(null);
    setGuardando(true);
    try {
      await actualizarInstructorExterno(editandoId, form);
      setEditandoId(null);
      setForm(VACIO);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function alternarActivo(i: InstructorExterno) {
    setError(null);
    try {
      await actualizarInstructorExterno(i.id, { activo: !i.activo });
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Instructores externos ({instructores?.length ?? 0})</h2>
      </div>

      <div className="card">
        <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Buscar</label>
        <input className="input-field" placeholder="Nombre, apellido o documento..." value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 320 }} />
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {editandoId && (
        <form onSubmit={guardar} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Editar instructor externo</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Apellido</label>
              <input className="input-field" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Documento</label>
              <input className="input-field" value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Institución</label>
              <input className="input-field" value={form.institucion} onChange={(e) => setForm({ ...form, institucion: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Especialidad</label>
              <input className="input-field" value={form.especialidad} onChange={(e) => setForm({ ...form, especialidad: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Teléfono</label>
              <input className="input-field" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Email</label>
              <input className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observaciones</label>
            <input className="input-field" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn-primary" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              className="btn-primary"
              style={{ background: '#475569' }}
              onClick={() => {
                setEditandoId(null);
                setForm(VACIO);
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {instructores && instructores.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No hay instructores externos registrados.</p>}
      {instructores && instructores.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Nombre</th>
              <th style={{ padding: '6px 4px' }}>Institución</th>
              <th style={{ padding: '6px 4px' }}>Especialidad</th>
              <th style={{ padding: '6px 4px' }}>Contacto</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              {puedeGestionar && <th style={{ padding: '6px 4px' }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {instructores.map((i) => (
              <tr key={i.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>
                  {i.nombre} {i.apellido ?? ''}
                </td>
                <td style={{ padding: '6px 4px' }}>{i.institucion ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>{i.especialidad ?? '-'}</td>
                <td style={{ padding: '6px 4px', color: '#94a3b8' }}>{[i.telefono, i.email].filter(Boolean).join(' / ') || '-'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: i.activo ? undefined : '#475569' }}>
                    {i.activo ? 'activo' : 'inactivo'}
                  </span>
                </td>
                {puedeGestionar && (
                  <td style={{ padding: '6px 4px', display: 'flex', gap: 6 }}>
                    <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => iniciarEdicion(i)}>
                      Editar
                    </button>
                    <button type="button"
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 11, background: '#475569' }}
                      onClick={() => alternarActivo(i)}
                    >
                      {i.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
