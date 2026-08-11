'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard/seguridad', label: 'Dashboard', exact: true },
  { href: '/dashboard/seguridad/usuarios', label: 'Usuarios' },
  { href: '/dashboard/seguridad/roles', label: 'Roles' },
  { href: '/dashboard/seguridad/permisos', label: 'Permisos' },
  { href: '/dashboard/seguridad/sesiones', label: 'Sesiones' },
  { href: '/dashboard/seguridad/auditoria', label: 'Auditoría' },
  { href: '/dashboard/seguridad/apariencia', label: 'Apariencia' },
];

export default function SeguridadLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <nav className="subnav" aria-label="Secciones de seguridad">
        {TABS.map((tab) => {
          const activo = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <Link key={tab.href} href={tab.href} className={`subnav-link${activo ? ' active' : ''}`} aria-current={activo ? 'page' : undefined}>
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
