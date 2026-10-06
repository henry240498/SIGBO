'use client';

import { useEffect, useId, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import {
  EstadoEstablecimiento,
  ResultadoInspeccion,
  cargarEstadoPrevencion,
  registrarInspeccion,
} from '@/lib/reservas';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';

const FONDO: Record<EstadoEstablecimiento['estado'], string> = {
  VIGENTE: 'var(--ok-fill)',
  POR_VENCER: 'var(--warn-fill)',
  VENCIDO: 'var(--bad-fill)',
  PENDIENTE: 'var(--warn-fill)',
};
const ETIQUETA: Record<EstadoEstablecimiento['estado'], string> = {
  VIGENTE: 'Certificado vigente',
  POR_VENCER: 'Por vencer',
  VENCIDO: 'Vencido',
  PENDIENTE: 'Pendiente de regularizar',
};

const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function PrevencionPage() {
  const id = useId();
  const [estado, setEstado] = useState<EstadoEstablecimiento[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [establecimiento, setEstablecimiento] = useState('');
  const [direccion, setDireccion] = useState('');
  const [fecha, setFecha] = useState(hoy());
  const [resultado, setResultado] = useState<ResultadoInspeccion>('APROBADO');
  const [observaciones, setObservaciones] = useState('');
  const [certNumero, setCertNumero] = useState('');
  const [certVence, setCertVence] = useState('');

  const puedeRegistrar = !!obtenerSesion()?.usuario.permisos.includes('servicios:crear');

  async function cargar() {
    try {
      setEstado(await cargarEstadoPrevencion(30));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    try {
      await registrarInspeccion({
        establecimiento,
        direccion,
        fecha,
        resultado,
        observaciones: observaciones || undefined,
        certificadoNumero: resultado === 'APROBADO' ? certNumero : undefined,
        certificadoVence: resultado === 'APROBADO' ? certVence : undefined,
      });
      setMensaje('Inspección registrada');
      setEstablecimiento('');
      setDireccion('');
      setObservaciones('');
      setCertNumero('');
      setCertVence('');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 16 }}>Prevención: inspecciones y certificados</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          El estado de cada establecimiento sale de su última inspección. Una inspección aprobada lleva el número y el vencimiento del certificado.
        </p>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {puedeRegistrar && (
        <form className="card" onSubmit={registrar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <strong style={{ fontSize: 14 }}>Registrar inspección</strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            <div>
              <label htmlFor={`${id}-est`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Establecimiento</label>
              <input id={`${id}-est`} className="input-field" value={establecimiento} onChange={(e) => setEstablecimiento(e.target.value)} required minLength={2} maxLength={150} />
            </div>
            <div>
              <label htmlFor={`${id}-dir`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Dirección</label>
              <input id={`${id}-dir`} className="input-field" value={direccion} onChange={(e) => setDireccion(e.target.value)} required minLength={3} maxLength={300} />
            </div>
            <div>
              <label htmlFor={`${id}-fec`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label>
              <input id={`${id}-fec`} className="input-field" type="date" max={hoy()} value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
            <div>
              <label htmlFor={`${id}-res`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Resultado</label>
              <select id={`${id}-res`} className="input-field" value={resultado} onChange={(e) => setResultado(e.target.value as ResultadoInspeccion)}>
                <option value="APROBADO">Aprobado</option>
                <option value="CON_OBSERVACIONES">Con observaciones</option>
                <option value="RECHAZADO">Rechazado</option>
              </select>
            </div>
            {resultado === 'APROBADO' && (
              <>
                <div>
                  <label htmlFor={`${id}-cn`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>N.º de certificado</label>
                  <input id={`${id}-cn`} className="input-field" value={certNumero} onChange={(e) => setCertNumero(e.target.value)} required maxLength={40} />
                </div>
                <div>
                  <label htmlFor={`${id}-cv`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Vence</label>
                  <input id={`${id}-cv`} className="input-field" type="date" min={fecha} value={certVence} onChange={(e) => setCertVence(e.target.value)} required />
                </div>
              </>
            )}
          </div>
          <div>
            <label htmlFor={`${id}-obs`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observaciones</label>
            <textarea id={`${id}-obs`} className="input-field" rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} maxLength={1000} />
          </div>
          <div><button type="submit" className="btn-primary">Registrar inspección</button></div>
        </form>
      )}

      {estado === null ? (
        <Cargando texto="Cargando establecimientos…" />
      ) : estado.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Todavía no hay inspecciones registradas.</p>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th scope="col">Establecimiento</th>
                <th scope="col">Última inspección</th>
                <th scope="col">Certificado</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {estado.map((e) => (
                <tr key={`${e.establecimiento}-${e.direccion}`}>
                  <td><strong>{e.establecimiento}</strong><div style={{ fontSize: 12, color: 'var(--muted)' }}>{e.direccion}</div></td>
                  <td>{e.ultimaInspeccion}<div style={{ fontSize: 12, color: 'var(--muted)' }}>{e.resultado.replace('_', ' ').toLowerCase()}</div></td>
                  <td>{e.certificadoNumero ? <>{e.certificadoNumero}<div style={{ fontSize: 12, color: 'var(--muted)' }}>vence {e.certificadoVence}</div></> : '—'}</td>
                  <td>
                    <span className="badge" style={{ background: FONDO[e.estado] }}>{ETIQUETA[e.estado]}</span>
                    {e.diasRestantes !== null && (
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{e.diasRestantes < 0 ? `hace ${-e.diasRestantes} d` : `en ${e.diasRestantes} d`}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
