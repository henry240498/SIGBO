'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { obtenerSesion, Sesion } from '@/lib/api';
import { MODULOS, moduloVisible } from '@/lib/modulos';

export default function InicioPage() {
  const [sesion, setSesion] = useState<Sesion | null>(null);

  useEffect(() => {
    setSesion(obtenerSesion());
  }, []);

  if (!sesion) return null;

  const modulosVisibles = MODULOS.filter((m) => moduloVisible(m, sesion.usuario.permisos));

  return (
    <div>
      {sesion.usuario.debeCambiarPassword && (
        <section className="card" style={{ marginBottom: 20, borderColor: '#b45309', background: '#451a03' }}>
          <p style={{ fontSize: 13 }}>
            ⚠ Tu contrasena requiere cambio (fue reseteada o expiro). Cambiala en{' '}
            <Link href="/dashboard/mi-perfil" style={{ textDecoration: 'underline' }}>
              Mi Perfil
            </Link>
            .
          </p>
        </section>
      )}

      <section className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Sesion actual</h2>
        <p style={{ marginBottom: 6 }}>
          <strong>Usuario:</strong> {sesion.usuario.username} ({sesion.usuario.email})
        </p>
        <p style={{ marginBottom: 10 }}>
          <strong>Roles ({sesion.usuario.roles.length}):</strong>{' '}
          {sesion.usuario.roles.map((r) => (
            <span key={r} className="badge" style={{ marginRight: 6 }}>
              {r}
            </span>
          ))}
        </p>
        <p style={{ fontSize: 13, color: '#94a3b8' }}>
          {sesion.usuario.permisos.length} permisos efectivos otorgados por el Policy Engine
        </p>
      </section>

      <h2 style={{ fontSize: 15, marginBottom: 12, color: '#94a3b8' }}>
        Modulos disponibles para tu usuario
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 14,
        }}
      >
        {modulosVisibles.map((m) => (
          <Link
            key={m.slug}
            href={`/dashboard/${m.slug}`}
            className="card"
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div style={{ fontSize: 26, marginBottom: 8 }}>{m.icono}</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{m.nombre}</div>
            <div style={{ fontSize: 12, color: m.disponible ? '#4ade80' : '#94a3b8' }}>
              {m.disponible ? 'Disponible' : 'Proximamente'}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
