import { Request, Response } from 'express';
import { duracionEnMilisegundos } from './auth.service';

const ACCESS_COOKIE = 'sigbo_access';
const REFRESH_COOKIE = 'sigbo_refresh';

type SameSite = 'lax' | 'strict' | 'none';

function mismoSitio(): SameSite {
  const valor = process.env.AUTH_COOKIE_SAME_SITE?.toLowerCase();
  if (!valor) return 'lax';
  if (valor === 'strict' || valor === 'none' || valor === 'lax') return valor;
  throw new Error('AUTH_COOKIE_SAME_SITE debe ser lax, strict o none.');
}

function esSeguro(): boolean {
  const valor = process.env.AUTH_COOKIE_SECURE?.toLowerCase();
  if (valor && valor !== 'true' && valor !== 'false') {
    throw new Error('AUTH_COOKIE_SECURE debe ser true o false.');
  }
  return valor === 'true' || process.env.NODE_ENV === 'production';
}

export function validarConfiguracionCookies(): void {
  opciones('/api/v1');
  opciones('/api/v1/auth', 1);
  obtenerOrigenesCors();
}

export function obtenerOrigenesCors(): string[] {
  const origenes = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);
  if (origenes.length === 0 || origenes.includes('*')) {
    throw new Error('CORS_ORIGIN debe contener uno o más orígenes explícitos; no se permite *.');
  }
  for (const origen of origenes) {
    try {
      const url = new URL(origen);
      if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origen) throw new Error();
    } catch {
      throw new Error(`CORS_ORIGIN contiene un origen inválido: ${origen}`);
    }
  }
  return origenes;
}

function opciones(path: string, maxAge?: number) {
  const secure = esSeguro();
  const sameSite = mismoSitio();
  if (sameSite === 'none' && !secure) {
    throw new Error('AUTH_COOKIE_SAME_SITE=none requiere AUTH_COOKIE_SECURE=true.');
  }
  return {
    httpOnly: true,
    secure,
    sameSite,
    path,
    ...(process.env.AUTH_COOKIE_DOMAIN ? { domain: process.env.AUTH_COOKIE_DOMAIN } : {}),
    ...(maxAge ? { maxAge } : {}),
  };
}

export function leerCookie(req: Request, nombre: string): string | undefined {
  const cabecera = req.headers.cookie;
  if (!cabecera) return undefined;
  for (const parte of cabecera.split(';')) {
    const [clave, ...resto] = parte.trim().split('=');
    if (clave === nombre) {
      try {
        return decodeURIComponent(resto.join('=')) || undefined;
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

export function leerRefreshCookie(req: Request): string | undefined {
  return leerCookie(req, REFRESH_COOKIE);
}

export function leerAccessCookie(req: Request): string | undefined {
  return leerCookie(req, ACCESS_COOKIE);
}

export function establecerCookiesAuth(res: Response, accessToken: string, refreshToken?: string): void {
  res.cookie(ACCESS_COOKIE, accessToken, opciones('/api/v1'));
  if (refreshToken) {
    res.cookie(
      REFRESH_COOKIE,
      refreshToken,
      opciones('/api/v1/auth', duracionEnMilisegundos('REFRESH_TOKEN_EXPIRATION', '7d')),
    );
  }
}

export function limpiarCookiesAuth(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, opciones('/api/v1'));
  res.clearCookie(REFRESH_COOKIE, opciones('/api/v1/auth'));
}

export function extraerAccessToken(req: Request): string | null {
  const authorization = req.headers.authorization;
  if (authorization?.startsWith('Bearer ')) return authorization.slice('Bearer '.length) || null;
  return leerAccessCookie(req) ?? null;
}
