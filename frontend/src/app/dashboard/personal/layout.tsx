'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard/personal', label: 'Personal', exact: true },
  { href: '/dashboard/personal/control', label: 'Control: vencimientos, horas y fichaje' },
];

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Solo el listado y el control llevan pestañas; la ficha y el alta ocupan toda la pantalla.
  if (!TABS.some((t) => pathname === t.href)) return <>{children}</>;

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
          const activo = pathname === tab.href;
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
