import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Intenta resolver una sesión sin impedir que una ruta pública continúe. */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(_err: any, user: TUser): TUser {
    return user ?? (null as TUser);
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context) as boolean;
  }
}
