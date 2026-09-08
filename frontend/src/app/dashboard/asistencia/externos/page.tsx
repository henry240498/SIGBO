'use client';

import { useEffect, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { actualizarExterno, cargarExternos, crearExterno, ParticipanteExterno } from '@/lib/asistencia';
import { Aviso } from '@/app/components/Aviso';

export default function ExternosPage() {
  const [externos, setExternos] = useState<ParticipanteExterno[] | null>(null);
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({ cedula: '', nombre: '', apellido: '', celular: '', institucionProcedencia: '', observacion: '' });

  const puedeCrear = !!obtenerSesion()?.usuario.permisos.includes('asistencia:externos_crear');
  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('asistencia:externos_editar');

  async function cargar() {
    try {
      setExternos(await cargarExternos(q || undefined));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function limpiarForm() {
    setForm({ cedula: '', nombre: '', apellido: '', celular: '', institucionProcedencia: '', observacion: '' });
    setEditandoId(null);
  }

  function editar(x: ParticipanteExterno) {
    setEditandoId(x.id);
    setForm({
      cedula: x.cedula ?? '',
      nombre: x.nombre,
      apellido: x.apellido ?? '',
      celular: x.celular ?? '',
      institucionProcedencia: x.institucionProcedencia ?? '',
      observacion: x.observacion ?? '',
    });
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      const payload = {
        cedula: form.cedula || undefined,
        nombre: form.nombre,
        apellido: form.apellido || undefined,
        celular: form.celular || undefined,
        institucionProcedencia: form.institucionProcedencia || undefined,
        observacion: form.observacion || undefined,
      };
      if (editandoId) {
        await actualizarExterno(editandoId, payload);
        setMensaje('Actualizado');
      } else {
        await crearExterno(payload);
        setMensaje('Creado');
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Personas Externas ({externos?.length ?? 0})</h2>
        {puedeCrear && (
          <button type="button"
            className="btn-primary"
            onClick={() => {
              if (mostrarForm) {
                setMostrarForm(false);
              } else {
                limpiarForm();
                setMostrarForm(true);
              }
            }}
          >
            {mostrarForm ? 'Cancelar' : '+ Nueva persona externa'}
          </button>
        )}
      </div>

      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
        Personas que participan de eventos sin pertenecer al cuerpo de bomberos (civiles, invitados, estudiantes,
        personal de otras instituciones). Nunca se convierten en un registro de Personal.
      </p>

      <div className="card">
        <input
          className="input-field"
          style={{ maxWidth: 280 }}
          placeholder="Buscar por nombre, apellido o cedula..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form onSubmit={guardar} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="cedula" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cedula</label>
              <input id="cedula" className="input-field" value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} />
            </div>
            <div>
              <label htmlFor="nombre" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input id="nombre" className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="apellido" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Apellido</label>
              <input id="apellido" className="input-field" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
            </div>
            <div>
              <label htmlFor="celular" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Celular</label>
              <input id="celular" className="input-field" value={form.celular} onChange={(e) => setForm({ ...form, celular: e.target.value })} />
            </div>
            <div>
              <label htmlFor="institucion-de-procedencia" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Institución de procedencia</label>
              <input id="institucion-de-procedencia"
                className="input-field"
                value={form.institucionProcedencia}
                onChange={(e) => setForm({ ...form, institucionProcedencia: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="observacion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observación</label>
              <input id="observacion" className="input-field" value={form.observacion} onChange={(e) => setForm({ ...form, observacion: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear'}
          </button>
        </form>
      )}

      {externos && externos.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin personas externas registradas.</p>}
      {externos && externos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Nombre</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Cedula</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Celular</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Institución</th>
              {puedeEditar && <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {externos.map((x) => (
              <tr key={x.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>
                  {x.nombre} {x.apellido ?? ''}
                </td>
                <td style={{ padding: '6px 4px' }}>{x.cedula ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>{x.celular ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>{x.institucionProcedencia ?? ''}</td>
                {puedeEditar && (
                  <td style={{ padding: '6px 4px' }}>
                    <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(x)}>
                      Editar
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
