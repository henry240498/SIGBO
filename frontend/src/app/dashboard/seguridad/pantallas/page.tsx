'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';

type TipoSujeto = 'ROL' | 'USUARIO' | 'RANGO' | 'CARGO';
type Accion = 'ver' | 'crear' | 'editar' | 'eliminar' | 'confidencial' | 'denegar';
interface Pantalla { codigo: string; nombre: string; descripcion: string | null; confidencialAplica: boolean; activa: boolean }
interface Sujeto { id: string; nombre: string }
interface Sujetos { roles: Sujeto[]; usuarios: Sujeto[]; rangos: Sujeto[]; cargos: Sujeto[] }
interface Regla {
  id: string; pantallaCodigo: string; sujetoTipo: TipoSujeto; sujetoId: string;
  ver: boolean; crear: boolean; editar: boolean; eliminar: boolean; confidencial: boolean; denegar: boolean;
}
const ACCIONES: { key: Accion; label: string }[] = [
  { key: 'ver', label: 'Ver' }, { key: 'crear', label: 'Crear' },
  { key: 'editar', label: 'Editar' }, { key: 'eliminar', label: 'Eliminar' },
  { key: 'confidencial', label: 'Confidencial' }, { key: 'denegar', label: 'Denegar' },
];
const GRUPOS: { tipo: TipoSujeto; titulo: string; clave: keyof Sujetos }[] = [
  { tipo: 'ROL', titulo: 'Rol', clave: 'roles' }, { tipo: 'USUARIO', titulo: 'Usuario', clave: 'usuarios' },
  { tipo: 'RANGO', titulo: 'Rango', clave: 'rangos' }, { tipo: 'CARGO', titulo: 'Cargo', clave: 'cargos' },
];
const VACIA = { ver: false, crear: false, editar: false, eliminar: false, confidencial: false, denegar: false };

export default function PermisosPantallaPage() {
  const [pantallas, setPantallas] = useState<Pantalla[]>([]);
  const [sujetos, setSujetos] = useState<Sujetos>({ roles: [], usuarios: [], rangos: [], cargos: [] });
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
  const pantalla = pantallas.find((p) => p.codigo === codigo);
  const opcionesSujeto = useMemo(() => sujetos[GRUPOS.find((g) => g.tipo === tipo)!.clave], [sujetos, tipo]);

  async function cargarBase() {
    setCargando(true); setError('');
    try {
      const [pRes, sRes] = await Promise.all([apiFetch('/pantallas'), apiFetch('/pantallas/sujetos')]);
      if (!pRes.ok || !sRes.ok) throw new Error('Tu usuario no tiene permiso para administrar reglas por pantalla.');
      const p: Pantalla[] = await pRes.json();
      setPantallas(p.filter((x) => x.activa));
      if (!codigo && p[0]) setCodigo(p.find((x) => x.activa)?.codigo ?? '');
      setSujetos(await sRes.json());
    } catch (e: any) { setError(e.message ?? 'No se pudo cargar la configuración.'); }
    finally { setCargando(false); }
  }

  async function cargarReglas() {
    if (!codigo) return;
    setError('');
    try {
      const res = await apiFetch(`/pantallas/reglas?codigo=${encodeURIComponent(codigo)}`);
      if (!res.ok) throw new Error('No se pudieron cargar las reglas.');
      setReglas(await res.json());
    } catch (e: any) { setError(e.message ?? 'No se pudieron cargar las reglas.'); }
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
      setAviso('Regla guardada y registrada en auditoría.'); setEditando(null); setForm(VACIA); setSujetoId('');
      await cargarReglas();
    } catch (e: any) { setError(e.message ?? 'No se pudo guardar la regla.'); }
    finally { setGuardando(false); }
  }

  async function quitar(id: string) {
    setError(''); setAviso('');
    try {
      const res = await apiFetch(`/pantallas/reglas/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo quitar la regla.');
      if (editando === id) { setEditando(null); setForm(VACIA); setSujetoId(''); }
      setAviso('Regla quitada y registrada en auditoría.'); await cargarReglas();
    } catch (e: any) { setError(e.message ?? 'No se pudo quitar la regla.'); }
  }

  const nombreSujeto = (r: Regla) => sujetos[GRUPOS.find((g) => g.tipo === r.sujetoTipo)!.clave].find((x) => x.id === r.sujetoId)?.nombre ?? r.sujetoId;

  return <main style={{ display: 'grid', gap: 16 }}>
    <header><h1 style={{ margin: 0 }}>Permisos por pantalla</h1><p style={{ color: 'var(--muted)' }}>Las reglas se aplican en el backend por rol, usuario, rango o cargo. Las acciones sensibles quedan auditadas.</p></header>
    {error && <div role="alert" className="card" style={{ color: 'var(--danger)' }}>{error}</div>}
    {aviso && <div role="status" className="card" style={{ color: 'var(--success)' }}>{aviso}</div>}
    {cargando ? <div className="card">Cargando configuración…</div> : <>
      <section className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
        <label>Pantalla<select value={codigo} onChange={(e) => setCodigo(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 6 }}>
          {pantallas.map((p) => <option key={p.codigo} value={p.codigo}>{p.codigo} · {p.nombre}</option>)}
        </select></label>
        <div><strong>{pantalla?.nombre}</strong><div style={{ color: 'var(--muted)', fontSize: 13 }}>{pantalla?.descripcion}</div></div>
      </section>
      <section className="card" style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 17 }}>{editando ? 'Editar regla' : 'Agregar regla'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
          <label>Tipo de sujeto<select value={tipo} onChange={(e) => { setTipo(e.target.value as TipoSujeto); setSujetoId(''); setEditando(null); setForm(VACIA); }} style={{ display: 'block', width: '100%', marginTop: 6 }}>{GRUPOS.map((g) => <option key={g.tipo} value={g.tipo}>{g.titulo}</option>)}</select></label>
          <label>{GRUPOS.find((g) => g.tipo === tipo)?.titulo}<select value={sujetoId} onChange={(e) => setSujetoId(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 6 }}><option value="">Seleccionar…</option>{opcionesSujeto.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select></label>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px' }}>{ACCIONES.map((a) => <label key={a.key} style={{ display: 'inline-flex', gap: 6, alignItems: 'center', opacity: a.key === 'confidencial' && !pantalla?.confidencialAplica ? .5 : 1 }}><input type="checkbox" checked={form[a.key]} disabled={a.key === 'confidencial' && !pantalla?.confidencialAplica} onChange={(e) => setForm((f) => ({ ...f, [a.key]: e.target.checked }))} />{a.label}</label>)}</div>
        <div style={{ display: 'flex', gap: 8 }}><button type="button" className="btn btn-primary" onClick={guardar} disabled={guardando || !sujetoId}>{guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Agregar regla'}</button>{editando && <button type="button" className="btn" onClick={() => { setEditando(null); setForm(VACIA); setSujetoId(''); }}>Cancelar edición</button>}</div>
      </section>
      <section className="card"><h2 style={{ marginTop: 0, fontSize: 17 }}>Reglas para {pantalla?.codigo}</h2>
        {!reglas.length ? <p style={{ color: 'var(--muted)' }}>Sin reglas específicas. Se aplican los permisos base del backend.</p> :
          <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 740 }}><thead><tr><th scope="col" style={{ textAlign: 'left' }}>Sujeto</th>{ACCIONES.map((a) => <th key={a.key} scope="col">{a.label}</th>)}<th scope="col">Acciones</th></tr></thead><tbody>{reglas.map((r) => <tr key={r.id} style={{ borderTop: '1px solid var(--line-soft)' }}><td style={{ padding: 9 }}>{r.sujetoTipo} · {nombreSujeto(r)}</td>{ACCIONES.map((a) => <td key={a.key} style={{ textAlign: 'center' }}>{r[a.key] ? '✓' : '—'}</td>)}<td style={{ whiteSpace: 'nowrap', padding: 8 }}><button type="button" className="btn" onClick={() => cargarEnEditor(r)}>Editar</button> <button type="button" className="btn" onClick={() => quitar(r.id)}>Quitar</button></td></tr>)}</tbody></table></div>}
      </section>
    </>}
  </main>;
}
