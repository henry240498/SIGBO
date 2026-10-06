import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { leerAccessCookie, leerRefreshCookie, obtenerOrigenesCors } from './auth-cookies';

const METODOS_SEGUROS = new Set(['GET', 'HEAD', 'OPTIONS']);

function emiteCookiesDeSesion(req: Request): boolean {
  const ruta = (req.originalUrl ?? req.url).split('?')[0];
  return /(?:^|\/)auth\/(?:login|refresh|logout)\/?$/.test(ruta);
}

/**
 * La app nativa (carpeta .movile) no es un navegador: no envia `Origin` ni cookies, asi que no
 * puede pasar la comprobacion de origen pensada para formularios web. Se la reconoce por su
 * cabecera `X-SIGBO-Dispositivo: movil`, y SOLO si ademas no trae cookies ni `Origin`:
 *  - un navegador SIEMPRE agrega `Origin` a un POST, asi que una pagina maliciosa nunca cumple
 *    esta condicion;
 *  - esa cabecera propia obligaria a un preflight CORS, que el servidor no autoriza a sitios ajenos;
 *  - con cookies o con `Origin` se sigue exigiendo todo lo de siempre.
 * La proteccion contra login-CSRF (fijar una sesion ajena en un navegador) no cambia.
 */
export function esClienteNativo(req: Request, usaCookies: boolean): boolean {
  return !usaCookies && !req.get('origin') && req.get('x-sigbo-dispositivo') === 'movil';
}

/**
 * Las integraciones con Authorization: Bearer siguen siendo stateless. Cuando
 * la autenticación llega por cookie, o una ruta va a emitir/renovar una cookie,
 * toda mutación debe provenir de un origen explícitamente permitido. Así un
 * formulario externo no puede fijar una sesión ajena mediante login-CSRF.
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const usaCookies = Boolean(leerAccessCookie(req) || leerRefreshCookie(req));
    if (METODOS_SEGUROS.has(req.method) || (!usaCookies && !emiteCookiesDeSesion(req))) {
      next();
      return;
    }

    if (esClienteNativo(req, usaCookies)) {
      next();
      return;
    }

    const origin = req.get('origin');
    if (!origin || !obtenerOrigenesCors().includes(origin)) {
      res.status(403).json({ statusCode: 403, message: 'Origen no autorizado para la sesión.' });
      return;
    }
    if (req.get('x-sigbo-request') !== '1') {
      res.status(403).json({ statusCode: 403, message: 'Solicitud de sesión no válida.' });
      return;
    }
    next();
  }
}
