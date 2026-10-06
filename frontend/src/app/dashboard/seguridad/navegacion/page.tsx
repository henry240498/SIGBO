'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Usuario { id: string; username: string; email?: string }
interface Servicio { id: string; numero: string; estado: string }
interface Entrada { hora: string; origen: string; titulo: string; detalle?: unknown; servicioId?: string | null; duracionSeg?: number | null }
interface LineaAuditoria {
  usuario: { id: string; nombre: string | null };
  fecha: string;
  servicios: Servicio[];
  totales: { entradas: number; pantallasVisitadas: number; segundosEnPantallas: number };
  linea: Entrada[];
}

const fechaHoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function NavegacionPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioId, setUsuarioId] = useState('');
  const [fecha, setFecha] = useState(fechaHoy);
  const [servicioId, setServicioId] = useState('');
  const [resultado, setResultado] = useState<LineaAuditoria | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/seguridad/usuarios').then(async (res) => {
      if (!res.ok) throw new Error('No se pudo cargar la lista de usuarios.');
      const data: Usuario[] = await res.json();
      setUsuarios(data);
      if (data[0]) setUsuarioId(data[0].id);
    }).catch((e) => setError(e.message));
  }, []);

  async function consultar(e?: FormEvent) {
    e?.preventDefault();
    if (!usuarioId || !fecha) return;
    setCargando(true);
    setError('');
    try {
      const params = new URLSearchParams({ usuarioId, fecha });
      if (servicioId) params.set('servicioId', servicioId);
      const res = await apiFetch(`/navegacion/linea?${params}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? 'No se pudo consultar la navegación.');
      setResultado(data);
      if (servicioId && !data.servicios?.some((s: Servicio) => s.id === servicioId)) setServicioId('');
    } catch (e: any) {
      setError(e.message ?? 'Error de conexión.');
    } finally {
      setCargando(false);
    }
  }

  return <main style={{ display: 'grid', gap: 16 }}>
    <header>
      <h1 style={{ margin: 0 }}>Auditoría de navegación</h1>
      <p style={{ color: 'var(--muted)' }}>Consulta cronológica de pantallas, acciones y actividad operativa. Cada consulta queda auditada.</p>
    </header>
    <form className="card" onSubmit={consultar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', alignItems: 'end', gap: 12 }}>
      <label>Usuario<select value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)} required style={{ display: 'block', width: '100%', marginTop: 6 }}>
        <option value="">Seleccionar usuario</option>{usuarios.map((u) => <option key={u.id} value={u.id}>{u.username}{u.email ? ` · ${u.email}` : ''}</option>)}
      </select></label>
      <label>Fecha<input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required style={{ display: 'block', width: '100%', marginTop: 6 }} /></label>
      <label>Servicio<select value={servicioId} onChange={(e) => setServicioId(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 6 }}>
        <option value="">Todos los servicios del día</option>{resultado?.servicios.map((s) => <option key={s.id} value={s.id}>{s.numero} · {s.estado}</option>)}
      </select></label>
      <button type="submit" className="btn btn-primary" disabled={cargando || !usuarioId}>{cargando ? 'Consultando…' : 'Consultar'}</button>
    </form>
    {error && <p role="alert" style={{ color: 'var(--danger)' }}>{error}</p>}
    {resultado && <>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        <div className="card"><small>Usuario</small><strong style={{ display: 'block', marginTop: 4 }}>{resultado.usuario.nombre ?? resultado.usuario.id}</strong></div>
        <div className="card"><small>Eventos</small><strong style={{ display: 'block', marginTop: 4 }}>{resultado.totales.entradas}</strong></div>
        <div className="card"><small>Pantallas visitadas</small><strong style={{ display: 'block', marginTop: 4 }}>{resultado.totales.pantallasVisitadas}</strong></div>
        <div className="card"><small>Tiempo registrado en pantallas</small><strong style={{ display: 'block', marginTop: 4 }}>{Math.floor(resultado.totales.segundosEnPantallas / 60)} min</strong></div>
      </section>
      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: 17 }}>Línea de tiempo · {resultado.fecha}</h2>
        {!resultado.linea.length ? <p style={{ color: 'var(--muted)' }}>No hay actividad registrada para estos filtros.</p> :
          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>{resultado.linea.map((item, i) => <li key={`${item.hora}-${i}`} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 12, padding: '12px 4px', borderBottom: '1px solid var(--line-soft)' }}>
            <time dateTime={item.hora} style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--muted)' }}>{new Date(item.hora).toLocaleTimeString()}</time>
            <div><div style={{ fontWeight: 650 }}>{item.titulo}</div><small style={{ color: 'var(--muted)' }}>{item.origen}{item.servicioId ? ` · servicio ${resultado.servicios.find((s) => s.id === item.servicioId)?.numero ?? item.servicioId}` : ''}{item.duracionSeg != null ? ` · ${item.duracionSeg} s` : ''}</small>
              {item.detalle != null && <details style={{ marginTop: 5 }}><summary style={{ cursor: 'pointer', color: 'var(--muted)' }}>Detalle</summary><pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: 12 }}>{JSON.stringify(item.detalle, null, 2)}</pre></details>}
            </div>
          </li>)}</ol>}
      </section>
    </>}
  </main>;
}
