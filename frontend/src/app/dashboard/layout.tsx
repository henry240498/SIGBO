'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  API_ORIGIN,
  apiFetch,
  EVENTO_SESION_FINALIZADA,
  logout,
  obtenerSesion,
  Sesion,
} from '@/lib/api';
import { MODULOS, agruparModulos, moduloVisible, GrupoModulo, IconoModulo } from '@/lib/modulos';
import { migasDePan } from '@/lib/navegacion';
import { PANTALLAS } from '@/lib/pantallas.generado';
import { SystemIcon } from '@/app/components/SystemIcon';
import { BuscadorPantallas } from '@/app/components/BuscadorPantallas';

interface Apariencia { nombreSistemaMenu: string | null; subtituloMenu: string | null; logoMenu: string | null; }

/** Que grupos dejo plegados el usuario. Es una preferencia de vista, no dato de negocio. */
const CLAVE_PLEGADOS = 'sigbo_menu_plegados';

function leerPlegados(): GrupoModulo[] {
  try {
    const guardado = window.localStorage.getItem(CLAVE_PLEGADOS);
    return guardado ? (JSON.parse(guardado) as GrupoModulo[]) : [];
  } catch {
    return [];
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [apariencia, setApariencia] = useState<Apariencia | null>(null);
  const [plegados, setPlegados] = useState<GrupoModulo[]>([]);
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);

  useEffect(() => {
    const current = obtenerSesion();
    if (!current) router.replace('/login');
    else setSesion(current);
    const redirigirAlLogin = () => router.replace('/login');
    const sync=(event:StorageEvent)=>{if(event.key==='sigbo_sesion'&&!event.newValue)redirigirAlLogin()};
    window.addEventListener('storage',sync);
    window.addEventListener(EVENTO_SESION_FINALIZADA, redirigirAlLogin);
    return()=>{
      window.removeEventListener('storage',sync);
      window.removeEventListener(EVENTO_SESION_FINALIZADA, redirigirAlLogin);
    };
  }, [router]);

  useEffect(() => { setPlegados(leerPlegados()); }, []);

  // En telefono la barra inferior es una fila de 16 iconos con scroll horizontal, y en
  // escritorio el menu puede pasar del alto de la pantalla: en los dos casos el modulo
  // abierto puede quedar fuera de vista. 'nearest' mueve solo ese contenedor.
  useEffect(() => {
    document
      .querySelector<HTMLElement>('.side-nav .nav-link.active')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [pathname]);

  useEffect(() => {
    function alTeclado(evento: KeyboardEvent) {
      if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === 'k') {
        evento.preventDefault();
        setBuscadorAbierto((abierto) => !abierto);
      }
    }
    window.addEventListener('keydown', alTeclado);
    return () => window.removeEventListener('keydown', alTeclado);
  }, []);

  useEffect(() => {
    apiFetch('/seguridad/apariencia').then(async (res) => res.ok && setApariencia(await res.json())).catch(() => undefined);
  }, []);

  const alternarGrupo = useCallback((grupo: GrupoModulo) => {
    setPlegados((previos) => {
      const siguiente = previos.includes(grupo) ? previos.filter((g) => g !== grupo) : [...previos, grupo];
      try { window.localStorage.setItem(CLAVE_PLEGADOS, JSON.stringify(siguiente)); } catch { /* modo privado */ }
      return siguiente;
    });
  }, []);

  async function onLogout() { await logout(); router.push('/login'); }

  const slugActual = pathname.split('/')[2];
  const moduloActual = MODULOS.find((m) => m.slug === slugActual);
  const grupos = useMemo(
    () => agruparModulos(MODULOS.filter((m) => moduloVisible(m, sesion?.usuario.permisos ?? []))),
    [sesion],
  );

  const migas = migasDePan(pathname);
  const pantallaActual = PANTALLAS.find((p) => p.ruta === pathname);
  const titulo = pantallaActual?.nombre
    ?? migas[migas.length - 1]?.nombre
    ?? 'Panel de mando';
  // En la portada de un modulo se explica el modulo; mas adentro, la ruta ya ubica.
  const descripcion = pathname === `/dashboard/${slugActual}` ? moduloActual?.descripcion : undefined;

  // La pestana decia "SIGBO-CBVC" en las 97 pantallas: con varias abiertas no habia
  // forma de distinguirlas, y el historial y los favoritos quedaban todos iguales.
  useEffect(() => { document.title = `${titulo} · SIGBO`; }, [titulo]);

  if (!sesion) return null;
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
        <nav className="side-nav" aria-label="Navegación principal">
          <MenuLink href="/dashboard" icono="home" nombre="Inicio" activo={pathname === '/dashboard'} />
          {grupos.map((grupo) => {
            // El grupo del modulo abierto se muestra siempre, para no esconder donde estas parado.
            const contieneActual = grupo.modulos.some((m) => m.slug === slugActual);
            const abierto = contieneActual || !plegados.includes(grupo.id);
            const idLista = `grupo-${grupo.id}`;
            return (
              <div key={grupo.id} className="side-group">
                <button
                  type="button"
                  className="side-group-header"
                  onClick={() => alternarGrupo(grupo.id)}
                  aria-expanded={abierto}
                  aria-controls={idLista}
                >
                  <span>{grupo.nombre}</span>
                  <span className={`side-group-chevron${abierto ? ' abierto' : ''}`} aria-hidden="true">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </span>
                </button>
                <div id={idLista} className="side-group-items" hidden={!abierto}>
                  {grupo.modulos.map((m) => (
                    <MenuLink key={m.slug} href={`/dashboard/${m.slug}`} icono={m.icono} nombre={m.nombre} activo={slugActual === m.slug} proximamente={!m.disponible} />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <MenuLink href="/dashboard/mi-perfil" icono="user" nombre="Mi perfil" activo={pathname === '/dashboard/mi-perfil'} />
          <button type="button" className="logout-button" onClick={onLogout}>Cerrar sesión</button>
        </div>
      </aside>

      <main className="app-main" id="contenido-principal" tabIndex={-1}>
        <header className="topbar">
          <div style={{ minWidth: 0 }}>
            <nav className="migas" aria-label="Ruta de navegación">
              {migas.map((miga, i) => (
                <span key={miga.href ?? `actual-${i}`}>
                  {i > 0 && <span className="migas-sep" aria-hidden="true">›</span>}
                  {miga.href
                    ? <Link href={miga.href}>{miga.nombre}</Link>
                    : <span aria-current="page">{miga.nombre}</span>}
                </span>
              ))}
            </nav>
            <h1>{titulo}</h1>
            {descripcion && <p className="topbar-descripcion">{descripcion}</p>}
          </div>
          <div className="topbar-acciones">
            <button type="button" className="boton-buscar" onClick={() => setBuscadorAbierto(true)}>
              <SystemIcon name="buscar" size={15} />
              <span>Buscar pantalla</span>
              <kbd>Ctrl K</kbd>
            </button>
            <div className="user-chip" title={`${sesion.usuario.roles.length} roles asignados`}>
              <span className="user-name">{sesion.usuario.username}</span>
              <span className="badge">{sesion.usuario.roles.length} roles</span>
              <span className="user-avatar">{iniciales}</span>
            </div>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>

      <BuscadorPantallas permisos={sesion.usuario.permisos} abierto={buscadorAbierto} onCerrar={() => setBuscadorAbierto(false)} />
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
