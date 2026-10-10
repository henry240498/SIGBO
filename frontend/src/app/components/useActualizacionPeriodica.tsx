'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { haceCuanto, siguienteEspera } from '@/lib/actualizacion';

export interface EstadoActualizacion {
  actualizadoEn: Date | null;
  error: string | null;
  cargando: boolean;
  refrescar: () => void;
}

/**
 * Llama a `cargar` cada `intervaloMs` mientras la pestana esta visible; al volver a
 * verla consulta enseguida. Si falla, conserva lo ultimo cargado y reintenta con
 * espera creciente. `cargar` debe lanzar un Error con el mensaje para la persona.
 */
export function useActualizacionPeriodica(cargar: () => Promise<void>, intervaloMs: number, activo = true): EstadoActualizacion {
  const [actualizadoEn, setActualizadoEn] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const fallos = useRef(0);
  const reloj = useRef<number | null>(null);
  /** Verdadero solo mientras el hook esta montado y activo: frena cualquier actualizacion tardia. */
  const vivo = useRef(false);
  const cargarRef = useRef(cargar);
  cargarRef.current = cargar;

  const detener = useCallback(() => {
    if (reloj.current !== null) window.clearTimeout(reloj.current);
    reloj.current = null;
  }, []);

  const ciclo = useCallback(async () => {
    if (!vivo.current) return;
    detener();
    setCargando(true);
    let mensaje: string | null = null;
    try {
      await cargarRef.current();
    } catch (e) {
      mensaje = e instanceof Error ? e.message : 'No se pudo actualizar.';
    }
    if (!vivo.current) return;
    if (mensaje === null) {
      fallos.current = 0;
      setError(null);
      setActualizadoEn(new Date());
    } else {
      fallos.current += 1;
      setError(mensaje);
    }
    setCargando(false);
    if (document.visibilityState === 'visible') {
      detener();
      reloj.current = window.setTimeout(() => void ciclo(), siguienteEspera(intervaloMs, fallos.current));
    }
  }, [intervaloMs, detener]);

  useEffect(() => {
    if (!activo) return;
    vivo.current = true;
    void ciclo();
    const alCambiarVisibilidad = () => {
      if (document.visibilityState === 'visible') void ciclo();
      else detener();
    };
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    return () => {
      vivo.current = false;
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      detener();
    };
  }, [ciclo, activo, detener]);

  return { actualizadoEn, error, cargando, refrescar: () => void ciclo() };
}

/** "Actualizado hace N s", con el boton para actualizar ya y el aviso si se perdio la conexion. */
export function MarcaActualizacion({ actualizadoEn, error, cargando, refrescar }: EstadoActualizacion) {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setAhora(new Date()), 5000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="marca-actualizacion">
      <span className={`punto-vivo${error ? ' caido' : ''}`} aria-hidden="true" />
      {error
        ? <span role="status">Sin conexión con el servidor · último dato {haceCuanto(actualizadoEn, ahora)}</span>
        : <span>Actualizado {haceCuanto(actualizadoEn, ahora)}</span>}
      <button type="button" className="service-secondary" onClick={refrescar} disabled={cargando}>{cargando ? 'Actualizando…' : 'Actualizar'}</button>
    </div>
  );
}
