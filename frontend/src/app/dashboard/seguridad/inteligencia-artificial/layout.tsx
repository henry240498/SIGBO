'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard/seguridad/inteligencia-artificial', label: 'Resumen', exact: true },
  { href: '/dashboard/seguridad/inteligencia-artificial/configuracion', label: 'Configuración' },
  { href: '/dashboard/seguridad/inteligencia-artificial/conversaciones', label: 'Conversaciones' },
  { href: '/dashboard/seguridad/inteligencia-artificial/propuestas', label: 'Propuestas de mejora' },
  { href: '/dashboard/seguridad/inteligencia-artificial/auditoria', label: 'Auditoría' },
];

export default function InteligenciaArtificialLayout({ children }: { children: React.ReactNode }) {
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
