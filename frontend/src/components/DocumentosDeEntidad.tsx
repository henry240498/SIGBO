'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Documento, cargarDocumentosDeEntidad } from '@/lib/documentos';

/**
 * Lista los documentos relacionados con un registro de CUALQUIER modulo
 * (Personal, Vehiculos, Equipos, Servicios, Academia, ...) via el sistema
 * transversal de Documentos (documentos.relaciones). Reutilizable en toda
 * SIGBO -- ver seccion "regla fundamental de transversalidad" del pedido
 * de Documentos: no crear listas de documentos aisladas por modulo.
 */
export function DocumentosDeEntidad({ modulo, entidad, registroId, titulo = 'Documentos' }: { modulo: string; entidad: string; registroId: string; titulo?: string }) {
  const [documentos, setDocumentos] = useState<Documento[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDocumentosDeEntidad(modulo, entidad, registroId)
      .then(setDocumentos)
      .catch((err) => setError(err.message));
  }, [modulo, entidad, registroId]);

  return (
    <div className="card">
      <h2 style={{ fontSize: 14, marginBottom: 10 }}>
        {titulo} — <Link href="/dashboard/documentos/listado" style={{ color: '#60a5fa', fontSize: 12 }}>ver todos ↗</Link>
      </h2>
      {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
      {documentos && documentos.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin documentos relacionados con este registro.</p>}
      {documentos && documentos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Numero</th>
              <th style={{ padding: '6px 4px' }}>Titulo</th>
              <th style={{ padding: '6px 4px' }}>Emision</th>
            </tr>
          </thead>
          <tbody>
            {documentos.map((d) => (
              <tr key={d.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>
                  <Link href={`/dashboard/documentos/${d.id}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>{d.numeroDocumental ?? '(sin numero)'}</Link>
                </td>
                <td style={{ padding: '6px 4px' }}>{d.titulo}</td>
                <td style={{ padding: '6px 4px' }}>{d.fechaEmision}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
