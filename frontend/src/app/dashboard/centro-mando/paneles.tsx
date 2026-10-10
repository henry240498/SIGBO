'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { haceCuanto } from '@/lib/actualizacion';
import { MODULOS } from '@/lib/modulos';
import { PANTALLAS } from '@/lib/pantallas.generado';
import { MatrizWeb, pantallasVisibles } from '@/lib/permisos-pantalla';
import { coincideBusqueda } from '@/lib/texto';
import { Aviso } from '@/app/components/Aviso';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { useEntradaConfirmada } from '@/app/components/InputProvider';
import {
  Alerta, Convocatoria, Emergencia, ETIQUETA_NIVEL, GuardiaVigente, MiActividad, Moviles, Pendiente, PersonalDisponible, ResumenSistema, Seccion,
} from './tipos';

const GRAVEDAD: Record<string, { texto: string; fondo: string }> = {
  LEVE: { texto: 'Baja', fondo: 'var(--info-fill)' },
  MODERADA: { texto: 'Media', fondo: 'var(--warn-fill)' },
  GRAVE: { texto: 'Alta', fondo: 'var(--bad-fill)' },
  CRITICA: { texto: 'Crítica', fondo: 'var(--bad-fill)' },
};
const FONDO_NIVEL = { normal: 'var(--ok-fill)', atencion: 'var(--warn-fill)', critico: 'var(--bad-fill)' } as const;

function Marco({ id, titulo, extra, ancho, children }: { id: string; titulo: string; extra?: React.ReactNode; ancho?: boolean; children: React.ReactNode }) {
  return (
    <section className={`cm-panel${ancho ? ' cm-panel-ancho' : ''}`} aria-labelledby={`cm-${id}`}>
      <h2 id={`cm-${id}`}><span>{titulo}</span>{extra}</h2>
      {children}
    </section>
  );
}

function Contenido<T>({ seccion, children }: { seccion: Seccion<T>; children: (datos: T) => React.ReactNode }) {
  if (seccion.estado === 'error') return <Aviso tipo="error" texto={`No se pudo cargar: ${seccion.error}`} fontSize={12} />;
  return <>{children(seccion.datos)}</>;
}

/** Enlace a una pantalla solo si la persona puede abrirla (sin enlaces que terminen en "Sin acceso"). */
function EnlaceSiVisible({ ruta, texto, visibles }: { ruta: string; texto: string; visibles: Set<string> }) {
  return visibles.has(ruta) ? <Link href={ruta} style={{ fontSize: 12 }}>{texto}</Link> : null;
}

export function PanelEmergencias({ seccion, visibles }: { seccion: Seccion<{ supervisor: boolean; servicios: Emergencia[] }>; visibles: Set<string> }) {
  const supervisor = seccion.estado === 'ok' && seccion.datos.supervisor;
  return (
    <Marco id="emergencias" titulo="Emergencias en curso" ancho extra={supervisor ? <span className="badge" style={{ background: 'var(--info-fill)' }}>Supervisión: todas</span> : undefined}>
      <Contenido seccion={seccion}>{({ servicios }) => servicios.length === 0
        ? <p className="cm-vacio">{supervisor ? 'No hay emergencias en curso.' : 'No integrás ninguna emergencia en curso.'}</p>
        : <ul className="cm-lista">{servicios.map((s) => {
          const g = s.gravedad ? GRAVEDAD[s.gravedad] : null;
          return <li key={s.id}>
            <span>
              <strong>{s.numeroServicio} · {s.tipo}</strong>
              <small>{s.estado} · aviso {haceCuanto(new Date(s.fechaHoraAviso), new Date())}{s.direccion ? ` · ${s.direccion}` : ''}</small>
              <small>{s.personal} en el servicio · {s.enCamino} en camino · {s.moviles} móvil(es)</small>
            </span>
            {g && <span className="badge" style={{ background: g.fondo }}>{g.texto}</span>}
          </li>;
        })}</ul>}
      </Contenido>
      <EnlaceSiVisible ruta="/dashboard/servicios" texto="Abrir Servicios" visibles={visibles} />
    </Marco>
  );
}

export function PanelAlertas({ seccion, puedeAtender, alCambiar }: { seccion: Seccion<Alerta[]>; puedeAtender: boolean; alCambiar: () => void }) {
  const confirmar = useConfirmacion();
  const pedirMotivo = useEntradaConfirmada();
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [ocupada, setOcupada] = useState<string | null>(null);

  async function cambiar(a: Alerta, estado: 'ATENDIDA' | 'CANCELADA') {
    let motivo: string | undefined;
    if (estado === 'ATENDIDA') {
      const ok = await confirmar({ titulo: 'Marcar alerta atendida', mensaje: `${a.tipo} de ${a.solicitanteNombre}. Queda registrado quién la atendió.`, confirmar: 'Marcar atendida' });
      if (!ok) return;
    } else {
      const m = await pedirMotivo({ titulo: 'Cancelar alerta', mensaje: `${a.tipo} de ${a.solicitanteNombre}.`, etiqueta: 'Motivo', requerida: true, confirmar: 'Cancelar alerta', peligro: true });
      if (m === null) return;
      motivo = m;
    }
    setOcupada(a.id); setError(''); setExito('');
    try {
      const res = await apiFetch(`/alertas/${a.id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado, ...(motivo ? { motivo } : {}) }) });
      const cuerpo = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(cuerpo.message ?? 'No se pudo cambiar la alerta.');
      setExito(estado === 'ATENDIDA' ? 'Alerta marcada como atendida.' : 'Alerta cancelada.');
      alCambiar();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cambiar la alerta.'); }
    finally { setOcupada(null); }
  }

  return (
    <Marco id="alertas" titulo="Alertas activas">
      {error && <Aviso tipo="error" texto={error} fontSize={12} />}
      {exito && <Aviso tipo="exito" texto={exito} fontSize={12} />}
      <Contenido seccion={seccion}>{(alertas) => alertas.length === 0
        ? <p className="cm-vacio">No hay alertas pendientes.</p>
        : <ul className="cm-lista">{alertas.map((a) => <li key={a.id}>
          <span>
            <strong>{a.tipo === 'SOLICITUD_CHOFER' ? 'Pide chofer' : 'Pide apoyo'} · {a.solicitanteNombre}</strong>
            <small>{haceCuanto(new Date(a.creadoEn), new Date())}{a.detalle ? ` · ${a.detalle}` : ''}</small>
          </span>
          {puedeAtender && <span className="cm-acciones">
            <button type="button" className="btn-primary" disabled={ocupada === a.id} onClick={() => void cambiar(a, 'ATENDIDA')}>Atendida</button>
            <button type="button" className="service-secondary" disabled={ocupada === a.id} onClick={() => void cambiar(a, 'CANCELADA')}>Cancelar</button>
          </span>}
        </li>)}</ul>}
      </Contenido>
    </Marco>
  );
}

export function PanelMoviles({ seccion, visibles }: { seccion: Seccion<Moviles>; visibles: Set<string> }) {
  return (
    <Marco id="moviles" titulo="Móviles">
      <Contenido seccion={seccion}>{(m) => <>
        <div className="cm-cifras">
          <div className="cm-cifra"><strong>{m.disponibles.length}</strong><span>Disponibles</span></div>
          <div className="cm-cifra"><strong>{m.enServicio.length}</strong><span>En servicio</span></div>
          <div className="cm-cifra"><strong>{m.noOperativos.length}</strong><span>Fuera de servicio</span></div>
        </div>
        {m.enServicio.length > 0 && <ul className="cm-lista">{m.enServicio.map((v) => <li key={v.id}><span>{v.numeroInterno}{v.alias ? ` · ${v.alias}` : ''}</span><span className="badge" style={{ background: 'var(--info-fill)' }}>{v.estadoOperativo}</span></li>)}</ul>}
      </>}</Contenido>
      <EnlaceSiVisible ruta="/dashboard/vehiculos/flota" texto="Abrir Flota en vivo" visibles={visibles} />
    </Marco>
  );
}

export function PanelPersonal({ seccion }: { seccion: Seccion<PersonalDisponible> }) {
  return (
    <Marco id="personal" titulo="Personal disponible">
      <Contenido seccion={seccion}>{(p) => <div className="cm-cifras">
        <div className="cm-cifra"><strong>{p.alLlamado + p.enBase}</strong><span>Disponibles</span></div>
        <div className="cm-cifra"><strong>{p.enCamino}</strong><span>En camino</span></div>
        <div className="cm-cifra"><strong>{p.enServicio}</strong><span>En servicio</span></div>
        <div className="cm-cifra"><strong>{p.noDisponible}</strong><span>No disponibles</span></div>
      </div>}</Contenido>
    </Marco>
  );
}

export function PanelGuardia({ seccion, visibles }: { seccion: Seccion<GuardiaVigente>; visibles: Set<string> }) {
  return (
    <Marco id="guardia" titulo="Guardia de turno">
      <Contenido seccion={seccion}>{(g) => g.guardiasVigentes === 0
        ? <p className="cm-vacio">No hay ninguna guardia vigente en este momento.</p>
        : <ul className="cm-lista">{g.personal.map((p) => <li key={`${p.guardiaId}-${p.bomberoId}`}>
          <span>{p.nombre}<small>{p.rol ?? p.tipoParticipacion}{p.numeroBombero ? ` · N.º ${p.numeroBombero}` : ''}</small></span>
          {p.ausente && <span className="badge" style={{ background: 'var(--warn-fill)' }}>Ausente</span>}
        </li>)}</ul>}
      </Contenido>
      <EnlaceSiVisible ruta="/dashboard/guardias" texto="Abrir Guardias" visibles={visibles} />
    </Marco>
  );
}

export function PanelConvocatorias({ seccion, visibles }: { seccion: Seccion<Convocatoria[]>; visibles: Set<string> }) {
  return (
    <Marco id="convocatorias" titulo="Convocatorias abiertas">
      <Contenido seccion={seccion}>{(c) => c.length === 0
        ? <p className="cm-vacio">No hay convocatorias abiertas.</p>
        : <ul className="cm-lista">{c.map((x) => <li key={x.id}>
          <span>{x.mensaje}<small>{x.voy} van · {x.noPuedo} no pueden{x.menorEtaMinutos !== null ? ` · el primero llega en ${x.menorEtaMinutos} min` : ''}</small></span>
        </li>)}</ul>}
      </Contenido>
      <EnlaceSiVisible ruta="/dashboard/servicios/convocatorias" texto="Abrir Convocatorias" visibles={visibles} />
    </Marco>
  );
}

export function PanelPendientes({ seccion, visibles }: { seccion: Seccion<Pendiente[]>; visibles: Set<string> }) {
  return (
    <Marco id="pendientes" titulo="Pendientes de mi función">
      <Contenido seccion={seccion}>{(items) => <ul className="cm-lista">{items.map((p) => <li key={p.clave}>
        <span>
          <strong>{p.titulo}</strong>
          <small>{p.error ? `No se pudo consultar: ${p.error}` : p.detalle ?? ''}</small>
        </span>
        <span className="cm-acciones">
          {p.cantidad !== null && <span className="badge" style={{ background: FONDO_NIVEL[p.nivel] }}>{p.cantidad}</span>}
          <EnlaceSiVisible ruta={p.enlace} texto="Abrir" visibles={visibles} />
        </span>
      </li>)}</ul>}</Contenido>
    </Marco>
  );
}

export function PanelMiActividad({ seccion }: { seccion: Seccion<MiActividad> }) {
  const fecha = (f: string) => new Intl.DateTimeFormat('es-PY', { day: '2-digit', month: 'short' }).format(new Date(`${f}T12:00:00`));
  return (
    <Marco id="mi-actividad" titulo="Mi actividad">
      <Contenido seccion={seccion}>{(m) => !m.tienePerfilBombero
        ? <p className="cm-vacio">Tu usuario no está vinculado a una ficha de bombero.</p>
        : <ul className="cm-lista">
          {m.proximasGuardias.slice(0, 3).map((g) => <li key={g.id}><span>Guardia {fecha(g.fecha)}<small>{g.horaInicio.slice(0, 5)}–{g.horaFin.slice(0, 5)} · {g.turno}</small></span><span className="badge">{g.rol ?? g.estado}</span></li>)}
          {m.ultimosServicios.slice(0, 3).map((s) => <li key={s.id}><span>{s.numeroServicio}<small>{s.tipo ?? 'Servicio'} · {haceCuanto(new Date(s.fechaHoraAviso), new Date())}</small></span><span className="badge">{s.rol ?? s.estado}</span></li>)}
          {m.proximasGuardias.length === 0 && m.ultimosServicios.length === 0 && <li><span className="cm-vacio">Sin guardias próximas ni servicios recientes.</span></li>}
        </ul>}
      </Contenido>
    </Marco>
  );
}

export function PanelSistema({ seccion, visibles }: { seccion: Seccion<ResumenSistema>; visibles: Set<string> }) {
  return (
    <Marco id="sistema" titulo="Estado del sistema">
      <Contenido seccion={seccion}>{(r) => <>
        <span className={`semaforo semaforo-${r.nivel}`}>{ETIQUETA_NIVEL[r.nivel]}</span>
        {r.alertas.length === 0
          ? <p className="cm-vacio">Sin alertas.</p>
          : <ul className="cm-lista">{r.alertas.slice(0, 4).map((a, i) => <li key={i}><span>{a.mensaje}</span></li>)}</ul>}
      </>}</Contenido>
      <EnlaceSiVisible ruta="/dashboard/sistema" texto="Abrir el área Sistema" visibles={visibles} />
    </Marco>
  );
}

export function PanelAccesos({ permisos, matriz }: { permisos: string[]; matriz: MatrizWeb | null }) {
  const [busqueda, setBusqueda] = useState('');
  const grupos = useMemo(() => {
    const visibles = pantallasVisibles(PANTALLAS, permisos, matriz, MODULOS).filter((p) => p.modulo !== 'inicio' && p.ruta !== '/dashboard/centro-mando');
    const nombre = (slug: string) => MODULOS.find((m) => m.slug === slug)?.nombre ?? slug;
    const filtradas = busqueda.trim() ? visibles.filter((p) => coincideBusqueda(p.nombre, busqueda) || coincideBusqueda(nombre(p.modulo), busqueda)) : visibles;
    return MODULOS.map((m) => ({ slug: m.slug, nombre: m.nombre, pantallas: filtradas.filter((p) => p.modulo === m.slug) })).filter((g) => g.pantallas.length > 0);
  }, [permisos, matriz, busqueda]);

  return (
    <Marco id="accesos" titulo="Accesos rápidos" ancho>
      <label htmlFor="cm-buscar" className="sr-only">Buscar una pantalla</label>
      <input id="cm-buscar" className="input-field" placeholder="Buscar una pantalla…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      {grupos.length === 0 && <p className="cm-vacio">Ninguna pantalla coincide con «{busqueda}».</p>}
      <div className="cm-accesos">
        {grupos.map((g) => <div key={g.slug}>
          <h3 className="grupo-titulo">{g.nombre}</h3>
          <div className="cm-acciones">{g.pantallas.map((p) => <Link key={p.ruta} href={p.ruta} className="cm-acceso">{p.nombre}</Link>)}</div>
        </div>)}
      </div>
    </Marco>
  );
}
