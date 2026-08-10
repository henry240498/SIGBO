'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard/asistencia', label: 'Dashboard', exact: true },
  { href: '/dashboard/asistencia/registro', label: 'Registro' },
  { href: '/dashboard/asistencia/eventos', label: 'Eventos' },
  { href: '/dashboard/asistencia/guardias', label: 'Guardias' },
  { href: '/dashboard/asistencia/externos', label: 'Personas Externas' },
  { href: '/dashboard/asistencia/tolerancias', label: 'Tolerancias' },
  { href: '/dashboard/asistencia/auditoria', label: 'Auditoria' },
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
