'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_ORIGIN, apiFetch } from '@/lib/api';
import { Cargando } from '@/app/components/Cargando';
import { Aviso } from '@/app/components/Aviso';

interface Rol {
  id: string;
  nombre: string;
  color: string;
}

interface Permiso {
  id: string;
  nombre: string;
  categoria: string | null;
}

interface Sesion {
  id: string;
  ip: string | null;
  userAgent: string | null;
  fechaInicio: string;
  fechaUltimaActividad: string;
}

interface AuditoriaItem {
  id: string;
  accion: string;
  recurso: string;
  fecha: string;
  ip: string | null;
}

interface PermisoDirecto {
  permisoId: string;
  nombre: string;
  categoria: string | null;
  concedido: boolean;
  motivo: string | null;
}

interface PerfilAdmin {
  avatarUrl: string | null;
  whatsapp: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  xUrl: string | null;
  telefonos: { numero: string; etiqueta: string | null }[];
  correos: { correo: string; etiqueta: string | null }[];
}

interface Detalle {
  usuario: {
    id: string;
    username: string;
    email: string;
    estado: string;
    ultimoAcceso: string | null;
    ipUltimoAcceso: string | null;
    intentosFallidos: number;
    bloqueadoHasta: string | null;
    twoFactorEnabled: boolean;
    debeCambiarPassword: boolean;
    passwordExpiraEn: string | null;
  };
  roles: Rol[];
  permisos: string[];
  permisosDirectos: PermisoDirecto[];
  sesiones: Sesion[];
  auditoria: AuditoriaItem[];
}

export default function UsuarioDetallePage() {
  const params = useParams<{ id: string }>();
  const [detalle, setDetalle] = useState<Detalle | null>(null);
  const [todosRoles, setTodosRoles] = useState<Rol[]>([]);
  const [todosPermisos, setTodosPermisos] = useState<Permiso[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [rolesSeleccionados, setRolesSeleccionados] = useState<string[]>([]);
  const [permisoNuevo, setPermisoNuevo] = useState('');

  const [perfilAdmin, setPerfilAdmin] = useState<PerfilAdmin | null>(null);
  const [telefonosAdmin, setTelefonosAdmin] = useState<{ numero: string; etiqueta: string | null }[]>([]);
  const [correosAdmin, setCorreosAdmin] = useState<{ correo: string; etiqueta: string | null }[]>([]);
  const [whatsappAdmin, setWhatsappAdmin] = useState('');
  const [facebookAdmin, setFacebookAdmin] = useState('');
  const [instagramAdmin, setInstagramAdmin] = useState('');
  const [xAdmin, setXAdmin] = useState('');
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [subiendoFotoAdmin, setSubiendoFotoAdmin] = useState(false);

  async function cargar() {
    try {
      const [dRes, rRes, pRes, perfilRes] = await Promise.all([
        apiFetch(`/seguridad/usuarios/${params.id}/detalle`),
        apiFetch('/seguridad/roles'),
        apiFetch('/seguridad/permisos'),
        apiFetch(`/seguridad/usuarios/${params.id}/perfil`),
      ]);
      if (!dRes.ok) throw new Error('No se pudo cargar el detalle del usuario');
      const d: Detalle = await dRes.json();
      setDetalle(d);
      setRolesSeleccionados(d.roles.map((r) => r.id));
      if (rRes.ok) setTodosRoles(await rRes.json());
      if (pRes.ok) setTodosPermisos(await pRes.json());
      if (perfilRes.ok) {
        const p: PerfilAdmin = await perfilRes.json();
        setPerfilAdmin(p);
        setTelefonosAdmin(p.telefonos.length ? p.telefonos : [{ numero: '', etiqueta: '' }]);
        setCorreosAdmin(p.correos.length ? p.correos : [{ correo: '', etiqueta: '' }]);
        setWhatsappAdmin(p.whatsapp ?? '');
        setFacebookAdmin(p.facebookUrl ?? '');
        setInstagramAdmin(p.instagramUrl ?? '');
        setXAdmin(p.xUrl ?? '');
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function guardarPerfilAdmin() {
    setError(null);
    setGuardandoPerfil(true);
    try {
      const res = await apiFetch(`/seguridad/usuarios/${params.id}/perfil`, {
        method: 'PUT',
        body: JSON.stringify({
          whatsapp: whatsappAdmin || undefined,
          facebookUrl: facebookAdmin || undefined,
          instagramUrl: instagramAdmin || undefined,
          xUrl: xAdmin || undefined,
          telefonos: telefonosAdmin
            .filter((t) => t.numero.trim())
            .map((t) => ({ numero: t.numero.trim(), etiqueta: t.etiqueta || undefined })),
          correos: correosAdmin
            .filter((c) => c.correo.trim())
            .map((c) => ({ correo: c.correo.trim(), etiqueta: c.etiqueta || undefined })),
        }),
      });
      if (!res.ok) throw new Error('No se pudo guardar el perfil del usuario');
      setMensaje('Datos personales actualizados');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardandoPerfil(false);
    }
  }

  async function subirFotoAdmin(archivo: File) {
    setError(null);
    setSubiendoFotoAdmin(true);
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);
      const res = await fetch(`${API_ORIGIN}/api/v1/seguridad/usuarios/${params.id}/perfil/foto`, {
        method: 'PUT',
        headers: { 'X-SIGBO-Request': '1' },
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('No se pudo subir la foto');
      setMensaje('Foto actualizada');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubiendoFotoAdmin(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  function toggleRol(id: string) {
    setRolesSeleccionados((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }

  async function guardarRoles() {
    setError(null);
    const res = await apiFetch(`/seguridad/usuarios/${params.id}/roles`, {
      method: 'PUT',
      body: JSON.stringify({ rolesIds: rolesSeleccionados }),
    });
    if (!res.ok) {
      setError('No se pudieron actualizar los roles');
      return;
    }
    setMensaje('Roles actualizados');
    await cargar();
  }

  async function aplicarPermisoDirecto(concedido: boolean) {
    if (!permisoNuevo) return;
    setError(null);
    const res = await apiFetch(`/seguridad/usuarios/${params.id}/permisos`, {
      method: 'PUT',
      body: JSON.stringify({ permisoId: permisoNuevo, concedido }),
    });
    if (!res.ok) {
      setError('No se pudo aplicar el permiso directo');
      return;
    }
    setPermisoNuevo('');
    await cargar();
  }

  async function quitarPermisoDirecto(permisoId: string) {
    setError(null);
    const res = await apiFetch(`/seguridad/usuarios/${params.id}/permisos/${permisoId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      setError('No se pudo quitar el permiso directo');
      return;
    }
    await cargar();
  }

  async function cerrarSesion(id: string) {
    setError(null);
    const res = await apiFetch(`/seguridad/sesiones/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setError('No se pudo cerrar la sesion');
      return;
    }
    await cargar();
  }

  if (error && !detalle) return <p style={{ color: 'var(--danger)' }}>{error}</p>;
  if (!detalle) return <Cargando texto="Cargando…" />;

  const { usuario } = detalle;
  const permisosPorCategoria = new Map<string, Permiso[]>();
  for (const p of todosPermisos) {
    const cat = p.categoria ?? 'Otros';
    if (!permisosPorCategoria.has(cat)) permisosPorCategoria.set(cat, []);
    permisosPorCategoria.get(cat)!.push(p);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      <section className="card">
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>{usuario.username}</h2>
        <p style={{ marginBottom: 4 }}>
          <strong>Email:</strong> {usuario.email}
        </p>
        <p style={{ marginBottom: 4 }}>
          <strong>Estado:</strong> <span className="badge">{usuario.estado}</span>
        </p>
        <p style={{ marginBottom: 4 }}>
          <strong>Ultimo acceso:</strong>{' '}
          {usuario.ultimoAcceso ? new Date(usuario.ultimoAcceso).toLocaleString('es-PY') : '—'} (
          {usuario.ipUltimoAcceso ?? '—'})
        </p>
        <p style={{ marginBottom: 4 }}>
          <strong>Intentos fallidos:</strong> {usuario.intentosFallidos}
        </p>
        <p style={{ marginBottom: 4 }}>
          <strong>2FA:</strong> {usuario.twoFactorEnabled ? 'Activado' : 'Desactivado'}
        </p>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          {usuario.debeCambiarPassword && 'Debe cambiar su contrasena. '}
          {usuario.passwordExpiraEn &&
            `Contrasena expira: ${new Date(usuario.passwordExpiraEn).toLocaleDateString('es-PY')}`}
        </p>
      </section>

      <section className="card">
        <h2 style={{ fontSize: 15, marginBottom: 12 }}>
          Datos personales <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>(edicion de administrador, no pasa por la politica Libre/Fijo)</span>
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          {perfilAdmin?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${API_ORIGIN}/api/v1/seguridad/usuarios/${params.id}/perfil/foto`}
              alt="Foto"
              style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--line)' }}
            />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              👤
            </div>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            disabled={subiendoFotoAdmin}
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) subirFotoAdmin(archivo);
              e.target.value = '';
            }}
            style={{ fontSize: 12 }}
          />
          {subiendoFotoAdmin && <span style={{ fontSize: 12, color: 'var(--muted)' }}>Subiendo...</span>}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Telefonos</label>
          {telefonosAdmin.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <input
                className="input-field"
                placeholder="Numero"
                value={t.numero}
                onChange={(e) => setTelefonosAdmin((prev) => prev.map((x, idx) => (idx === i ? { ...x, numero: e.target.value } : x)))}
              />
              <input
                className="input-field"
                placeholder="Etiqueta"
                style={{ maxWidth: 140 }}
                value={t.etiqueta ?? ''}
                onChange={(e) => setTelefonosAdmin((prev) => prev.map((x, idx) => (idx === i ? { ...x, etiqueta: e.target.value } : x)))}
              />
              <button type="button" onClick={() => setTelefonosAdmin((prev) => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                quitar
              </button>
            </div>
          ))}
          <button type="button" className="btn-primary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setTelefonosAdmin((prev) => [...prev, { numero: '', etiqueta: '' }])}>
            + Agregar telefono
          </button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Correos</label>
          {correosAdmin.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <input
                className="input-field"
                placeholder="Correo"
                value={c.correo}
                onChange={(e) => setCorreosAdmin((prev) => prev.map((x, idx) => (idx === i ? { ...x, correo: e.target.value } : x)))}
              />
              <input
                className="input-field"
                placeholder="Etiqueta"
                style={{ maxWidth: 140 }}
                value={c.etiqueta ?? ''}
                onChange={(e) => setCorreosAdmin((prev) => prev.map((x, idx) => (idx === i ? { ...x, etiqueta: e.target.value } : x)))}
              />
              <button type="button" onClick={() => setCorreosAdmin((prev) => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                quitar
              </button>
            </div>
          ))}
          <button type="button" className="btn-primary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setCorreosAdmin((prev) => [...prev, { correo: '', etiqueta: '' }])}>
            + Agregar correo
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label htmlFor="whatsapp" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>WhatsApp</label>
            <input id="whatsapp" className="input-field" value={whatsappAdmin} onChange={(e) => setWhatsappAdmin(e.target.value)} placeholder="+595 981 234567" />
          </div>
          <div>
            <label htmlFor="facebook" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Facebook</label>
            <input id="facebook" className="input-field" value={facebookAdmin} onChange={(e) => setFacebookAdmin(e.target.value)} />
          </div>
          <div>
            <label htmlFor="instagram" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Instagram</label>
            <input id="instagram" className="input-field" value={instagramAdmin} onChange={(e) => setInstagramAdmin(e.target.value)} />
          </div>
          <div>
            <label htmlFor="x-twitter" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>X (Twitter)</label>
            <input id="x-twitter" className="input-field" value={xAdmin} onChange={(e) => setXAdmin(e.target.value)} />
          </div>
        </div>

        <button type="button" className="btn-primary" disabled={guardandoPerfil} onClick={guardarPerfilAdmin}>
          {guardandoPerfil ? 'Guardando...' : 'Guardar datos personales'}
        </button>
      </section>

      <section className="card">
        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Roles</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          {todosRoles.map((r) => (
            <label key={r.id} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
              <input type="checkbox" checked={rolesSeleccionados.includes(r.id)} onChange={() => toggleRol(r.id)} />
              {r.nombre}
            </label>
          ))}
        </div>
        <button type="button" className="btn-primary" onClick={guardarRoles}>
          Guardar roles
        </button>
      </section>

      <section className="card">
        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Permisos efectivos ({detalle.permisos.length})</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {detalle.permisos.map((p) => (
            <span key={p} className="badge">
              {p}
            </span>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Permisos directos (excepciones al rol)</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <select className="input-field" style={{ maxWidth: 320 }} value={permisoNuevo} onChange={(e) => setPermisoNuevo(e.target.value)}>
            <option value="">-- seleccionar permiso --</option>
            {[...permisosPorCategoria.entries()].map(([cat, ps]) => (
              <optgroup key={cat} label={cat}>
                {ps.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button type="button" className="btn-primary" style={{ background: '#16a34a' }} onClick={() => aplicarPermisoDirecto(true)}>
            Conceder
          </button>
          <button type="button" className="btn-primary" style={{ background: '#7f1d1d' }} onClick={() => aplicarPermisoDirecto(false)}>
            Denegar
          </button>
        </div>

        {detalle.permisosDirectos.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sin excepciones directas; usa solo los permisos de sus roles.</p>
        )}
        {detalle.permisosDirectos.map((pd) => (
          <div key={pd.permisoId} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 4 }}>
            <span className="badge" style={{ background: pd.concedido ? 'var(--ok-fill)' : 'var(--bad-fill)' }}>
              {pd.concedido ? 'Concedido' : 'Denegado'}
            </span>
            <span>{pd.nombre}</span>
            <button type="button"
              onClick={() => quitarPermisoDirecto(pd.permisoId)}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              quitar
            </button>
          </div>
        ))}
      </section>

      <section className="card">
        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Sesiones activas ({detalle.sesiones.length})</h2>
        {detalle.sesiones.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sin sesiones activas.</p>}
        {detalle.sesiones.map((s) => (
          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
            <span>
              {s.ip} — {new Date(s.fechaUltimaActividad).toLocaleString('es-PY')}
            </span>
            <button type="button"
              onClick={() => cerrarSesion(s.id)}
              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              cerrar
            </button>
          </div>
        ))}
      </section>

      <section className="card">
        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Historial de auditoria</h2>
        {detalle.auditoria.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sin actividad registrada.</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <tbody>
            {detalle.auditoria.map((a) => (
              <tr key={a.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge">{a.accion}</span>
                </td>
                <td style={{ padding: '6px 4px' }}>{a.recurso}</td>
                <td style={{ padding: '6px 4px', color: 'var(--muted)', textAlign: 'right' }}>
                  {new Date(a.fecha).toLocaleString('es-PY')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
