import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Optional } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { leerAccessCookie, leerRefreshCookie } from '../../auth/auth-cookies';
import { esClienteNativo } from '../../auth/csrf.middleware';
import { MatrizWebService } from '../../pantallas/matriz-web.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    /** Matriz de pantallas web (MatrizWebModule es global). Opcional: sin ella, solo el rol. */
    @Optional() private readonly matriz?: MatrizWebService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;

    if (requiredPermissions && requiredPermissions.length > 0) {
      if (!user) {
        throw new ForbiddenException('Usuario no autenticado');
      }
      const tienePermiso = requiredPermissions.some((p) => user.permisos.includes(p));
      if (!tienePermiso) {
        throw new ForbiddenException(
          `Permiso insuficiente. Se requiere: ${requiredPermissions.join(' o ')}`,
        );
      }
    }

    // Despues del rol, la matriz por pantalla: solo restringe, y sin reglas no cambia nada.
    if (!this.matriz || !user) return true;
    // La app movil tiene su propia matriz (0xA): las reglas de pantallas web gobiernan solo la web.
    // Se la reconoce igual que el middleware CSRF (cabecera de dispositivo, sin cookies ni Origin).
    const usaCookies = Boolean(leerAccessCookie(request) || leerRefreshCookie(request));
    if (esClienteNativo(request, usaCookies)) return true;
    return this.matriz.exigirEnRuta(user, request.method, request.route?.path).then(() => true);
  }
}
