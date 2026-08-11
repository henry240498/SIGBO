// Rango Unicode de marcas diacriticas combinantes (U+0300 a U+036F), construido
// con String.fromCodePoint para no depender de escapes \u dentro de un string
// (que rompen el parseo de TypeScript dentro de un template literal).
const RANGO_DIACRITICOS = new RegExp(
  '[' + String.fromCodePoint(0x0300) + '-' + String.fromCodePoint(0x036f) + ']',
  'g',
);

/** Normaliza texto para comparaciones anti-duplicado: minusculas, sin
 * tildes/diacriticos, espacios recortados y colapsados. Ej: "Farmaceutico",
 * "farmaceutico" y " Farmaceutico " normalizan al mismo valor. */
export function normalizarTexto(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(RANGO_DIACRITICOS, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}
