'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard/organizacion', label: 'Dashboard', exact: true },
  { href: '/dashboard/organizacion/rangos', label: 'Rangos' },
  { href: '/dashboard/organizacion/cargos', label: 'Cargos' },
  { href: '/dashboard/organizacion/especialidades', label: 'Especialidades' },
  { href: '/dashboard/organizacion/companias', label: 'Companias' },
  { href: '/dashboard/organizacion/cuarteles', label: 'Cuarteles' },
  { href: '/dashboard/organizacion/brigadas', label: 'Brigadas' },
  { href: '/dashboard/organizacion/departamentos', label: 'Departamentos' },
  { href: '/dashboard/organizacion/unidades', label: 'Unidades' },
  { href: '/dashboard/organizacion/turnos', label: 'Turnos' },
  { href: '/dashboard/organizacion/guardias', label: 'Guardias' },
  { href: '/dashboard/organizacion/designaciones', label: 'Designaciones' },
  { href: '/dashboard/organizacion/ascensos', label: 'Ascensos' },
  { href: '/dashboard/organizacion/reportes', label: 'Reportes' },
];

export default function OrganizacionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <nav
        style={{
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
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
                padding: '8px 12px',
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
