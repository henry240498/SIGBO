'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_ORIGIN, apiFetch, logout, obtenerSesion, Sesion } from '@/lib/api';
import { MODULOS, moduloVisible } from '@/lib/modulos';

interface Apariencia {
  nombreSistemaMenu: string | null;
  subtituloMenu: string | null;
  logoMenu: string | null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [apariencia, setApariencia] = useState<Apariencia | null>(null);

  useEffect(() => {
    const s = obtenerSesion();
    if (!s) {
      router.replace('/login');
      return;
    }
    setSesion(s);
  }, [router]);

  useEffect(() => {
    apiFetch('/seguridad/apariencia')
      .then(async (res) => (res.ok ? setApariencia(await res.json()) : null))
      .catch(() => undefined);
  }, []);

  async function onLogout() {
    await logout();
    router.push('/login');
  }

  if (!sesion) return null;

  const modulosVisibles = MODULOS.filter((m) => moduloVisible(m, sesion.usuario.permisos));
  const slugActual = pathname.split('/')[2];
  const moduloActual = MODULOS.find((m) => m.slug === slugActual);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          width: 240,
          flexShrink: 0,
          borderRight: '1px solid #334155',
          padding: '20px 14px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ marginBottom: 24, paddingLeft: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          {apariencia?.logoMenu ? (
            <img
              src={`${API_ORIGIN}${apariencia.logoMenu}`}
              alt="Logo"
              style={{ width: 28, height: 28, objectFit: 'contain' }}
            />
          ) : (
            <div style={{ fontSize: 22 }}>🚒</div>
          )}
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{apariencia?.nombreSistemaMenu || 'SIGBO-CBVC'}</div>
            {apariencia?.subtituloMenu && (
              <div style={{ fontSize: 10, color: '#94a3b8' }}>{apariencia.subtituloMenu}</div>
            )}
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflowY: 'auto' }}>
          <MenuLink href="/dashboard" icono="🏠" nombre="Inicio" activo={pathname === '/dashboard'} />
          {modulosVisibles.map((m) => (
            <MenuLink
              key={m.slug}
              href={`/dashboard/${m.slug}`}
              icono={m.icono}
              nombre={m.nombre}
              activo={slugActual === m.slug}
              proximamente={!m.disponible}
            />
          ))}
        </nav>

        <div style={{ borderTop: '1px solid #334155', paddingTop: 10, marginTop: 6 }}>
          <MenuLink
            href="/dashboard/mi-perfil"
            icono="👤"
            nombre="Mi Perfil"
            activo={pathname === '/dashboard/mi-perfil'}
          />
        </div>

        <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={onLogout}>
          Cerrar sesion
        </button>
      </aside>

      <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1100 }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>
            {moduloActual ? `${moduloActual.icono} ${moduloActual.nombre}` : '🏠 Inicio'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>{sesion.usuario.username}</span>
            <span className="badge">{sesion.usuario.roles.length} roles</span>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

function MenuLink({
  href,
  icono,
  nombre,
  activo,
  proximamente,
}: {
  href: string;
  icono: string;
  nombre: string;
  activo: boolean;
  proximamente?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 10px',
        borderRadius: 8,
        fontSize: 14,
        textDecoration: 'none',
        color: activo ? '#e2e8f0' : '#94a3b8',
        background: activo ? '#1e293b' : 'transparent',
        fontWeight: activo ? 600 : 400,
      }}
    >
      <span>{icono}</span>
      <span style={{ flex: 1 }}>{nombre}</span>
      {proximamente && <span style={{ fontSize: 10, color: '#64748b' }}>pronto</span>}
    </Link>
  );
}
