'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { cargarEquipos, Equipo } from '@/lib/equipos';
import {
  Articulo,
  InventarioFisicoDeposito,
  InventarioFisicoItemDeposito,
  agregarItemInventarioFisico,
  cargarArticulos,
  cargarInventarioFisico,
  cargarItemsInventarioFisico,
  finalizarInventarioFisico,
} from '@/lib/deposito';
import { Cargando } from '@/app/components/Cargando';
import { Aviso } from '@/app/components/Aviso';

export default function InventarioFisicoDetallePage() {
  const confirmar = useConfirmacion();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [inventario, setInventario] = useState<InventarioFisicoDeposito | null>(null);
  const [items, setItems] = useState<InventarioFisicoItemDeposito[] | null>(null);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [finalizando, setFinalizando] = useState(false);

  const [tipoElemento, setTipoElemento] = useState<'EQUIPO' | 'ARTICULO'>('EQUIPO');
  const [equipoId, setEquipoId] = useState('');
  const [articuloId, setArticuloId] = useState('');
  const [cantidadFisica, setCantidadFisica] = useState('');
  const [observacionItem, setObservacionItem] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCargar = permisos.includes('deposito:inventario_fisico');

  const opcionesArticulo = useMemo(() => articulos.map((a) => ({ value: a.id, label: `${a.codigo} — ${a.nombre}` })), [articulos]);
  const opcionesEquipo = useMemo(() => equipos.map((e) => ({ value: e.id, label: `${e.codigoInterno} — ${e.nombre}` })), [equipos]);
  const articuloPorId = useMemo(() => new Map(articulos.map((a) => [a.id, `${a.codigo} — ${a.nombre}`])), [articulos]);
  const equipoPorId = useMemo(() => new Map(equipos.map((e) => [e.id, `${e.codigoInterno} — ${e.nombre}`])), [equipos]);

  async function cargar() {
    try {
      setInventario(await cargarInventarioFisico(id));
      setItems(await cargarItemsInventarioFisico(id));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarArticulos().then(setArticulos).catch(() => undefined);
    cargarEquipos().then(setEquipos).catch(() => undefined);
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function agregarItem(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      const item = await agregarItemInventarioFisico(id, {
        tipoElemento,
        equipoId: tipoElemento === 'EQUIPO' ? equipoId : undefined,
        articuloId: tipoElemento === 'ARTICULO' ? articuloId : undefined,
        cantidadFisica: Number(cantidadFisica),
        observacion: observacionItem || undefined,
      });
      setMensaje(
        item.generaIncidencia
          ? `Item agregado. Se detecto una diferencia (sistema=${item.cantidadSistema}, fisico=${item.cantidadFisica}) y se genero una incidencia.`
          : 'Item agregado sin diferencias.',
      );
      setEquipoId('');
      setArticuloId('');
      setCantidadFisica('');
      setObservacionItem('');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function finalizar() {
    if (!await confirmar({ titulo: 'Finalizar inventario', mensaje: '¿Finalizar este inventario físico? No se podrán agregar más ítems después.', confirmar: 'Finalizar', peligro: true })) return;
    setError(null);
    setFinalizando(true);
    try {
      await finalizarInventarioFisico(id);
      setMensaje('Inventario finalizado.');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFinalizando(false);
    }
  }

  if (error && !inventario) return <p style={{ color: 'var(--danger)' }}>{error}</p>;
  if (!inventario) return <Cargando texto="Cargando…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <button type="button"
          onClick={() => router.push('/dashboard/deposito/inventarios-fisicos')}
          style={{ background: 'none', border: 'none', color: 'var(--signal)', cursor: 'pointer', fontSize: 12, padding: 0, marginBottom: 6 }}
        >
          ← Volver a inventarios fisicos
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 16 }}>
            Inventario fisico — {inventario.fecha}{' '}
            <span className="badge" style={{ marginLeft: 8, background: inventario.estado === 'FINALIZADO' ? 'var(--ok-fill)' : 'var(--neutral-fill)' }}>
              {inventario.estado}
            </span>
          </h2>
          {puedeCargar && inventario.estado === 'EN_PROCESO' && (
            <button type="button" className="btn-primary" style={{ background: '#7f1d1d' }} onClick={finalizar} disabled={finalizando}>
              {finalizando ? 'Finalizando...' : 'Finalizar inventario'}
            </button>
          )}
        </div>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {puedeCargar && inventario.estado === 'EN_PROCESO' && (
        <form onSubmit={agregarItem} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 style={{ fontSize: 15 }}>Cargar conteo</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 2fr auto', gap: 10, alignItems: 'flex-end' }}>
            <ComboBuscable opciones={[{ value: 'EQUIPO', label: 'Equipo' }, { value: 'ARTICULO', label: 'Articulo' }]} value={tipoElemento} onChange={(v) => setTipoElemento(v as 'EQUIPO' | 'ARTICULO')} />
            {tipoElemento === 'EQUIPO' ? (
              <ComboBuscable opciones={opcionesEquipo} value={equipoId} onChange={setEquipoId} ningunaLabel="-- seleccionar equipo --" placeholderBusqueda="Buscar equipo..." />
            ) : (
              <ComboBuscable opciones={opcionesArticulo} value={articuloId} onChange={setArticuloId} ningunaLabel="-- seleccionar articulo --" placeholderBusqueda="Buscar articulo..." />
            )}
            <input className="input-field" type="number" min={0} step="0.01" placeholder="Cantidad fisica" value={cantidadFisica} onChange={(e) => setCantidadFisica(e.target.value)} required />
            <input className="input-field" placeholder="Observacion" value={observacionItem} onChange={(e) => setObservacionItem(e.target.value)} />
            <button type="button" className="btn-primary" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Agregar'}
            </button>
          </div>
        </form>
      )}

      <section className="card">
        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Items contados ({items?.length ?? 0})</h2>
        {items && items.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Todavia no se cargo ningun item.</p>}
        {items && items.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                <th scope="col" style={{ padding: '6px 4px' }}>Elemento</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Sistema</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Fisico</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Diferencia</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Incidencia</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '6px 4px' }}>
                    {it.tipoElemento === 'EQUIPO' ? (it.equipoId ? equipoPorId.get(it.equipoId) ?? it.equipoId : '-') : it.articuloId ? articuloPorId.get(it.articuloId) ?? it.articuloId : '-'}
                  </td>
                  <td style={{ padding: '6px 4px' }}>{it.cantidadSistema}</td>
                  <td style={{ padding: '6px 4px' }}>{it.cantidadFisica}</td>
                  <td style={{ padding: '6px 4px', color: it.diferencia !== 0 ? 'var(--danger)' : 'var(--success)', fontWeight: it.diferencia !== 0 ? 600 : undefined }}>
                    {it.diferencia > 0 ? `+${it.diferencia}` : it.diferencia}
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    {it.generaIncidencia ? <span className="badge" style={{ background: 'var(--bad-fill)', color: 'var(--danger)' }}>SI</span> : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
