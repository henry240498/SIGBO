'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface RolBadge {
  id: string;
  nombre: string;
  color: string;
}

interface Usuario {
  id: string;
  username: string;
  email: string;
  estado: string;
  ultimoAcceso: string | null;
  bloqueadoHasta: string | null;
  roles: RolBadge[];
}

interface Rol {
  id: string;
  nombre: string;
  color: string;
  activo: boolean;
}

interface Bombero {
  id: string;
  nombre: string;
  apellido: string;
  numeroBombero: string;
}

const ESTADOS = ['ACTIVO', 'INACTIVO', 'BLOQUEADO', 'PENDIENTE_VERIFICACION'];

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [bomberos, setBomberos] = useState<Bombero[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [estado, setEstado] = useState('ACTIVO');
  const [bomberoId, setBomberoId] = useState('');
  const [rolesSeleccionados, setRolesSeleccionados] = useState<string[]>([]);
  const [creando, setCreando] = useState(false);

  async function cargar() {
    try {
      const [uRes, rRes, bRes] = await Promise.all([
        apiFetch('/seguridad/usuarios'),
        apiFetch('/seguridad/roles'),
        apiFetch('/personal/bomberos'),
      ]);
      if (!uRes.ok) throw new Error('No se pudo cargar usuarios');
      setUsuarios(await uRes.json());
      if (rRes.ok) setRoles(await rRes.json());
      if (bRes.ok) setBomberos(await bRes.json());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function toggleRol(id: string) {
    setRolesSeleccionados((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }

  async function crearUsuario(e: React.FormEvent) {
    e.preventDefault();
    setCreando(true);
    setError(null);
    try {
      const res = await apiFetch('/seguridad/usuarios', {
        method: 'POST',
        body: JSON.stringify({
          username,
          email,
          password,
          estado,
          bomberoId: bomberoId || undefined,
          rolesIds: rolesSeleccionados,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'Error al crear usuario');
      }
      setUsername('');
      setEmail('');
      setPassword('');
      setEstado('ACTIVO');
      setBomberoId('');
      setRolesSeleccionados([]);
      setMostrarForm(false);
      setMensaje('Usuario creado correctamente');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreando(false);
    }
  }

  async function bloquear(id: string, bloquear: boolean) {
    setError(null);
    const res = await apiFetch(`/seguridad/usuarios/${id}/bloqueo`, {
      method: 'PATCH',
      body: JSON.stringify({ bloquear }),
    });
    if (!res.ok) {
      setError('No se pudo actualizar el bloqueo');
      return;
    }
    await cargar();
  }

  async function darBaja(id: string) {
    setError(null);
    const motivo = window.prompt('Motivo de la baja (opcional):') ?? undefined;
    const res = await apiFetch(`/seguridad/usuarios/${id}/baja`, {
      method: 'PATCH',
      body: JSON.stringify({ motivo }),
    });
    if (!res.ok) {
      setError('No se pudo dar de baja al usuario');
      return;
    }
    await cargar();
  }

  async function resetearPassword(id: string) {
    setError(null);
    const nueva = window.prompt('Nueva contrasena temporal (min 8, mayuscula, minuscula, numero y especial):');
    if (!nueva) return;
    const res = await apiFetch(`/seguridad/usuarios/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ passwordNueva: nueva, forzarCambio: true }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo resetear la contrasena');
      return;
    }
    setMensaje('Contrasena reseteada. El usuario debera cambiarla en su proximo inicio de sesion.');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Usuarios ({usuarios?.length ?? 0})</h2>
        <button className="btn-primary" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : 'Nuevo usuario'}
        </button>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {mostrarForm && (
        <form className="card" onSubmit={crearUsuario} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Usuario</label>
              <input className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Email</label>
              <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Contrasena</label>
              <input
                className="input-field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8, Aa1!"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
              <select className="input-field" value={estado} onChange={(e) => setEstado(e.target.value)}>
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                Vincular a Personal (opcional)
              </label>
              <select className="input-field" value={bomberoId} onChange={(e) => setBomberoId(e.target.value)}>
                <option value="">-- ninguno --</option>
                {bomberos.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.numeroBombero} - {b.nombre} {b.apellido}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Roles</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {roles.map((r) => (
                <label key={r.id} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="checkbox"
                    checked={rolesSeleccionados.includes(r.id)}
                    onChange={() => toggleRol(r.id)}
                  />
                  {r.nombre}
                </label>
              ))}
            </div>
          </div>

          <button className="btn-primary" disabled={creando} style={{ alignSelf: 'flex-start' }}>
            {creando ? 'Creando...' : 'Crear usuario'}
          </button>
        </form>
      )}

      {usuarios && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Usuario</th>
              <th style={{ padding: '6px 4px' }}>Email</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              <th style={{ padding: '6px 4px' }}>Roles</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => {
              const bloqueado = !!(u.bloqueadoHasta && new Date(u.bloqueadoHasta) > new Date());
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>
                    <Link href={`/dashboard/seguridad/usuarios/${u.id}`} style={{ textDecoration: 'underline' }}>
                      {u.username}
                    </Link>
                  </td>
                  <td style={{ padding: '6px 4px' }}>{u.email}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge">{u.estado}</span>
                    {bloqueado && (
                      <span className="badge" style={{ marginLeft: 4, background: '#7f1d1d' }}>
                        BLOQUEADO
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    {u.roles.map((r) => (
                      <span key={r.id} className="badge" style={{ marginRight: 4, background: r.color }}>
                        {r.nombre}
                      </span>
                    ))}
                  </td>
                  <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => bloquear(u.id, !bloqueado)}>
                      {bloqueado ? 'Desbloquear' : 'Bloquear'}
                    </button>
                    <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => resetearPassword(u.id)}>
                      Resetear password
                    </button>
                    <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }} onClick={() => darBaja(u.id)}>
                      Dar de baja
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
