'use client';

import { useEffect, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Parametro, resolverNombres } from '@/lib/parametros';
import { cargarEquipos, Equipo } from '@/lib/equipos';
import {
  Articulo,
  EntradaDeposito,
  ProveedorDeposito,
  UbicacionDeposito,
  cargarArticulos,
  cargarEntradasDeposito,
  cargarProveedoresDeposito,
  cargarTiposMovimientoDeposito,
  cargarUbicacionesDeposito,
  crearEntradaDeposito,
} from '@/lib/deposito';

interface ItemForm {
  tipoElemento: 'EQUIPO' | 'ARTICULO';
  articuloId: string;
  equipoId: string;
  cantidad: string;
  precioUnitario: string;
}

function itemVacio(): ItemForm {
  return { tipoElemento: 'ARTICULO', articuloId: '', equipoId: '', cantidad: '', precioUnitario: '' };
}

export default function EntradasDepositoPage() {
  const [entradas, setEntradas] = useState<EntradaDeposito[] | null>(null);
  const [tiposMovimiento, setTiposMovimiento] = useState<Parametro[]>([]);
  const [ubicaciones, setUbicaciones] = useState<UbicacionDeposito[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorDeposito[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [nombresTipo, setNombresTipo] = useState<Map<string, string>>(new Map());
  const [nombresUbicacion, setNombresUbicacion] = useState<Map<string, string>>(new Map());

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [tipoEntradaId, setTipoEntradaId] = useState('');
  const [fecha, setFecha] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [donanteNombre, setDonanteNombre] = useState('');
  const [donanteDocumento, setDonanteDocumento] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [ubicacionDestinoId, setUbicacionDestinoId] = useState('');
  const [observacion, setObservacion] = useState('');
  const [items, setItems] = useState<ItemForm[]>([itemVacio()]);

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCrear = permisos.includes('deposito:crear');

  const opcionesTipoEntrada = useMemo(() => tiposMovimiento.map((t) => ({ value: t.id, label: t.nombre })), [tiposMovimiento]);
  const opcionesUbicacion = useMemo(() => ubicaciones.map((u) => ({ value: u.id, label: u.nombre })), [ubicaciones]);
  const opcionesProveedor = useMemo(() => proveedores.map((p) => ({ value: p.id, label: p.razonSocial })), [proveedores]);
  const opcionesArticulo = useMemo(() => articulos.map((a) => ({ value: a.id, label: `${a.codigo} — ${a.nombre}` })), [articulos]);
  const opcionesEquipo = useMemo(() => equipos.map((e) => ({ value: e.id, label: `${e.codigoInterno} — ${e.nombre}` })), [equipos]);
  const proveedorPorId = useMemo(() => new Map(proveedores.map((p) => [p.id, p.razonSocial])), [proveedores]);

  const tipoElementoOpciones = [{ value: 'ARTICULO', label: 'Articulo' }, { value: 'EQUIPO', label: 'Equipo' }];

  async function cargar() {
    try {
      const datos = await cargarEntradasDeposito();
      setEntradas(datos);
      setNombresTipo(await resolverNombres(datos.map((e) => e.tipoEntradaId)));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarTiposMovimientoDeposito().then(setTiposMovimiento);
    cargarUbicacionesDeposito().then((u) => {
      setUbicaciones(u);
      setNombresUbicacion(new Map(u.map((x) => [x.id, x.nombre])));
    });
    cargarProveedoresDeposito().then(setProveedores);
    cargarArticulos().then(setArticulos).catch(() => undefined);
    cargarEquipos().then(setEquipos).catch(() => undefined);
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function limpiarForm() {
    setTipoEntradaId('');
    setFecha('');
    setProveedorId('');
    setDonanteNombre('');
    setDonanteDocumento('');
    setNumeroDocumento('');
    setValorTotal('');
    setUbicacionDestinoId('');
    setObservacion('');
    setItems([itemVacio()]);
  }

  function actualizarItem(idx: number, cambios: Partial<ItemForm>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...cambios } : it)));
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await crearEntradaDeposito({
        tipoEntradaId,
        fecha,
        proveedorId: proveedorId || undefined,
        donanteNombre: donanteNombre || undefined,
        donanteDocumento: donanteDocumento || undefined,
        numeroDocumento: numeroDocumento || undefined,
        valorTotal: valorTotal ? Number(valorTotal) : undefined,
        ubicacionDestinoId,
        observacion: observacion || undefined,
        items: items.map((it) => ({
          tipoElemento: it.tipoElemento,
          articuloId: it.tipoElemento === 'ARTICULO' ? it.articuloId : undefined,
          equipoId: it.tipoElemento === 'EQUIPO' ? it.equipoId : undefined,
          cantidad: Number(it.cantidad),
          precioUnitario: it.precioUnitario ? Number(it.precioUnitario) : undefined,
        })),
      });
      setMensaje('Entrada registrada.');
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
        <h2 style={{ fontSize: 16 }}>Entradas ({entradas?.length ?? 0})</h2>
        {puedeCrear && (
          <button type="button"
            className="btn-primary"
            onClick={() => {
              limpiarForm();
              setMostrarForm(!mostrarForm);
            }}
          >
            {mostrarForm ? 'Cancelar' : '+ Nueva entrada'}
          </button>
        )}
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 12, color: '#64748b' }}>
            Cubre Compra, Donacion, Transferencia, Devolucion y Recuperacion (seleccionar el tipo apropiado). Cada entrada genera
            automaticamente el movimiento correspondiente para todos sus items.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de entrada</label>
              <ComboBuscable opciones={opcionesTipoEntrada} value={tipoEntradaId} onChange={setTipoEntradaId} ningunaLabel="-- seleccionar --" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label>
              <input className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Ubicacion destino</label>
              <ComboBuscable opciones={opcionesUbicacion} value={ubicacionDestinoId} onChange={setUbicacionDestinoId} ningunaLabel="-- seleccionar --" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Proveedor</label>
              <ComboBuscable opciones={opcionesProveedor} value={proveedorId} onChange={setProveedorId} ningunaLabel="Sin proveedor" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Donante</label>
              <input className="input-field" value={donanteNombre} onChange={(e) => setDonanteNombre(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Documento donante</label>
              <input className="input-field" value={donanteDocumento} onChange={(e) => setDonanteDocumento(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>N° documento (factura/remito)</label>
              <input className="input-field" value={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Valor total (opcional)</label>
              <input className="input-field" type="number" min={0} step="0.01" value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observacion</label>
              <input className="input-field" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
            </div>
          </div>

          <div>
            <strong style={{ fontSize: 13 }}>Items</strong>
            {items.map((it, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr auto', gap: 8, alignItems: 'flex-end', marginTop: 8 }}>
                <ComboBuscable opciones={tipoElementoOpciones} value={it.tipoElemento} onChange={(v) => actualizarItem(idx, { tipoElemento: v as 'EQUIPO' | 'ARTICULO' })} />
                {it.tipoElemento === 'ARTICULO' ? (
                  <ComboBuscable opciones={opcionesArticulo} value={it.articuloId} onChange={(v) => actualizarItem(idx, { articuloId: v })} placeholderBusqueda="Buscar articulo..." />
                ) : (
                  <ComboBuscable opciones={opcionesEquipo} value={it.equipoId} onChange={(v) => actualizarItem(idx, { equipoId: v })} placeholderBusqueda="Buscar equipo..." />
                )}
                <input
                  className="input-field"
                  type="number"
                  min={0.01}
                  step="0.01"
                  placeholder="Cantidad"
                  value={it.cantidad}
                  onChange={(e) => actualizarItem(idx, { cantidad: e.target.value })}
                  required
                />
                <input
                  className="input-field"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Precio unit."
                  value={it.precioUnitario}
                  onChange={(e) => actualizarItem(idx, { precioUnitario: e.target.value })}
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}
                  >
                    quitar
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '4px 10px', fontSize: 12, marginTop: 10 }}
              onClick={() => setItems((prev) => [...prev, itemVacio()])}
            >
              + Agregar item
            </button>
          </div>

          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Registrar entrada'}
          </button>
        </form>
      )}

      {entradas && entradas.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No hay entradas registradas.</p>}
      {entradas && entradas.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Fecha</th>
              <th style={{ padding: '6px 4px' }}>Tipo</th>
              <th style={{ padding: '6px 4px' }}>Proveedor / Donante</th>
              <th style={{ padding: '6px 4px' }}>Documento</th>
              <th style={{ padding: '6px 4px' }}>Destino</th>
              <th style={{ padding: '6px 4px' }}>Valor total</th>
            </tr>
          </thead>
          <tbody>
            {entradas.map((en) => (
              <tr key={en.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{en.fecha}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge">{nombresTipo.get(en.tipoEntradaId) ?? '-'}</span>
                </td>
                <td style={{ padding: '6px 4px' }}>{en.proveedorId ? proveedorPorId.get(en.proveedorId) ?? '-' : en.donanteNombre ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>{en.numeroDocumento ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>{nombresUbicacion.get(en.ubicacionDestinoId) ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>{en.valorTotal ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
