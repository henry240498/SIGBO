import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { GUID_REGEX, GUID_REGEX_MENSAJE } from '../../../shared/utils/guid';

const ESTADOS = ['OK', 'NO_OK'];

export class CreateInspeccionMovilDto {
  @ApiProperty({ description: 'vehiculos.vehiculos.id' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  vehiculoId: string;

  @ApiProperty({ description: 'vehiculos.checklist_items.id' })
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  checklistItemId: string;

  @ApiProperty({ enum: ESTADOS, default: 'OK' }) @IsIn(ESTADOS) estado: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() observacion?: string;

  @ApiProperty({ required: false, description: 'personal.bomberos.id de quien realizo la verificacion' })
  @IsOptional()
  @Matches(GUID_REGEX, { message: GUID_REGEX_MENSAJE })
  responsableId?: string;
}
