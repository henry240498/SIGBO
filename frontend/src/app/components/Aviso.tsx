'use client';

import { useEffect, useState } from 'react';

/**
 * Mensaje de resultado de una accion. Antes cada pantalla ponia un parrafo suelto de
 * color, con dos problemas: sin role, un lector de pantalla no anunciaba nada al
 * guardar o al fallar; y el aviso de exito quedaba pegado en pantalla indefinidamente,
 * asi que uno terminaba dudando de si era de la accion recien hecha o de la anterior.
 *
 * El de exito se retira solo a los 6 segundos. El de error se queda: un fallo se
 * atiende, no se espera que desaparezca.
 */
const SEGUNDOS_VISIBLE = 6000;

export function Aviso({ tipo, texto, fontSize }: { tipo: 'error' | 'exito'; texto: string; fontSize?: number }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    if (tipo === 'error') return;
    const reloj = setTimeout(() => setVisible(false), SEGUNDOS_VISIBLE);
    return () => clearTimeout(reloj);
  }, [texto, tipo]);

  if (!visible) return null;

  return (
    <p
      className={`aviso aviso-${tipo}`}
      role={tipo === 'error' ? 'alert' : 'status'}
      aria-live={tipo === 'error' ? 'assertive' : 'polite'}
      style={fontSize ? { fontSize } : undefined}
    >
      {texto}
    </p>
  );
}
