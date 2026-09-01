'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Parametro } from '@/lib/parametros';
import { Documento, cargarDocumentos, cargarTiposDocumento } from '@/lib/documentos';
import { Aviso } from '@/app/components/Aviso';

export default function VencimientosDocumentosPage() {
  const [vista, setVista] = useState<'PROXIMOS' | 'VENCIDOS'>('PROXIMOS');
  const [documentos, setDocumentos] = useState<Documento[] | null>(null);
  const [tipos, setTipos] = useState<Parametro[]>([]);
  const [error, setError] = useState<string | null>(null);

  const tipoPorId = useMemo(() => new Map(tipos.map((t) => [t.id, t.nombre])), [tipos]);

  useEffect(() => {
    cargarTiposDocumento().then(setTipos).catch(() => undefined);
  }, []);

  useEffect(() => {
    cargarDocumentos({ vencimiento: vista })
      .then(setDocumentos)
      .catch((err) => setError(err.message));
  }, [vista]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Vencimientos ({documentos?.length ?? 0})</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="btn-primary" style={{ background: vista === 'PROXIMOS' ? undefined : '#334155' }} onClick={() => setVista('PROXIMOS')}>Proximos a vencer</button>
          <button type="button" className="btn-primary" style={{ background: vista === 'VENCIDOS' ? '#7f1d1d' : '#334155' }} onClick={() => setVista('VENCIDOS')}>Vencidos</button>
        </div>
      </div>

      {error && <Aviso tipo="error" texto={error} />}

      {documentos && documentos.length === 0 && (
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>{vista === 'PROXIMOS' ? 'Sin documentos proximos a vencer en los proximos 30 dias.' : 'Sin documentos vencidos.'}</p>
      )}
      {documentos && documentos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Numero</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Titulo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Tipo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Vencimiento</th>
            </tr>
          </thead>
          <tbody>
            {documentos.map((d) => (
              <tr key={d.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>
                  <Link href={`/dashboard/documentos/${d.id}`} style={{ color: 'var(--signal)', textDecoration: 'none' }}>{d.numeroDocumental ?? '(sin numero)'}</Link>
                </td>
                <td style={{ padding: '6px 4px' }}>{d.titulo}</td>
                <td style={{ padding: '6px 4px' }}>{tipoPorId.get(d.tipoDocumentoId) ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: vista === 'VENCIDOS' ? 'var(--bad-fill)' : 'var(--warn-fill)' }}>{d.fechaVencimiento}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
