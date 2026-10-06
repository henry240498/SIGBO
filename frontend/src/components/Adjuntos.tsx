'use client';

import { useEffect, useState } from 'react';
import { AdjuntoMeta, cargarAdjuntos, urlDeAdjunto } from '@/lib/ausencias';

/** Fotos y firmas tomadas desde el celular para un registro (movil, hidrante, punto de riesgo, despacho). */
export function Adjuntos({ entidad, entidadId, titulo }: { entidad: string; entidadId: string; titulo: string }) {
  const [lista, setLista] = useState<AdjuntoMeta[] | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    let vivo = true;
    const creadas: string[] = [];
    setLista(null);
    setUrls({});
    setError('');
    cargarAdjuntos(entidad, entidadId)
      .then(async (l) => {
        if (!vivo) return;
        setLista(l);
        for (const a of l.slice(0, 12)) {
          try {
            const u = await urlDeAdjunto(a.id);
            creadas.push(u);
            if (vivo) setUrls((prev) => ({ ...prev, [a.id]: u }));
          } catch {
            /* una imagen que no carga no impide ver las demas */
          }
        }
      })
      .catch((e: Error) => vivo && setError(e.message));
    return () => {
      vivo = false;
      creadas.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [entidad, entidadId]);

  return (
    <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }} aria-label={titulo}>
      <strong style={{ fontSize: 14 }}>{titulo}</strong>
      {error && <p style={{ fontSize: 13, color: 'var(--danger)', margin: 0 }}>{error}</p>}
      {lista !== null && lista.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Todavía no hay fotos ni firmas.</p>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {(lista ?? []).slice(0, 12).map((a) => (
          <figure key={a.id} style={{ margin: 0, width: 150 }}>
            {urls[a.id] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={urls[a.id]} alt={`${a.tipo === 'FIRMA' ? 'Firma' : 'Foto'}: ${a.descripcion ?? ''}`} style={{ width: 150, height: 110, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--line)' }} />
            ) : (
              <div style={{ width: 150, height: 110, background: 'var(--neutral-fill)', borderRadius: 6 }} aria-hidden="true" />
            )}
            <figcaption style={{ fontSize: 12, color: 'var(--muted)' }}>
              {a.tipo === 'FIRMA' ? 'Firma' : 'Foto'} · {new Date(a.tomadoEn).toLocaleString('es-PY')}
              {a.descripcion ? ` · ${a.descripcion}` : ''}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
