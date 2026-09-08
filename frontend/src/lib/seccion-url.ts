/**
 * Resolucion de la pestana que pide la URL (`?seccion=`).
 *
 * Vive aparte del componente y sin JSX a proposito: asi se puede probar con
 * `node --test` sin navegador ni framework de pruebas.
 */

/**
 * Devuelve la seccion pedida en la query si es una de las validas.
 *
 * Si no viene, viene vacia o no esta en la lista, devuelve `null` para que el llamador
 * conserve su valor por defecto. Nunca devuelve un id que no exista: un `?seccion=`
 * inventado dejaria el panel en blanco, sin pestana marcada y sin contenido.
 */
export function seccionPedida(search: string, idsValidos: readonly string[]): string | null {
  const pedida = new URLSearchParams(search).get('seccion');
  if (!pedida) return null;
  return idsValidos.includes(pedida) ? pedida : null;
}

/** La URL actual con `?seccion=` puesta en `id`, conservando el resto de la query. */
export function urlConSeccion(href: string, id: string): string {
  const url = new URL(href);
  url.searchParams.set('seccion', id);
  return url.toString();
}
