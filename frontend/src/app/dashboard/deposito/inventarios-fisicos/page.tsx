'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { cargarBomberos, BomberoResumen } from '@/lib/personal';
import { InventarioFisicoDeposito, UbicacionDeposito, cargarInventariosFisicos, cargarUbicacionesDeposito, crearInventarioFisico } from '@/lib/deposito';

export default function InventariosFisicosPage() {
  const router = useRouter();
  const [inventarios, setInventarios] = useState<InventarioFisicoDeposito[] | null>(null);
  const [ubicaciones, setUbicaciones] = useState<UbicacionDeposito[]>([]);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('');

  const [fecha, setFecha] = useState('');
  const [ubicacionId, setUbicacionId] = useState('');
  const [responsableId, setResponsableId] = useState('');
  const [observacion, setObservacion] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCrear = permisos.includes('deposito:inventario_fisico');

  const opcionesUbicacion = useMemo(() => ubicaciones.map((u) => ({ value: u.id, label: u.nombre })), [ubicaciones]);
  const opcionesBombero = useMemo(() => bomberos.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` })), [bomberos]);
  const ubicacionPorId = useMemo(() => new Map(ubicaciones.map((u) => [u.id, u.nombre])), [ubicaciones]);

  async function cargar() {
    try {
      setInventarios(await cargarInventariosFisicos({ estado: filtroEstado || undefined }));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarUbicacionesDeposito().then(setUbicaciones);
    cargarBomberos().then(setBomberos).catch(() => undefined);
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      const creado = await crearInventarioFisico({
        fecha,
        ubicacionId: ubicacionId || undefined,
        responsableId: responsableId || undefined,
        observacion: observacion || undefined,
      });
      router.push(`/dashboard/deposito/inventarios-fisicos/${creado.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Inventarios fisicos ({inventarios?.length ?? 0})</h2>
        {puedeCrear && (
          <button className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : '+ Nuevo inventario fisico'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Estado</label>
          <ComboBuscable opciones={[{ value: 'EN_PROCESO', label: 'EN_PROCESO' }, { value: 'FINALIZADO', label: 'FINALIZADO' }]} value={filtroEstado} onChange={setFiltroEstado} maxWidth={180} />
        </div>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label>
              <input className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Ubicacion (opcional -- limita el conteo a esta ubicacion)</label>
              <ComboBuscable opciones={opcionesUbicacion} value={ubicacionId} onChange={setUbicacionId} ningunaLabel="Todo el deposito" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Responsable</label>
              <ComboBuscable opciones={opcionesBombero} value={responsableId} onChange={setResponsableId} ningunaLabel="Sin definir" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observacion</label>
            <input className="input-field" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
          </div>
          <button className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Creando...' : 'Crear e ir a cargar items'}
          </button>
        </form>
      )}

      {inventarios && inventarios.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No hay inventarios fisicos registrados.</p>}
      {inventarios && inventarios.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Fecha</th>
              <th style={{ padding: '6px 4px' }}>Ubicacion</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {inventarios.map((i) => (
              <tr key={i.id} onClick={() => router.push(`/dashboard/deposito/inventarios-fisicos/${i.id}`)} style={{ borderBottom: '1px solid #1f2937', cursor: 'pointer' }}>
                <td style={{ padding: '6px 4px' }}>{i.fecha}</td>
                <td style={{ padding: '6px 4px' }}>{i.ubicacionId ? ubicacionPorId.get(i.ubicacionId) ?? '-' : 'Todo el deposito'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: i.estado === 'FINALIZADO' ? '#166534' : '#334155' }}>{i.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
