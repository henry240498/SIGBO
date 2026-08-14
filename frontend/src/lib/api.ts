export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
/** Origen del backend sin el prefijo /api/v1 - las imagenes subidas se sirven ahi. */
export const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '');

export interface Sesion {
  accessToken: string;
  refreshToken: string;
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

export function guardarSesion(sesion: Sesion) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sesion));
}

export function obtenerSesion(): Sesion | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function cerrarSesionLocal() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function login(usernameOrEmail: string, password: string): Promise<Sesion> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'No se pudo iniciar sesion');
  }
  const sesion = await res.json();
  guardarSesion(sesion);
  return sesion;
}

export async function logout(): Promise<void> {
  const sesion = obtenerSesion();
  if (sesion) {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: sesion.refreshToken }),
    }).catch(() => undefined);
  }
  cerrarSesionLocal();
}

async function refrescarToken(): Promise<string | null> {
  const sesion = obtenerSesion();
  if (!sesion) return null;
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: sesion.refreshToken }),
  });
  if (!res.ok) {
    cerrarSesionLocal();
    return null;
  }
  const { accessToken } = await res.json();
  guardarSesion({ ...sesion, accessToken });
  return accessToken;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const sesion = obtenerSesion();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (sesion) headers.set('Authorization', `Bearer ${sesion.accessToken}`);

  let res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && sesion) {
    const nuevoToken = await refrescarToken();
    if (nuevoToken) {
      headers.set('Authorization', `Bearer ${nuevoToken}`);
      res = await fetch(`${API_URL}${path}`, { ...options, headers });
    }
  }

  return res;
}
