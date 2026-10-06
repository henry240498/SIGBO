'use client';

import dynamic from 'next/dynamic';
import { useEffect, useId, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import {
  EstadoHidrante,
  Hidrante,
  NivelRiesgo,
  Preplan,
  PuntoRiesgo,
  actualizarHidrante,
  actualizarPuntoRiesgo,
  cargarHidrantes,
  cargarHistorialPreplan,
  cargarPuntosRiesgo,
  crearHidrante,
  crearPuntoRiesgo,
  guardarPreplan,
} from '@/lib/cartografia';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';

const MapaCartografia = dynamic(() => import('@/components/MapaCartografia'), {
  ssr: false,
  loading: () => <p style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando mapa…</p>,
});

const ESTADOS: EstadoHidrante[] = ['SIN_VERIFICAR', 'OPERATIVO', 'FUERA_SERVICIO'];
const NIVELES: NivelRiesgo[] = ['BAJO', 'MEDIO', 'ALTO', 'CRITICO'];
const FONDO_ESTADO: Record<EstadoHidrante, string> = {
  OPERATIVO: 'var(--ok-fill)',
  FUERA_SERVICIO: 'var(--bad-fill)',
  SIN_VERIFICAR: 'var(--neutral-fill)',
};
const FONDO_NIVEL: Record<NivelRiesgo, string> = {
  BAJO: 'var(--info-fill)',
  MEDIO: 'var(--warn-fill)',
  ALTO: 'var(--warn-fill)',
  CRITICO: 'var(--bad-fill)',
};

const BOTON_NEUTRO: React.CSSProperties = {
  background: 'var(--neutral-fill)',
  color: 'var(--ink)',
  border: '1px solid var(--line)',
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 13,
  cursor: 'pointer',
};

type Vista = 'hidrantes' | 'puntos';

export default function CartografiaPage() {
  const id = useId();
  const [vista, setVista] = useState<Vista>('hidrantes');
  const [hidrantes, setHidrantes] = useState<Hidrante[] | null>(null);
  const [puntos, setPuntos] = useState<PuntoRiesgo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [sel, setSel] = useState<{ lat: number; lon: number } | null>(null);

  // formulario de hidrante
  const [codigo, setCodigo] = useState('');
  const [tipo, setTipo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [caudal, setCaudal] = useState('');
  // formulario de punto de riesgo
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [nivel, setNivel] = useState<NivelRiesgo>('MEDIO');
  const [contactoNombre, setContactoNombre] = useState('');
  const [contactoTelefono, setContactoTelefono] = useState('');
  const [descripcion, setDescripcion] = useState('');
  // pre-plan
  const [puntoPlan, setPuntoPlan] = useState<PuntoRiesgo | null>(null);
  const [versiones, setVersiones] = useState<Preplan[]>([]);
  const [tituloPlan, setTituloPlan] = useState('');
  const [contenidoPlan, setContenidoPlan] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCrear = permisos.includes('servicios:crear');
  const puedeEditar = permisos.includes('servicios:editar');

  async function cargar() {
    try {
      const [h, p] = await Promise.all([cargarHidrantes(), cargarPuntosRiesgo()]);
      setHidrantes(h);
      setPuntos(p);
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function ejecutar(accion: () => Promise<unknown>, ok: string) {
    setError(null);
    setMensaje(null);
    try {
      await accion();
      setMensaje(ok);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  function exigirUbicacion(): { lat: number; lon: number } | null {
    if (!sel) {
      setError('Primero haga clic en el mapa para elegir la ubicación.');
      return null;
    }
    return sel;
  }

  async function altaHidrante(e: React.FormEvent) {
    e.preventDefault();
    const u = exigirUbicacion();
    if (!u) return;
    await ejecutar(async () => {
      await crearHidrante({
        codigo,
        direccion,
        latitud: u.lat,
        longitud: u.lon,
        tipo: tipo || undefined,
        caudalLpm: caudal ? Number(caudal) : undefined,
      });
      setCodigo('');
      setTipo('');
      setDireccion('');
      setCaudal('');
      setSel(null);
    }, 'Hidrante registrado');
  }

  async function altaPunto(e: React.FormEvent) {
    e.preventDefault();
    const u = exigirUbicacion();
    if (!u) return;
    await ejecutar(async () => {
      await crearPuntoRiesgo({
        nombre,
        direccion,
        latitud: u.lat,
        longitud: u.lon,
        nivelRiesgo: nivel,
        categoria: categoria || undefined,
        contactoNombre: contactoNombre || undefined,
        contactoTelefono: contactoTelefono || undefined,
        descripcion: descripcion || undefined,
      });
      setNombre('');
      setDireccion('');
      setCategoria('');
      setContactoNombre('');
      setContactoTelefono('');
      setDescripcion('');
      setSel(null);
    }, 'Punto de riesgo registrado');
  }

  async function abrirPreplan(p: PuntoRiesgo) {
    setError(null);
    try {
      const v = await cargarHistorialPreplan(p.id);
      setPuntoPlan(p);
      setVersiones(v);
      const vigente = v.find((x) => x.vigente);
      setTituloPlan(vigente?.titulo ?? `Pre-plan ${p.nombre}`);
      setContenidoPlan(vigente?.contenido ?? '');
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function guardarPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!puntoPlan) return;
    await ejecutar(async () => {
      await guardarPreplan(puntoPlan.id, tituloPlan, contenidoPlan);
      setVersiones(await cargarHistorialPreplan(puntoPlan.id));
    }, 'Pre-plan guardado como versión nueva');
  }

  const etiqueta = (t: string, c: string, v: string, set: (s: string) => void, extra: Partial<React.InputHTMLAttributes<HTMLInputElement>> = {}) => (
    <div>
      <label htmlFor={`${id}-${c}`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>{t}</label>
      <input id={`${id}-${c}`} className="input-field" value={v} onChange={(e) => set(e.target.value)} {...extra} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 16 }}>Hidrantes y puntos de riesgo</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Para cargar uno nuevo, haga clic en el mapa donde está y complete la ficha.
        </p>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      <MapaCartografia
        hidrantes={hidrantes ?? []}
        puntos={puntos ?? []}
        seleccion={sel}
        onElegir={puedeCrear ? (lat, lon) => setSel({ lat, lon }) : undefined}
      />
      {sel && (
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
          Ubicación elegida: {sel.lat.toFixed(6)}, {sel.lon.toFixed(6)}
        </p>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className={vista === 'hidrantes' ? 'btn-primary' : undefined} style={vista === 'hidrantes' ? undefined : BOTON_NEUTRO} onClick={() => setVista('hidrantes')}>
          Hidrantes ({hidrantes?.length ?? 0})
        </button>
        <button type="button" className={vista === 'puntos' ? 'btn-primary' : undefined} style={vista === 'puntos' ? undefined : BOTON_NEUTRO} onClick={() => setVista('puntos')}>
          Puntos de riesgo ({puntos?.length ?? 0})
        </button>
      </div>

      {vista === 'hidrantes' && (
        <>
          {puedeCrear && (
            <form className="card" onSubmit={altaHidrante} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <strong style={{ fontSize: 14 }}>Nuevo hidrante</strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                {etiqueta('Código', 'cod', codigo, setCodigo, { required: true, maxLength: 30 })}
                {etiqueta('Tipo', 'tipo', tipo, setTipo, { maxLength: 40 })}
                {etiqueta('Dirección', 'dir', direccion, setDireccion, { required: true, minLength: 3, maxLength: 300 })}
                {etiqueta('Caudal (l/min)', 'caudal', caudal, setCaudal, { type: 'number', min: 0 })}
              </div>
              <div><button type="submit" className="btn-primary">Registrar hidrante</button></div>
            </form>
          )}
          {hidrantes === null ? (
            <Cargando texto="Cargando hidrantes…" />
          ) : hidrantes.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Todavía no hay hidrantes cargados.</p>
          ) : (
            <div className="card" style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Código</th>
                    <th scope="col">Dirección</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Caudal</th>
                    {puedeEditar && <th scope="col">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {hidrantes.map((h) => (
                    <tr key={h.id}>
                      <td><strong>{h.codigo}</strong>{h.tipo ? <div style={{ fontSize: 12, color: 'var(--muted)' }}>{h.tipo}</div> : null}</td>
                      <td>{h.direccion}</td>
                      <td>
                        {puedeEditar ? (
                          <select
                            aria-label={`Estado del hidrante ${h.codigo}`}
                            className="input-field"
                            style={{ width: 'auto', background: FONDO_ESTADO[h.estado] }}
                            value={h.estado}
                            onChange={(e) => ejecutar(() => actualizarHidrante(h.id, { estado: e.target.value as EstadoHidrante }), `Hidrante ${h.codigo} actualizado`)}
                          >
                            {ESTADOS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                          </select>
                        ) : (
                          <span className="badge" style={{ background: FONDO_ESTADO[h.estado] }}>{h.estado.replace('_', ' ')}</span>
                        )}
                      </td>
                      <td>{h.caudalLpm ? `${h.caudalLpm} l/min` : '—'}</td>
                      {puedeEditar && (
                        <td>
                          <button type="button" style={BOTON_NEUTRO} onClick={() => ejecutar(() => actualizarHidrante(h.id, { activo: false }), `Hidrante ${h.codigo} dado de baja`)}>
                            Dar de baja
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {vista === 'puntos' && (
        <>
          {puedeCrear && (
            <form className="card" onSubmit={altaPunto} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <strong style={{ fontSize: 14 }}>Nuevo punto de riesgo</strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                {etiqueta('Nombre', 'nom', nombre, setNombre, { required: true, minLength: 2, maxLength: 150 })}
                {etiqueta('Dirección', 'pdir', direccion, setDireccion, { required: true, minLength: 3, maxLength: 300 })}
                {etiqueta('Categoría', 'cat', categoria, setCategoria, { maxLength: 60 })}
                <div>
                  <label htmlFor={`${id}-nivel`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nivel de riesgo</label>
                  <select id={`${id}-nivel`} className="input-field" value={nivel} onChange={(e) => setNivel(e.target.value as NivelRiesgo)}>
                    {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                {etiqueta('Contacto', 'cn', contactoNombre, setContactoNombre, { maxLength: 150 })}
                {etiqueta('Teléfono', 'ct', contactoTelefono, setContactoTelefono, { maxLength: 40 })}
              </div>
              <div>
                <label htmlFor={`${id}-pdesc`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripción</label>
                <textarea id={`${id}-pdesc`} className="input-field" rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={1000} />
              </div>
              <div><button type="submit" className="btn-primary">Registrar punto de riesgo</button></div>
            </form>
          )}
          {puntos === null ? (
            <Cargando texto="Cargando puntos de riesgo…" />
          ) : puntos.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Todavía no hay puntos de riesgo cargados.</p>
          ) : (
            <div className="card" style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Dirección</th>
                    <th scope="col">Riesgo</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {puntos.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.nombre}</strong>
                        {p.categoria ? <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.categoria}</div> : null}
                        {p.contactoNombre || p.contactoTelefono ? (
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{[p.contactoNombre, p.contactoTelefono].filter(Boolean).join(' · ')}</div>
                        ) : null}
                      </td>
                      <td>{p.direccion}</td>
                      <td><span className="badge" style={{ background: FONDO_NIVEL[p.nivelRiesgo] }}>{p.nivelRiesgo}</span></td>
                      <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button type="button" style={BOTON_NEUTRO} onClick={() => abrirPreplan(p)}>Pre-plan</button>
                        {puedeEditar && (
                          <button type="button" style={BOTON_NEUTRO} onClick={() => ejecutar(() => actualizarPuntoRiesgo(p.id, { activo: false }), `${p.nombre} dado de baja`)}>
                            Dar de baja
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {puntoPlan && (
            <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }} aria-label={`Pre-plan de ${puntoPlan.nombre}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Pre-plan de {puntoPlan.nombre}</strong>
                <button type="button" style={BOTON_NEUTRO} onClick={() => setPuntoPlan(null)}>Cerrar</button>
              </div>
              {puedeEditar ? (
                <form onSubmit={guardarPlan} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {etiqueta('Título', 'pt', tituloPlan, setTituloPlan, { required: true, minLength: 3, maxLength: 200 })}
                  <div>
                    <label htmlFor={`${id}-pc`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                      Contenido (accesos, riesgos, recursos, hidrantes cercanos, instrucciones)
                    </label>
                    <textarea id={`${id}-pc`} className="input-field" rows={10} value={contenidoPlan} onChange={(e) => setContenidoPlan(e.target.value)} required minLength={3} maxLength={20000} />
                  </div>
                  <div><button type="submit" className="btn-primary">Guardar nueva versión</button></div>
                </form>
              ) : (
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: 13 }}>{versiones.find((v) => v.vigente)?.contenido ?? 'Sin pre-plan.'}</pre>
              )}
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                Versiones: {versiones.length === 0 ? 'ninguna todavía' : versiones.map((v) => `v${v.version}${v.vigente ? ' (vigente)' : ''} ${new Date(v.creadoEn).toLocaleDateString('es-PY')}`).join(' · ')}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
