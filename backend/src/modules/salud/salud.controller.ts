import { Controller, Get, Header, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('salud')
@Controller('salud')
export class SaludController {
  constructor(private readonly dataSource: DataSource) {}

  /** Sonda de disponibilidad: confirma que la API y su base de datos responden. */
  @Get()
  @Header('Cache-Control', 'no-store')
  async comprobar() {
    try {
      await this.dataSource.query('SELECT 1 AS disponible');
    } catch {
      throw new ServiceUnavailableException({ estado: 'no_disponible' });
    }
    return { estado: 'disponible', fecha: new Date().toISOString() };
  }
}
