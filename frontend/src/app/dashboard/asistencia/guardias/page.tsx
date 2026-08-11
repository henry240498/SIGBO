'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';
import { cargarGuardias, crearGuardia, Guardia, TURNOS_GUARDIA } from '@/lib/asistencia';

export default function GuardiasPage() {
  const router = useRouter();
  const [guardias, setGuardias] = useState<Guardia[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [fecha, setFecha] = useState('');
  const [turno, setTurno] = useState('DIURNO');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const puedeCrear = !!obtenerSesion()?.usuario.permisos.includes('asistencia:guardias_crear');

  async function cargar() {
    try {
      setGuardias(await cargarGuardias());
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
    setGuardando(true);
    try {
      const creada = await crearGuardia({ fecha, turno, horaInicio, horaFin, observaciones: observaciones || undefined });
      router.push(`/dashboard/asistencia/guardias/${creada.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Guardias ({guardias?.length ?? 0})</h2>
        {puedeCrear && (
          <button className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : '+ Nueva guardia'}
          </button>
        )}
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label>
              <input className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Turno</label>
              <select className="input-field" value={turno} onChange={(e) => setTurno(e.target.value)}>
                {TURNOS_GUARDIA.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Hora inicio</label>
              <input className="input-field" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Hora fin</label>
              <input className="input-field" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} required />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observaciones</label>
            <input className="input-field" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
          </div>
          <button className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Crear guardia'}
          </button>
        </form>
      )}

      {guardias && guardias.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No hay guardias registradas.</p>}
      {guardias && guardias.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Fecha</th>
              <th style={{ padding: '6px 4px' }}>Turno</th>
              <th style={{ padding: '6px 4px' }}>Horario</th>
              <th style={{ padding: '6px 4px' }}>Tipo</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {guardias.map((g) => (
              <tr
                key={g.id}
                onClick={() => router.push(`/dashboard/asistencia/guardias/${g.id}`)}
                style={{ borderBottom: '1px solid #1f2937', cursor: 'pointer' }}
              >
                <td style={{ padding: '6px 4px' }}>{g.fecha}</td>
                <td style={{ padding: '6px 4px' }}>{g.turno}</td>
                <td style={{ padding: '6px 4px' }}>
                  {g.horaInicio} - {g.horaFin}
                </td>
                <td style={{ padding: '6px 4px' }}>{g.tipo}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge">{g.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
