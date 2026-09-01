'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard/finanzas', label: 'Resumen', exact: true },
  { href: '/dashboard/finanzas/socios-protectores', label: 'Socios protectores' },
  { href: '/dashboard/finanzas/beneficios', label: 'Beneficios' },
  { href: '/dashboard/finanzas/facturacion', label: 'Facturación' },
  { href: '/dashboard/finanzas/movimientos', label: 'Movimientos' },
  { href: '/dashboard/finanzas/cajas', label: 'Cajas' },
  { href: '/dashboard/finanzas/cuentas-bancarias', label: 'Cuentas bancarias' },
  { href: '/dashboard/finanzas/movimientos-bancarios', label: 'Conciliación' },
  { href: '/dashboard/finanzas/cuotas', label: 'Cuotas' },
  { href: '/dashboard/finanzas/ordenes-pago', label: 'Órdenes de pago' },
  { href: '/dashboard/finanzas/presupuesto', label: 'Presupuesto' },
  { href: '/dashboard/finanzas/ejercicios-fiscales', label: 'Ejercicios fiscales' },
];

export default function FinanzasLayout({ children }: { children: React.ReactNode }) {
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
