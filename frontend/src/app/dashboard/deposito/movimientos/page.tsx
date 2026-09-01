'use client';

import { useEffect, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Parametro, resolverNombres } from '@/lib/parametros';
import { cargarBomberos, BomberoResumen } from '@/lib/personal';
import { cargarVehiculos, Vehiculo } from '@/lib/vehiculos';
import { cargarEquipos, Equipo } from '@/lib/equipos';
import {
  Articulo,
  MovimientoDeposito,
  UbicacionDeposito,
  cargarArticulos,
  cargarMovimientosDeposito,
  cargarTiposMovimientoDeposito,
  cargarTiposTenenciaDeposito,
  cargarUbicacionesDeposito,
  registrarMovimientoDeposito,
} from '@/lib/deposito';
import { Aviso } from '@/app/components/Aviso';

export default function MovimientosDepositoPage() {
  const [movimientos, setMovimientos] = useState<MovimientoDeposito[] | null>(null);
  const [tiposMovimiento, setTiposMovimiento] = useState<Parametro[]>([]);
  const [tiposTenencia, setTiposTenencia] = useState<Parametro[]>([]);
  const [ubicaciones, setUbicaciones] = useState<UbicacionDeposito[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [nombresTipoMov, setNombresTipoMov] = useState<Map<string, string>>(new Map());

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [filtroTipoElemento, setFiltroTipoElemento] = useState('');
  const [filtroTipoMovimientoId, setFiltroTipoMovimientoId] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  const [tipoMovimientoId, setTipoMovimientoId] = useState('');
  const [tipoElemento, setTipoElemento] = useState('ARTICULO');
  const [equipoId, setEquipoId] = useState('');
  const [articuloId, setArticuloId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [origenTipoTenenciaId, setOrigenTipoTenenciaId] = useState('');
  const [origenUbicacionId, setOrigenUbicacionId] = useState('');
  const [origenVehiculoId, setOrigenVehiculoId] = useState('');
  const [origenBomberoId, setOrigenBomberoId] = useState('');
  const [destinoTipoTenenciaId, setDestinoTipoTenenciaId] = useState('');
  const [destinoUbicacionId, setDestinoUbicacionId] = useState('');
  const [destinoVehiculoId, setDestinoVehiculoId] = useState('');
  const [destinoBomberoId, setDestinoBomberoId] = useState('');
  const [responsableId, setResponsableId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observacion, setObservacion] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeRegistrar = permisos.includes('deposito:movimiento');

  const opcionesTipoElemento = useMemo(() => [{ value: 'EQUIPO', label: 'Equipo' }, { value: 'ARTICULO', label: 'Articulo' }], []);
  const opcionesTipoMovimiento = useMemo(() => tiposMovimiento.map((t) => ({ value: t.id, label: t.nombre })), [tiposMovimiento]);
  const opcionesTipoTenencia = useMemo(() => tiposTenencia.map((t) => ({ value: t.id, label: t.nombre })), [tiposTenencia]);
  const opcionesUbicacion = useMemo(() => ubicaciones.map((u) => ({ value: u.id, label: u.nombre })), [ubicaciones]);
  const opcionesVehiculo = useMemo(() => vehiculos.map((v) => ({ value: v.id, label: v.numeroInterno })), [vehiculos]);
  const opcionesBombero = useMemo(() => bomberos.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` })), [bomberos]);
  const opcionesEquipo = useMemo(() => equipos.map((e) => ({ value: e.id, label: `${e.codigoInterno} — ${e.nombre}` })), [equipos]);
  const opcionesArticulo = useMemo(() => articulos.map((a) => ({ value: a.id, label: `${a.codigo} — ${a.nombre}` })), [articulos]);

  const ubicacionPorId = useMemo(() => new Map(ubicaciones.map((u) => [u.id, u.nombre])), [ubicaciones]);
  const vehiculoPorId = useMemo(() => new Map(vehiculos.map((v) => [v.id, v.numeroInterno])), [vehiculos]);
  const equipoPorId = useMemo(() => new Map(equipos.map((e) => [e.id, `${e.codigoInterno} — ${e.nombre}`])), [equipos]);
  const articuloPorId = useMemo(() => new Map(articulos.map((a) => [a.id, `${a.codigo} — ${a.nombre}`])), [articulos]);

  async function cargar() {
    try {
      const datos = await cargarMovimientosDeposito({
        tipoElemento: filtroTipoElemento || undefined,
        tipoMovimientoId: filtroTipoMovimientoId || undefined,
        desde: desde || undefined,
        hasta: hasta || undefined,
      });
      setMovimientos(datos);
      setNombresTipoMov(await resolverNombres(datos.map((m) => m.tipoMovimientoId)));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarTiposMovimientoDeposito().then(setTiposMovimiento);
    cargarTiposTenenciaDeposito().then(setTiposTenencia);
    cargarUbicacionesDeposito().then(setUbicaciones);
    cargarVehiculos().then(setVehiculos).catch(() => undefined);
    cargarBomberos().then(setBomberos).catch(() => undefined);
    cargarEquipos().then(setEquipos).catch(() => undefined);
    cargarArticulos().then(setArticulos).catch(() => undefined);
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroTipoElemento, filtroTipoMovimientoId, desde, hasta]);

  function limpiarForm() {
    setTipoMovimientoId('');
    setTipoElemento('ARTICULO');
    setEquipoId('');
    setArticuloId('');
    setCantidad('');
    setOrigenTipoTenenciaId('');
    setOrigenUbicacionId('');
    setOrigenVehiculoId('');
    setOrigenBomberoId('');
    setDestinoTipoTenenciaId('');
    setDestinoUbicacionId('');
    setDestinoVehiculoId('');
    setDestinoBomberoId('');
    setResponsableId('');
    setMotivo('');
    setObservacion('');
  }

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await registrarMovimientoDeposito({
        tipoMovimientoId,
        tipoElemento,
        equipoId: tipoElemento === 'EQUIPO' ? equipoId : undefined,
        articuloId: tipoElemento === 'ARTICULO' ? articuloId : undefined,
        cantidad: tipoElemento === 'ARTICULO' ? Number(cantidad) : undefined,
        origenTipoTenenciaId: origenTipoTenenciaId || undefined,
        origenUbicacionId: origenUbicacionId || undefined,
        origenVehiculoId: origenVehiculoId || undefined,
        origenBomberoId: origenBomberoId || undefined,
        destinoTipoTenenciaId: destinoTipoTenenciaId || undefined,
        destinoUbicacionId: destinoUbicacionId || undefined,
        destinoVehiculoId: destinoVehiculoId || undefined,
        destinoBomberoId: destinoBomberoId || undefined,
        responsableId: responsableId || undefined,
        motivo: motivo || undefined,
        observacion: observacion || undefined,
      });
      setMensaje('Movimiento registrado.');
      limpiarForm();
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  function descripcionElemento(m: MovimientoDeposito): string {
    if (m.tipoElemento === 'EQUIPO' && m.equipoId) return equipoPorId.get(m.equipoId) ?? m.equipoId;
    if (m.tipoElemento === 'ARTICULO' && m.articuloId) return `${articuloPorId.get(m.articuloId) ?? m.articuloId} (${m.cantidad ?? '-'})`;
    return '-';
  }

  function descripcionUbicacion(ubicacionId: string | null, vehiculoId: string | null, bomberoId: string | null): string {
    if (ubicacionId) return ubicacionPorId.get(ubicacionId) ?? '-';
    if (vehiculoId) return `Veh. ${vehiculoPorId.get(vehiculoId) ?? vehiculoId}`;
    if (bomberoId) return 'Personal';
    return '-';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Movimientos ({movimientos?.length ?? 0})</h2>
        {puedeRegistrar && (
          <button type="button"
            className="btn-primary"
            onClick={() => {
              limpiarForm();
              setMostrarForm(!mostrarForm);
            }}
          >
            {mostrarForm ? 'Cancelar' : '+ Registrar movimiento'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Tipo de elemento</label>
          <ComboBuscable ariaLabel="Tipo de elemento" opciones={opcionesTipoElemento} value={filtroTipoElemento} onChange={setFiltroTipoElemento} maxWidth={160} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Tipo de movimiento</label>
          <ComboBuscable ariaLabel="Tipo de movimiento" opciones={opcionesTipoMovimiento} value={filtroTipoMovimientoId} onChange={setFiltroTipoMovimientoId} maxWidth={220} />
        </div>
        <div>
          <label htmlFor="desde" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Desde</label>
          <input id="desde" className="input-field" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <label htmlFor="hasta" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Hasta</label>
          <input id="hasta" className="input-field" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <button type="button"
          className="btn-primary"
          style={{ background: '#475569' }}
          onClick={() => {
            setFiltroTipoElemento('');
            setFiltroTipoMovimientoId('');
            setDesde('');
            setHasta('');
          }}
        >
          Limpiar filtros
        </button>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form onSubmit={registrar} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            Para Entrada por compra/donacion usar la pantalla Entradas; para Prestamo/Devolucion usar Prestamos; para Baja usar Bajas. Este
            formulario cubre Transferencia, Asignacion, Consumo, Confiscacion, Recuperacion u Otro.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de elemento</label>
              <ComboBuscable ariaLabel="Tipo de elemento" opciones={opcionesTipoElemento} value={tipoElemento} onChange={setTipoElemento} ningunaLabel="-- seleccionar --" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de movimiento</label>
              <ComboBuscable ariaLabel="Tipo de movimiento" opciones={opcionesTipoMovimiento} value={tipoMovimientoId} onChange={setTipoMovimientoId} ningunaLabel="-- seleccionar --" />
            </div>
            {tipoElemento === 'EQUIPO' ? (
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Equipo</label>
                <ComboBuscable ariaLabel="Equipo" opciones={opcionesEquipo} value={equipoId} onChange={setEquipoId} ningunaLabel="-- seleccionar --" placeholderBusqueda="Buscar equipo..." />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Artículo</label>
                  <ComboBuscable ariaLabel="Articulo" opciones={opcionesArticulo} value={articuloId} onChange={setArticuloId} ningunaLabel="-- seleccionar --" placeholderBusqueda="Buscar articulo..." />
                </div>
                <div>
                  <label htmlFor="cantidad" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cantidad</label>
                  <input id="cantidad" className="input-field" type="number" min={0.01} step="0.01" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <strong style={{ fontSize: 13 }}>Origen (de donde sale)</strong>
              <ComboBuscable opciones={opcionesTipoTenencia} value={origenTipoTenenciaId} onChange={setOrigenTipoTenenciaId} ningunaLabel="Sin origen (alta nueva)" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <ComboBuscable opciones={opcionesUbicacion} value={origenUbicacionId} onChange={setOrigenUbicacionId} ningunaLabel="Sin ubicacion" />
                <ComboBuscable opciones={opcionesVehiculo} value={origenVehiculoId} onChange={setOrigenVehiculoId} ningunaLabel="Sin vehiculo" />
                <ComboBuscable opciones={opcionesBombero} value={origenBomberoId} onChange={setOrigenBomberoId} ningunaLabel="Sin personal" />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <strong style={{ fontSize: 13 }}>Destino (a donde llega)</strong>
              <ComboBuscable opciones={opcionesTipoTenencia} value={destinoTipoTenenciaId} onChange={setDestinoTipoTenenciaId} ningunaLabel="Sin destino (salida/consumo)" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <ComboBuscable opciones={opcionesUbicacion} value={destinoUbicacionId} onChange={setDestinoUbicacionId} ningunaLabel="Sin ubicacion" />
                <ComboBuscable opciones={opcionesVehiculo} value={destinoVehiculoId} onChange={setDestinoVehiculoId} ningunaLabel="Sin vehiculo" />
                <ComboBuscable opciones={opcionesBombero} value={destinoBomberoId} onChange={setDestinoBomberoId} ningunaLabel="Sin personal" />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Responsable (entrega/recibe)</label>
              <ComboBuscable ariaLabel="Responsable (entrega/recibe)" opciones={opcionesBombero} value={responsableId} onChange={setResponsableId} ningunaLabel="Sin definir" />
            </div>
            <div>
              <label htmlFor="motivo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo</label>
              <input id="motivo" className="input-field" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="observacion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observación</label>
            <input id="observacion" className="input-field" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
          </div>

          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Registrar movimiento'}
          </button>
        </form>
      )}

      {movimientos && movimientos.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay movimientos registrados.</p>}
      {movimientos && movimientos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Fecha</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Tipo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Elemento</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Origen</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Destino</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{new Date(m.creadoEn).toLocaleString()}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge">{nombresTipoMov.get(m.tipoMovimientoId) ?? '-'}</span>
                </td>
                <td style={{ padding: '6px 4px' }}>{descripcionElemento(m)}</td>
                <td style={{ padding: '6px 4px' }}>{descripcionUbicacion(m.ubicacionOrigenId, m.vehiculoOrigenId, m.bomberoOrigenId)}</td>
                <td style={{ padding: '6px 4px' }}>{descripcionUbicacion(m.ubicacionDestinoId, m.vehiculoDestinoId, m.bomberoDestinoId)}</td>
                <td style={{ padding: '6px 4px' }}>{m.motivo ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
