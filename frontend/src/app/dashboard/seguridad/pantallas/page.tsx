'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { MODULOS } from '@/lib/modulos';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { agruparPantallas, FilaPantalla, filtrarGrupos, PantallaAdmin, PantallaCatalogoAdmin } from '@/lib/pantallas-admin';

type TipoSujeto = 'ROL' | 'USUARIO' | 'RANGO' | 'CARGO';
type Accion = 'ver' | 'crear' | 'editar' | 'eliminar' | 'confidencial' | 'denegar';
interface Sujeto { id: string; nombre: string }
interface Sujetos { roles: Sujeto[]; usuarios: Sujeto[]; rangos: Sujeto[]; cargos: Sujeto[] }
interface Regla { id: string; pantallaCodigo: string; sujetoTipo: TipoSujeto; sujetoId: string; ver: boolean; crear: boolean; editar: boolean; eliminar: boolean; confidencial: boolean; denegar: boolean }
interface DecisionUi { permitido: boolean; origen: 'ROL' | 'REGLA' }
interface FilaVistaPrevia { codigo: string; ruta: string; nombre: string; modulo: string; ver: DecisionUi; crear: DecisionUi; editar: DecisionUi; eliminar: DecisionUi }

const ACCIONES: { key: Accion; label: string }[] = [
  { key: 'ver', label: 'Ver' }, { key: 'crear', label: 'Crear' }, { key: 'editar', label: 'Editar' },
  { key: 'eliminar', label: 'Eliminar' }, { key: 'confidencial', label: 'Confidencial' }, { key: 'denegar', label: 'Denegar' },
];
const GRUPOS_SUJETO: { tipo: TipoSujeto; titulo: string; clave: keyof Sujetos }[] = [
  { tipo: 'ROL', titulo: 'Rol', clave: 'roles' }, { tipo: 'USUARIO', titulo: 'Usuario', clave: 'usuarios' },
  { tipo: 'RANGO', titulo: 'Rango', clave: 'rangos' }, { tipo: 'CARGO', titulo: 'Cargo', clave: 'cargos' },
];
const VACIA: Record<Accion, boolean> = { ver: false, crear: false, editar: false, eliminar: false, confidencial: false, denegar: false };
const NOMBRES_MODULO = Object.fromEntries(MODULOS.map((m) => [m.slug, m.nombre]));

export default function PermisosPantallaPage() {
  const confirmar = useConfirmacion();
  const [filas, setFilas] = useState<FilaPantalla[]>([]);
  const [catalogo, setCatalogo] = useState<PantallaCatalogoAdmin[]>([]);
  const [sujetos, setSujetos] = useState<Sujetos>({ roles: [], usuarios: [], rangos: [], cargos: [] });
  const [busqueda, setBusqueda] = useState('');
  const [codigo, setCodigo] = useState('');
  const [reglas, setReglas] = useState<Regla[]>([]);
  const [tipo, setTipo] = useState<TipoSujeto>('ROL');
  const [sujetoId, setSujetoId] = useState('');
  const [form, setForm] = useState<Record<Accion, boolean>>(VACIA);
  const [editando, setEditando] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [usuarioPrevia, setUsuarioPrevia] = useState('');
  const [previa, setPrevia] = useState<FilaVistaPrevia[] | null>(null);
  const [soloRestringidas, setSoloRestringidas] = useState(true);

  const grupos = useMemo(() => agruparPantallas(filas, catalogo, NOMBRES_MODULO), [filas, catalogo]);
  const visibles = useMemo(() => filtrarGrupos(grupos, busqueda), [grupos, busqueda]);
  const pantalla: PantallaAdmin | undefined = grupos.flatMap((g) => g.pantallas).find((p) => p.codigo === codigo);
  const opcionesSujeto = sujetos[GRUPOS_SUJETO.find((g) => g.tipo === tipo)!.clave];

  async function cargarBase() {
    setCargando(true); setError('');
    try {
      const [pRes, cRes, sRes] = await Promise.all([apiFetch('/pantallas'), apiFetch('/pantallas/catalogo-web').catch(() => null), apiFetch('/pantallas/sujetos')]);
      if (!pRes.ok || !sRes.ok) throw new Error('Tu usuario no tiene permiso para administrar reglas por pantalla.');
      setFilas(await pRes.json());
      setSujetos(await sRes.json());
      let pantallasWeb: PantallaCatalogoAdmin[] = [];
      try {
        if (!cRes || !cRes.ok) throw new Error('catalogo');
        pantallasWeb = ((await cRes.json()) as { pantallas?: PantallaCatalogoAdmin[] }).pantallas ?? [];
      } catch { setError('No se pudo cargar el catálogo de rutas: las reglas se pueden editar igual, sin la lista de rutas de cada pantalla.'); }
      setCatalogo(pantallasWeb);
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar la configuración.'); }
    finally { setCargando(false); }
  }

  async function cargarReglas() {
    if (!codigo) { setReglas([]); return; }
    try {
      const res = await apiFetch(`/pantallas/reglas?codigo=${encodeURIComponent(codigo)}`);
      if (!res.ok) throw new Error('No se pudieron cargar las reglas.');
      setReglas(await res.json());
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudieron cargar las reglas.'); }
  }

  useEffect(() => { void cargarBase(); }, []);
  useEffect(() => { void cargarReglas(); setEditando(null); setForm(VACIA); setSujetoId(''); }, [codigo]);

  function cargarEnEditor(r: Regla) {
    setTipo(r.sujetoTipo); setSujetoId(r.sujetoId); setEditando(r.id);
    setForm({ ver: r.ver, crear: r.crear, editar: r.editar, eliminar: r.eliminar, confidencial: r.confidencial, denegar: r.denegar });
  }

  async function guardar() {
    if (!codigo || !sujetoId) return;
    setGuardando(true); setError(''); setAviso('');
    try {
      const res = await apiFetch('/pantallas/reglas', { method: 'PUT', body: JSON.stringify({ pantallaCodigo: codigo, sujetoTipo: tipo, sujetoId, ...form }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? 'No se pudo guardar la regla.');
      setAviso('Regla guardada y registrada en auditoría. Rige en el servidor en menos de un minuto.');
      setEditando(null); setForm(VACIA); setSujetoId('');
      await cargarReglas();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar la regla.'); }
    finally { setGuardando(false); }
  }

  async function quitar(r: Regla) {
    const ok = await confirmar({ titulo: 'Quitar regla', mensaje: `Se quita la regla de ${r.sujetoTipo.toLowerCase()} «${nombreSujeto(r)}» sobre «${pantalla?.nombre ?? r.pantallaCodigo}».`, confirmar: 'Quitar', peligro: true });
    if (!ok) return;
    setError(''); setAviso('');
    try {
      const res = await apiFetch(`/pantallas/reglas/${r.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo quitar la regla.');
      if (editando === r.id) { setEditando(null); setForm(VACIA); setSujetoId(''); }
      setAviso('Regla quitada y registrada en auditoría.');
      await cargarReglas();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo quitar la regla.'); }
  }

  async function verPrevia() {
    if (!usuarioPrevia) return;
    setError(''); setPrevia(null);
    try {
      const res = await apiFetch(`/pantallas/vista-previa?usuarioId=${encodeURIComponent(usuarioPrevia)}`);
      if (!res.ok) throw new Error('No se pudo calcular la vista previa.');
      setPrevia(await res.json());
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo calcular la vista previa.'); }
  }

  function nombreSujeto(r: Regla) {
    return sujetos[GRUPOS_SUJETO.find((g) => g.tipo === r.sujetoTipo)!.clave].find((x) => x.id === r.sujetoId)?.nombre ?? r.sujetoId;
  }

  const filasPrevia = (previa ?? []).filter((f) => !soloRestringidas || [f.ver, f.crear, f.editar, f.eliminar].some((d) => d.origen === 'REGLA'));
  const marca = (d: DecisionUi) => <span className="badge" style={{ background: d.permitido ? 'var(--ok-fill)' : 'var(--bad-fill)' }} title={d.origen === 'REGLA' ? 'Lo decide una regla' : 'Lo decide el rol'}>{d.permitido ? 'Sí' : 'No'}{d.origen === 'REGLA' ? ' · regla' : ''}</span>;

  if (cargando) return <Cargando texto="Cargando pantallas y reglas…" />;

  return <div style={{ display: 'grid', gap: 16 }}>
    <p style={{ color: 'var(--muted)', fontSize: 14 }}>
      Las reglas restringen lo que el rol permite, por rol, usuario, rango o cargo, y el servidor las exige en cada pantalla. Denegar gana siempre.
      Para dar más de lo que el rol permite, asigná el permiso en Roles.
    </p>
    {error && <Aviso tipo="error" texto={error} />}
    {aviso && <Aviso tipo="exito" texto={aviso} />}

    <div className="pantallas-admin">
      <section className="card pantallas-lista" aria-labelledby="titulo-lista">
        <h2 id="titulo-lista" style={{ fontSize: 16, marginBottom: 10 }}>Pantallas</h2>
        <label htmlFor="buscar-pantalla" className="sr-only">Buscar pantalla</label>
        <input id="buscar-pantalla" className="input-field" placeholder="Buscar por nombre, ruta o código…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        <div style={{ marginTop: 10, display: 'grid', gap: 12 }}>
          {visibles.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Ninguna pantalla coincide con «{busqueda}».</p>}
          {visibles.map((g) => <div key={g.clave}>
            <h3 className="grupo-titulo">{g.titulo}</h3>
            <ul style={{ listStyle: 'none', display: 'grid', gap: 2 }}>
              {g.pantallas.map((p) => <li key={p.codigo}>
                <button type="button" className={`pantallas-opcion${p.codigo === codigo ? ' activa' : ''}`} aria-pressed={p.codigo === codigo} onClick={() => setCodigo(p.codigo)}>
                  <span>{p.nombre}</span><small>{p.codigo}</small>
                </button>
              </li>)}
            </ul>
          </div>)}
        </div>
      </section>

      <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
        {!pantalla && <section className="card"><p style={{ color: 'var(--muted)' }}>Elegí una pantalla de la lista para ver sus rutas y reglas.</p></section>}
        {pantalla && <>
          <section className="card" aria-labelledby="titulo-pantalla">
            <h2 id="titulo-pantalla" style={{ fontSize: 17 }}>{pantalla.nombre}</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>{pantalla.codigo}{pantalla.ruta ? ` · ${pantalla.ruta}` : ''} · {pantalla.tipo === 'MOVIL' ? 'app móvil' : pantalla.tipo === 'SECCION' ? 'sección del Centro de mando' : 'pantalla web'}</p>
            {pantalla.rutasApi.length > 0 && <div style={{ overflowX: 'auto', marginTop: 12 }}>
              <table className="tabla-compacta">
                <caption className="sr-only">Rutas de la API que cubre esta pantalla</caption>
                <thead><tr><th scope="col">Método</th><th scope="col">Ruta</th><th scope="col">Permiso por rol</th><th scope="col">Matriz</th></tr></thead>
                <tbody>{pantalla.rutasApi.map((r) => <tr key={`${r.metodo} ${r.patron}`}>
                  <td><code>{r.metodo}</code></td><td><code>{r.patron}</code></td>
                  <td>{r.permisos.length ? r.permisos.join(' o ') : 'cualquier usuario'}</td>
                  <td>{r.exenta ? <span className="badge" style={{ background: 'var(--neutral-fill)' }}>exenta</span> : <span className="badge" style={{ background: 'var(--info-fill)' }}>aplica</span>}</td>
                </tr>)}</tbody>
              </table>
            </div>}
          </section>

          <section className="card" style={{ display: 'grid', gap: 12 }} aria-labelledby="titulo-editor">
            <h2 id="titulo-editor" style={{ fontSize: 16 }}>{editando ? 'Editar regla' : 'Agregar regla'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
              <div><label htmlFor="tipo-sujeto">Tipo de sujeto</label>
                <select id="tipo-sujeto" className="input-field" value={tipo} onChange={(e) => { setTipo(e.target.value as TipoSujeto); setSujetoId(''); setEditando(null); setForm(VACIA); }}>
                  {GRUPOS_SUJETO.map((g) => <option key={g.tipo} value={g.tipo}>{g.titulo}</option>)}
                </select></div>
              <div><label htmlFor="sujeto">{GRUPOS_SUJETO.find((g) => g.tipo === tipo)?.titulo}</label>
                <select id="sujeto" className="input-field" value={sujetoId} onChange={(e) => setSujetoId(e.target.value)}>
                  <option value="">Seleccionar…</option>{opcionesSujeto.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select></div>
            </div>
            <fieldset style={{ border: 0, display: 'flex', flexWrap: 'wrap', gap: '8px 18px' }}>
              <legend className="sr-only">Acciones</legend>
              {ACCIONES.map((a) => {
                const deshabilitada = a.key === 'confidencial' && !pantalla.confidencialAplica;
                return <label key={a.key} htmlFor={`accion-${a.key}`} style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: deshabilitada ? 'var(--muted)' : undefined }}>
                  <input id={`accion-${a.key}`} type="checkbox" checked={form[a.key]} disabled={deshabilitada} onChange={(e) => setForm((f) => ({ ...f, [a.key]: e.target.checked }))} />{a.label}
                </label>;
              })}
            </fieldset>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn-primary" onClick={guardar} disabled={guardando || !sujetoId}>{guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Agregar regla'}</button>
              {editando && <button type="button" className="service-secondary" onClick={() => { setEditando(null); setForm(VACIA); setSujetoId(''); }}>Cancelar edición</button>}
            </div>
          </section>

          <section className="card" aria-labelledby="titulo-reglas">
            <h2 id="titulo-reglas" style={{ fontSize: 16 }}>Reglas de esta pantalla</h2>
            {!reglas.length ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin reglas: rige solo el permiso por rol.</p> :
              <div style={{ overflowX: 'auto' }}><table className="tabla-compacta">
                <thead><tr><th scope="col">Sujeto</th>{ACCIONES.map((a) => <th key={a.key} scope="col">{a.label}</th>)}<th scope="col">Acciones</th></tr></thead>
                <tbody>{reglas.map((r) => <tr key={r.id}>
                  <td>{r.sujetoTipo} · {nombreSujeto(r)}</td>
                  {ACCIONES.map((a) => <td key={a.key} style={{ textAlign: 'center' }}>{r[a.key] ? 'Sí' : '—'}</td>)}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button type="button" className="service-secondary" onClick={() => cargarEnEditor(r)}>Editar</button>{' '}
                    <button type="button" className="service-secondary" onClick={() => void quitar(r)}>Quitar</button>
                  </td>
                </tr>)}</tbody>
              </table></div>}
          </section>
        </>}

        <section className="card" style={{ display: 'grid', gap: 10 }} aria-labelledby="titulo-previa">
          <h2 id="titulo-previa" style={{ fontSize: 16 }}>Vista previa: qué ve una persona</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div><label htmlFor="usuario-previa">Usuario</label>
              <select id="usuario-previa" className="input-field" value={usuarioPrevia} onChange={(e) => { setUsuarioPrevia(e.target.value); setPrevia(null); }}>
                <option value="">Seleccionar…</option>{sujetos.usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
              </select></div>
            <button type="button" className="btn-primary" disabled={!usuarioPrevia} onClick={() => void verPrevia()}>Calcular</button>
            <label htmlFor="solo-restringidas" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              <input id="solo-restringidas" type="checkbox" checked={soloRestringidas} onChange={(e) => setSoloRestringidas(e.target.checked)} />Solo donde decide una regla
            </label>
          </div>
          {previa && (filasPrevia.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>{soloRestringidas ? 'Ninguna regla afecta a esta persona: ve lo que su rol permite.' : 'Sin pantallas.'}</p>
            : <div style={{ overflowX: 'auto' }}><table className="tabla-compacta">
              <thead><tr><th scope="col">Pantalla</th><th scope="col">Ver</th><th scope="col">Crear</th><th scope="col">Editar</th><th scope="col">Eliminar</th></tr></thead>
              <tbody>{filasPrevia.map((f) => <tr key={f.codigo}>
                <td>{f.nombre}<small style={{ display: 'block', color: 'var(--muted)' }}>{f.ruta}</small></td>
                <td>{marca(f.ver)}</td><td>{marca(f.crear)}</td><td>{marca(f.editar)}</td><td>{marca(f.eliminar)}</td>
              </tr>)}</tbody>
            </table></div>)}
        </section>
      </div>
    </div>
  </div>;
}
