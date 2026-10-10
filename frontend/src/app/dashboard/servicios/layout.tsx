'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTabsVisibles } from '@/app/components/PermisosPantallaProvider';

const TABS = [
  { href: '/dashboard/servicios', label: 'Comunicaciones', exact: true },
  { href: '/dashboard/servicios/llamados', label: 'Llamados' },
  { href: '/dashboard/servicios/convocatorias', label: 'Convocatorias' },
  { href: '/dashboard/servicios/despacho', label: 'Despacho operativo' },
  { href: '/dashboard/servicios/cartografia', label: 'Hidrantes y riesgos' },
  { href: '/dashboard/servicios/prevencion', label: 'Prevención' },
  { href: '/dashboard/servicios/indicadores', label: 'Indicadores' },
];

export default function ServiciosLayout({ children }: { children: React.ReactNode }) {
  const tabs = useTabsVisibles(TABS);
  const pathname = usePathname();
  // El formulario de carga ocupa toda la pantalla: sin pestañas.
  if (pathname.startsWith('/dashboard/servicios/nuevo')) return <>{children}</>;

  return (
    <div>
      <nav
        style={{
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--line)',
          marginBottom: 20,
          paddingBottom: 0,
        }}
      >
        {tabs.map((tab) => {
          const activo = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                padding: '8px 12px',
                fontSize: 13,
                textDecoration: 'none',
                color: activo ? 'var(--ink)' : 'var(--muted)',
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
