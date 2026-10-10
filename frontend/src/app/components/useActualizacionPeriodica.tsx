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
 *
 * Nunca hay dos cargas en vuelo: una consulta pendiente bloquea las demas (timer,
 * visibilidad o refrescar). Un resultado de una generacion anterior (se desactivo o
 * cambio `activo` mientras cargaba) se descarta sin tocar el estado.
 */
export function useActualizacionPeriodica(cargar: () => Promise<void>, intervaloMs: number, activo = true): EstadoActualizacion {
  const [actualizadoEn, setActualizadoEn] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const fallos = useRef(0);
  const reloj = useRef<number | null>(null);
  /** Verdadero mientras el hook esta montado. */
  const montado = useRef(false);
  /** Verdadero solo mientras el hook esta montado y activo: frena cualquier actualizacion tardia. */
  const vivo = useRef(false);
  /** Una carga en vuelo: ninguna otra arranca hasta que termine. */
  const enCurso = useRef(false);
  /** Sube al activar y al desactivar; una carga de otra generacion no actualiza nada. */
  const generacion = useRef(0);
  /** Hay un dato cargado: las consultas automaticas ya no muestran "Actualizando…". */
  const tieneDato = useRef(false);
  const cargarRef = useRef(cargar);
  cargarRef.current = cargar;

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const detener = useCallback(() => {
    if (reloj.current !== null) window.clearTimeout(reloj.current);
    reloj.current = null;
  }, []);

  /** `manual` es un refrescar del usuario: solo ese (o la primera carga) muestra el estado ocupado. */
  const ciclo = useCallback(async (manual = false) => {
    if (!vivo.current || enCurso.current) return;
    detener();
    const generacionInicial = generacion.current;
    enCurso.current = true;
    if (manual || !tieneDato.current) setCargando(true);
    let mensaje: string | null = null;
    try {
      await cargarRef.current();
    } catch (e) {
      mensaje = e instanceof Error ? e.message : 'No se pudo actualizar.';
    }
    enCurso.current = false;
    if (montado.current) setCargando(false);
    if (!montado.current) return;
    if (generacionInicial !== generacion.current) {
      // Se desactivo o se reactivo mientras cargaba: esta respuesta ya no vale.
      if (vivo.current) void ciclo();
      return;
    }
    if (!vivo.current) return;
    if (mensaje === null) {
      tieneDato.current = true;
      fallos.current = 0;
      setError(null);
      setActualizadoEn(new Date());
    } else {
      fallos.current += 1;
      setError(mensaje);
    }
    if (document.visibilityState === 'visible') {
      detener();
      reloj.current = window.setTimeout(() => void ciclo(), siguienteEspera(intervaloMs, fallos.current));
    }
  }, [intervaloMs, detener]);

  useEffect(() => {
    if (!activo) return;
    generacion.current += 1;
    vivo.current = true;
    void ciclo();
    const alCambiarVisibilidad = () => {
      if (document.visibilityState === 'visible') void ciclo();
      else detener();
    };
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    return () => {
      generacion.current += 1;
      vivo.current = false;
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      detener();
    };
  }, [ciclo, activo, detener]);

  return { actualizadoEn, error, cargando, refrescar: () => void ciclo(true) };
}

/**
 * "Actualizado hace N s", con el boton para actualizar ya. El aviso de conexion vive en un
 * `role="status"` que siempre esta en pantalla: solo cambia su texto, para que el lector de
 * pantalla lo anuncie. La marca de tiempo queda fuera de esa region para no anunciarse cada 5 s.
 */
export function MarcaActualizacion({ actualizadoEn, error, cargando, refrescar }: EstadoActualizacion) {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setAhora(new Date()), 5000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="marca-actualizacion">
      <span className={`punto-vivo${error ? ' caido' : ''}`} aria-hidden="true" />
      <span role="status">{error ? 'Sin conexión con el servidor' : ''}</span>
      <span>{error ? `último dato ${haceCuanto(actualizadoEn, ahora)}` : `Actualizado ${haceCuanto(actualizadoEn, ahora)}`}</span>
      <button type="button" className="service-secondary" onClick={refrescar} disabled={cargando}>{cargando ? 'Actualizando…' : 'Actualizar'}</button>
    </div>
  );
}
