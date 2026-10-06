import { Controller, Get, Header, StreamableFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppMovilService } from './app-movil.service';

/**
 * Actualizacion de la app movil. Es publico a proposito: la app necesita
 * poder actualizarse aunque la sesion haya vencido, y el APK no contiene
 * datos (Android ademas exige que el APK nuevo este firmado con la misma
 * clave que el instalado, y la app verifica el SHA-256 publicado).
 */
@ApiTags('app-movil')
@Controller('app-movil')
export class AppMovilController {
  constructor(private readonly appMovil: AppMovilService) {}

  @Get('version')
  @Header('Cache-Control', 'no-store')
  version() {
    return this.appMovil.obtenerVersion();
  }

  @Get('descargar')
  @Header('Content-Type', 'application/vnd.android.package-archive')
  @Header('Content-Disposition', 'attachment; filename="sigbo-alertas.apk"')
  descargar() {
    const { stream, tamanio } = this.appMovil.abrirApk();
    return new StreamableFile(stream, { length: tamanio });
  }
}
