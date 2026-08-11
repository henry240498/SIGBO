'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { obtenerSesion, Sesion } from '@/lib/api';
import { MODULOS, moduloVisible } from '@/lib/modulos';
import { SystemIcon } from '@/app/components/SystemIcon';

export default function InicioPage() {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [ahora, setAhora] = useState<Date | null>(null);
  useEffect(() => { setSesion(obtenerSesion()); setAhora(new Date()); }, []);
  if (!sesion) return null;
  const modulos = MODULOS.filter((m) => moduloVisible(m, sesion.usuario.permisos));
  const hora = ahora?.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' }) || '--:--';
  const fecha = ahora?.toLocaleDateString('es-PY', { weekday: 'long', day: '2-digit', month: 'long' }) || '';

  return <>
    {sesion.usuario.debeCambiarPassword && <section className="card" style={{ marginBottom: 18, borderLeft: '4px solid var(--warning)' }}>
      <strong>Acción requerida.</strong> Tu contraseña necesita actualizarse. <Link href="/dashboard/mi-perfil">Cambiar contraseña →</Link>
    </section>}
    <section className="dashboard-hero">
      <div>
        <div className="hero-kicker">Estado del sistema · Operativo</div>
        <h2>Todo el cuerpo,<br />en un solo mapa.</h2>
        <p>Personal, unidades y recursos organizados para tomar decisiones con información clara y confiable.</p>
      </div>
      <div className="hero-stamp"><div className="hero-time">{hora}</div><div className="hero-date">{fecha}</div></div>
    </section>
    <div className="section-heading"><h2>Áreas de trabajo</h2><span>{modulos.length} módulos habilitados</span></div>
    <div className="module-grid">
      {modulos.map((m) => <Link key={m.slug} href={`/dashboard/${m.slug}`} className="card module-card" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="module-icon"><SystemIcon name={m.icono} size={20} /></div>
        <div><div className="module-name">{m.nombre}</div><div className={`module-status${m.disponible ? '' : ' soon'}`}>{m.disponible ? 'Disponible' : 'Próximamente'}</div></div>
      </Link>)}
    </div>
  </>;
}
