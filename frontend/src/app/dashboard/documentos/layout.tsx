'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard/documentos', label: 'Resumen', exact: true },
  { href: '/dashboard/documentos/listado', label: 'Documentos' },
  { href: '/dashboard/documentos/expedientes', label: 'Expedientes' },
  { href: '/dashboard/documentos/plantillas', label: 'Plantillas' },
  { href: '/dashboard/documentos/vencimientos', label: 'Vencimientos' },
  { href: '/dashboard/documentos/auditoria', label: 'Auditoría' },
];

export default function DocumentosLayout({ children }: { children: React.ReactNode }) {
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
