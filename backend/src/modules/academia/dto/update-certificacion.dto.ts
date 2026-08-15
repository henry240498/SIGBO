import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCertificacionDto } from './create-certificacion.dto';

export class UpdateCertificacionDto extends PartialType(OmitType(CreateCertificacionDto, ['bomberoId'] as const)) {}
