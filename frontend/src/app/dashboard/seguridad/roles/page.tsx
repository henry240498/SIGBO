'use client';

import { Fragment, useEffect, useState } from 'react';
import { useEntradaConfirmada } from '@/app/components/InputProvider';
import { apiFetch } from '@/lib/api';
import { useConfirmacion } from '@/app/components/ConfirmProvider';

interface Rol {
  id: string;
  nombre: string;
  descripcion: string | null;
  color: string;
  prioridad: number;
  esAdministrativo: boolean;
  esSistema: boolean;
  accesoTotal: boolean;
  activo: boolean;
}

interface Permiso {
  id: string;
  nombre: string;
  categoria: string | null;
}

export default function RolesPage() {
  const solicitarEntrada = useEntradaConfirmada();
  const confirmar = useConfirmacion();
  const [roles, setRoles] = useState<Rol[] | null>(null);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);
  const [permisosDelRol, setPermisosDelRol] = useState<string[]>([]);
  const [rolOrigenCopia, setRolOrigenCopia] = useState('');

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [color, setColor] = useState('#6B7280');
  const [prioridad, setPrioridad] = useState(10);
  const [esAdministrativo, setEsAdministrativo] = useState(false);

  async function cargar() {
    try {
      const [rRes, pRes] = await Promise.all([apiFetch('/seguridad/roles'), apiFetch('/seguridad/permisos')]);
      if (!rRes.ok) throw new Error('No se pudo cargar roles');
      setRoles(await rRes.json());
      if (pRes.ok) setPermisos(await pRes.json());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crearRol(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await apiFetch('/seguridad/roles', {
      method: 'POST',
      body: JSON.stringify({ nombre, descripcion: descripcion || undefined, color, prioridad, esAdministrativo }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo crear el rol');
      return;
    }
    setNombre('');
    setDescripcion('');
    setColor('#6B7280');
    setPrioridad(10);
    setEsAdministrativo(false);
    setMostrarForm(false);
    await cargar();
  }

  async function activar(id: string, activo: boolean) {
    setError(null);
    const res = await apiFetch(`/seguridad/roles/${id}/activo`, {
      method: 'PATCH',
      body: JSON.stringify({ activo }),
    });
    if (!res.ok) {
      setError('No se pudo actualizar el estado del rol');
      return;
    }
    await cargar();
  }

  async function eliminar(id: string) {
    setError(null);
    if (!await confirmar({titulo:'Eliminar rol',mensaje:'El rol se eliminará definitivamente. Esta acción no se puede deshacer.',confirmar:'Eliminar',peligro:true})) return;
    const res = await apiFetch(`/seguridad/roles/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo eliminar el rol');
      return;
    }
    await cargar();
  }

  async function duplicar(id: string, nombreActual: string) {
    const nombreNuevo = await solicitarEntrada({ titulo: 'Duplicar rol', mensaje: 'Indique el nombre para el nuevo rol.', etiqueta: 'Nombre', valorInicial: `${nombreActual} (copia)`, confirmar: 'Duplicar', requerida: true });
    if (!nombreNuevo) return;
    setError(null);
    const res = await apiFetch(`/seguridad/roles/${id}/duplicar`, {
      method: 'POST',
      body: JSON.stringify({ nombreNuevo }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo duplicar el rol');
      return;
    }
    setMensaje(`Rol "${nombreNuevo}" creado como copia`);
    await cargar();
  }

  async function abrirPermisos(rol: Rol) {
    if (expandidoId === rol.id) {
      setExpandidoId(null);
      return;
    }
    const res = await apiFetch(`/seguridad/roles/${rol.id}/permisos`);
    if (res.ok) {
      const lista: Permiso[] = await res.json();
      setPermisosDelRol(lista.map((p) => p.id));
    } else {
      setPermisosDelRol([]);
    }
    setExpandidoId(rol.id);
  }

  function togglePermiso(id: string) {
    setPermisosDelRol((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function guardarPermisos(rolId: string) {
    setError(null);
    const res = await apiFetch(`/seguridad/roles/${rolId}/permisos`, {
      method: 'PUT',
      body: JSON.stringify({ permisosIds: permisosDelRol }),
    });
    if (!res.ok) {
      setError('No se pudieron guardar los permisos del rol');
      return;
    }
    setMensaje('Permisos del rol actualizados');
  }

  async function copiarPermisosDesde(rolId: string) {
    if (!rolOrigenCopia) return;
    setError(null);
    const res = await apiFetch(`/seguridad/roles/${rolId}/copiar-permisos`, {
      method: 'POST',
      body: JSON.stringify({ rolOrigenId: rolOrigenCopia }),
    });
    if (!res.ok) {
      setError('No se pudieron copiar los permisos');
      return;
    }
    await abrirPermisosRefresh(rolId);
  }

  async function abrirPermisosRefresh(rolId: string) {
    const res = await apiFetch(`/seguridad/roles/${rolId}/permisos`);
    if (res.ok) {
      const lista: Permiso[] = await res.json();
      setPermisosDelRol(lista.map((p) => p.id));
    }
  }

  const permisosPorCategoria = new Map<string, Permiso[]>();
  for (const p of permisos) {
    const cat = p.categoria ?? 'Otros';
    if (!permisosPorCategoria.has(cat)) permisosPorCategoria.set(cat, []);
    permisosPorCategoria.get(cat)!.push(p);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Roles ({roles?.length ?? 0})</h2>
        <button type="button" className="btn-primary" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : 'Nuevo rol'}
        </button>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {mostrarForm && (
        <form className="card" onSubmit={crearRol} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Color</label>
              <input className="input-field" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Prioridad</label>
              <input
                className="input-field"
                type="number"
                value={prioridad}
                onChange={(e) => setPrioridad(Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripcion</label>
            <input className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={esAdministrativo} onChange={(e) => setEsAdministrativo(e.target.checked)} />
            Rol administrativo
          </label>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
            Crear rol
          </button>
        </form>
      )}

      {roles && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Rol</th>
              <th style={{ padding: '6px 4px' }}>Descripcion</th>
              <th style={{ padding: '6px 4px' }}>Prioridad</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <Fragment key={r.id}>
                <tr style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={{ background: r.color }}>
                      {r.nombre}
                    </span>
                    {r.esSistema && <span style={{ fontSize: 10, color: '#64748b', marginLeft: 6 }}>sistema</span>}
                    {r.accesoTotal && (
                      <span
                        style={{ fontSize: 10, color: '#166534', marginLeft: 6 }}
                        title="Este rol tiene todos los permisos del sistema, incluidos los que se agreguen a futuro."
                      >
                        acceso total
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '6px 4px', color: '#94a3b8' }}>{r.descripcion}</td>
                  <td style={{ padding: '6px 4px' }}>{r.prioridad}</td>
                  <td style={{ padding: '6px 4px' }}>{r.activo ? 'Activo' : 'Inactivo'}</td>
                  <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => abrirPermisos(r)}>
                      Permisos
                    </button>
                    <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => duplicar(r.id, r.nombre)}>
                      Duplicar
                    </button>
                    <button type="button"
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 12 }}
                      onClick={() => activar(r.id, !r.activo)}
                    >
                      {r.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    {!r.esSistema && (
                      <button type="button"
                        className="btn-primary"
                        style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }}
                        onClick={() => eliminar(r.id)}
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
                {expandidoId === r.id && (
                  <tr>
                    <td colSpan={5} style={{ padding: '10px 4px', background: '#0f172a' }}>
                      {r.accesoTotal && (
                        <p style={{ fontSize: 12, color: '#166534', marginBottom: 10 }}>
                          Este rol tiene acceso total: ya cuenta con todos los permisos existentes y con los que se
                          agreguen a futuro, sin importar lo que esté marcado abajo.
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                        <select
                          className="input-field"
                          style={{ maxWidth: 260 }}
                          value={rolOrigenCopia}
                          onChange={(e) => setRolOrigenCopia(e.target.value)}
                        >
                          <option value="">-- copiar permisos desde --</option>
                          {roles.filter((x) => x.id !== r.id).map((x) => (
                            <option key={x.id} value={x.id}>
                              {x.nombre}
                            </option>
                          ))}
                        </select>
                        <button type="button" className="btn-primary" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => copiarPermisosDesde(r.id)}>
                          Copiar
                        </button>
                        <button type="button" className="btn-primary" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => guardarPermisos(r.id)}>
                          Guardar permisos
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                        {[...permisosPorCategoria.entries()].map(([cat, ps]) => (
                          <div key={cat}>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{cat}</div>
                            {ps.map((p) => (
                              <label key={p.id} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <input
                                  type="checkbox"
                                  checked={permisosDelRol.includes(p.id)}
                                  onChange={() => togglePermiso(p.id)}
                                />
                                {p.nombre}
                              </label>
                            ))}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
