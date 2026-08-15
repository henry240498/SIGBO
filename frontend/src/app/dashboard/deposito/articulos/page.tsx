'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Parametro } from '@/lib/parametros';
import { Articulo, CategoriaArticulo, cargarArticulos, cargarCategoriasArticulo, cargarUnidadesMedidaDeposito, crearArticulo } from '@/lib/deposito';

export default function ArticulosPage() {
  const router = useRouter();
  const [articulos, setArticulos] = useState<Articulo[] | null>(null);
  const [categorias, setCategorias] = useState<CategoriaArticulo[]>([]);
  const [unidades, setUnidades] = useState<Parametro[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [q, setQ] = useState('');
  const [filtroCategoriaId, setFiltroCategoriaId] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [soloStockBajo, setSoloStockBajo] = useState(false);

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaArticuloId, setCategoriaArticuloId] = useState('');
  const [unidadMedidaId, setUnidadMedidaId] = useState('');
  const [stockMinimo, setStockMinimo] = useState('0');
  const [stockMaximo, setStockMaximo] = useState('');
  const [controlaLote, setControlaLote] = useState(false);
  const [controlaVencimiento, setControlaVencimiento] = useState(false);

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCrear = permisos.includes('deposito:crear');

  const categoriaPorId = useMemo(() => new Map(categorias.map((c) => [c.id, c.nombre])), [categorias]);
  const opcionesCategoria = useMemo(() => categorias.map((c) => ({ value: c.id, label: c.nombre })), [categorias]);
  const opcionesUnidad = useMemo(() => unidades.map((u) => ({ value: u.id, label: u.nombre })), [unidades]);
  const opcionesEstado = useMemo(() => [{ value: 'ACTIVO', label: 'ACTIVO' }, { value: 'INACTIVO', label: 'INACTIVO' }], []);

  async function cargar() {
    try {
      setArticulos(
        await cargarArticulos({
          q: q || undefined,
          categoriaArticuloId: filtroCategoriaId || undefined,
          estado: filtroEstado || undefined,
          stockBajo: soloStockBajo || undefined,
        }),
      );
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarCategoriasArticulo().then(setCategorias);
    cargarUnidadesMedidaDeposito().then(setUnidades);
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filtroCategoriaId, filtroEstado, soloStockBajo]);

  function limpiarForm() {
    setCodigo('');
    setNombre('');
    setDescripcion('');
    setCategoriaArticuloId('');
    setUnidadMedidaId('');
    setStockMinimo('0');
    setStockMaximo('');
    setControlaLote(false);
    setControlaVencimiento(false);
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await crearArticulo({
        codigo,
        nombre,
        descripcion: descripcion || undefined,
        categoriaArticuloId,
        unidadMedidaId: unidadMedidaId || undefined,
        stockMinimo: stockMinimo ? Number(stockMinimo) : 0,
        stockMaximo: stockMaximo ? Number(stockMaximo) : undefined,
        controlaLote,
        controlaVencimiento,
      });
      setMensaje('Articulo creado.');
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
        <h2 style={{ fontSize: 16 }}>Articulos ({articulos?.length ?? 0})</h2>
        {puedeCrear && (
          <button className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : '+ Nuevo articulo'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Buscar</label>
          <input className="input-field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre o codigo..." />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Categoria</label>
          <ComboBuscable opciones={opcionesCategoria} value={filtroCategoriaId} onChange={setFiltroCategoriaId} maxWidth={220} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Estado</label>
          <ComboBuscable opciones={opcionesEstado} value={filtroEstado} onChange={setFiltroEstado} maxWidth={160} />
        </div>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 10 }}>
          <input type="checkbox" checked={soloStockBajo} onChange={(e) => setSoloStockBajo(e.target.checked)} />
          Solo stock bajo
        </label>
        <button
          className="btn-primary"
          style={{ background: '#475569' }}
          onClick={() => {
            setQ('');
            setFiltroCategoriaId('');
            setFiltroEstado('');
            setSoloStockBajo(false);
          }}
        >
          Limpiar filtros
        </button>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Codigo</label>
              <input className="input-field" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Categoria</label>
              <ComboBuscable opciones={opcionesCategoria} value={categoriaArticuloId} onChange={setCategoriaArticuloId} ningunaLabel="-- seleccionar --" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripcion</label>
            <input className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Unidad de medida</label>
              <ComboBuscable opciones={opcionesUnidad} value={unidadMedidaId} onChange={setUnidadMedidaId} ningunaLabel="Sin definir" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Stock minimo</label>
              <input className="input-field" type="number" min={0} step="0.01" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Stock maximo</label>
              <input className="input-field" type="number" min={0} step="0.01" value={stockMaximo} onChange={(e) => setStockMaximo(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={controlaLote} onChange={(e) => setControlaLote(e.target.checked)} />
              Controla lote
            </label>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={controlaVencimiento} onChange={(e) => setControlaVencimiento(e.target.checked)} />
              Controla vencimiento
            </label>
          </div>
          <p style={{ fontSize: 12, color: '#64748b' }}>
            El stock inicial se carga con un movimiento de tipo Entrada desde la pantalla de Movimientos o Entradas, no desde este formulario.
          </p>
          <button className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Crear articulo'}
          </button>
        </form>
      )}

      {articulos && articulos.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No hay articulos registrados.</p>}
      {articulos && articulos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Codigo</th>
              <th style={{ padding: '6px 4px' }}>Nombre</th>
              <th style={{ padding: '6px 4px' }}>Categoria</th>
              <th style={{ padding: '6px 4px' }}>Stock actual</th>
              <th style={{ padding: '6px 4px' }}>Stock minimo</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {articulos.map((a) => {
              const stockBajo = a.stockActual < a.stockMinimo;
              return (
                <tr
                  key={a.id}
                  onClick={() => router.push(`/dashboard/deposito/articulos/${a.id}`)}
                  style={{ borderBottom: '1px solid #1f2937', cursor: 'pointer' }}
                >
                  <td style={{ padding: '6px 4px' }}>{a.codigo}</td>
                  <td style={{ padding: '6px 4px' }}>
                    {a.nombre}
                    {a.controlaLote && <span className="badge" style={{ marginLeft: 6, background: '#475569' }}>lote</span>}
                    {a.controlaVencimiento && <span className="badge" style={{ marginLeft: 6, background: '#475569' }}>vencimiento</span>}
                  </td>
                  <td style={{ padding: '6px 4px' }}>{categoriaPorId.get(a.categoriaArticuloId) ?? '-'}</td>
                  <td style={{ padding: '6px 4px', color: stockBajo ? '#f87171' : undefined, fontWeight: stockBajo ? 600 : undefined }}>{a.stockActual}</td>
                  <td style={{ padding: '6px 4px' }}>{a.stockMinimo}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={{ background: a.estado === 'ACTIVO' ? '#166534' : '#7f1d1d', color: a.estado === 'ACTIVO' ? '#4ade80' : '#f87171' }}>
                      {a.estado}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
