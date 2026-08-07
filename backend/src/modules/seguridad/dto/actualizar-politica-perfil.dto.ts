import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ActualizarPoliticaPerfilDto {
  @ApiProperty({ description: 'true = Modo Libre (el usuario puede editar su perfil), false = Modo Fijo' })
  @IsBoolean()
  perfilEdicionLibre: boolean;
}
