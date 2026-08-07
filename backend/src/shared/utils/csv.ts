function escaparCampo(valor: unknown): string {
  if (valor === null || valor === undefined) return '';
  const texto = valor instanceof Date ? valor.toISOString() : String(valor);
  if (/[",\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

/** Convierte una lista de objetos planos a texto CSV (con cabecera). */
export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const columnas = Object.keys(rows[0]);
  const cabecera = columnas.join(',');
  const lineas = rows.map((fila) => columnas.map((c) => escaparCampo(fila[c])).join(','));
  return [cabecera, ...lineas].join('\n');
}
