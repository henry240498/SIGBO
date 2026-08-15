'use client';

import { API_ORIGIN } from '@/lib/api';

interface AvatarIaProps {
  avatarUrl?: string | null;
  avatarEmoji?: string | null;
  avatarColorFondo?: string | null;
  nombre: string;
  size?: number;
}

/**
 * Muestra el avatar de la IA con la misma logica en cualquier pantalla:
 * imagen subida (con el origen del backend antepuesto -- sin eso el
 * navegador la pide contra el propio frontend y da 404) > avatar
 * predefinido (emoji + color, sin archivo) > emoji de reserva. Nunca
 * fuerza un circulo opaco sobre una imagen: se muestra completa con
 * object-fit: contain, "flotando" sin recorte ni marco.
 */
export function AvatarIa({ avatarUrl, avatarEmoji, avatarColorFondo, nombre, size = 44 }: AvatarIaProps) {
  if (avatarUrl) {
    return (
      <img
        src={`${API_ORIGIN}${avatarUrl}`}
        alt={nombre}
        style={{ height: size, width: 'auto', maxWidth: size * 1.5, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
      />
    );
  }
  if (avatarEmoji) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: avatarColorFondo ?? '#334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.55,
          flexShrink: 0,
        }}
      >
        {avatarEmoji}
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5, flexShrink: 0 }}>
      🐶
    </div>
  );
}
