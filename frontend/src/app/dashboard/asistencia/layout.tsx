'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard/asistencia', label: 'Resumen', exact: true },
  { href: '/dashboard/asistencia/registro', label: 'Registro' },
  { href: '/dashboard/asistencia/eventos', label: 'Eventos' },
  { href: '/dashboard/asistencia/externos', label: 'Personas externas' },
  { href: '/dashboard/asistencia/tolerancias', label: 'Tolerancias' },
  { href: '/dashboard/asistencia/auditoria', label: 'Auditoría' },
];

export default function AsistenciaLayout({ children }: { children: React.ReactNode }) {
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
