'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Guardia, GrupoGuardia, TIPOS_GUARDIA_REGISTRO, TURNOS_GUARDIA, cargarGruposGuardia, cargarGuardias, crearGuardia } from '@/lib/guardias';

export default function GuardiasPage() {
  const router = useRouter();
  const [guardias, setGuardias] = useState<Guardia[] | null>(null);
  const [grupos, setGrupos] = useState<GrupoGuardia[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [fecha, setFecha] = useState('');
  const [turno, setTurno] = useState('DIURNO');
  const [tipo, setTipo] = useState('ORDINARIA');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [grupoGuardiaId, setGrupoGuardiaId] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const puedeCrear = !!obtenerSesion()?.usuario.permisos.includes('guardias:crear');

  async function cargar() {
    try {
      setGuardias(await cargarGuardias());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    cargarGruposGuardia('ACTIVO').then(setGrupos).catch(() => undefined);
  }, []);

  const opcionesGrupo = grupos.map((g) => ({ value: g.id, label: g.nombre }));

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      const creada = await crearGuardia({
        fecha,
        turno,
        tipo,
        horaInicio,
        horaFin,
        grupoGuardiaId: grupoGuardiaId || undefined,
        observaciones: observaciones || undefined,
      });
      router.push(`/dashboard/guardias/${creada.id}`);
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
          <button type="button" className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : '+ Nueva guardia'}
          </button>
        )}
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label>
              <input className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Turno</label>
              <select className="input-field" value={turno} onChange={(e) => setTurno(e.target.value)}>
                {TURNOS_GUARDIA.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo</label>
              <select className="input-field" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {TIPOS_GUARDIA_REGISTRO.map((t) => (
                  <option key={t} value={t}>{t}</option>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Grupo de guardia (opcional)</label>
              <ComboBuscable
                opciones={opcionesGrupo}
                value={grupoGuardiaId}
                onChange={setGrupoGuardiaId}
                placeholderBusqueda="Buscar grupo..."
                ningunaLabel="Sin grupo (cargar personal manualmente)"
              />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observaciones</label>
              <input className="input-field" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            </div>
          </div>
          {grupoGuardiaId && (
            <p style={{ fontSize: 12, color: '#94a3b8' }}>
              El personal titular del grupo seleccionado se cargara automaticamente al crear la guardia.
            </p>
          )}
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
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
                onClick={() => router.push(`/dashboard/guardias/${g.id}`)}
                style={{ borderBottom: '1px solid #1f2937', cursor: 'pointer' }}
              >
                <td style={{ padding: '6px 4px' }}>{g.fecha}</td>
                <td style={{ padding: '6px 4px' }}>{g.turno}</td>
                <td style={{ padding: '6px 4px' }}>{g.horaInicio} - {g.horaFin}</td>
                <td style={{ padding: '6px 4px' }}>{g.tipo}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span
                    className="badge"
                    style={{ background: g.estado === 'FINALIZADA' ? '#166534' : g.estado === 'CANCELADA' ? '#7f1d1d' : '#334155' }}
                  >
                    {g.estado}
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
