'use client';

import { useEffect, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { EjercicioFiscal, cargarEjerciciosFiscales, cerrarEjercicioFiscal, crearEjercicioFiscal, reabrirEjercicioFiscal } from '@/lib/finanzas';

export default function EjerciciosFiscalesPage() {
  const confirmar = useConfirmacion();
  const [ejercicios, setEjercicios] = useState<EjercicioFiscal[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [anio, setAnio] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeAdministrar = permisos.includes('finanzas:administrar_presupuesto');

  async function cargar() {
    try {
      setEjercicios(await cargarEjerciciosFiscales());
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
    setMensaje(null);
    setGuardando(true);
    try {
      await crearEjercicioFiscal({ anio: Number(anio), fechaInicio, fechaFin });
      setMensaje('Ejercicio fiscal creado.');
      setAnio('');
      setFechaInicio('');
      setFechaFin('');
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function alternarEstado(ej: EjercicioFiscal) {
    if (!await confirmar({ titulo: 'Cambiar estado del ejercicio', mensaje: `¿${ej.estado === 'ABIERTO' ? 'Cerrar' : 'Reabrir'} el ejercicio ${ej.anio}?`, confirmar: 'Continuar', peligro: true })) return;
    try {
      if (ej.estado === 'ABIERTO') await cerrarEjercicioFiscal(ej.id);
      else await reabrirEjercicioFiscal(ej.id);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Ejercicios fiscales ({ejercicios?.length ?? 0})</h2>
        {puedeAdministrar && (
          <button type="button" className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : '+ Nuevo ejercicio'}
          </button>
        )}
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}
      <p style={{ fontSize: 12, color: '#64748b' }}>Los movimientos financieros nunca se mezclan entre ejercicios -- cada uno se resuelve segun su fecha.</p>

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Año</label>
              <input className="input-field" type="number" value={anio} onChange={(e) => setAnio(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha inicio</label>
              <input className="input-field" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha fin</label>
              <input className="input-field" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
            </div>
          </div>
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Crear ejercicio'}
          </button>
        </form>
      )}

      {ejercicios && ejercicios.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No hay ejercicios fiscales registrados.</p>}
      {ejercicios && ejercicios.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Año</th>
              <th style={{ padding: '6px 4px' }}>Inicio</th>
              <th style={{ padding: '6px 4px' }}>Fin</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ejercicios.map((ej) => (
              <tr key={ej.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{ej.anio}</td>
                <td style={{ padding: '6px 4px' }}>{ej.fechaInicio}</td>
                <td style={{ padding: '6px 4px' }}>{ej.fechaFin}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: ej.estado === 'ABIERTO' ? '#166534' : '#334155', color: ej.estado === 'ABIERTO' ? '#4ade80' : '#e2e8f0' }}>{ej.estado}</span>
                </td>
                <td style={{ padding: '6px 4px' }}>
                  {puedeAdministrar && (
                    <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12, background: ej.estado === 'ABIERTO' ? '#7f1d1d' : '#475569' }} onClick={() => alternarEstado(ej)}>
                      {ej.estado === 'ABIERTO' ? 'Cerrar' : 'Reabrir'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
