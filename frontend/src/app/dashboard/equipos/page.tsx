'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { obtenerSesion } from '@/lib/api';
import { CategoriaEquipo, ESTADOS_EQUIPO, Equipo, cargarCategorias, cargarEquipos, crearEquipo } from '@/lib/equipos';
import { Aviso } from '@/app/components/Aviso';

export default function EquiposPage() {
  const [equipos, setEquipos] = useState<Equipo[] | null>(null);
  const [categorias, setCategorias] = useState<CategoriaEquipo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [q, setQ] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const [categoriaId, setCategoriaId] = useState('');
  const [codigoInterno, setCodigoInterno] = useState('');
  const [nombre, setNombre] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');

  const puedeCrear = !!obtenerSesion()?.usuario.permisos.includes('equipos:crear');
  const categoriaPorId = useMemo(() => new Map(categorias.map((c) => [c.id, c])), [categorias]);

  async function cargar() {
    try {
      setEquipos(await cargarEquipos(q || undefined, filtroCategoria || undefined, filtroEstado || undefined));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarCategorias().then(setCategorias).catch(() => undefined);
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filtroCategoria, filtroEstado]);

  function limpiarForm() {
    setCategoriaId('');
    setCodigoInterno('');
    setNombre('');
    setMarca('');
    setModelo('');
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await crearEquipo({
        categoriaId,
        codigoInterno,
        nombre,
        marca: marca || undefined,
        modelo: modelo || undefined,
      });
      setMensaje('Equipo creado');
      limpiarForm();
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Equipos ({equipos?.length ?? 0})</h2>
        {puedeCrear && (
          <button type="button" className="btn-primary" onClick={() => setMostrarForm((v) => !v)}>
            {mostrarForm ? 'Cancelar' : 'Nuevo equipo'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="input-field"
          style={{ maxWidth: 260 }}
          placeholder="Buscar por nombre, código o N. serie..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="input-field" style={{ maxWidth: 220 }} value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <select className="input-field" style={{ maxWidth: 200 }} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS_EQUIPO.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form className="card" onSubmit={crear} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="categoria" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Categoría</label>
              <select id="categoria" className="input-field" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} required>
                <option value="">-- seleccionar --</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="codigo-interno" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Código interno</label>
              <input id="codigo-interno" className="input-field" value={codigoInterno} onChange={(e) => setCodigoInterno(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="nombre" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input id="nombre" className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="marca" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Marca</label>
              <input id="marca" className="input-field" value={marca} onChange={(e) => setMarca(e.target.value)} />
            </div>
            <div>
              <label htmlFor="modelo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Modelo</label>
              <input id="modelo" className="input-field" value={modelo} onChange={(e) => setModelo(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={guardando} style={{ alignSelf: 'flex-start' }}>
            {guardando ? 'Guardando...' : 'Crear equipo'}
          </button>
        </form>
      )}

      {equipos && equipos.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin equipos registrados.</p>}

      {equipos && equipos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Código</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Nombre</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Categoría</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Ubicación</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {equipos.map((eq) => (
              <tr key={eq.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>
                  <Link href={`/dashboard/equipos/${eq.id}`} style={{ color: 'var(--signal)', textDecoration: 'none' }}>
                    {eq.codigoInterno}
                  </Link>
                </td>
                <td style={{ padding: '6px 4px' }}>{eq.nombre}</td>
                <td style={{ padding: '6px 4px' }}>{categoriaPorId.get(eq.categoriaId)?.nombre ?? '—'}</td>
                <td style={{ padding: '6px 4px' }}>{eq.ubicacion ?? '—'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span
                    className="badge"
                    style={{ background: eq.estado === 'OPERATIVO' ? 'var(--ok-fill)' : eq.estado === 'BAJA' || eq.estado === 'DANIADO' ? 'var(--bad-fill)' : 'var(--warn-fill)' }}
                  >
                    {eq.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
