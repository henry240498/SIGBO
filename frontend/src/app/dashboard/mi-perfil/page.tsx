'use client';

import { useEffect, useState } from 'react';
import { API_ORIGIN, apiFetch } from '@/lib/api';

interface Contacto {
  numero?: string;
  correo?: string;
  etiqueta?: string | null;
}

interface Perfil {
  avatarUrl: string | null;
  whatsapp: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  xUrl: string | null;
  telefonos: { numero: string; etiqueta: string | null }[];
  correos: { correo: string; etiqueta: string | null }[];
  puedeEditar: boolean;
}

export default function MiPerfilPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [telefonos, setTelefonos] = useState<Contacto[]>([]);
  const [correos, setCorreos] = useState<Contacto[]>([]);
  const [whatsapp, setWhatsapp] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [xUrl, setXUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [mensajePassword, setMensajePassword] = useState<string | null>(null);

  async function cargar() {
    const res = await apiFetch('/seguridad/mi-perfil');
    if (!res.ok) {
      setError('No se pudo cargar tu perfil');
      return;
    }
    const data: Perfil = await res.json();
    setPerfil(data);
    setTelefonos(data.telefonos.length ? data.telefonos : [{ numero: '', etiqueta: '' }]);
    setCorreos(data.correos.length ? data.correos : [{ correo: '', etiqueta: '' }]);
    setWhatsapp(data.whatsapp ?? '');
    setFacebookUrl(data.facebookUrl ?? '');
    setInstagramUrl(data.instagramUrl ?? '');
    setXUrl(data.xUrl ?? '');
  }

  useEffect(() => {
    cargar().catch((err) => setError(err.message));
  }, []);

  async function cambiarPassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorPassword(null);
    setMensajePassword(null);
    const res = await apiFetch('/seguridad/me/password', {
      method: 'POST',
      body: JSON.stringify({ passwordActual, passwordNueva }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErrorPassword(
        Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo cambiar la contrasena',
      );
      return;
    }
    setPasswordActual('');
    setPasswordNueva('');
    setMensajePassword('Contrasena actualizada correctamente');
  }

  async function subirFoto(archivo: File) {
    setError(null);
    setSubiendoFoto(true);
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);
      const res = await fetch(`${API_ORIGIN}/api/v1/seguridad/mi-perfil/foto`, {
        method: 'PUT',
        headers: { 'X-SIGBO-Request': '1' },
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo subir la foto');
      }
      setMensaje('Foto de perfil actualizada');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubiendoFoto(false);
    }
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      const res = await apiFetch('/seguridad/mi-perfil', {
        method: 'PUT',
        body: JSON.stringify({
          whatsapp: whatsapp || undefined,
          facebookUrl: facebookUrl || undefined,
          instagramUrl: instagramUrl || undefined,
          xUrl: xUrl || undefined,
          telefonos: telefonos
            .filter((t) => t.numero && t.numero.trim())
            .map((t) => ({ numero: t.numero!.trim(), etiqueta: t.etiqueta || undefined })),
          correos: correos
            .filter((c) => c.correo && c.correo.trim())
            .map((c) => ({ correo: c.correo!.trim(), etiqueta: c.etiqueta || undefined })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo guardar tu perfil');
      }
      setMensaje('Perfil actualizado correctamente');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (!perfil) return <p style={{ color: '#94a3b8' }}>Cargando...</p>;

  const bloqueado = !perfil.puedeEditar;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
      {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {bloqueado && (
        <section className="card" style={{ borderColor: '#b45309', background: '#451a03' }}>
          <p style={{ fontSize: 13 }}>
            ⚠ La edicion de tus datos personales (foto, telefonos, correos y redes sociales) esta
            bloqueada por el Administrador. Solo el cambio de contrasena sigue disponible. Contacte a
            soporte para realizar cambios.
          </p>
        </section>
      )}

      {/* Contraseña: SIEMPRE habilitado, sin importar la politica */}
      <section className="card">
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Cambiar mi contrasena</h2>
        <form onSubmit={cambiarPassword} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360 }}>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Contrasena actual</label>
            <input
              className="input-field"
              type="password"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Contrasena nueva</label>
            <input
              className="input-field"
              type="password"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              placeholder="Min 8, Aa1!"
              required
            />
          </div>
          {errorPassword && <p style={{ color: '#f87171', fontSize: 13 }}>{errorPassword}</p>}
          {mensajePassword && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensajePassword}</p>}
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
            Guardar contrasena
          </button>
        </form>
      </section>

      <section className="card">
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Foto de perfil</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {perfil.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${API_ORIGIN}/api/v1/seguridad/mi-perfil/foto`}
              alt="Foto de perfil"
              style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: '50%', border: '1px solid #334155' }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                border: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
              }}
            >
              👤
            </div>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            disabled={bloqueado || subiendoFoto}
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) subirFoto(archivo);
              e.target.value = '';
            }}
            style={{ fontSize: 12 }}
          />
          {subiendoFoto && <span style={{ fontSize: 12, color: '#94a3b8' }}>Subiendo...</span>}
        </div>
      </section>

      <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <section className="card">
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Telefonos</h2>
          {telefonos.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                className="input-field"
                placeholder="Numero"
                value={t.numero ?? ''}
                disabled={bloqueado}
                onChange={(e) =>
                  setTelefonos((prev) => prev.map((x, idx) => (idx === i ? { ...x, numero: e.target.value } : x)))
                }
              />
              <input
                className="input-field"
                placeholder="Etiqueta (opcional)"
                style={{ maxWidth: 160 }}
                value={t.etiqueta ?? ''}
                disabled={bloqueado}
                onChange={(e) =>
                  setTelefonos((prev) => prev.map((x, idx) => (idx === i ? { ...x, etiqueta: e.target.value } : x)))
                }
              />
              {!bloqueado && (
                <button
                  type="button"
                  onClick={() => setTelefonos((prev) => prev.filter((_, idx) => idx !== i))}
                  style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                >
                  quitar
                </button>
              )}
            </div>
          ))}
          {!bloqueado && (
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '4px 10px', fontSize: 12 }}
              onClick={() => setTelefonos((prev) => [...prev, { numero: '', etiqueta: '' }])}
            >
              + Agregar telefono
            </button>
          )}
        </section>

        <section className="card">
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Correos electronicos</h2>
          {correos.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                className="input-field"
                placeholder="Correo"
                value={c.correo ?? ''}
                disabled={bloqueado}
                onChange={(e) =>
                  setCorreos((prev) => prev.map((x, idx) => (idx === i ? { ...x, correo: e.target.value } : x)))
                }
              />
              <input
                className="input-field"
                placeholder="Etiqueta (opcional)"
                style={{ maxWidth: 160 }}
                value={c.etiqueta ?? ''}
                disabled={bloqueado}
                onChange={(e) =>
                  setCorreos((prev) => prev.map((x, idx) => (idx === i ? { ...x, etiqueta: e.target.value } : x)))
                }
              />
              {!bloqueado && (
                <button
                  type="button"
                  onClick={() => setCorreos((prev) => prev.filter((_, idx) => idx !== i))}
                  style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                >
                  quitar
                </button>
              )}
            </div>
          ))}
          {!bloqueado && (
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '4px 10px', fontSize: 12 }}
              onClick={() => setCorreos((prev) => [...prev, { correo: '', etiqueta: '' }])}
            >
              + Agregar correo
            </button>
          )}
        </section>

        <section className="card">
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Redes sociales</h2>
          <RedSocial
            etiqueta="WhatsApp"
            placeholder="+595 981 234567"
            valor={whatsapp}
            onChange={setWhatsapp}
            disabled={bloqueado}
            href={whatsapp ? `https://wa.me/${whatsapp.replace(/[^\d]/g, '')}` : null}
          />
          <RedSocial
            etiqueta="Facebook"
            placeholder="https://facebook.com/..."
            valor={facebookUrl}
            onChange={setFacebookUrl}
            disabled={bloqueado}
            href={facebookUrl || null}
          />
          <RedSocial
            etiqueta="Instagram"
            placeholder="https://instagram.com/..."
            valor={instagramUrl}
            onChange={setInstagramUrl}
            disabled={bloqueado}
            href={instagramUrl || null}
          />
          <RedSocial
            etiqueta="X (Twitter)"
            placeholder="https://x.com/..."
            valor={xUrl}
            onChange={setXUrl}
            disabled={bloqueado}
            href={xUrl || null}
          />
        </section>

        <button type="submit" className="btn-primary" disabled={bloqueado || guardando} style={{ alignSelf: 'flex-start' }}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}

function RedSocial({
  etiqueta,
  placeholder,
  valor,
  onChange,
  disabled,
  href,
}: {
  etiqueta: string;
  placeholder: string;
  valor: string;
  onChange: (v: string) => void;
  disabled: boolean;
  href: string | null;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span>{etiqueta}</span>
        {href && (
          <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>
            Abrir enlace ↗
          </a>
        )}
      </label>
      <input
        className="input-field"
        placeholder={placeholder}
        value={valor}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
