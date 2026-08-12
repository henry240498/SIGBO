'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { EsquemaHorarioGuardia, SorteoGuardia, cargarEsquemasHorario, cargarSorteos, generarSorteo } from '@/lib/guardias';

export default function SorteosPage() {
  const router = useRouter();
  const [sorteos, setSorteos] = useState<SorteoGuardia[] | null>(null);
  const [esquemas, setEsquemas] = useState<EsquemaHorarioGuardia[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [generando, setGenerando] = useState(false);

  const [fecha, setFecha] = useState('');
  const [motivo, setMotivo] = useState('');
  const [cantidadASeleccionar, setCantidadASeleccionar] = useState('1');
  const [esquemaHorarioId, setEsquemaHorarioId] = useState('');

  const puedeGenerar = !!obtenerSesion()?.usuario.permisos.includes('guardias:sorteos');
  const opcionesEsquema = esquemas.filter((e) => e.esEspecial).map((e) => ({ value: e.id, label: e.nombre }));

  async function cargar() {
    try {
      setSorteos(await cargarSorteos());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    cargarEsquemasHorario(true).then(setEsquemas).catch(() => undefined);
  }, []);

  async function generar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGenerando(true);
    try {
      const cantidad = parseInt(cantidadASeleccionar, 10);
      const resultado = await generarSorteo({ fecha, motivo, cantidadASeleccionar: cantidad, esquemaHorarioId: esquemaHorarioId || undefined });
      router.push(`/dashboard/guardias/sorteos/${resultado.sorteo.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Sorteos de guardia ({sorteos?.length ?? 0})</h2>
        {puedeGenerar && (
          <button className="btn-primary" onClick={() => setMostrarForm((v) => !v)}>
            {mostrarForm ? 'Cancelar' : 'Nuevo sorteo'}
          </button>
        )}
      </div>
      <p style={{ fontSize: 13, color: '#94a3b8' }}>
        Para fechas especiales con sorteo (8 de diciembre, Nochebuena, Navidad, vispera de Ano Nuevo, Ano Nuevo).
        Candidato = bombero ACTIVO con &quot;Realiza guardias especiales&quot; marcado en su ficha. Se registran
        todos los elegibles, seleccionados y no seleccionados, con fecha/hora y usuario ejecutor.
      </p>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {mostrarForm && (
        <form className="card" onSubmit={generar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label>
              <input className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo</label>
              <input className="input-field" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Nochebuena 2026" required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cantidad a seleccionar</label>
              <input className="input-field" type="number" min={1} value={cantidadASeleccionar} onChange={(e) => setCantidadASeleccionar(e.target.value)} required />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Esquema de horario especial (opcional, para crear la guardia despues)</label>
            <ComboBuscable opciones={opcionesEsquema} value={esquemaHorarioId} onChange={setEsquemaHorarioId} placeholderBusqueda="Buscar esquema..." ningunaLabel="Decidir mas adelante" />
          </div>
          <button className="btn-primary" disabled={generando} style={{ alignSelf: 'flex-start' }}>
            {generando ? 'Sorteando...' : 'Generar sorteo'}
          </button>
        </form>
      )}

      {sorteos && sorteos.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin sorteos registrados.</p>}
      {sorteos && sorteos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Fecha</th>
              <th style={{ padding: '6px 4px' }}>Motivo</th>
              <th style={{ padding: '6px 4px' }}>Seleccionados</th>
              <th style={{ padding: '6px 4px' }}>Guardia</th>
              <th style={{ padding: '6px 4px' }}>Ejecutado</th>
            </tr>
          </thead>
          <tbody>
            {sorteos.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>
                  <Link href={`/dashboard/guardias/sorteos/${s.id}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>
                    {s.fecha}
                  </Link>
                </td>
                <td style={{ padding: '6px 4px' }}>{s.motivo}</td>
                <td style={{ padding: '6px 4px' }}>{s.cantidadASeleccionar}</td>
                <td style={{ padding: '6px 4px' }}>
                  {s.guardiaId ? <span className="badge" style={{ background: '#166534' }}>Creada</span> : <span className="badge">Sin crear</span>}
                </td>
                <td style={{ padding: '6px 4px' }}>{new Date(s.ejecutadoEn).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
