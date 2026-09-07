import { BadRequestException, Body, Controller, Post, Res, UseFilters, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user';
import { MulterExceptionFilter } from '../../shared/filters/multer-exception.filter';
import { IaRateLimitGuard } from './guards/ia-rate-limit.guard';
import { IaVozService } from './ia-voz.service';
import { HablarVozDto } from './dto/voz-ia.dto';

// audio/webm (Chrome/Edge/Firefox por defecto), audio/ogg (Firefox a
// veces) y audio/mp4 (Safari) son los contenedores que produce
// MediaRecorder en navegadores reales -- ningun navegador ofrece WAV
// nativamente. wav se acepta igual por si algun cliente ya lo manda
// convertido. WhisperService reconvierte todo a WAV 16kHz igual, asi que
// aceptar de mas aca no relaja nada aguas abajo.
const MIMETYPES_AUDIO = /^audio\/(webm|ogg|mp4|wav|wave|x-wav|mpeg)/;
const TAMANO_MAXIMO_AUDIO = 15 * 1024 * 1024;

/** Voz alrededor de Snoopy (Etapa 2 del pedido): mismo permiso que el chat
 * de texto (`inteligencia:usar`, sin permiso nuevo -- seccion "no crear
 * una via alternativa") y el mismo limitador anti-abuso. Estos endpoints
 * NUNCA tocan `IaMotorService`/`IaToolsService`: solo convierten
 * audio<->texto alrededor del `/ia/chat` que ya existe y no cambia. */
@ApiTags('ia/voz')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('ia/voz')
export class IaVozController {
  constructor(private readonly vozService: IaVozService) {}

  @Post('transcribir')
  @RequirePermission('inteligencia:usar')
  @UseGuards(IaRateLimitGuard)
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: memoryStorage(),
      limits: { fileSize: TAMANO_MAXIMO_AUDIO },
      fileFilter: (_req, file, callback) => {
        if (!MIMETYPES_AUDIO.test(file.mimetype)) {
          return callback(new BadRequestException('Formato de audio no soportado.'), false);
        }
        callback(null, true);
      },
    }),
  )
  async transcribir(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibió ningún audio.');
    return this.vozService.transcribir(file.buffer);
  }

  @Post('hablar')
  @RequirePermission('inteligencia:usar')
  @UseGuards(IaRateLimitGuard)
  async hablar(@Body() dto: HablarVozDto, @CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const audioWav = await this.vozService.hablar(dto.mensajeId, user);
    res.set({ 'Content-Type': 'audio/wav', 'Content-Length': audioWav.length.toString() });
    res.send(audioWav);
  }
}
