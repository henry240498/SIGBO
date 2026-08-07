import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class ActualizarCondicionDto {
  @ApiProperty({ enum: ['INCORPORADO', 'COMBATIENTE', 'APOYO_ECONOMICO', 'HONORARIO'] })
  @IsIn(['INCORPORADO', 'COMBATIENTE', 'APOYO_ECONOMICO', 'HONORARIO'])
  condicionInstitucional: string;

  @ApiProperty({
    required: false,
    description:
      'Campos propios del subtipo elegido (ver CondicionIncorporado, CondicionCombatiente, CondicionApoyoEconomico o CondicionHonorario segun corresponda).',
  })
  @IsOptional()
  detalle?: any;
}
