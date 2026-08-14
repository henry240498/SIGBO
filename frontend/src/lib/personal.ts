import { apiFetch, API_ORIGIN, obtenerSesion } from './api';

/**
 * Reglas GLOBALES de SIGBO para trabajar con Personal (bomberos). Cualquier
 * pantalla de cualquier modulo que liste, busque, filtre o seleccione
 * personal (asignar responsables, participantes de un servicio/guardia,
 * capacitaciones, equipamiento, informes, etc.) debe reutilizar estas
 * funciones en vez de reimplementar su propio criterio de orden/busqueda.
 *
 * Orden institucional (nunca alfabetico): el `orden` de
 * personal.tipos_bombero define la prioridad de cada tipo (BCF=1, BC=2,
 * BI=3, BVAF=4, BVA=5, BH=6, BJ=7 al momento de escribir esto, pero el
 * numero real siempre debe leerse de la parametrizacion, nunca asumirse).
 * Dentro de un mismo tipo, el numero del codigo bomberil se ordena como
 * entero real (BC-9, BC-10, ..., BC-99, BC-100), nunca como texto.
 *
 * El codigo bomberil (numeroBombero) NUNCA se usa como identificador
 * tecnico: el `id` (GUID autonumerado) es la unica PK valida. El codigo
 * puede cambiar durante la trayectoria de la persona.
 */

export interface TipoBombero {
  id: string;
  nombre: string;
  prefijo: string;
  orden: number;
}

export interface BomberoResumen {
  id: string;
  cedula: string;
  nombre: string;
  apellido: string;
  rango: string;
  cargo: string | null;
  numeroBombero: string;
  estado: string;
  tipoBomberoId: string | null;
  rangoId: string | null;
  cargoPrincipalId: string | null;
}

/** Estados de ciclo de vida de un bombero. Es una maquina de estados fija
 * (impuesta por CHECK constraint + DTO en el backend), no un catalogo
 * administrable — por eso vive aqui como constante compartida y no en
 * organizacion.parametros. */
export const ESTADOS_BOMBERO = [
  'ASPIRANTE',
  'ACTIVO',
  'SUSPENDIDO',
  'LICENCIA',
  'RETIRADO',
  'FALLECIDO',
  'HONORARIO',
];

export async function cargarTiposBombero(): Promise<TipoBombero[]> {
  const res = await apiFetch('/personal/tipos-bombero?estado=ACTIVO');
  if (!res.ok) return [];
  const tipos: TipoBombero[] = await res.json();
  return [...tipos].sort((a, b) => a.orden - b.orden);
}

/** A diferencia de los catalogos secundarios de este archivo, lanza si la
 * carga falla: el listado de personal es el dato primario de la pantalla que
 * lo consuma, y ocultar el error dejaria un listado vacio sin explicacion. */
export async function cargarBomberos(): Promise<BomberoResumen[]> {
  const res = await apiFetch('/personal/bomberos');
  if (!res.ok) throw new Error('No se pudo cargar el listado de bomberos');
  return res.json();
}

export function construirTipoPorId(tipos: TipoBombero[]): Map<string, TipoBombero> {
  return new Map(tipos.map((t) => [t.id, t]));
}

/** Extrae la parte numerica del codigo bomberil como entero real (nunca como
 * texto), quitando primero el prefijo institucional del tipo asociado. El
 * cero inicial (ej. "BC-01") es solo formato visual y no afecta el valor. */
export function extraerNumeroCodigo(numeroBombero: string, prefijo?: string | null): number {
  const resto = prefijo && numeroBombero.startsWith(prefijo) ? numeroBombero.slice(prefijo.length) : numeroBombero;
  const match = resto.match(/\d+/);
  return match ? parseInt(match[0], 10) : Number.MAX_SAFE_INTEGER;
}

/**
 * Comparador institucional canonico: prioridad del Tipo de Bombero
 * (parametrizada) y despues numero de codigo ascendente real. Nunca se
 * adivina el tipo a partir del texto del codigo (ej. "BCF-44" jamas se debe
 * confundir con "BC", ni "BVAF-01" con "BVA") — siempre se usa el
 * `tipoBomberoId` real del registro contra el catalogo.
 */
export function compararBomberosInstitucional(
  a: Pick<BomberoResumen, 'numeroBombero' | 'tipoBomberoId'>,
  b: Pick<BomberoResumen, 'numeroBombero' | 'tipoBomberoId'>,
  tipoPorId: Map<string, TipoBombero>,
): number {
  const tipoA = a.tipoBomberoId ? tipoPorId.get(a.tipoBomberoId) : undefined;
  const tipoB = b.tipoBomberoId ? tipoPorId.get(b.tipoBomberoId) : undefined;
  const ordenA = tipoA?.orden ?? Number.MAX_SAFE_INTEGER;
  const ordenB = tipoB?.orden ?? Number.MAX_SAFE_INTEGER;
  if (ordenA !== ordenB) return ordenA - ordenB;
  const numA = extraerNumeroCodigo(a.numeroBombero, tipoA?.prefijo);
  const numB = extraerNumeroCodigo(b.numeroBombero, tipoB?.prefijo);
  if (numA !== numB) return numA - numB;
  return a.numeroBombero.localeCompare(b.numeroBombero);
}

export interface Catalogo {
  id: string;
  nombre: string;
  codigo?: string;
}

/** Fetch generico para catalogos simples de Organizacion Institucional
 * (rangos, cargos, etc.) usados en combos de Personal. */
export async function cargarCatalogo(path: string): Promise<Catalogo[]> {
  const res = await apiFetch(`${path}?estado=ACTIVO`);
  if (!res.ok) return [];
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Firma digital -- endpoints dedicados, distintos del PATCH generico   */
/* ------------------------------------------------------------------ */

async function mensajeErrorFirma(res: Response, porDefecto: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return Array.isArray(body.message) ? body.message.join(', ') : body.message ?? porDefecto;
}

/** Multipart: apiFetch fuerza Content-Type: application/json, incompatible
 * con el boundary de un form-data -- mismo patron manual que
 * seguridad/apariencia/page.tsx. */
export async function subirFirmaDigital(bomberoId: string, archivo: File): Promise<unknown> {
  const formData = new FormData();
  formData.append('archivo', archivo);
  const sesion = obtenerSesion();
  const headers: HeadersInit = {};
  if (sesion) headers['Authorization'] = `Bearer ${sesion.accessToken}`;

  const res = await fetch(`${API_ORIGIN}/api/v1/personal/bomberos/${bomberoId}/firma-digital`, {
    method: 'PUT',
    headers,
    body: formData,
  });
  if (!res.ok) throw new Error(await mensajeErrorFirma(res, 'No se pudo subir la firma digital'));
  return res.json();
}

export async function eliminarFirmaDigital(bomberoId: string): Promise<unknown> {
  const res = await apiFetch(`/personal/bomberos/${bomberoId}/firma-digital`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await mensajeErrorFirma(res, 'No se pudo eliminar la firma digital'));
  return res.json();
}

export async function cambiarAutorizacionFirma(bomberoId: string, autorizado: boolean): Promise<unknown> {
  const res = await apiFetch(`/personal/bomberos/${bomberoId}/autorizacion-firma`, {
    method: 'PATCH',
    body: JSON.stringify({ autorizado }),
  });
  if (!res.ok) throw new Error(await mensajeErrorFirma(res, 'No se pudo actualizar la autorizacion de firma digital'));
  return res.json();
}
