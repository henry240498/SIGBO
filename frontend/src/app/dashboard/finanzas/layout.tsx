'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard/finanzas', label: 'Dashboard', exact: true },
  { href: '/dashboard/finanzas/movimientos', label: 'Movimientos' },
  { href: '/dashboard/finanzas/cajas', label: 'Cajas' },
  { href: '/dashboard/finanzas/cuentas-bancarias', label: 'Cuentas Bancarias' },
  { href: '/dashboard/finanzas/movimientos-bancarios', label: 'Conciliacion' },
  { href: '/dashboard/finanzas/cuotas', label: 'Cuotas' },
  { href: '/dashboard/finanzas/ordenes-pago', label: 'Ordenes de Pago' },
  { href: '/dashboard/finanzas/presupuesto', label: 'Presupuesto' },
  { href: '/dashboard/finanzas/ejercicios-fiscales', label: 'Ejercicios Fiscales' },
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
