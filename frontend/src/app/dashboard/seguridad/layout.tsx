'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard/seguridad', label: 'Dashboard', exact: true },
  { href: '/dashboard/seguridad/usuarios', label: 'Usuarios' },
  { href: '/dashboard/seguridad/roles', label: 'Roles' },
  { href: '/dashboard/seguridad/permisos', label: 'Permisos' },
  { href: '/dashboard/seguridad/sesiones', label: 'Sesiones' },
  { href: '/dashboard/seguridad/auditoria', label: 'Auditoria' },
  { href: '/dashboard/seguridad/apariencia', label: 'Apariencia' },
];

export default function SeguridadLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <nav
        style={{
          display: 'flex',
          gap: 4,
          borderBottom: '1px solid #334155',
          marginBottom: 20,
          paddingBottom: 0,
        }}
      >
        {TABS.map((tab) => {
          const activo = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                textDecoration: 'none',
                color: activo ? '#e2e8f0' : '#94a3b8',
                fontWeight: activo ? 600 : 400,
                borderBottom: activo ? '2px solid #2563eb' : '2px solid transparent',
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
