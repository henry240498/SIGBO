'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard/organizacion', label: 'Dashboard', exact: true },
  { href: '/dashboard/organizacion/rangos', label: 'Rangos' },
  { href: '/dashboard/organizacion/cargos', label: 'Cargos' },
  { href: '/dashboard/organizacion/tipos-bombero', label: 'Tipos de Bombero' },
  { href: '/dashboard/organizacion/especialidades', label: 'Especialidades' },
  { href: '/dashboard/organizacion/companias', label: 'Compañías' },
  { href: '/dashboard/organizacion/cuarteles', label: 'Cuarteles' },
  { href: '/dashboard/organizacion/brigadas', label: 'Brigadas' },
  { href: '/dashboard/organizacion/departamentos', label: 'Departamentos' },
  { href: '/dashboard/organizacion/unidades', label: 'Unidades' },
  { href: '/dashboard/organizacion/turnos', label: 'Turnos' },
  { href: '/dashboard/organizacion/guardias', label: 'Guardias' },
  { href: '/dashboard/organizacion/feriados', label: 'Feriados' },
  { href: '/dashboard/organizacion/designaciones', label: 'Designaciones' },
  { href: '/dashboard/organizacion/ascensos', label: 'Ascensos' },
  { href: '/dashboard/organizacion/parametros', label: 'Parámetros' },
  { href: '/dashboard/organizacion/reportes', label: 'Reportes' },
];

export default function OrganizacionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <nav className="subnav" aria-label="Secciones de organización">
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
