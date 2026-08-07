'use client';

import { useEffect, useState } from 'react';
import { API_ORIGIN, apiFetch, obtenerSesion } from '@/lib/api';

interface Apariencia {
  logoLogin: string | null;
  fondoLogin: string | null;
  textoBajoLogo: string | null;
  nombreSistemaMenu: string | null;
  subtituloMenu: string | null;
  logoMenu: string | null;
  perfilEdicionLibre: boolean;
}

function urlImagen(ruta: string | null): string | null {
  return ruta ? `${API_ORIGIN}${ruta}` : null;
}

export default function AparienciaPage() {
  const [tienePermiso, setTienePermiso] = useState(false);
  const [tienePermisoPolitica, setTienePermisoPolitica] = useState(false);
  const [config, setConfig] = useState<Apariencia | null>(null);
  const [guardandoPolitica, setGuardandoPolitica] = useState(false);
  const [textoBajoLogo, setTextoBajoLogo] = useState('');
  const [nombreSistemaMenu, setNombreSistemaMenu] = useState('');
  const [subtituloMenu, setSubtituloMenu] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState<string | null>(null);

  async function cargar() {
    const res = await apiFetch('/seguridad/apariencia');
    if (!res.ok) {
      setError('No se pudo cargar la configuracion de apariencia');
      return;
    }
    const data: Apariencia = await res.json();
    setConfig(data);
    setTextoBajoLogo(data.textoBajoLogo ?? '');
    setNombreSistemaMenu(data.nombreSistemaMenu ?? '');
    setSubtituloMenu(data.subtituloMenu ?? '');
  }

  useEffect(() => {
    const sesion = obtenerSesion();
    setTienePermiso(!!sesion?.usuario.permisos.includes('seguridad:configurar_apariencia'));
    setTienePermisoPolitica(!!sesion?.usuario.permisos.includes('seguridad:configurar_politica_perfil'));
    cargar().catch((err) => setError(err.message));
  }, []);

  async function cambiarPolitica(libre: boolean) {
    setError(null);
    setGuardandoPolitica(true);
    try {
      const res = await apiFetch('/seguridad/apariencia/politica-perfil', {
        method: 'PUT',
        body: JSON.stringify({ perfilEdicionLibre: libre }),
      });
      if (!res.ok) throw new Error('No se pudo cambiar la politica');
      setMensaje(`Politica actualizada: modo ${libre ? 'Libre' : 'Fijo'}`);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardandoPolitica(false);
    }
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      const res = await apiFetch('/seguridad/apariencia', {
        method: 'PUT',
        body: JSON.stringify({
          textoBajoLogo: textoBajoLogo || undefined,
          nombreSistemaMenu: nombreSistemaMenu || undefined,
          subtituloMenu: subtituloMenu || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo guardar la apariencia');
      }
      setMensaje('Apariencia actualizada');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function subirImagen(campo: 'logo-login' | 'fondo-login' | 'logo-menu', archivo: File) {
    setError(null);
    setSubiendo(campo);
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);
      const sesion = obtenerSesion();
      const headers: HeadersInit = {};
      if (sesion) headers['Authorization'] = `Bearer ${sesion.accessToken}`;

      const res = await fetch(`${API_ORIGIN}/api/v1/seguridad/apariencia/imagen/${campo}`, {
        method: 'PUT',
        headers,
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? 'No se pudo subir la imagen');
      }
      setMensaje('Imagen actualizada');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubiendo(null);
    }
  }

  if (!tienePermiso && !tienePermisoPolitica) {
    return (
      <p style={{ color: '#94a3b8', fontSize: 13 }}>
        Solo un usuario con el permiso <code>seguridad:configurar_apariencia</code> o{' '}
        <code>seguridad:configurar_politica_perfil</code> (rol Administrador General) puede acceder
        a esta seccion.
      </p>
    );
  }

  if (!config) return <p style={{ color: '#94a3b8' }}>Cargando...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {tienePermisoPolitica && (
        <section className="card">
          <h2 style={{ fontSize: 16, marginBottom: 6 }}>Politica de edicion de datos personales</h2>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
            Controla si los usuarios pueden editar su propia foto, telefonos, correos y redes
            sociales desde &quot;Mi Perfil&quot;. El cambio de contrasena nunca se ve afectado por
            esta politica.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn-primary"
              disabled={guardandoPolitica}
              style={{ background: config.perfilEdicionLibre ? '#16a34a' : '#334155' }}
              onClick={() => cambiarPolitica(true)}
            >
              Modo Libre {config.perfilEdicionLibre && '✓'}
            </button>
            <button
              className="btn-primary"
              disabled={guardandoPolitica}
              style={{ background: !config.perfilEdicionLibre ? '#7f1d1d' : '#334155' }}
              onClick={() => cambiarPolitica(false)}
            >
              Modo Fijo (bloqueado) {!config.perfilEdicionLibre && '✓'}
            </button>
          </div>
        </section>
      )}

      {tienePermiso && (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <section className="card">
          <h2 style={{ fontSize: 16, marginBottom: 14 }}>Pantalla de login</h2>

          <ImagenField
            etiqueta="Imagen de fondo (login)"
            valor={urlImagen(config.fondoLogin)}
            subiendo={subiendo === 'fondo-login'}
            onArchivo={(f) => subirImagen('fondo-login', f)}
          />
          <ImagenField
            etiqueta="Logo (login)"
            valor={urlImagen(config.logoLogin)}
            subiendo={subiendo === 'logo-login'}
            onArchivo={(f) => subirImagen('logo-login', f)}
          />

          <form onSubmit={guardar} style={{ marginTop: 14 }}>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              Nombre del sistema <span style={{ color: '#64748b' }}>(titulo en el login y en el menu)</span>
            </label>
            <input
              className="input-field"
              value={nombreSistemaMenu}
              onChange={(e) => setNombreSistemaMenu(e.target.value)}
              placeholder="SIGBO-CBVC"
              maxLength={100}
            />
            <div style={{ height: 10 }} />
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Texto debajo del logo (login)</label>
            <input
              className="input-field"
              value={textoBajoLogo}
              onChange={(e) => setTextoBajoLogo(e.target.value)}
              placeholder="Cuerpo de Bomberos Voluntarios Carapegua"
              maxLength={200}
            />

            <h2 style={{ fontSize: 16, margin: '20px 0 14px' }}>Menu principal</h2>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Subtitulo del sistema</label>
            <input
              className="input-field"
              value={subtituloMenu}
              onChange={(e) => setSubtituloMenu(e.target.value)}
              placeholder="Panel principal"
              maxLength={200}
            />

            <button className="btn-primary" disabled={guardando} style={{ marginTop: 16 }}>
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>

          <div style={{ marginTop: 20 }}>
            <ImagenField
              etiqueta="Logo (menu)"
              valor={urlImagen(config.logoMenu)}
              subiendo={subiendo === 'logo-menu'}
              onArchivo={(f) => subirImagen('logo-menu', f)}
            />
          </div>
        </section>

        <section className="card">
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Vista previa - Login</h2>
          <div
            style={{
              borderRadius: 10,
              overflow: 'hidden',
              height: 300,
              position: 'relative',
              backgroundColor: '#0f172a',
              backgroundImage: config.fondoLogin ? `url(${urlImagen(config.fondoLogin)})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid #334155',
                borderRadius: 10,
                padding: '20px 24px',
                width: 200,
                textAlign: 'center',
              }}
            >
              {config.logoLogin ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urlImagen(config.logoLogin)!} alt="Logo" style={{ width: 56, height: 56, objectFit: 'contain', margin: '0 auto' }} />
              ) : (
                <div style={{ fontSize: 34 }}>🚒</div>
              )}
              <p style={{ fontSize: 14, fontWeight: 700, marginTop: 6 }}>{nombreSistemaMenu || 'SIGBO-CBVC'}</p>
              {textoBajoLogo && <p style={{ fontSize: 10, color: '#cbd5e1', marginTop: 4 }}>{textoBajoLogo}</p>}
              <div style={{ marginTop: 12, height: 22, border: '1px solid #475569', borderRadius: 6 }} />
              <div style={{ marginTop: 6, height: 22, border: '1px solid #475569', borderRadius: 6 }} />
              <div style={{ marginTop: 8, height: 22, background: '#2563eb', borderRadius: 6 }} />
            </div>
          </div>

          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Vista previa - Menu</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, border: '1px solid #334155', borderRadius: 8 }}>
            {config.logoMenu ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={urlImagen(config.logoMenu)!} alt="Logo menu" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: 20 }}>🚒</span>
            )}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{nombreSistemaMenu || 'SIGBO-CBVC'}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>{subtituloMenu || 'Panel principal'}</div>
            </div>
          </div>
        </section>
      </div>
      )}
    </div>
  );
}

function ImagenField({
  etiqueta,
  valor,
  subiendo,
  onArchivo,
}: {
  etiqueta: string;
  valor: string | null;
  subiendo: boolean;
  onArchivo: (archivo: File) => void;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>{etiqueta}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {valor && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={valor} alt={etiqueta} style={{ width: 36, height: 36, objectFit: 'contain', border: '1px solid #334155', borderRadius: 6 }} />
        )}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          disabled={subiendo}
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            if (archivo) onArchivo(archivo);
            e.target.value = '';
          }}
          style={{ fontSize: 12, color: '#94a3b8' }}
        />
        {subiendo && <span style={{ fontSize: 11, color: '#94a3b8' }}>Subiendo...</span>}
      </div>
    </div>
  );
}
