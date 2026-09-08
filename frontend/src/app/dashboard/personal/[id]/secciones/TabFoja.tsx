'use client';

import { useEffect, useState } from 'react';
import { apiFetch, descargarArchivo, obtenerSesion } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';

export function TabFoja({ bomberoId, puedeEditar }: { bomberoId: string; puedeEditar: boolean }) {
  const [anios, setAnios] = useState<number[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);

  const puedeGenerar = !!obtenerSesion()?.usuario.permisos.includes('personal:generar_foja');

  async function cargar() {
    const res = await apiFetch(`/personal/bomberos/${bomberoId}/foja-servicio`);
    if (res.ok) setAnios(await res.json());
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomberoId]);

  async function generar() {
    setGenerando(true);
    setError(null);
    try {
      const res = await apiFetch(`/personal/bomberos/${bomberoId}/foja-servicio`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo generar la foja');
      }
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {puedeEditar && puedeGenerar && (
        <button type="button" className="btn-primary" style={{ alignSelf: 'flex-end' }} disabled={generando} onClick={generar}>
          {generando ? 'Generando...' : `Generar foja de servicio ${new Date().getFullYear()}`}
        </button>
      )}
      {error && <Aviso tipo="error" texto={error} />}

      <div className="card">
        {anios && anios.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Todavía no se genero ninguna foja de servicio.</p>}
        {anios && anios.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                <th scope="col" style={{ padding: '6px 4px' }}>Ano</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Descargas</th>
              </tr>
            </thead>
            <tbody>
              {anios.map((anio) => (
                <FilaFoja key={anio} bomberoId={bomberoId} anio={anio} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}



function FilaFoja({ bomberoId, anio }: { bomberoId: string; anio: number }) {
  const [foja, setFoja] = useState<{ archivoPdfUrl: string | null; archivoDocxUrl: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`/personal/bomberos/${bomberoId}/foja-servicio/${anio}`)
      .then(async (res) => (res.ok ? setFoja(await res.json()) : undefined))
      .catch(() => undefined);
  }, [bomberoId, anio]);

  async function descargar(formato: 'pdf' | 'docx') {
    try {
      setError(null);
      await descargarArchivo(`/api/v1/personal/bomberos/${bomberoId}/foja-servicio/${anio}/archivos/${formato}`, `foja-servicio-${anio}.${formato}`);
    } catch (err: any) {
      setError(err.message ?? 'No se pudo descargar el archivo');
    }
  }

  return (
    <tr style={{ borderBottom: '1px solid var(--line-soft)' }}>
      <td style={{ padding: '6px 4px' }}>{anio}</td>
      <td style={{ padding: '6px 4px', display: 'flex', gap: 10 }}>
        {foja?.archivoPdfUrl && <button type="button" className="link-button" onClick={() => descargar('pdf')}>PDF</button>}
        {foja?.archivoDocxUrl && <button type="button" className="link-button" onClick={() => descargar('docx')}>Word</button>}
        {error && <span role="alert" style={{ color: 'var(--danger)' }}>{error}</span>}
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/* Linea de tiempo                                                       */
/* ------------------------------------------------------------------ */
