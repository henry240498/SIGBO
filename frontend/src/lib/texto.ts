/** Normaliza texto para comparaciones de busqueda: minusculas, sin tildes,
 * espacios recortados y colapsados. Reutilizable en cualquier combo o campo
 * de busqueda de SIGBO (mismo criterio que `normalizarTexto` del backend). */
export function normalizarTexto(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(new RegExp('[' + String.fromCodePoint(0x0300) + '-' + String.fromCodePoint(0x036f) + ']', 'g'), '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/** true si `texto` contiene `busqueda` de forma insensible a mayusculas/tildes. */
export function coincideBusqueda(texto: string, busqueda: string): boolean {
  if (!busqueda.trim()) return true;
  return normalizarTexto(texto).includes(normalizarTexto(busqueda));
}
