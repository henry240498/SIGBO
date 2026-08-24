'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useConfirmacion } from '@/app/components/ConfirmProvider';

interface Permiso {
  id: string;
  nombre: string;
  descripcion: string | null;
  recurso: string;
  accion: string;
  categoria: string | null;
  esSistema: boolean;
}

export default function PermisosPage() {
  const confirmar = useConfirmacion();
  const [permisos, setPermisos] = useState<Permiso[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [nombre, setNombre] = useState('');
  const [recurso, setRecurso] = useState('');
  const [accion, setAccion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');

  async function cargar() {
    try {
      const res = await apiFetch('/seguridad/permisos');
      if (!res.ok) throw new Error('No se pudo cargar permisos');
      setPermisos(await res.json());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await apiFetch('/seguridad/permisos', {
      method: 'POST',
      body: JSON.stringify({ nombre, recurso, accion, categoria: categoria || undefined, descripcion: descripcion || undefined }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo crear el permiso');
      return;
    }
    setNombre('');
    setRecurso('');
    setAccion('');
    setCategoria('');
    setDescripcion('');
    setMostrarForm(false);
    await cargar();
  }

  async function eliminar(id: string) {
    setError(null);
    if (!await confirmar({titulo:'Eliminar permiso',mensaje:'El permiso se quitará de todos los roles y usuarios que lo tengan.',confirmar:'Eliminar',peligro:true})) return;
    const res = await apiFetch(`/seguridad/permisos/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo eliminar el permiso');
      return;
    }
    await cargar();
  }

  const porCategoria = new Map<string, Permiso[]>();
  for (const p of permisos ?? []) {
    const cat = p.categoria ?? 'Otros';
    if (!porCategoria.has(cat)) porCategoria.set(cat, []);
    porCategoria.get(cat)!.push(p);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Permisos ({permisos?.length ?? 0})</h2>
        <button type="button" className="btn-primary" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : 'Nuevo permiso'}
        </button>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {mostrarForm && (
        <form className="card" onSubmit={crear} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre (recurso:accion)</label>
            <input className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="productos:crear" required />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Recurso</label>
            <input className="input-field" value={recurso} onChange={(e) => setRecurso(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Accion</label>
            <input className="input-field" value={accion} onChange={(e) => setAccion(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Categoria</label>
            <input className="input-field" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripcion</label>
            <input className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1', justifySelf: 'start' }}>
            Crear permiso
          </button>
        </form>
      )}

      {[...porCategoria.entries()].map(([cat, ps]) => (
        <section key={cat} className="card">
          <h3 style={{ fontSize: 14, marginBottom: 10, color: '#94a3b8' }}>{cat}</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              {ps.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>{p.nombre}</td>
                  <td style={{ padding: '6px 4px', color: '#94a3b8' }}>{p.descripcion}</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right' }}>
                    {p.esSistema ? (
                      <span style={{ fontSize: 10, color: '#64748b' }}>sistema</span>
                    ) : (
                      <button type="button"
                        onClick={() => eliminar(p.id)}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}
                      >
                        eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
