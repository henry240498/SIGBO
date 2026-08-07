'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { descargarArchivo } from '@/lib/exportar';

interface Opcion {
  id: string;
  nombre: string;
}

interface Bombero {
  id: string;
  nombre: string;
  apellido: string;
  numeroBombero: string;
}

interface Ascenso {
  id: string;
  codigo: string | null;
  bomberoId: string;
  bomberoNombre: string | null;
  rangoAnteriorNombre: string | null;
  rangoNuevoNombre: string | null;
  fecha: string;
  resolucion: string | null;
  motivo: string | null;
  estado: 'REGISTRADO' | 'ANULADO';
}

export default function AscensosPage() {
  const [ascensos, setAscensos] = useState<Ascenso[] | null>(null);
  const [bomberos, setBomberos] = useState<Bombero[]>([]);
  const [rangos, setRangos] = useState<Opcion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [bomberoId, setBomberoId] = useState('');
  const [rangoNuevoId, setRangoNuevoId] = useState('');
  const [fecha, setFecha] = useState('');
  const [resolucion, setResolucion] = useState('');
  const [motivo, setMotivo] = useState('');

  async function cargar() {
    try {
      const [aRes, bRes, rRes] = await Promise.all([
        apiFetch('/organizacion/ascensos'),
        apiFetch('/personal/bomberos'),
        apiFetch('/organizacion/rangos'),
      ]);
      if (!aRes.ok) throw new Error('No se pudo cargar ascensos');
      setAscensos(await aRes.json());
      if (bRes.ok) setBomberos(await bRes.json());
      if (rRes.ok) setRangos(await rRes.json());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const bomberoActual = bomberos.find((b) => b.id === bomberoId) as any;

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await apiFetch('/organizacion/ascensos', {
      method: 'POST',
      body: JSON.stringify({
        bomberoId,
        rangoNuevoId,
        fecha,
        resolucion: resolucion || undefined,
        motivo: motivo || undefined,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo registrar el ascenso');
      return;
    }
    setBomberoId('');
    setRangoNuevoId('');
    setFecha('');
    setResolucion('');
    setMotivo('');
    setMostrarForm(false);
    await cargar();
  }

  async function anular(id: string) {
    setError(null);
    if (!window.confirm('Anular este ascenso? Si el bombero no tuvo ascensos posteriores, se revertira su rango.')) return;
    const res = await apiFetch(`/organizacion/ascensos/${id}/anular`, { method: 'PATCH' });
    if (!res.ok) {
      setError('No se pudo anular el ascenso');
      return;
    }
    await cargar();
  }



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Ascensos ({ascensos?.length ?? 0})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary" onClick={() => descargarArchivo('/organizacion/ascensos/exportar/excel', 'ascensos.xlsx')}>
            Exportar a Excel
          </button>
          <button className="btn-primary" onClick={() => descargarArchivo('/organizacion/ascensos/exportar/pdf', 'ascensos.pdf')}>
            Exportar a PDF
          </button>
          <button className="btn-primary" onClick={() => setMostrarForm((v) => !v)}>
            {mostrarForm ? 'Cancelar' : 'Registrar ascenso'}
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {mostrarForm && (
        <form className="card" onSubmit={crear} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Bombero</label>
            <select className="input-field" value={bomberoId} onChange={(e) => setBomberoId(e.target.value)} required>
              <option value="">-- seleccionar --</option>
              {bomberos.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.numeroBombero} - {b.nombre} {b.apellido}
                </option>
              ))}
            </select>
            {bomberoActual && (
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                Rango actual: {bomberoActual.rango ?? 'sin registrar'}
              </p>
            )}
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nuevo rango</label>
            <select className="input-field" value={rangoNuevoId} onChange={(e) => setRangoNuevoId(e.target.value)} required>
              <option value="">-- seleccionar --</option>
              {rangos.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label>
            <input className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Resolucion</label>
            <input className="input-field" value={resolucion} onChange={(e) => setResolucion(e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo</label>
            <input className="input-field" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </div>
          <button className="btn-primary" style={{ gridColumn: '1 / -1', justifySelf: 'start' }}>
            Registrar ascenso
          </button>
        </form>
      )}

      {ascensos && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Bombero</th>
              <th style={{ padding: '6px 4px' }}>Rango anterior</th>
              <th style={{ padding: '6px 4px' }}>Rango nuevo</th>
              <th style={{ padding: '6px 4px' }}>Fecha</th>
              <th style={{ padding: '6px 4px' }}>Resolucion</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ascensos.map((a) => (
              <tr key={a.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{a.bomberoNombre}</td>
                <td style={{ padding: '6px 4px', color: '#94a3b8' }}>{a.rangoAnteriorNombre ?? '—'}</td>
                <td style={{ padding: '6px 4px' }}>{a.rangoNuevoNombre}</td>
                <td style={{ padding: '6px 4px' }}>{a.fecha}</td>
                <td style={{ padding: '6px 4px', color: '#94a3b8' }}>{a.resolucion}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge">{a.estado}</span>
                </td>
                <td style={{ padding: '6px 4px' }}>
                  {a.estado === 'REGISTRADO' && (
                    <button
                      onClick={() => anular(a.id)}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}
                    >
                      anular
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
