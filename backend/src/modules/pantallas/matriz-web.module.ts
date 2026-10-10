import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { MatrizWebService } from './matriz-web.service';

/**
 * Global: PermissionsGuard se instancia en cada modulo que lo usa y necesita poder
 * resolver MatrizWebService en todos. No importa otros modulos (usa ModuleRef para la
 * auditoria y la politica) para no crear ciclos con SeguridadModule.
 */
@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [MatrizWebService],
  exports: [MatrizWebService],
})
export class MatrizWebModule {}
