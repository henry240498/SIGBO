'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, obtenerSesion, Sesion } from '@/lib/api';
import { MODULOS, agruparModulos, moduloVisible } from '@/lib/modulos';
import { SystemIcon } from '@/app/components/SystemIcon';
import { Cargando } from '@/app/components/Cargando';
import { Aviso } from '@/app/components/Aviso';

interface InicioBombero {
  tienePerfilBombero: boolean;
  proximasGuardias: Array<{ id: string; fecha: string; horaInicio: string; horaFin: string; turno: string; estado: string; rol: string | null }>;
  ultimosServicios: Array<{ id: string; numeroServicio: string; fechaHoraAviso: string; estado: string; tipo: string | null; rol: string | null; horasServicio: number | null }>;
}

const fechaCorta = (fecha: string) => new Intl.DateTimeFormat('es-PY', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${fecha}T12:00:00`));
const fechaHoraCorta = (fecha: string) => new Intl.DateTimeFormat('es-PY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(fecha));

export default function InicioPage() {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [ahora, setAhora] = useState<Date | null>(null);
  const [inicioBombero, setInicioBombero] = useState<InicioBombero | null>(null);
  const [errorInicio, setErrorInicio] = useState<string | null>(null);
  useEffect(() => {
    setSesion(obtenerSesion());
    setAhora(new Date());
    apiFetch('/seguridad/mi-inicio')
      .then(async (res) => {
        if (!res.ok) throw new Error('No se pudo cargar tu resumen operativo.');
        setInicioBombero(await res.json());
      })
      .catch((error: Error) => setErrorInicio(error.message));
  }, []);
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
    <section className="card" style={{ marginTop: 18 }}>
      <div className="section-heading" style={{ margin: 0, marginBottom: 14 }}><h2>Mi actividad operativa</h2><span>Información vinculada a tu perfil</span></div>
      {errorInicio && <Aviso tipo="error" texto={errorInicio} fontSize={13} />}
      {!inicioBombero && !errorInicio && <Cargando texto="Cargando tu actividad operativa…" />}
      {inicioBombero && !inicioBombero.tienePerfilBombero && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Tu usuario aún no está vinculado a una ficha de bombero. Contactá a Personal para completar la vinculación.</p>}
      {inicioBombero?.tienePerfilBombero && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div>
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>Próximas guardias</h3>
          {inicioBombero.proximasGuardias.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No tenés guardias próximas asignadas.</p>}
          {inicioBombero.proximasGuardias.map((guardia) => <div key={guardia.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '9px 0', borderTop: '1px solid var(--line)' }}>
            <span><strong>{fechaCorta(guardia.fecha)}</strong><small style={{ display: 'block', color: 'var(--muted)' }}>{guardia.horaInicio.slice(0, 5)} - {guardia.horaFin.slice(0, 5)} · {guardia.turno}</small></span>
            <span className="badge">{guardia.rol || guardia.estado}</span>
          </div>)}
        </div>
        <div>
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>Últimos servicios con tu participación</h3>
          {inicioBombero.ultimosServicios.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay servicios registrados con tu participación.</p>}
          {inicioBombero.ultimosServicios.map((servicio) => <div key={servicio.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '9px 0', borderTop: '1px solid var(--line)' }}>
            <span><strong>{servicio.numeroServicio}</strong><small style={{ display: 'block', color: 'var(--muted)' }}>{servicio.tipo || 'Servicio'} · {fechaHoraCorta(servicio.fechaHoraAviso)}</small></span>
            <span className="badge">{servicio.rol || servicio.estado}</span>
          </div>)}
        </div>
      </div>}
    </section>
    <div className="section-heading"><h2>Accesos directos</h2><span>{modulos.length} módulos habilitados para tu usuario</span></div>
    {agruparModulos(modulos).map((grupo) => <section key={grupo.id} style={{ marginBottom: 22 }}>
      <h3 className="grupo-titulo">{grupo.nombre}</h3>
      <div className="module-grid">
        {grupo.modulos.map((m) => <Link key={m.slug} href={`/dashboard/${m.slug}`} className="card module-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="module-icon"><SystemIcon name={m.icono} size={20} /></div>
          <div>
            <div className="module-name">{m.nombre}</div>
            {/* Antes decia solo "Disponible", que no ayudaba a elegir a donde entrar. */}
            <p className="module-desc">{m.descripcion}</p>
            {!m.disponible && <div className="module-status soon">Próximamente</div>}
          </div>
        </Link>)}
      </div>
    </section>)}
  </>;
}
