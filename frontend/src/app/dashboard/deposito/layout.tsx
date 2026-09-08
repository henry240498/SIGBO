'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard/deposito', label: 'Resumen', exact: true },
  { href: '/dashboard/deposito/articulos', label: 'Artículos' },
  { href: '/dashboard/deposito/categorias', label: 'Categorías' },
  { href: '/dashboard/deposito/ubicaciones', label: 'Ubicaciones' },
  { href: '/dashboard/deposito/movimientos', label: 'Movimientos' },
  { href: '/dashboard/deposito/entradas', label: 'Entradas' },
  { href: '/dashboard/deposito/bajas', label: 'Bajas' },
  { href: '/dashboard/deposito/prestamos', label: 'Préstamos' },
  { href: '/dashboard/deposito/mantenimientos', label: 'Mantenimientos' },
  { href: '/dashboard/deposito/inventarios-fisicos', label: 'Inventarios físicos' },
  { href: '/dashboard/deposito/incidencias', label: 'Incidencias' },
  { href: '/dashboard/deposito/proveedores', label: 'Proveedores' },
];

export default function DepositoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
