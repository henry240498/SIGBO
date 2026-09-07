'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { obtenerSesion } from '@/lib/api';
import { MensajeIa, PerfilIa, cargarConversacion, cargarMisConversaciones, cargarPerfilIa, enviarMensajeIa, hablarVoz, transcribirVoz } from '@/lib/ia';
import { AvatarIa } from '@/components/AvatarIa';

interface MensajeLocal {
  id: string;
  rol: 'USUARIO' | 'IA';
  contenido: string;
  fuentes?: Array<{ documentoId: string; titulo: string; numeroDocumental: string | null; enlace: string }>;
  esError?: boolean;
}

/** Estados visuales de Snoopy (seccion 5/8 del pedido de voz): NORMAL en
 * reposo, ESCUCHANDO mientras graba, PENSANDO mientras espera la
 * respuesta (de un mensaje hablado o escrito, da lo mismo), HABLANDO
 * mientras reproduce audio, ERROR ante una falla puntual de voz -- nunca
 * bloquea el chat, solo se muestra unos segundos y vuelve a NORMAL. */
type EstadoSnoopy = 'NORMAL' | 'ESCUCHANDO' | 'PENSANDO' | 'HABLANDO' | 'ERROR';

const ICONO_ESTADO: Record<EstadoSnoopy, string> = {
  NORMAL: '🐶',
  ESCUCHANDO: '🎙️',
  PENSANDO: '🧠',
  HABLANDO: '🔊',
  ERROR: '⚠️',
};

const ETIQUETA_ESTADO: Record<EstadoSnoopy, string> = {
  NORMAL: '',
  ESCUCHANDO: 'Escuchando...',
  PENSANDO: 'Pensando...',
  HABLANDO: 'Hablando...',
  ERROR: '',
};

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

  // Voz (Etapa 2): grabando es el estado "en vivo" del microfono;
  // reproduciendo el de la reproduccion de audio de una respuesta. errorVoz
  // es puntual (seccion 13, "una falla de voz nunca inutiliza a Snoopy") --
  // se muestra un momento y se limpia solo, el chat de texto sigue andando.
  const [grabando, setGrabando] = useState(false);
  const [transcribiendo, setTranscribiendo] = useState(false);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [errorVoz, setErrorVoz] = useState<string | null>(null);
  const grabadorRef = useRef<MediaRecorder | null>(null);
  const trozosRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const finRef = useRef<HTMLDivElement>(null);

  const usuario = obtenerSesion()?.usuario;

  const estado: EstadoSnoopy = errorVoz ? 'ERROR' : grabando ? 'ESCUCHANDO' : transcribiendo || enviando ? 'PENSANDO' : reproduciendo ? 'HABLANDO' : 'NORMAL';

  useEffect(() => {
    cargarPerfilIa().then(setPerfil).catch((err) => setError(err.message));
    cargarMisConversaciones()
      .then((lista) => setHistorial(lista.map((c) => ({ id: c.id, titulo: c.titulo, ultimaActividadEn: c.ultimaActividadEn }))))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  useEffect(() => {
    if (!errorVoz) return;
    const temporizador = setTimeout(() => setErrorVoz(null), 4000);
    return () => clearTimeout(temporizador);
  }, [errorVoz]);

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

  /** Envia un mensaje YA resuelto a texto -- lo use el usuario tecleando o
   * lo haya transcripto whisper.cpp, es EXACTAMENTE el mismo camino
   * (`enviarMensajeIa` -> `POST /ia/chat`, sin ninguna rama especial para
   * voz -- seccion 2/10 del pedido: "ambos modos deben utilizar
   * exactamente el mismo nucleo... no crear una via alternativa que
   * saltee autenticacion/autorizacion"). `origenVoz` solo decide si,
   * al llegar la respuesta, se la reproduce en voz alta o no. */
  async function enviarTexto(contenido: string, origenVoz: boolean) {
    if (!contenido || enviando) return;
    setError(null);
    setEnviando(true);
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
      // Solo se habla en voz alta si la respuesta vino de una pregunta
      // hablada -- si el usuario tecleo, Snoopy contesta en texto (mismo
      // criterio del diagrama de arquitectura del pedido: el modo escrito
      // no incluye TTS de salida a menos que el usuario lo pida a mano
      // con el altavoz de cada mensaje).
      if (origenVoz && respuesta.mensajeId && perfil?.vozHabilitada && perfil?.respuestaVozHabilitada) {
        reproducirMensaje(respuesta.mensajeId);
      }
    } catch (err: any) {
      setError(err.message);
      setMensajes((prev) => [...prev, { id: `err-${Date.now()}`, rol: 'IA', contenido: err.message, esError: true }]);
    } finally {
      setEnviando(false);
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const contenido = texto.trim();
    setTexto('');
    await enviarTexto(contenido, false);
  }

  /** Microfono (seccion 3/6 del pedido de voz): un click arranca a grabar,
   * el siguiente para y transcribe. Sin soporte de MediaRecorder o sin
   * permiso de microfono -> mensaje claro y se sigue por texto (seccion
   * 13, fallback obligatorio: "nunca hacer que una falla de voz
   * inutilice Snoopy"). */
  async function alternarGrabacion() {
    if (grabando) {
      grabadorRef.current?.stop();
      return;
    }
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setErrorVoz('Este navegador no soporta grabación de audio. Podés seguir escribiendo.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const grabador = new MediaRecorder(stream);
      trozosRef.current = [];
      grabador.ondataavailable = (evento) => {
        if (evento.data.size > 0) trozosRef.current.push(evento.data);
      };
      grabador.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setGrabando(false);
        const blob = new Blob(trozosRef.current, { type: grabador.mimeType || 'audio/webm' });
        if (blob.size === 0) return;
        setTranscribiendo(true);
        try {
          const { texto: transcripto } = await transcribirVoz(blob);
          setTranscribiendo(false);
          await enviarTexto(transcripto, true);
        } catch (err: any) {
          setTranscribiendo(false);
          setErrorVoz(err.message || 'No se pudo transcribir el audio. Podés seguir escribiendo.');
        }
      };
      grabadorRef.current = grabador;
      grabador.start();
      setGrabando(true);
    } catch {
      setErrorVoz('No se pudo acceder al micrófono. Revisá los permisos del navegador o seguí escribiendo.');
    }
  }

  /** Reproduce en voz alta un mensaje de Snoopy YA guardado -- ni bien
   * llega una respuesta de una pregunta hablada, o a mano con el
   * altavoz de cualquier mensaje de la conversación. */
  async function reproducirMensaje(mensajeId: string) {
    try {
      const blob = await hablarVoz(mensajeId);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = perfil?.vozVolumen ?? 1;
      audio.playbackRate = perfil?.vozVelocidad ?? 1;
      audioRef.current = audio;
      setReproduciendo(true);
      audio.onended = () => {
        setReproduciendo(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setReproduciendo(false);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (err: any) {
      setReproduciendo(false);
      setErrorVoz(err.message || 'No se pudo reproducir el audio. Podés leer la respuesta en texto.');
    }
  }

  /** Interrupcion (seccion 6 del pedido de voz): corta la reproduccion en
   * el momento, sin esperar a que termine el audio. */
  function detenerReproduccion() {
    audioRef.current?.pause();
    setReproduciendo(false);
  }

  const enMantenimiento = perfil?.estado === 'MANTENIMIENTO';
  const inactivo = perfil?.estado === 'INACTIVA';
  const puedeHablar = !!perfil?.vozHabilitada && !!perfil?.entradaVozHabilitada;
  const puedeEscuchar = !!perfil?.vozHabilitada && !!perfil?.respuestaVozHabilitada;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16, height: 'calc(100vh - 160px)', minHeight: 480 }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
        <button className="btn-primary" onClick={nuevaConversacion}>+ Nueva conversación</button>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Historial</div>
        {historial.length === 0 && <p style={{ fontSize: 12, color: '#64748b' }}>Sin conversaciones todavía.</p>}
        {historial.map((c) => (
          <button
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
          <div style={{ position: 'relative' }}>
            <AvatarIa avatarUrl={perfil?.avatarUrl} avatarEmoji={perfil?.avatarEmoji} avatarColorFondo={perfil?.avatarColorFondo} nombre={perfil?.nombre ?? 'Asistente'} size={40} />
            {estado !== 'NORMAL' && (
              <span
                title={ETIQUETA_ESTADO[estado]}
                style={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  fontSize: 14,
                  background: estado === 'ERROR' ? '#7f1d1d' : '#0f172a',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #334155',
                }}
              >
                {ICONO_ESTADO[estado]}
              </span>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{perfil?.nombre ?? 'Asistente'}</div>
            <div style={{ fontSize: 11, color: estado === 'ERROR' ? '#f87171' : '#94a3b8' }}>
              {estado === 'ERROR' ? errorVoz : estado !== 'NORMAL' ? ETIQUETA_ESTADO[estado] : (perfil?.descripcion ?? 'Asistente institucional')}
            </div>
          </div>
          {inactivo && <span className="badge" style={{ background: '#7f1d1d', marginLeft: 'auto' }}>Desactivado</span>}
          {enMantenimiento && <span className="badge" style={{ background: '#451a03', marginLeft: 'auto' }}>Mantenimiento</span>}
          {reproduciendo && !inactivo && !enMantenimiento && (
            <button type="button" className="btn-primary" style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: 11 }} onClick={detenerReproduccion}>
              ⏹ Detener
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mensajes.length === 0 && (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>
              {perfil?.saludo ?? `Hola${usuario ? ` ${usuario.username}` : ''}, ¿en qué puedo ayudarte?`}
            </div>
          )}
          {mensajes.map((m) => (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.rol === 'USUARIO' ? 'flex-end' : 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, maxWidth: '75%' }}>
                <div
                  style={{
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
                {m.rol === 'IA' && !m.esError && puedeEscuchar && !m.id.startsWith('resp-') && (
                  <button
                    type="button"
                    title="Escuchar"
                    onClick={() => reproducirMensaje(m.id)}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 14, padding: 2, flexShrink: 0 }}
                  >
                    🔊
                  </button>
                )}
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
          {(enviando || transcribiendo) && <div style={{ color: '#64748b', fontSize: 12 }}>{perfil?.nombre ?? 'El asistente'} está {transcribiendo ? 'procesando lo que dijiste' : 'pensando'}...</div>}
          <div ref={finRef} />
        </div>

        {error && <p style={{ color: '#f87171', fontSize: 12, padding: '0 18px' }}>{error}</p>}

        <form onSubmit={enviar} style={{ display: 'flex', gap: 8, padding: 14, borderTop: '1px solid #334155' }}>
          {puedeHablar && (
            <button
              type="button"
              title={grabando ? 'Detener grabación' : 'Hablarle a Snoopy'}
              onClick={alternarGrabacion}
              disabled={enviando || inactivo || transcribiendo}
              style={{
                background: grabando ? '#7f1d1d' : '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
                color: '#e2e8f0',
                width: 40,
                fontSize: 16,
                cursor: enviando || inactivo ? 'not-allowed' : 'pointer',
                flexShrink: 0,
              }}
            >
              🎙️
            </button>
          )}
          <input
            className="input-field"
            placeholder={inactivo ? 'El asistente está desactivado' : grabando ? 'Escuchando...' : 'Escribí tu consulta...'}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            disabled={enviando || inactivo || grabando}
            maxLength={4000}
          />
          <button className="btn-primary" disabled={enviando || inactivo || grabando || !texto.trim()}>
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
