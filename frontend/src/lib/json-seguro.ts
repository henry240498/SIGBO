/** Evita que un dato histórico malformado deje inoperable la pantalla que lo muestra. */
export function formatearJsonSeguro(valor: string | null | undefined, vacio = '(nada)'): string {
  if (!valor) return vacio;
  try {
    return JSON.stringify(JSON.parse(valor), null, 2);
  } catch {
    return '(contenido no válido)';
  }
}

export function parsearJsonSeguro<T>(valor: string | null | undefined): T | null {
  if (!valor) return null;
  try {
    return JSON.parse(valor) as T;
  } catch {
    return null;
  }
}
