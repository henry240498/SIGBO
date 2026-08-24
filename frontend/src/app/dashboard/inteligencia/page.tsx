'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { obtenerSesion } from '@/lib/api';
import { MensajeIa, PerfilIa, cargarConversacion, cargarMisConversaciones, cargarPerfilIa, enviarMensajeIa } from '@/lib/ia';
import { AvatarIa } from '@/components/AvatarIa';

interface MensajeLocal {
  id: string;
  rol: 'USUARIO' | 'IA';
  contenido: string;
  fuentes?: Array<{ documentoId: string; titulo: string; numeroDocumental: string | null; enlace: string }>;
  esError?: boolean;
}

function formatearFechaHora(iso: string) {
  return new Date(iso).toLocaleString('es-PY', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function ChatInteligenciaPage() {
  const [perfil, setPerfil] = useState<PerfilIa | null>(null);
  const [conversacionId, setConversacionId] = useState<string | null>(null);
  const [historial, setHistorial] = useState<Array<{ id: string; titulo: string | null; ultimaActividadEn: string }>>([]);
  const [mensajes, setMensajes] = useState<MensajeLocal[]>([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);

  const usuario = obtenerSesion()?.usuario;

  useEffect(() => {
    cargarPerfilIa().then(setPerfil).catch((err) => setError(err.message));
    cargarMisConversaciones()
      .then((lista) => setHistorial(lista.map((c) => ({ id: c.id, titulo: c.titulo, ultimaActividadEn: c.ultimaActividadEn }))))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  async function abrirConversacion(id: string) {
    setError(null);
    try {
      const { mensajes: mensajesGuardados } = await cargarConversacion(id);
      setConversacionId(id);
      setMensajes(
        mensajesGuardados
          .filter((m): m is MensajeIa & { rol: 'USUARIO' | 'IA' } => m.rol === 'USUARIO' || m.rol === 'IA')
          .map((m) => ({ id: m.id, rol: m.rol, contenido: m.contenido, fuentes: m.fuentesJson ? JSON.parse(m.fuentesJson) : undefined, esError: m.resultado === 'ERROR' || m.resultado === 'BLOQUEADO' })),
      );
    } catch (err: any) {
      setError(err.message);
    }
  }

  function nuevaConversacion() {
    setConversacionId(null);
    setMensajes([]);
    setError(null);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const contenido = texto.trim();
    if (!contenido || enviando) return;
    setError(null);
    setEnviando(true);
    setTexto('');
    setMensajes((prev) => [...prev, { id: `local-${Date.now()}`, rol: 'USUARIO', contenido }]);

    try {
      const respuesta = await enviarMensajeIa(contenido, conversacionId ?? undefined);
      setConversacionId(respuesta.conversacionId);
      setMensajes((prev) => [...prev, { id: respuesta.mensajeId ?? `resp-${Date.now()}`, rol: 'IA', contenido: respuesta.respuesta, fuentes: respuesta.fuentes, esError: respuesta.error }]);
      if (!historial.some((c) => c.id === respuesta.conversacionId)) {
        cargarMisConversaciones()
          .then((lista) => setHistorial(lista.map((c) => ({ id: c.id, titulo: c.titulo, ultimaActividadEn: c.ultimaActividadEn }))))
          .catch(() => undefined);
      }
    } catch (err: any) {
      setError(err.message);
      setMensajes((prev) => [...prev, { id: `err-${Date.now()}`, rol: 'IA', contenido: err.message, esError: true }]);
    } finally {
      setEnviando(false);
    }
  }

  const enMantenimiento = perfil?.estado === 'MANTENIMIENTO';
  const inactivo = perfil?.estado === 'INACTIVA';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, height: 'calc(100vh - 160px)', minHeight: 480 }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
        <button type="button" className="btn-primary" onClick={nuevaConversacion}>+ Nueva conversación</button>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Historial</div>
        {historial.length === 0 && <p style={{ fontSize: 12, color: '#64748b' }}>Sin conversaciones todavía.</p>}
        {historial.map((c) => (
          <button type="button"
            key={c.id}
            onClick={() => abrirConversacion(c.id)}
            style={{
              textAlign: 'left',
              background: conversacionId === c.id ? '#1e293b' : 'transparent',
              border: '1px solid #334155',
              borderRadius: 8,
              padding: '8px 10px',
              color: '#e2e8f0',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {c.titulo ?? 'Conversación'}
            <div style={{ color: '#64748b', fontSize: 10, marginTop: 2 }}>{formatearFechaHora(c.ultimaActividadEn)}</div>
          </button>
        ))}
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AvatarIa avatarUrl={perfil?.avatarUrl} avatarEmoji={perfil?.avatarEmoji} avatarColorFondo={perfil?.avatarColorFondo} nombre={perfil?.nombre ?? 'Asistente'} size={40} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{perfil?.nombre ?? 'Asistente'}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{perfil?.descripcion ?? 'Asistente institucional'}</div>
          </div>
          {inactivo && <span className="badge" style={{ background: '#7f1d1d', marginLeft: 'auto' }}>Desactivado</span>}
          {enMantenimiento && <span className="badge" style={{ background: '#451a03', marginLeft: 'auto' }}>Mantenimiento</span>}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mensajes.length === 0 && (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>
              {perfil?.saludo ?? `Hola${usuario ? ` ${usuario.username}` : ''}, ¿en qué puedo ayudarte?`}
            </div>
          )}
          {mensajes.map((m) => (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.rol === 'USUARIO' ? 'flex-end' : 'flex-start' }}>
              <div
                style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: 12,
                  fontSize: 13,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  background: m.rol === 'USUARIO' ? '#2563eb' : m.esError ? '#451a03' : '#1e293b',
                  color: '#e2e8f0',
                  border: m.rol === 'IA' ? '1px solid #334155' : 'none',
                }}
              >
                {m.contenido}
              </div>
              {m.fuentes && m.fuentes.length > 0 && (
                <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {m.fuentes.map((f) => (
                    <Link key={f.documentoId} href={f.enlace} style={{ fontSize: 11, color: '#60a5fa', textDecoration: 'none' }}>
                      📄 Fuente: {f.numeroDocumental ? `${f.numeroDocumental} — ` : ''}{f.titulo}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          {enviando && <div style={{ color: '#64748b', fontSize: 12 }}>{perfil?.nombre ?? 'El asistente'} está escribiendo...</div>}
          <div ref={finRef} />
        </div>

        {error && <p style={{ color: '#f87171', fontSize: 12, padding: '0 18px' }}>{error}</p>}

        <form onSubmit={enviar} style={{ display: 'flex', gap: 8, padding: 14, borderTop: '1px solid #334155' }}>
          <input
            className="input-field"
            placeholder={inactivo ? 'El asistente está desactivado' : 'Escribí tu consulta...'}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            disabled={enviando || inactivo}
            maxLength={4000}
          />
          <button type="button" className="btn-primary" disabled={enviando || inactivo || !texto.trim()}>
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
