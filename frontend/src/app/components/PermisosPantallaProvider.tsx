'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { apiFetch, obtenerSesion } from '@/lib/api';
import { MODULOS } from '@/lib/modulos';
import { PANTALLAS } from '@/lib/pantallas.generado';
import { AccionUi, EstadoPermisos, MatrizWeb, matrizDeRespuesta, pantallasVisibles, PermisoPantalla, puede, tabsVisibles } from '@/lib/permisos-pantalla';

/** Las reglas pueden cambiar mientras la persona trabaja; igual el backend ya las exige al instante. */
const RECARGA_MS = 5 * 60_000;

export interface AccesoCentroMando { acceso: boolean; motivo: string | null }

interface ValorPermisos {
  estado: EstadoPermisos;
  matriz: MatrizWeb | null;
  centroMando: AccesoCentroMando | null;
  recargar: () => void;
}

const Contexto = createContext<ValorPermisos>({ estado: 'sin_datos', matriz: null, centroMando: null, recargar: () => undefined });

export function PermisosPantallaProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<ValorPermisos['estado']>('cargando');
  const [matriz, setMatriz] = useState<MatrizWeb | null>(null);
  const [centroMando, setCentroMando] = useState<AccesoCentroMando | null>(null);

  // Solo la ultima llamada aplica su resultado: una respuesta lenta y vieja no pisa una nueva.
  const ultima = useRef(0);
  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => { montado.current = false; };
  }, []);

  const cargar = useCallback(async () => {
    const mia = ++ultima.current;
    const vigente = () => montado.current && mia === ultima.current;
    const [pantallas, acceso] = await Promise.allSettled([apiFetch('/pantallas/mis-permisos-web'), apiFetch('/centro-mando/acceso')]);
    let datos: { activa?: boolean; pantallas?: PermisoPantalla[] } | null = null;
    if (pantallas.status === 'fulfilled' && pantallas.value.ok) {
      datos = (await pantallas.value.json().catch(() => null)) as { activa?: boolean; pantallas?: PermisoPantalla[] } | null;
    }
    const accesoCm = acceso.status === 'fulfilled' && acceso.value.ok
      ? ((await acceso.value.json().catch(() => null)) as AccesoCentroMando | null)
      : null;
    if (!vigente()) return;
    const nueva = matrizDeRespuesta(datos);
    if (nueva) {
      setMatriz(nueva);
      setEstado('listo');
    } else if (datos?.activa === false) {
      // El servidor no aplica la matriz (no armo su indice): la web tampoco oculta por ella.
      setMatriz(null);
      setEstado('sin_datos');
    } else {
      // Se conserva lo ultimo que se cargo bien; si nunca se cargo, la web vuelve al prefijo.
      setEstado((previo) => (previo === 'listo' ? 'listo' : 'sin_datos'));
    }
    if (accesoCm) setCentroMando(accesoCm);
  }, []);

  useEffect(() => {
    void cargar();
    const reloj = window.setInterval(() => void cargar(), RECARGA_MS);
    return () => window.clearInterval(reloj);
  }, [cargar]);

  const valor = useMemo<ValorPermisos>(() => ({ estado, matriz, centroMando, recargar: () => void cargar() }), [estado, matriz, centroMando, cargar]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function usePermisosPantalla(): ValorPermisos {
  return useContext(Contexto);
}

/** ¿Puede hacer esta accion en la pantalla actual? Sin datos de la matriz: si (decide el backend). */
export function usePuede(): (accion: AccionUi) => boolean {
  const pathname = usePathname();
  const { matriz } = usePermisosPantalla();
  return useCallback((accion: AccionUi) => puede(pathname, PANTALLAS, matriz, accion), [pathname, matriz]);
}

/** Pestanas del submenu de un modulo que la persona puede abrir. */
export function useTabsVisibles<T extends { href: string }>(tabs: T[]): T[] {
  const { matriz } = usePermisosPantalla();
  return useMemo(() => tabsVisibles(tabs, PANTALLAS, matriz), [tabs, matriz]);
}

/**
 * Permisos de la sesion. Se leen despues de montar: localStorage no existe al renderizar
 * en el servidor, y leerlo antes desacoplaria el HTML del servidor y el del navegador.
 */
export function usePermisosSesion(): string[] {
  const [permisos, setPermisos] = useState<string[]>([]);
  useEffect(() => { setPermisos(obtenerSesion()?.usuario.permisos ?? []); }, []);
  return permisos;
}

/** Rutas que la persona puede abrir: para no ofrecer enlaces que terminen en "Sin acceso". */
export function useRutasVisibles(): Set<string> {
  const { matriz } = usePermisosPantalla();
  const permisos = usePermisosSesion();
  return useMemo(() => new Set(pantallasVisibles(PANTALLAS, permisos, matriz, MODULOS).map((p) => p.ruta)), [permisos, matriz]);
}
