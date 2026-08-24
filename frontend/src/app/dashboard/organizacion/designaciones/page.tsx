'use client';

import { useEffect, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
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

interface Designacion {
  id: string;
  codigo: string | null;
  bomberoId: string;
  bomberoNombre: string | null;
  cargoId: string;
  cargoNombre: string | null;
  companiaId: string | null;
  companiaNombre: string | null;
  cuartelId: string | null;
  cuartelNombre: string | null;
  fechaDesde: string;
  fechaHasta: string | null;
  estado: 'ACTIVA' | 'FINALIZADA' | 'ANULADA';
  motivo: string | null;
  eliminadoEn: string | null;
}

export default function DesignacionesPage() {
  const confirmar = useConfirmacion();
  const [designaciones, setDesignaciones] = useState<Designacion[] | null>(null);
  const [bomberos, setBomberos] = useState<Bombero[]>([]);
  const [cargos, setCargos] = useState<Opcion[]>([]);
  const [companias, setCompanias] = useState<Opcion[]>([]);
  const [cuarteles, setCuarteles] = useState<Opcion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [bomberoId, setBomberoId] = useState('');
  const [cargoId, setCargoId] = useState('');
  const [companiaId, setCompaniaId] = useState('');
  const [cuartelId, setCuartelId] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');

  async function cargar() {
    try {
      const [dRes, bRes, cRes, coRes, cuRes] = await Promise.all([
        apiFetch('/organizacion/designaciones'),
        apiFetch('/personal/bomberos'),
        apiFetch('/organizacion/cargos'),
        apiFetch('/organizacion/companias'),
        apiFetch('/organizacion/cuarteles'),
      ]);
      if (!dRes.ok) throw new Error('No se pudo cargar designaciones');
      setDesignaciones(await dRes.json());
      if (bRes.ok) setBomberos(await bRes.json());
      if (cRes.ok) setCargos(await cRes.json());
      if (coRes.ok) setCompanias(await coRes.json());
      if (cuRes.ok) setCuarteles(await cuRes.json());
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
    const res = await apiFetch('/organizacion/designaciones', {
      method: 'POST',
      body: JSON.stringify({
        bomberoId,
        cargoId,
        companiaId: companiaId || undefined,
        cuartelId: cuartelId || undefined,
        fechaDesde,
        motivo: motivo || undefined,
        observaciones: observaciones || undefined,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo crear la designacion');
      return;
    }
    setBomberoId('');
    setCargoId('');
    setCompaniaId('');
    setCuartelId('');
    setFechaDesde('');
    setMotivo('');
    setObservaciones('');
    setMostrarForm(false);
    await cargar();
  }

  async function finalizar(id: string) {
    setError(null);
    const res = await apiFetch(`/organizacion/designaciones/${id}/finalizar`, { method: 'PATCH', body: JSON.stringify({}) });
    if (!res.ok) {
      setError('No se pudo finalizar la designacion');
      return;
    }
    await cargar();
  }

  async function anular(id: string) {
    setError(null);
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: 'Anular esta designacion?', confirmar: 'Continuar', peligro: true })) return;
    const res = await apiFetch(`/organizacion/designaciones/${id}/baja`, { method: 'PATCH' });
    if (!res.ok) {
      setError('No se pudo anular la designacion');
      return;
    }
    await cargar();
  }



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Designaciones ({designaciones?.length ?? 0})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-primary" onClick={() => descargarArchivo('/organizacion/designaciones/exportar/excel', 'designaciones.xlsx')}>
            Exportar a Excel
          </button>
          <button type="button" className="btn-primary" onClick={() => descargarArchivo('/organizacion/designaciones/exportar/pdf', 'designaciones.pdf')}>
            Exportar a PDF
          </button>
          <button type="button" className="btn-primary" onClick={() => setMostrarForm((v) => !v)}>
            {mostrarForm ? 'Cancelar' : 'Nueva designacion'}
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
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cargo</label>
            <select className="input-field" value={cargoId} onChange={(e) => setCargoId(e.target.value)} required>
              <option value="">-- seleccionar --</option>
              {cargos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Compania (opcional)</label>
            <select className="input-field" value={companiaId} onChange={(e) => setCompaniaId(e.target.value)}>
              <option value="">-- ninguna --</option>
              {companias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cuartel (opcional)</label>
            <select className="input-field" value={cuartelId} onChange={(e) => setCuartelId(e.target.value)}>
              <option value="">-- ninguno --</option>
              {cuarteles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Desde</label>
            <input
              className="input-field"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo</label>
            <input className="input-field" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observaciones</label>
            <input className="input-field" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1', justifySelf: 'start' }}>
            Crear designacion
          </button>
        </form>
      )}

      {designaciones && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Bombero</th>
              <th style={{ padding: '6px 4px' }}>Cargo</th>
              <th style={{ padding: '6px 4px' }}>Compania / Cuartel</th>
              <th style={{ padding: '6px 4px' }}>Desde</th>
              <th style={{ padding: '6px 4px' }}>Hasta</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {designaciones.map((d) => (
              <tr key={d.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{d.bomberoNombre}</td>
                <td style={{ padding: '6px 4px' }}>{d.cargoNombre}</td>
                <td style={{ padding: '6px 4px', color: '#94a3b8' }}>
                  {d.companiaNombre ?? '—'} {d.cuartelNombre ? `/ ${d.cuartelNombre}` : ''}
                </td>
                <td style={{ padding: '6px 4px' }}>{d.fechaDesde}</td>
                <td style={{ padding: '6px 4px' }}>{d.fechaHasta ?? '—'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge">{d.estado}</span>
                </td>
                <td style={{ padding: '6px 4px', display: 'flex', gap: 8 }}>
                  {d.estado === 'ACTIVA' && (
                    <button type="button"
                      onClick={() => finalizar(d.id)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}
                    >
                      finalizar
                    </button>
                  )}
                  {!d.eliminadoEn && (
                    <button type="button"
                      onClick={() => anular(d.id)}
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
