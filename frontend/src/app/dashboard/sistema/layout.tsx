'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTabsVisibles } from '@/app/components/PermisosPantallaProvider';

const TABS = [
  { href: '/dashboard/sistema', label: 'Estado', exact: true },
  { href: '/dashboard/sistema/tareas', label: 'Tareas' },
  { href: '/dashboard/sistema/datos', label: 'Respaldos y base de datos' },
  { href: '/dashboard/sistema/app-movil', label: 'App móvil' },
  { href: '/dashboard/sistema/registros', label: 'Registros' },
];

export default function SistemaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const tabs = useTabsVisibles(TABS);
  return (
    <div>
      <nav className="subnav" aria-label="Secciones del área Sistema">
        {tabs.map((tab) => {
          const activo = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return <Link key={tab.href} href={tab.href} className={`subnav-link${activo ? ' active' : ''}`} aria-current={activo ? 'page' : undefined}>{tab.label}</Link>;
        })}
      </nav>
      {children}
    </div>
  );
}
