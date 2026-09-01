'use client';

import { useEffect, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { apiFetch } from '@/lib/api';
import { descargarArchivo } from '@/lib/exportar';
import { Aviso } from '@/app/components/Aviso';

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
  const confirmar = useConfirmacion();
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
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: 'Anular este ascenso? Si el bombero no tuvo ascensos posteriores, se revertira su rango.', confirmar: 'Continuar', peligro: true })) return;
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
          <button type="button" className="btn-primary" onClick={() => descargarArchivo('/organizacion/ascensos/exportar/excel', 'ascensos.xlsx')}>
            Exportar a Excel
          </button>
          <button type="button" className="btn-primary" onClick={() => descargarArchivo('/organizacion/ascensos/exportar/pdf', 'ascensos.pdf')}>
            Exportar a PDF
          </button>
          <button type="button" className="btn-primary" onClick={() => setMostrarForm((v) => !v)}>
            {mostrarForm ? 'Cancelar' : 'Registrar ascenso'}
          </button>
        </div>
      </div>

      {error && <Aviso tipo="error" texto={error} />}

      {mostrarForm && (
        <form className="card" onSubmit={crear} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label htmlFor="bombero" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Bombero</label>
            <select id="bombero" className="input-field" value={bomberoId} onChange={(e) => setBomberoId(e.target.value)} required>
              <option value="">-- seleccionar --</option>
              {bomberos.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.numeroBombero} - {b.nombre} {b.apellido}
                </option>
              ))}
            </select>
            {bomberoActual && (
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                Rango actual: {bomberoActual.rango ?? 'sin registrar'}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="nuevo-rango" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nuevo rango</label>
            <select id="nuevo-rango" className="input-field" value={rangoNuevoId} onChange={(e) => setRangoNuevoId(e.target.value)} required>
              <option value="">-- seleccionar --</option>
              {rangos.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fecha" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label>
            <input id="fecha" className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="resolucion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Resolucion</label>
            <input id="resolucion" className="input-field" value={resolucion} onChange={(e) => setResolucion(e.target.value)} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="motivo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo</label>
            <input id="motivo" className="input-field" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1', justifySelf: 'start' }}>
            Registrar ascenso
          </button>
        </form>
      )}

      {ascensos && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Bombero</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Rango anterior</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Rango nuevo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Fecha</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Resolucion</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ascensos.map((a) => (
              <tr key={a.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{a.bomberoNombre}</td>
                <td style={{ padding: '6px 4px', color: 'var(--muted)' }}>{a.rangoAnteriorNombre ?? '—'}</td>
                <td style={{ padding: '6px 4px' }}>{a.rangoNuevoNombre}</td>
                <td style={{ padding: '6px 4px' }}>{a.fecha}</td>
                <td style={{ padding: '6px 4px', color: 'var(--muted)' }}>{a.resolucion}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge">{a.estado}</span>
                </td>
                <td style={{ padding: '6px 4px' }}>
                  {a.estado === 'REGISTRADO' && (
                    <button type="button"
                      onClick={() => anular(a.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}
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
