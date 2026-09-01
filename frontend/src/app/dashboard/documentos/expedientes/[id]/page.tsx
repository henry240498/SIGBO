'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Documento, Expediente, cargarDocumentosDeExpediente, cargarExpediente } from '@/lib/documentos';
import { Cargando } from '@/app/components/Cargando';

export default function ExpedienteDetallePage() {
  const params = useParams();
  const id = params.id as string;

  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [documentos, setDocumentos] = useState<Documento[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([cargarExpediente(id), cargarDocumentosDeExpediente(id)])
      .then(([e, docs]) => {
        setExpediente(e);
        setDocumentos(docs);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <p style={{ color: 'var(--danger)' }}>{error}</p>;
  if (!expediente) return <Cargando texto="Cargando expediente…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 16 }}>{expediente.numero} — {expediente.titulo}</h2>
          <span className="badge" style={{ background: expediente.estado === 'ABIERTO' ? 'var(--ok-fill)' : 'var(--neutral-fill)' }}>{expediente.estado}</span>
        </div>
        {expediente.descripcion && <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>{expediente.descripcion}</p>}
      </div>

      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 10 }}>Documentos del expediente ({documentos?.length ?? 0})</h3>
        {documentos && documentos.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)' }}>Este expediente todavia no tiene documentos.</p>}
        {documentos && documentos.map((d) => (
          <Link key={d.id} href={`/dashboard/documentos/${d.id}`} style={{ display: 'block', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--line-soft)', color: 'var(--ink)', textDecoration: 'none' }}>
            {d.numeroDocumental ? `${d.numeroDocumental} — ` : ''}{d.titulo} <span style={{ color: 'var(--muted)' }}>({d.fechaEmision})</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
