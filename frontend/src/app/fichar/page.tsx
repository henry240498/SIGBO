'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { ResultadoEscaneo, escanearFichaje } from '@/lib/control-personal';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';

const CLAVE_TOKEN = 'sigbo_fichar_token';
const CLAVE_VOLVER = 'sigbo_volver';

type Estado =
  | { fase: 'cargando' }
  | { fase: 'sin-codigo' }
  | { fase: 'sin-sesion' }
  | { fase: 'listo'; resultado: ResultadoEscaneo }
  | { fase: 'error'; mensaje: string };

/**
 * Destino del QR de la puerta del cuartel. Se abre con la camara del celular:
 * si hay sesion iniciada registra la entrada o salida; si no, guarda el codigo,
 * lleva al inicio de sesion y vuelve aqui para completar el fichaje.
 */
export default function FicharPage() {
  const [estado, setEstado] = useState<Estado>({ fase: 'cargando' });

  useEffect(() => {
    let token = new URLSearchParams(window.location.search).get('t');
    try {
      if (token) sessionStorage.setItem(CLAVE_TOKEN, token);
      else token = sessionStorage.getItem(CLAVE_TOKEN);
    } catch {
      /* sin almacenamiento de sesion: se usa solo el de la direccion */
    }
    if (!token) {
      setEstado({ fase: 'sin-codigo' });
      return;
    }
    if (!obtenerSesion()) {
      try {
        sessionStorage.setItem(CLAVE_VOLVER, '/fichar');
      } catch {
        /* igual se muestra el enlace */
      }
      setEstado({ fase: 'sin-sesion' });
      return;
    }
    // El token se borra antes de usarlo: recargar la pagina no vuelve a fichar.
    try {
      sessionStorage.removeItem(CLAVE_TOKEN);
      sessionStorage.removeItem(CLAVE_VOLVER);
    } catch {
      /* nada */
    }
    window.history.replaceState(null, '', '/fichar');
    escanearFichaje(token)
      .then((resultado) => setEstado({ fase: 'listo', resultado }))
      .catch((err: Error) => setEstado({ fase: 'error', mensaje: err.message }));
  }, []);

  return (
    <main style={{ maxWidth: 420, margin: '0 auto', padding: '48px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 20 }}>Fichaje</h1>

      {estado.fase === 'cargando' && <Cargando texto="Registrando…" />}

      {estado.fase === 'sin-codigo' && (
        <Aviso tipo="error" texto="Falta el código. Escanee el QR de la puerta del cuartel con la cámara del celular." />
      )}

      {estado.fase === 'sin-sesion' && (
        <>
          <p style={{ fontSize: 14 }}>Para fichar tiene que iniciar sesión. Al terminar volverá aquí y se registrará su fichaje.</p>
          <Link className="btn-primary" href="/login" style={{ textAlign: 'center' }}>Iniciar sesión</Link>
        </>
      )}

      {estado.fase === 'listo' && (
        <div className="card" role="status" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <strong style={{ fontSize: 18 }}>
            {estado.resultado.duplicado ? 'Ya estaba registrado: ' : 'Registrado: '}
            {estado.resultado.tipo === 'ENTRADA' ? 'ENTRADA' : 'SALIDA'}
          </strong>
          <span style={{ fontSize: 14 }}>
            {estado.resultado.punto} · {new Date(estado.resultado.registradoEn).toLocaleString('es-PY')}
          </span>
          {estado.resultado.duplicado && (
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Escaneó dos veces seguidas: se cuenta una sola.</span>
          )}
        </div>
      )}

      {estado.fase === 'error' && <Aviso tipo="error" texto={estado.mensaje} />}

      {(estado.fase === 'listo' || estado.fase === 'error') && (
        <Link href="/dashboard" style={{ fontSize: 14 }}>Ir al inicio</Link>
      )}
    </main>
  );
}
