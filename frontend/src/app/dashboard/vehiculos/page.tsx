'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { obtenerSesion } from '@/lib/api';
import { ESTADOS_VEHICULO, Vehiculo, cargarVehiculos, crearVehiculo } from '@/lib/vehiculos';

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [q, setQ] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const [numeroInterno, setNumeroInterno] = useState('');
  const [tipo, setTipo] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [patente, setPatente] = useState('');

  const puedeCrear = !!obtenerSesion()?.usuario.permisos.includes('vehiculos:crear');

  async function cargar() {
    try {
      setVehiculos(await cargarVehiculos(filtroEstado || undefined));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado]);

  const filtrados = useMemo(() => {
    if (!vehiculos) return [];
    if (!q.trim()) return vehiculos;
    const qn = q.trim().toLowerCase();
    return vehiculos.filter(
      (v) =>
        v.numeroInterno.toLowerCase().includes(qn) ||
        v.tipo.toLowerCase().includes(qn) ||
        (v.marca ?? '').toLowerCase().includes(qn) ||
        (v.patente ?? '').toLowerCase().includes(qn),
    );
  }, [vehiculos, q]);

  function limpiarForm() {
    setNumeroInterno('');
    setTipo('');
    setMarca('');
    setModelo('');
    setAnio('');
    setPatente('');
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await crearVehiculo({
        numeroInterno,
        tipo,
        marca: marca || undefined,
        modelo: modelo || undefined,
        anio: anio ? Number(anio) : undefined,
        patente: patente || undefined,
      });
      setMensaje('Vehiculo creado. Completa el resto de los datos desde su ficha.');
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
        <h2 style={{ fontSize: 16 }}>Moviles ({filtrados.length})</h2>
        {puedeCrear && (
          <button type="button" className="btn-primary" onClick={() => setMostrarForm((v) => !v)}>
            {mostrarForm ? 'Cancelar' : 'Nuevo movil'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="input-field"
          style={{ maxWidth: 260 }}
          placeholder="Buscar por codigo, tipo, marca o patente..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="input-field" style={{ maxWidth: 200 }} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS_VEHICULO.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {mostrarForm && (
        <form className="card" onSubmit={crear} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Codigo interno</label>
              <input className="input-field" value={numeroInterno} onChange={(e) => setNumeroInterno(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo</label>
              <input className="input-field" value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="Autobomba, Ambulancia..." required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Marca</label>
              <input className="input-field" value={marca} onChange={(e) => setMarca(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Modelo</label>
              <input className="input-field" value={modelo} onChange={(e) => setModelo(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Anio</label>
              <input className="input-field" type="number" value={anio} onChange={(e) => setAnio(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Patente</label>
              <input className="input-field" value={patente} onChange={(e) => setPatente(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={guardando} style={{ alignSelf: 'flex-start' }}>
            {guardando ? 'Guardando...' : 'Crear movil'}
          </button>
        </form>
      )}

      {filtrados.length === 0 && vehiculos && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin moviles registrados.</p>}

      {filtrados.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Codigo</th>
              <th style={{ padding: '6px 4px' }}>Tipo</th>
              <th style={{ padding: '6px 4px' }}>Marca/Modelo</th>
              <th style={{ padding: '6px 4px' }}>Patente</th>
              <th style={{ padding: '6px 4px' }}>Km actual</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((v) => (
              <tr key={v.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>
                  <Link href={`/dashboard/vehiculos/${v.id}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>
                    {v.numeroInterno}
                  </Link>
                </td>
                <td style={{ padding: '6px 4px' }}>{v.tipo}</td>
                <td style={{ padding: '6px 4px' }}>{[v.marca, v.modelo].filter(Boolean).join(' ') || '—'}</td>
                <td style={{ padding: '6px 4px' }}>{v.patente ?? '—'}</td>
                <td style={{ padding: '6px 4px' }}>{v.kilometrajeActual.toLocaleString()}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span
                    className="badge"
                    style={{
                      background:
                        v.estado === 'OPERATIVO' ? '#166534' : v.estado === 'BAJA' ? '#7f1d1d' : '#854d0e',
                    }}
                  >
                    {v.estado}
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
