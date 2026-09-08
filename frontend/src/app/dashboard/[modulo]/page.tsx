'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MODULOS } from '@/lib/modulos';
import { SystemIcon } from '@/app/components/SystemIcon';

/**
 * Captura cualquier `/dashboard/<algo>` que no tenga pantalla propia. Hoy los 15 modulos
 * la tienen, asi que en la practica esto es el "no encontrado" del panel; el caso del
 * modulo declarado pero sin implementar se mantiene porque un modulo puede entrar a
 * MODULOS antes que su pantalla.
 */
export default function ModuloNoDisponiblePage() {
  const params = useParams<{ modulo: string }>();
  const modulo = MODULOS.find((m) => m.slug === params.modulo);

  return (
    <section className="card" style={{ maxWidth: 640 }}>
      <div className="module-icon" style={{ marginBottom: 14 }}>
        {/* Antes esto imprimia el nombre del icono como texto ("building"). */}
        <SystemIcon name={modulo?.icono ?? 'alert'} size={20} />
      </div>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>
        {modulo ? modulo.nombre : 'Esta pantalla no existe'}
      </h2>
      {modulo ? (
        <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.55 }}>
          El módulo está declarado en el catálogo de permisos (<code>{modulo.permisoPrefijo}*</code>),
          pero todavía no tiene pantalla. Se habilitará acá cuando se implemente el módulo
          correspondiente en <code>backend/src/modules</code>.
        </p>
      ) : (
        <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.55 }}>
          No hay ninguna pantalla en <code>/dashboard/{params.modulo}</code>. Puede que el
          enlace esté desactualizado o que tengas mal escrita la dirección.
        </p>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
        <Link href="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>
          Volver al inicio
        </Link>
      </div>
      <p style={{ marginTop: 14, color: 'var(--muted)', fontSize: 12 }}>
        Para buscar una pantalla por su nombre, usá <kbd>Ctrl</kbd> + <kbd>K</kbd>.
      </p>
    </section>
  );
}
