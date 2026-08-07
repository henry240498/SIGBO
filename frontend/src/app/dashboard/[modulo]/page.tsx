'use client';

import { useParams } from 'next/navigation';
import { MODULOS } from '@/lib/modulos';

export default function ModuloPlaceholderPage() {
  const params = useParams<{ modulo: string }>();
  const modulo = MODULOS.find((m) => m.slug === params.modulo);

  return (
    <section className="card">
      <div style={{ fontSize: 36, marginBottom: 10 }}>{modulo?.icono ?? '🧩'}</div>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>{modulo?.nombre ?? 'Modulo'}</h2>
      <p style={{ color: '#94a3b8', fontSize: 13 }}>
        Este modulo esta definido en el catalogo de permisos
        {modulo ? ` (${modulo.permisoPrefijo}*)` : ''}, pero el backend todavia no expone
        entidades ni endpoints para el. Se habilitara aqui cuando se implemente el modulo
        correspondiente en <code>backend/src/modules</code>.
      </p>
    </section>
  );
}
