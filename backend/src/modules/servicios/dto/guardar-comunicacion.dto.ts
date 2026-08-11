import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsObject, IsOptional, Min } from 'class-validator';

export class GuardarComunicacionDto {
  @ApiProperty({ enum: ['OTRAS_OCURRENCIAS', 'INCENDIO'] })
  @IsIn(['OTRAS_OCURRENCIAS', 'INCENDIO'])
  tipo: 'OTRAS_OCURRENCIAS' | 'INCENDIO';

  /** Datos completos del formulario, preservados para consulta e impresión. */
  @ApiProperty({ type: 'object' })
  @IsObject()
  formulario: Record<string, unknown>;

  /** Versión devuelta por la API. Opcional para mantener compatibilidad con borradores previos. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  version?: number;
}
