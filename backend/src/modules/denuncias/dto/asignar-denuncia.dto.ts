import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class AsignarDenunciaDto {
  @IsUUID() usuarioId: string;
  @IsOptional() @IsString() @Length(2, 2000) comentario?: string;
}
