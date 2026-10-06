'use client';

import { FormEvent, useId, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';

type Tipo = 'ERROR' | 'SUGERENCIA' | 'OTRO';

const TIPOS: Array<{ valor: Tipo; texto: string }> = [
  { valor: 'ERROR', texto: 'Algo no funciona (error)' },
  { valor: 'SUGERENCIA', texto: 'Una idea o mejora (sugerencia)' },
  { valor: 'OTRO', texto: 'Otro comentario' },
];

const MAX_MENSAJE = 4000;

/** Buzón simple: lo que se escribe acá queda como archivo de texto en el servidor. */
export default function ReportarPage() {
  const id = useId();
  const [tipo, setTipo] = useState<Tipo>('ERROR');
  const [titulo, setTitulo] = useState('');
  const [pantalla, setPantalla] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setExito(null);
    if (mensaje.trim().length < 5) {
      setError('Contanos un poco más: el mensaje necesita al menos 5 caracteres.');
      return;
    }
    setEnviando(true);
    try {
      const res = await apiFetch('/reportes', {
        method: 'POST',
        body: JSON.stringify({
          tipo,
          origen: 'WEB',
          titulo: titulo.trim() || undefined,
          pantalla: pantalla.trim() || undefined,
          mensaje: mensaje.trim(),
          version: 'web',
          dispositivo: typeof navigator === 'undefined' ? undefined : navigator.userAgent.slice(0, 160),
          id: crypto.randomUUID(),
        }),
      });
      if (!res.ok) {
        const cuerpo = await res.json().catch(() => ({}));
        const detalle = Array.isArray(cuerpo.message) ? cuerpo.message.join(' ') : cuerpo.message;
        setError(detalle || 'No se pudo enviar el reporte. Intentá de nuevo.');
        return;
      }
      setExito('¡Gracias! Tu reporte quedó guardado en el servidor.');
      setTitulo('');
      setPantalla('');
      setMensaje('');
    } catch {
      setError('No hay conexión con el servidor. Intentá de nuevo en un momento.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Reportar un problema o una sugerencia</h1>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16 }}>
        Sirve para avisar de un error o proponer una mejora del sistema o de la app del celular. Se guarda como
        texto en el servidor y lo revisa el equipo.
      </p>

      <form className="card" onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
        <div>
          <label htmlFor={`${id}-tipo`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>¿Qué querés contarnos?</label>
          <select id={`${id}-tipo`} className="input-field" value={tipo} onChange={(e) => setTipo(e.target.value as Tipo)}>
            {TIPOS.map((t) => (
              <option key={t.valor} value={t.valor}>{t.texto}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${id}-titulo`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Título (opcional)</label>
          <input id={`${id}-titulo`} className="input-field" maxLength={120} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </div>

        <div>
          <label htmlFor={`${id}-pantalla`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>¿En qué pantalla pasó? (opcional)</label>
          <input id={`${id}-pantalla`} className="input-field" maxLength={120} value={pantalla} onChange={(e) => setPantalla(e.target.value)} />
        </div>

        <div>
          <label htmlFor={`${id}-mensaje`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Mensaje</label>
          <textarea
            id={`${id}-mensaje`}
            className="input-field"
            rows={7}
            maxLength={MAX_MENSAJE}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            required
          />
          <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'right' }}>{mensaje.length} / {MAX_MENSAJE}</div>
        </div>

        {error && <Aviso tipo="error" texto={error} />}
        {exito && <Aviso tipo="exito" texto={exito} />}

        <button type="submit" className="btn-primary" disabled={enviando} style={{ alignSelf: 'flex-start' }}>
          {enviando ? 'Enviando…' : 'Enviar reporte'}
        </button>
      </form>
    </div>
  );
}
