import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PublicacionPublica, PublicacionesService } from './publicaciones.service';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly service: PublicacionesService) {}
  @Get('publicas') publicas() { return this.service.listar(false); }
  @Get() @UseGuards(JwtAuthGuard) todas() { return this.service.listar(true); }
  @Put() @UseGuards(JwtAuthGuard) reemplazar(@Body() items: PublicacionPublica[]) { return this.service.reemplazar(items); }
}
