'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Parametro, resolverNombres } from '@/lib/parametros';
import { cargarBomberos, BomberoResumen } from '@/lib/personal';
import { cargarVehiculos, Vehiculo } from '@/lib/vehiculos';
import {
  Articulo,
  CategoriaArticulo,
  LoteArticulo,
  TenenciaDeposito,
  UbicacionDeposito,
  actualizarArticulo,
  cargarArticulo,
  cargarCategoriasArticulo,
  cargarLotesArticulo,
  cargarTenenciasArticulo,
  cargarUbicacionesDeposito,
  cargarUnidadesMedidaDeposito,
  crearLoteArticulo,
} from '@/lib/deposito';
import { Cargando } from '@/app/components/Cargando';
import { Aviso } from '@/app/components/Aviso';

export default function ArticuloDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [articulo, setArticulo] = useState<Articulo | null>(null);
  const [tenencias, setTenencias] = useState<TenenciaDeposito[] | null>(null);
  const [lotes, setLotes] = useState<LoteArticulo[] | null>(null);
  const [categorias, setCategorias] = useState<CategoriaArticulo[]>([]);
  const [unidades, setUnidades] = useState<Parametro[]>([]);
  const [ubicaciones, setUbicaciones] = useState<UbicacionDeposito[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [nombresTipoTenencia, setNombresTipoTenencia] = useState<Map<string, string>>(new Map());
  const [nombresEstado, setNombresEstado] = useState<Map<string, string>>(new Map());

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaArticuloId, setCategoriaArticuloId] = useState('');
  const [unidadMedidaId, setUnidadMedidaId] = useState('');
  const [stockMinimo, setStockMinimo] = useState('0');
  const [stockMaximo, setStockMaximo] = useState('');
  const [controlaLote, setControlaLote] = useState(false);
  const [controlaVencimiento, setControlaVencimiento] = useState(false);
  const [estado, setEstado] = useState('ACTIVO');

  const [mostrarFormLote, setMostrarFormLote] = useState(false);
  const [numeroLote, setNumeroLote] = useState('');
  const [fechaFabricacion, setFechaFabricacion] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [cantidadLote, setCantidadLote] = useState('');
  const [guardandoLote, setGuardandoLote] = useState(false);

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeEditar = permisos.includes('deposito:editar');
  const puedeCrear = permisos.includes('deposito:crear');

  const opcionesCategoria = useMemo(() => categorias.map((c) => ({ value: c.id, label: c.nombre })), [categorias]);
  const opcionesUnidad = useMemo(() => unidades.map((u) => ({ value: u.id, label: u.nombre })), [unidades]);
  const ubicacionPorId = useMemo(() => new Map(ubicaciones.map((u) => [u.id, u.nombre])), [ubicaciones]);
  const vehiculoPorId = useMemo(() => new Map(vehiculos.map((v) => [v.id, v.numeroInterno])), [vehiculos]);
  const bomberoPorId = useMemo(() => new Map(bomberos.map((b) => [b.id, `${b.nombre} ${b.apellido} (${b.numeroBombero})`])), [bomberos]);

  async function cargar() {
    try {
      const a = await cargarArticulo(id);
      setArticulo(a);
      setNombre(a.nombre);
      setDescripcion(a.descripcion ?? '');
      setCategoriaArticuloId(a.categoriaArticuloId);
      setUnidadMedidaId(a.unidadMedidaId ?? '');
      setStockMinimo(String(a.stockMinimo));
      setStockMaximo(a.stockMaximo != null ? String(a.stockMaximo) : '');
      setControlaLote(a.controlaLote);
      setControlaVencimiento(a.controlaVencimiento);
      setEstado(a.estado);

      const tns = await cargarTenenciasArticulo(id);
      setTenencias(tns);
      const [tipoNombres, estadoNombres] = await Promise.all([
        resolverNombres(tns.map((t) => t.tipoTenenciaId)),
        resolverNombres(tns.map((t) => t.estadoElementoId)),
      ]);
      setNombresTipoTenencia(tipoNombres);
      setNombresEstado(estadoNombres);

      if (a.controlaLote) setLotes(await cargarLotesArticulo(id));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarCategoriasArticulo().then(setCategorias);
    cargarUnidadesMedidaDeposito().then(setUnidades);
    cargarUbicacionesDeposito().then(setUbicaciones);
    cargarVehiculos().then(setVehiculos).catch(() => undefined);
    cargarBomberos().then(setBomberos).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await actualizarArticulo(id, {
        nombre,
        descripcion: descripcion || undefined,
        categoriaArticuloId,
        unidadMedidaId: unidadMedidaId || undefined,
        stockMinimo: stockMinimo ? Number(stockMinimo) : 0,
        stockMaximo: stockMaximo ? Number(stockMaximo) : undefined,
        controlaLote,
        controlaVencimiento,
        estado,
      });
      setMensaje('Articulo actualizado.');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function crearLote(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardandoLote(true);
    try {
      await crearLoteArticulo({
        articuloId: id,
        numeroLote,
        fechaFabricacion: fechaFabricacion || undefined,
        fechaVencimiento: fechaVencimiento || undefined,
        cantidad: Number(cantidadLote),
      });
      setMensaje('Lote creado.');
      setNumeroLote('');
      setFechaFabricacion('');
      setFechaVencimiento('');
      setCantidadLote('');
      setMostrarFormLote(false);
      setLotes(await cargarLotesArticulo(id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardandoLote(false);
    }
  }

  function nombreTenedor(t: TenenciaDeposito): string {
    if (t.ubicacionId) return ubicacionPorId.get(t.ubicacionId) ?? 'Ubicacion desconocida';
    if (t.vehiculoId) return `Vehiculo ${vehiculoPorId.get(t.vehiculoId) ?? t.vehiculoId}`;
    if (t.bomberoId) return bomberoPorId.get(t.bomberoId) ?? 'Bombero desconocido';
    if (t.servicioId) return `Servicio ${t.servicioId.slice(0, 8)}`;
    return '-';
  }

  if (error && !articulo) return <p style={{ color: 'var(--danger)' }}>{error}</p>;
  if (!articulo) return <Cargando texto="Cargando…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button type="button"
            onClick={() => router.push('/dashboard/deposito/articulos')}
            style={{ background: 'none', border: 'none', color: 'var(--signal)', cursor: 'pointer', fontSize: 12, padding: 0, marginBottom: 6 }}
          >
            ← Volver a articulos
          </button>
          <h2 style={{ fontSize: 16 }}>
            {articulo.codigo} — {articulo.nombre}
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{articulo.stockActual}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>stock actual (solo cambia por movimientos)</div>
        </div>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      <section className="card">
        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Datos generales</h2>
        <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="nombre" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input id="nombre" className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required disabled={!puedeEditar} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Categoría</label>
              <ComboBuscable ariaLabel="Categoria" opciones={opcionesCategoria} value={categoriaArticuloId} onChange={setCategoriaArticuloId} disabled={!puedeEditar} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
              <ComboBuscable ariaLabel="Estado"
                opciones={[{ value: 'ACTIVO', label: 'ACTIVO' }, { value: 'INACTIVO', label: 'INACTIVO' }]}
                value={estado}
                onChange={setEstado}
                ningunaLabel="ACTIVO"
                disabled={!puedeEditar}
              />
            </div>
          </div>
          <div>
            <label htmlFor="descripcion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripción</label>
            <input id="descripcion" className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} disabled={!puedeEditar} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Unidad de medida</label>
              <ComboBuscable ariaLabel="Unidad de medida" opciones={opcionesUnidad} value={unidadMedidaId} onChange={setUnidadMedidaId} ningunaLabel="Sin definir" disabled={!puedeEditar} />
            </div>
            <div>
              <label htmlFor="stock-minimo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Stock mínimo</label>
              <input id="stock-minimo" className="input-field" type="number" min={0} step="0.01" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} disabled={!puedeEditar} />
            </div>
            <div>
              <label htmlFor="stock-maximo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Stock máximo</label>
              <input id="stock-maximo" className="input-field" type="number" min={0} step="0.01" value={stockMaximo} onChange={(e) => setStockMaximo(e.target.value)} disabled={!puedeEditar} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={controlaLote} onChange={(e) => setControlaLote(e.target.checked)} disabled={!puedeEditar} />
              Controla lote
            </label>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={controlaVencimiento} onChange={(e) => setControlaVencimiento(e.target.checked)} disabled={!puedeEditar} />
              Controla vencimiento
            </label>
          </div>
          {puedeEditar && (
            <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          )}
        </form>
      </section>

      <section className="card">
        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Donde esta el stock ({tenencias?.length ?? 0})</h2>
        {tenencias && tenencias.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin stock registrado en ninguna tenencia.</p>}
        {tenencias && tenencias.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                <th scope="col" style={{ padding: '6px 4px' }}>Tipo de tenencia</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Donde / con quien</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Cantidad</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {tenencias.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '6px 4px' }}>{nombresTipoTenencia.get(t.tipoTenenciaId) ?? '-'}</td>
                  <td style={{ padding: '6px 4px' }}>{nombreTenedor(t)}</td>
                  <td style={{ padding: '6px 4px' }}>{t.cantidad ?? '-'}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge">{nombresEstado.get(t.estadoElementoId) ?? '-'}</span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>{new Date(t.actualizadoEn).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {articulo.controlaLote && (
        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 15 }}>Lotes ({lotes?.length ?? 0})</h2>
            {puedeCrear && (
              <button type="button" className="btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setMostrarFormLote(!mostrarFormLote)}>
                {mostrarFormLote ? 'Cancelar' : '+ Nuevo lote'}
              </button>
            )}
          </div>

          {mostrarFormLote && (
            <form onSubmit={crearLote} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 10, alignItems: 'flex-end', marginBottom: 14 }}>
              <div>
                <label htmlFor="numero-de-lote" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Número de lote</label>
                <input id="numero-de-lote" className="input-field" value={numeroLote} onChange={(e) => setNumeroLote(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="fecha-fabricacion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha fabricacion</label>
                <input id="fecha-fabricacion" className="input-field" type="date" value={fechaFabricacion} onChange={(e) => setFechaFabricacion(e.target.value)} />
              </div>
              <div>
                <label htmlFor="fecha-vencimiento" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha vencimiento</label>
                <input id="fecha-vencimiento" className="input-field" type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
              </div>
              <div>
                <label htmlFor="cantidad" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cantidad</label>
                <input id="cantidad" className="input-field" type="number" min={0} step="0.01" value={cantidadLote} onChange={(e) => setCantidadLote(e.target.value)} required />
              </div>
              <button type="button" className="btn-primary" disabled={guardandoLote}>
                {guardandoLote ? 'Guardando...' : 'Crear'}
              </button>
            </form>
          )}

          {lotes && lotes.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay lotes registrados.</p>}
          {lotes && lotes.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                  <th scope="col" style={{ padding: '6px 4px' }}>Lote</th>
                  <th scope="col" style={{ padding: '6px 4px' }}>Fabricacion</th>
                  <th scope="col" style={{ padding: '6px 4px' }}>Vencimiento</th>
                  <th scope="col" style={{ padding: '6px 4px' }}>Cantidad</th>
                  <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {lotes.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td style={{ padding: '6px 4px' }}>{l.numeroLote}</td>
                    <td style={{ padding: '6px 4px' }}>{l.fechaFabricacion ?? '-'}</td>
                    <td style={{ padding: '6px 4px' }}>{l.fechaVencimiento ?? '-'}</td>
                    <td style={{ padding: '6px 4px' }}>{l.cantidad}</td>
                    <td style={{ padding: '6px 4px' }}>
                      <span
                        className="badge"
                        style={{
                          background: l.estado === 'VIGENTE' ? 'var(--ok-fill)' : l.estado === 'VENCIDO' ? 'var(--bad-fill)' : 'var(--neutral-fill)',
                          color: l.estado === 'VIGENTE' ? 'var(--success)' : l.estado === 'VENCIDO' ? 'var(--danger)' : 'var(--ink)',
                        }}
                      >
                        {l.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}
