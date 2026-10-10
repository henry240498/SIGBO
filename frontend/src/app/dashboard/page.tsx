'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, obtenerSesion, Sesion } from '@/lib/api';
import { MODULOS, agruparModulos } from '@/lib/modulos';
import { PANTALLAS } from '@/lib/pantallas.generado';
import { decisionDeRuta, destinoDeModulo, moduloVisibleEnMenu } from '@/lib/permisos-pantalla';
import { SystemIcon } from '@/app/components/SystemIcon';
import { Cargando } from '@/app/components/Cargando';
import { Aviso } from '@/app/components/Aviso';
import { usePermisosPantalla, useRutasVisibles } from '@/app/components/PermisosPantallaProvider';
import { useActualizacionPeriodica } from '@/app/components/useActualizacionPeriodica';
import { ETIQUETA_NIVEL, ResumenSistema } from './sistema/tipos';

interface InicioBombero {
  tienePerfilBombero: boolean;
  proximasGuardias: Array<{ id: string; fecha: string; horaInicio: string; horaFin: string; turno: string; estado: string; rol: string | null }>;
  ultimosServicios: Array<{ id: string; numeroServicio: string; fechaHoraAviso: string; estado: string; tipo: string | null; rol: string | null; horasServicio: number | null }>;
}

const fechaCorta = (fecha: string) => new Intl.DateTimeFormat('es-PY', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${fecha}T12:00:00`));
const fechaHoraCorta = (fecha: string) => new Intl.DateTimeFormat('es-PY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(fecha));

/** Antes decia "Estado del sistema · Operativo" fijo en el codigo: ahora lo que realmente responde el servidor. */
function EstadoDelSistema({ permisos }: { permisos: string[] }) {
  const [salud, setSalud] = useState<'ok' | 'caido' | null>(null);
  const [resumen, setResumen] = useState<ResumenSistema | null>(null);
  const [resumenFallo, setResumenFallo] = useState(false);
  const veSistema = permisos.includes('sistema:ver');
  const visibles = useRutasVisibles();
  const cargar = useCallback(async () => {
    const res = await apiFetch('/salud').catch(() => null);
    const cuerpo = res ? await res.json().catch(() => ({})) : {};
    const ok = !!res && res.ok && (cuerpo as { estado?: string }).estado === 'disponible';
    setSalud(ok ? 'ok' : 'caido');
    if (ok && veSistema) {
      // Si el resumen falla, se dice: "Servidor operativo" a secas ocultaria que no se pudo leer.
      const r = await apiFetch('/sistema/resumen').catch(() => null);
      const datos = r && r.ok ? ((await r.json().catch(() => null)) as ResumenSistema | null) : null;
      setResumen(datos);
      setResumenFallo(!datos);
    } else {
      setResumen(null);
      setResumenFallo(false);
    }
    if (!ok) throw new Error('El servidor no responde.');
  }, [veSistema]);
  useActualizacionPeriodica(cargar, 30_000);
  const texto = salud === null ? 'comprobando…'
    : salud === 'caido' ? 'Sin respuesta del servidor'
      : resumen ? ETIQUETA_NIVEL[resumen.nivel]
        : resumenFallo ? 'Servidor operativo · no se pudo leer el resumen del sistema' : 'Servidor operativo';
  return (
    <div className="hero-kicker" role="status">
      Estado del sistema · {texto}
      {resumen && resumen.alertas.length > 0 && <> · {visibles.has('/dashboard/sistema')
        ? <Link href="/dashboard/sistema" style={{ color: 'inherit' }}>{resumen.alertas.length} aviso(s)</Link>
        : <span>{resumen.alertas.length} aviso(s)</span>}</>}
    </div>
  );
}

export default function InicioPage() {
  const { matriz, centroMando } = usePermisosPantalla();
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [ahora, setAhora] = useState<Date | null>(null);
  const [inicioBombero, setInicioBombero] = useState<InicioBombero | null>(null);
  const [errorInicio, setErrorInicio] = useState<string | null>(null);
  useEffect(() => {
    setSesion(obtenerSesion());
    setAhora(new Date());
    const reloj = window.setInterval(() => setAhora(new Date()), 30_000);
    apiFetch('/seguridad/mi-inicio')
      .then(async (res) => {
        if (!res.ok) throw new Error('No se pudo cargar tu resumen operativo.');
        setInicioBombero(await res.json());
      })
      .catch((error: Error) => setErrorInicio(error.message));
    return () => window.clearInterval(reloj);
  }, []);
  if (!sesion) return null;
  const permisos = sesion.usuario.permisos;
  const modulos = MODULOS.filter((m) => m.slug !== 'centro-mando' && moduloVisibleEnMenu(m, permisos, PANTALLAS, matriz));
  const centroVisible = centroMando?.acceso !== false && (decisionDeRuta('/dashboard/centro-mando', PANTALLAS, matriz)?.ver ?? true);
  const hora = ahora?.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' }) || '--:--';
  const fecha = ahora?.toLocaleDateString('es-PY', { weekday: 'long', day: '2-digit', month: 'long' }) || '';

  return <>
    {sesion.usuario.debeCambiarPassword && <section className="card" style={{ marginBottom: 18, borderLeft: '4px solid var(--warning)' }}>
      <strong>Acción requerida.</strong> Tu contraseña necesita actualizarse. <Link href="/dashboard/mi-perfil">Cambiar contraseña →</Link>
    </section>}
    <section className="dashboard-hero">
      <div>
        <EstadoDelSistema permisos={permisos} />
        <h2>Todo el cuerpo,<br />en un solo mapa.</h2>
        <p>Personal, unidades y recursos organizados para tomar decisiones con información clara y confiable.</p>
        {centroVisible && <p style={{ marginTop: 14 }}><Link href="/dashboard/centro-mando" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>Abrir el Centro de mando</Link></p>}
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
        {grupo.modulos.map((m) => <Link key={m.slug} href={destinoDeModulo(m.slug, PANTALLAS, permisos, matriz, MODULOS)} className="card module-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="module-icon"><SystemIcon name={m.icono} size={20} /></div>
          <div>
            <div className="module-name">{m.nombre}</div>
            <p className="module-desc">{m.descripcion}</p>
            {!m.disponible && <div className="module-status soon">Próximamente</div>}
          </div>
        </Link>)}
      </div>
    </section>)}
  </>;
}
