import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'sigbo:permission';

export const RequirePermission = (...permisos: string[]) => SetMetadata(PERMISSION_KEY, permisos);
