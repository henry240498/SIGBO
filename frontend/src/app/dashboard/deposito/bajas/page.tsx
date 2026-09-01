'use client';

import { useEffect, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Parametro, resolverNombres } from '@/lib/parametros';
import { cargarBomberos, BomberoResumen } from '@/lib/personal';
import { cargarVehiculos, Vehiculo } from '@/lib/vehiculos';
import { cargarEquipos, Equipo } from '@/lib/equipos';
import {
  Articulo,
  BajaDeposito,
  UbicacionDeposito,
  cargarArticulos,
  cargarBajasDeposito,
  cargarMotivosBajaDeposito,
  cargarUbicacionesDeposito,
  crearBajaDeposito,
} from '@/lib/deposito';
import { Aviso } from '@/app/components/Aviso';

export default function BajasDepositoPage() {
  const confirmar = useConfirmacion();
  const [bajas, setBajas] = useState<BajaDeposito[] | null>(null);
  const [motivos, setMotivos] = useState<Parametro[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [ubicaciones, setUbicaciones] = useState<UbicacionDeposito[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [nombresMotivo, setNombresMotivo] = useState<Map<string, string>>(new Map());

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [tipoElemento, setTipoElemento] = useState<'EQUIPO' | 'ARTICULO'>('EQUIPO');
  const [equipoId, setEquipoId] = useState('');
  const [articuloId, setArticuloId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [origenUbicacionId, setOrigenUbicacionId] = useState('');
  const [origenVehiculoId, setOrigenVehiculoId] = useState('');
  const [origenBomberoId, setOrigenBomberoId] = useState('');
  const [motivoBajaId, setMotivoBajaId] = useState('');
  const [fecha, setFecha] = useState('');
  const [responsableId, setResponsableId] = useState('');
  const [autorizadoPor, setAutorizadoPor] = useState('');
  const [observacion, setObservacion] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeDarBaja = permisos.includes('deposito:baja');

  const opcionesTipoElemento = [{ value: 'EQUIPO', label: 'Equipo' }, { value: 'ARTICULO', label: 'Articulo' }];
  const opcionesMotivo = useMemo(() => motivos.map((m) => ({ value: m.id, label: m.nombre })), [motivos]);
  const opcionesArticulo = useMemo(() => articulos.map((a) => ({ value: a.id, label: `${a.codigo} — ${a.nombre}` })), [articulos]);
  const opcionesEquipo = useMemo(() => equipos.map((e) => ({ value: e.id, label: `${e.codigoInterno} — ${e.nombre}` })), [equipos]);
  const opcionesUbicacion = useMemo(() => ubicaciones.map((u) => ({ value: u.id, label: u.nombre })), [ubicaciones]);
  const opcionesVehiculo = useMemo(() => vehiculos.map((v) => ({ value: v.id, label: v.numeroInterno })), [vehiculos]);
  const opcionesBombero = useMemo(() => bomberos.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` })), [bomberos]);

  const articuloPorId = useMemo(() => new Map(articulos.map((a) => [a.id, `${a.codigo} — ${a.nombre}`])), [articulos]);
  const equipoPorId = useMemo(() => new Map(equipos.map((e) => [e.id, `${e.codigoInterno} — ${e.nombre}`])), [equipos]);

  async function cargar() {
    try {
      const datos = await cargarBajasDeposito();
      setBajas(datos);
      setNombresMotivo(await resolverNombres(datos.map((b) => b.motivoBajaId)));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarMotivosBajaDeposito().then(setMotivos);
    cargarArticulos().then(setArticulos).catch(() => undefined);
    cargarEquipos().then(setEquipos).catch(() => undefined);
    cargarUbicacionesDeposito().then(setUbicaciones);
    cargarVehiculos().then(setVehiculos).catch(() => undefined);
    cargarBomberos().then(setBomberos).catch(() => undefined);
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function limpiarForm() {
    setTipoElemento('EQUIPO');
    setEquipoId('');
    setArticuloId('');
    setCantidad('');
    setOrigenUbicacionId('');
    setOrigenVehiculoId('');
    setOrigenBomberoId('');
    setMotivoBajaId('');
    setFecha('');
    setResponsableId('');
    setAutorizadoPor('');
    setObservacion('');
  }

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    if (!await confirmar({ titulo: 'Registrar baja', mensaje: '¿Confirmar la baja de este elemento? Esta acción queda registrada permanentemente en el histórico.', confirmar: 'Registrar baja', peligro: true })) return;
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await crearBajaDeposito({
        tipoElemento,
        equipoId: tipoElemento === 'EQUIPO' ? equipoId : undefined,
        articuloId: tipoElemento === 'ARTICULO' ? articuloId : undefined,
        cantidad: tipoElemento === 'ARTICULO' ? Number(cantidad) : undefined,
        origenUbicacionId: tipoElemento === 'ARTICULO' ? origenUbicacionId || undefined : undefined,
        origenVehiculoId: tipoElemento === 'ARTICULO' ? origenVehiculoId || undefined : undefined,
        origenBomberoId: tipoElemento === 'ARTICULO' ? origenBomberoId || undefined : undefined,
        motivoBajaId,
        fecha,
        responsableId: responsableId || undefined,
        autorizadoPor: autorizadoPor || undefined,
        observacion: observacion || undefined,
      });
      setMensaje('Baja registrada.');
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
        <h2 style={{ fontSize: 16 }}>Bajas ({bajas?.length ?? 0})</h2>
        {puedeDarBaja && (
          <button type="button"
            className="btn-primary"
            style={{ background: '#7f1d1d' }}
            onClick={() => {
              limpiarForm();
              setMostrarForm(!mostrarForm);
            }}
          >
            {mostrarForm ? 'Cancelar' : '+ Dar de baja'}
          </button>
        )}
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form onSubmit={registrar} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            El elemento nunca se elimina: pasa a estado BAJA y permanece en el historico de movimientos.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de elemento</label>
              <ComboBuscable ariaLabel="Tipo de elemento" opciones={opcionesTipoElemento} value={tipoElemento} onChange={(v) => setTipoElemento(v as 'EQUIPO' | 'ARTICULO')} ningunaLabel="-- seleccionar --" />
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
            <div>
              <label htmlFor="fecha" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label>
              <input id="fecha" className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
          </div>

          {tipoElemento === 'ARTICULO' && (
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Origen del artículo</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <ComboBuscable opciones={opcionesUbicacion} value={origenUbicacionId} onChange={setOrigenUbicacionId} ningunaLabel="Sin ubicacion" />
                <ComboBuscable opciones={opcionesVehiculo} value={origenVehiculoId} onChange={setOrigenVehiculoId} ningunaLabel="Sin vehiculo" />
                <ComboBuscable opciones={opcionesBombero} value={origenBomberoId} onChange={setOrigenBomberoId} ningunaLabel="Sin personal" />
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo</label>
              <ComboBuscable ariaLabel="Motivo" opciones={opcionesMotivo} value={motivoBajaId} onChange={setMotivoBajaId} ningunaLabel="-- seleccionar --" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Responsable</label>
              <ComboBuscable ariaLabel="Responsable" opciones={opcionesBombero} value={responsableId} onChange={setResponsableId} ningunaLabel="Sin definir" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Autorizado por</label>
              <ComboBuscable ariaLabel="Autorizado por" opciones={opcionesBombero} value={autorizadoPor} onChange={setAutorizadoPor} ningunaLabel="Sin definir" />
            </div>
          </div>
          <div>
            <label htmlFor="observacion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observación</label>
            <input id="observacion" className="input-field" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
          </div>

          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start', background: '#7f1d1d' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Confirmar baja'}
          </button>
        </form>
      )}

      {bajas && bajas.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay bajas registradas.</p>}
      {bajas && bajas.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Fecha</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Elemento</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Motivo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Observación</th>
            </tr>
          </thead>
          <tbody>
            {bajas.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{b.fecha}</td>
                <td style={{ padding: '6px 4px' }}>
                  {b.tipoElemento === 'EQUIPO' ? (b.equipoId ? equipoPorId.get(b.equipoId) ?? b.equipoId : '-') : `${b.articuloId ? articuloPorId.get(b.articuloId) ?? b.articuloId : '-'} (${b.cantidad ?? '-'})`}
                </td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: 'var(--bad-fill)', color: 'var(--danger)' }}>
                    {nombresMotivo.get(b.motivoBajaId) ?? '-'}
                  </span>
                </td>
                <td style={{ padding: '6px 4px' }}>{b.observacion ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
