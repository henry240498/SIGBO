/**
 * El color de un rol o de un rango lo elige un administrador con un selector y queda en
 * la base, asi que puede ser cualquiera. `.badge` fija `color: var(--ink)`, que sobre un
 * fondo oscuro deja la etiqueta ilegible -- incluso el gris por defecto `#6B7280` se
 * queda en 3,2:1. Estas funciones eligen el texto segun el fondo, para que cualquier
 * color que elijan se lea.
 */

const INK = '#10263f';

/** Luminancia relativa segun WCAG 2.1. Devuelve null si el color no es un hex. */
function luminancia(hex: string): number | null {
  const limpio = hex.trim().replace('#', '');
  const completo = limpio.length === 3 ? limpio.split('').map((c) => c + c).join('') : limpio;
  if (!/^[0-9a-fA-F]{6}$/.test(completo)) return null;
  const canales = [0, 2, 4].map((i) => {
    const valor = parseInt(completo.slice(i, i + 2), 16) / 255;
    return valor <= 0.03928 ? valor / 12.92 : ((valor + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * canales[0] + 0.7152 * canales[1] + 0.0722 * canales[2];
}

function contraste(a: number, b: number): number {
  const [claro, oscuro] = a > b ? [a, b] : [b, a];
  return (claro + 0.05) / (oscuro + 0.05);
}

/**
 * Texto que mejor se lee sobre `fondo`: el azul marino de la app o blanco.
 * Si `fondo` no es un hex (por ejemplo `var(--ok-fill)`), devuelve undefined para no
 * pisar lo que ya venga de la clase.
 */
export function textoLegibleSobre(fondo: string | null | undefined): string | undefined {
  if (!fondo) return undefined;
  const lFondo = luminancia(fondo);
  if (lFondo === null) return undefined;
  const lInk = luminancia(INK) as number;
  return contraste(lFondo, lInk) >= contraste(lFondo, 1) ? INK : '#ffffff';
}

/** Estilo listo para un `.badge` cuyo fondo es un color elegido por el usuario. */
export function estiloBadgeColor(fondo: string | null | undefined) {
  return { background: fondo ?? undefined, color: textoLegibleSobre(fondo) };
}
