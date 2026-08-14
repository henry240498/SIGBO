import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export const ESTADOS_DENUNCIA = ['NUEVA', 'EN_REVISION', 'ASIGNADA', 'EN_INVESTIGACION', 'RESUELTA', 'CERRADA', 'DESCARTADA', 'DUPLICADA'] as const;
export class CambiarEstadoDenunciaDto {
  @IsIn(ESTADOS_DENUNCIA) estado: typeof ESTADOS_DENUNCIA[number];
  @IsOptional() @IsString() @Length(2, 2000) comentario?: string;
}
