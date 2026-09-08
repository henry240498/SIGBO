export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
/** Origen del backend sin el prefijo /api/v1 - las imagenes subidas se sirven ahi. */
export const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '');
const CABECERA_SOLICITUD_SIGBO = { 'X-SIGBO-Request': '1' };

/** Descarga un archivo servido por el backend aun cuando frontend y backend
 * usan puertos distintos (el atributo HTML `download` se ignora entre
 * origenes distintos). */
export async function descargarArchivo(ruta: string, nombre: string): Promise<void> {
  const res = await fetch(`${API_ORIGIN}${ruta}`, { credentials: 'include' });
  if (!res.ok) throw new Error('No se pudo descargar el archivo');
  const url = URL.createObjectURL(await res.blob());
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export interface Sesion {
  usuario: {
    id: string;
    email: string;
    username: string;
    roles: string[];
    permisos: string[];
    debeCambiarPassword?: boolean;
  };
}

const STORAGE_KEY = 'sigbo_sesion';
export const EVENTO_SESION_FINALIZADA = 'sigbo:sesion-finalizada';
let refreshEnCurso: Promise<boolean> | null = null;

export function guardarSesion(sesion: Sesion) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sesion));
}

export function obtenerSesion(): Sesion | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const sesion = JSON.parse(raw) as Sesion;
    if (!sesion?.usuario?.id) throw new Error('Sesion incompleta');
    return sesion;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function cerrarSesionLocal() {
  localStorage.removeItem(STORAGE_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENTO_SESION_FINALIZADA));
  }
}

export async function login(usernameOrEmail: string, password: string): Promise<Sesion> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...CABECERA_SOLICITUD_SIGBO },
    body: JSON.stringify({ usernameOrEmail, password }),
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'No se pudo iniciar sesion');
  }
  const respuesta = await res.json() as { usuario?: Sesion['usuario'] };
  if (!respuesta.usuario?.id) throw new Error('El servidor no devolvió una sesión válida');
  const sesion: Sesion = { usuario: respuesta.usuario };
  guardarSesion(sesion);
  return sesion;
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: CABECERA_SOLICITUD_SIGBO,
    credentials: 'include',
  }).catch(() => undefined);
  cerrarSesionLocal();
}

async function refrescarToken(): Promise<boolean> {
  if (!obtenerSesion()) return false;
  if (!refreshEnCurso) {
    refreshEnCurso = (async () => {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: CABECERA_SOLICITUD_SIGBO,
        credentials: 'include',
      });
      if (!res.ok) {
        cerrarSesionLocal();
        return false;
      }
      const respuesta = await res.json().catch(() => null) as { usuario?: Sesion['usuario'] } | null;
      if (respuesta?.usuario?.id) {
        guardarSesion({ usuario: respuesta.usuario });
      }
      return true;
    })().finally(() => {
      refreshEnCurso = null;
    });
  }
  return refreshEnCurso;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const sesion = obtenerSesion();
  const headers = new Headers(options.headers);
  const metodo = (options.method ?? 'GET').toUpperCase();
  const esMutacion = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(metodo);
  // Evita preflights CORS innecesarios en lecturas: el middleware CSRF solo
  // exige esta cabecera en mutaciones autenticadas por cookie.
  if (esMutacion) headers.set('X-SIGBO-Request', '1');
  // Actualmente los cuerpos JSON se serializan como string. No imponer este
  // encabezado a FormData, Blob ni URLSearchParams: el navegador agrega el
  // boundary o el tipo correcto para esas cargas.
  if (typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  let res = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' });

  if (res.status === 401 && sesion) {
    if (await refrescarToken()) {
      res = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' });
    }
  }

  return res;
}
