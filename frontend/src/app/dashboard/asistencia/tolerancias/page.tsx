'use client';

import { useEffect, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { cargarParametros, Parametro } from '@/lib/parametros';
import { cargarTolerancias, crearTolerancia, ToleranciaAsistencia } from '@/lib/asistencia';

export default function TolerenciasPage() {
  const [tolerancias, setTolerancias] = useState<ToleranciaAsistencia[] | null>(null);
  const [tiposEvento, setTiposEvento] = useState<Parametro[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [tipoEventoId, setTipoEventoId] = useState('');
  const [minutosEntrada, setMinutosEntrada] = useState(0);
  const [minutosSalida, setMinutosSalida] = useState(0);

  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('asistencia:asistencia_editar');
  const tipoPorId = useMemo(() => new Map(tiposEvento.map((t) => [t.id, t.nombre])), [tiposEvento]);
  const opcionesTipo = useMemo(() => tiposEvento.map((t) => ({ value: t.id, label: t.nombre })), [tiposEvento]);

  async function cargar() {
    setTolerancias(await cargarTolerancias());
  }

  useEffect(() => {
    cargar();
    cargarParametros('TIPO_EVENTO_ASISTENCIA').then(setTiposEvento);
  }, []);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await crearTolerancia({
        tipoEventoId: tipoEventoId || undefined,
        minutosToleranciaEntrada: minutosEntrada,
        minutosToleranciaSalida: minutosSalida,
      });
      setTipoEventoId('');
      setMinutosEntrada(0);
      setMinutosSalida(0);
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
        <h2 style={{ fontSize: 16 }}>Tolerancias de horario ({tolerancias?.length ?? 0})</h2>
        {puedeEditar && (
          <button type="button" className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : '+ Nueva tolerancia'}
          </button>
        )}
      </div>
      <p style={{ fontSize: 13, color: '#94a3b8' }}>
        Reglas de tolerancia parametrizables por tipo de evento (o generales, dejando &quot;Tipo de evento&quot; en
        NINGUNA). No estan codificadas rigidamente en el sistema.
      </p>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de evento (vacio = regla general)</label>
              <ComboBuscable opciones={opcionesTipo} value={tipoEventoId} onChange={setTipoEventoId} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tolerancia entrada (min)</label>
              <input
                className="input-field"
                type="number"
                min={0}
                value={minutosEntrada}
                onChange={(e) => setMinutosEntrada(Number(e.target.value))}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tolerancia salida (min)</label>
              <input
                className="input-field"
                type="number"
                min={0}
                value={minutosSalida}
                onChange={(e) => setMinutosSalida(Number(e.target.value))}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Crear'}
          </button>
        </form>
      )}

      {tolerancias && tolerancias.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin tolerancias configuradas.</p>}
      {tolerancias && tolerancias.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Tipo de evento</th>
              <th style={{ padding: '6px 4px' }}>Tolerancia entrada</th>
              <th style={{ padding: '6px 4px' }}>Tolerancia salida</th>
            </tr>
          </thead>
          <tbody>
            {tolerancias.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{t.tipoEventoId ? tipoPorId.get(t.tipoEventoId) ?? '-' : 'General'}</td>
                <td style={{ padding: '6px 4px' }}>{t.minutosToleranciaEntrada} min</td>
                <td style={{ padding: '6px 4px' }}>{t.minutosToleranciaSalida} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
