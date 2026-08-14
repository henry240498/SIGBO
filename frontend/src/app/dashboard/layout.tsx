'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_ORIGIN, apiFetch, logout, obtenerSesion, Sesion } from '@/lib/api';
import { MODULOS, moduloVisible, IconoModulo } from '@/lib/modulos';
import { SystemIcon } from '@/app/components/SystemIcon';

interface Apariencia { nombreSistemaMenu: string | null; subtituloMenu: string | null; logoMenu: string | null; }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [apariencia, setApariencia] = useState<Apariencia | null>(null);

  useEffect(() => {
    const current = obtenerSesion();
    if (!current) router.replace('/login');
    else setSesion(current);
    const sync=(event:StorageEvent)=>{if(event.key==='sigbo_sesion'&&!event.newValue)router.replace('/login')};
    window.addEventListener('storage',sync);
    return()=>window.removeEventListener('storage',sync);
  }, [router]);

  useEffect(() => {
    apiFetch('/seguridad/apariencia').then(async (res) => res.ok && setApariencia(await res.json())).catch(() => undefined);
  }, []);

  async function onLogout() { await logout(); router.push('/login'); }
  if (!sesion) return null;

  const modulosVisibles = MODULOS.filter((m) => moduloVisible(m, sesion.usuario.permisos));
  const slugActual = pathname.split('/')[2];
  const moduloActual = MODULOS.find((m) => m.slug === slugActual);
  const iniciales = sesion.usuario.username.slice(0, 2).toUpperCase();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand">
          <div className="brand-mark">
            {apariencia?.logoMenu ? <img src={`${API_ORIGIN}${apariencia.logoMenu}`} alt="" /> : <SystemIcon name="flame" size={23} />}
          </div>
          <div className="brand-copy">
            <div className="brand-title">{apariencia?.nombreSistemaMenu || 'SIGBO · CBVC'}</div>
            <div className="brand-subtitle">{apariencia?.subtituloMenu || 'Comando operativo'}</div>
          </div>
        </div>
        <div className="side-label">Centro de control</div>
        <nav className="side-nav" aria-label="Navegación principal">
          <MenuLink href="/dashboard" icono="home" nombre="Inicio" activo={pathname === '/dashboard'} />
          {modulosVisibles.map((m) => <MenuLink key={m.slug} href={`/dashboard/${m.slug}`} icono={m.icono} nombre={m.nombre} activo={slugActual === m.slug} proximamente={!m.disponible} />)}
        </nav>
        <div className="sidebar-footer">
          <MenuLink href="/dashboard/mi-perfil" icono="user" nombre="Mi perfil" activo={pathname === '/dashboard/mi-perfil'} />
          <button className="logout-button" onClick={onLogout}>Cerrar sesión</button>
        </div>
      </aside>

      <main className="app-main" id="contenido-principal" tabIndex={-1}>
        <header className="topbar">
          <div>
            <div className="topbar-eyebrow">Sistema integral</div>
            <h1>{moduloActual?.nombre || (pathname.includes('mi-perfil') ? 'Mi perfil' : 'Panel de mando')}</h1>
          </div>
          <div className="user-chip" title={`${sesion.usuario.roles.length} roles asignados`}>
            <span className="user-name">{sesion.usuario.username}</span>
            <span className="badge">{sesion.usuario.roles.length} roles</span>
            <span className="user-avatar">{iniciales}</span>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

function MenuLink({ href, icono, nombre, activo, proximamente }: { href: string; icono: IconoModulo | 'home' | 'user'; nombre: string; activo: boolean; proximamente?: boolean }) {
  return <Link href={href} className={`nav-link${activo ? ' active' : ''}`} aria-current={activo ? 'page' : undefined}>
    <span className="nav-icon"><SystemIcon name={icono} size={18} /></span>
    <span>{nombre}</span>
    {proximamente && <span className="nav-tag">Pronto</span>}
  </Link>;
}
