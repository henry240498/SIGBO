'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { API_ORIGIN, apiFetch, login } from '@/lib/api';

interface Apariencia {
  logoLogin: string | null;
  fondoLogin: string | null;
  textoBajoLogo: string | null;
  nombreSistemaMenu: string | null;
}

function IconoUsuario() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function IconoCandado() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ flexShrink: 0 }}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [apariencia, setApariencia] = useState<Apariencia | null>(null);

  useEffect(() => {
    apiFetch('/seguridad/apariencia')
      .then(async (res) => (res.ok ? setApariencia(await res.json()) : null))
      .catch(() => undefined);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await login(usernameOrEmail, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesion');
    } finally {
      setCargando(false);
    }
  }

  const fondoUrl = apariencia?.fondoLogin ? `${API_ORIGIN}${apariencia.fondoLogin}` : null;
  const logoUrl = apariencia?.logoLogin ? `${API_ORIGIN}${apariencia.logoLogin}` : null;

  return (
    <main
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        backgroundImage: fondoUrl
          ? `linear-gradient(rgba(15,23,42,0.35), rgba(15,23,42,0.55)), url(${fondoUrl})`
          : 'radial-gradient(circle at 30% 20%, #1e293b, #0f172a 70%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <form
        onSubmit={onSubmit}
        className="card"
        style={{
          width: 360,
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo"
              style={{ width: 76, height: 76, objectFit: 'contain', margin: '0 auto 8px' }}
            />
          ) : (
            <div style={{ fontSize: 36, marginBottom: 4 }}>🚒</div>
          )}
          <h1 style={{ fontSize: 19, fontWeight: 700 }}>{apariencia?.nombreSistemaMenu || 'SIGBO-CBVC'}</h1>
          {apariencia?.textoBajoLogo && (
            <p style={{ fontSize: 12, color: '#cbd5e1', marginTop: 6 }}>{apariencia.textoBajoLogo}</p>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid rgba(148, 163, 184, 0.18)',
            borderRadius: 14,
            padding: '15px 18px',
            marginBottom: 16,
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <IconoUsuario />
          <label className="sr-only" htmlFor="login-usuario">Usuario o correo electrónico</label>
          <input
            id="login-usuario"
            name="username"
            type="text"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            placeholder="Usuario"
            autoComplete="username"
            aria-describedby={error ? 'login-error' : undefined}
            aria-invalid={Boolean(error)}
            autoFocus
            required
            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, color: '#e2e8f0', fontSize: 16 }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid rgba(148, 163, 184, 0.18)',
            borderRadius: 14,
            padding: '15px 18px',
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <IconoCandado />
          <label className="sr-only" htmlFor="login-contrasena">Contraseña</label>
          <input
            id="login-contrasena"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contrasena"
            autoComplete="current-password"
            aria-describedby={error ? 'login-error' : undefined}
            aria-invalid={Boolean(error)}
            required
            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, color: '#e2e8f0', fontSize: 16 }}
          />
        </div>

        {error && <p id="login-error" role="alert" style={{ color: '#f87171', fontSize: 13, marginTop: 14 }}>{error}</p>}

        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 20 }} disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Iniciar Sesion'}
        </button>
      </form>
    </main>
  );
}
