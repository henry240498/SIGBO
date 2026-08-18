'use client';

import { useEffect, useState } from 'react';
import { Documento, EXTENSIONES_PREVISUALIZABLES, descargarArchivoDocumento, obtenerBlobPrevisualizacion } from '@/lib/documentos';

/** Visor integrado (seccion 1 del pedido): PDF e imagenes se muestran
 * embebidos sin forzar la descarga primero. Word/Excel/otros formatos no
 * tienen motor de conversion disponible en este entorno -- se informa con
 * claridad en vez de simular un visor que no va a funcionar, y se ofrece
 * descargar desde el mismo modal.
 *
 * El boton de cerrar se pinta FUERA de la tarjeta y de cualquier
 * contenedor con overflow/scroll (el visor nativo de PDF del navegador,
 * dentro del <iframe>, ocupa toda su caja con su propia barra de
 * herramientas y puede tapar visualmente controles que esten pegados al
 * borde del contenido) -- ademas de Escape y click en el fondo, para que
 * cerrar nunca dependa de un solo punto de la pantalla. */
export function VisorDocumento({ documento, onCerrar }: { documento: Documento; onCerrar: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [tipo, setTipo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const extension = (documento.archivoExtension ?? '').toLowerCase();
  const previsualizable = EXTENSIONES_PREVISUALIZABLES.includes(extension);

  useEffect(() => {
    if (!previsualizable) {
      setCargando(false);
      return;
    }
    let urlCreada: string | null = null;
    obtenerBlobPrevisualizacion(documento.id)
      .then(({ blob, tipo: contentType }) => {
        urlCreada = URL.createObjectURL(blob);
        setUrl(urlCreada);
        setTipo(contentType);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
    return () => {
      if (urlCreada) URL.revokeObjectURL(urlCreada);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documento.id]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCerrar();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCerrar]);

  async function descargar() {
    try {
      await descargarArchivoDocumento(documento.id, documento.archivoNombreOriginal ?? `${documento.titulo}.${extension || 'pdf'}`);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <button
        type="button"
        onClick={onCerrar}
        title="Cerrar (Esc)"
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 210,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: 'none',
          background: '#7f1d1d',
          color: '#fff',
          fontSize: 20,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
        }}
      >
        ✕
      </button>

      <div className="card" style={{ width: '90vw', maxWidth: 1000, height: '88vh', display: 'flex', flexDirection: 'column', gap: 10 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 15 }}>{documento.numeroDocumental ? `${documento.numeroDocumental} — ` : ''}{documento.titulo}</h3>
            <p style={{ fontSize: 11, color: '#94a3b8' }}>{documento.archivoNombreOriginal}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {documento.archivoUrl && (
              <button className="btn-primary" style={{ background: '#334155', padding: '6px 12px' }} onClick={descargar}>Descargar</button>
            )}
            <button className="btn-primary" style={{ background: '#475569', padding: '6px 12px' }} onClick={onCerrar}>Cerrar</button>
          </div>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}

        <div style={{ flex: 1, minHeight: 0, background: '#0f172a', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {cargando && <p style={{ color: '#94a3b8', fontSize: 13 }}>Cargando vista previa...</p>}
          {!cargando && !previsualizable && (
            <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', maxWidth: 400 }}>
              Este tipo de archivo ({extension || 'desconocido'}) no admite vista previa integrada en este momento.
              Descargalo para verlo con el programa correspondiente.
            </p>
          )}
          {!cargando && previsualizable && url && tipo?.startsWith('image/') && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={documento.titulo} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          )}
          {!cargando && previsualizable && url && tipo === 'application/pdf' && (
            <iframe src={url} title={documento.titulo} style={{ width: '100%', height: '100%', border: 'none' }} />
          )}
        </div>
      </div>
    </div>
  );
}
