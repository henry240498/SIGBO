import { BadRequestException } from '@nestjs/common';
import { Type } from 'class-transformer';
import { Allow, ArrayMaxSize, ArrayUnique, IsArray, IsIn, IsInt, IsISO8601, IsOptional, IsString, IsUUID, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import type { ContextoConsultaMatpel, ParametrosMatpel } from '../matpel-modelo';

export class BuscarMatpelDto {
  @IsString() @MaxLength(120) q: string;
  @IsOptional() @IsUUID() versionGreId?: string;
  @IsOptional() @IsIn(['IDENTIFICADOR', 'NOMBRE', 'GUIA']) tipo?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limite = 20;
  @IsOptional() @IsString() @MaxLength(2000) cursor?: string;
}
export class VersionMatpelDto {
  @IsUUID() versionGreId: string;
}
export class TablaMatpelDto extends VersionMatpelDto {
  @IsOptional() @IsString() @MaxLength(4) identificador?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100000) pagina = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limite = 20;
}
export class DatoMatpelDto {
  @Allow() valor: unknown;
  @IsIn(['DESCONOCIDO', 'NO_CONFIRMADO', 'ESTIMADO', 'CONFIRMADO']) certeza: string;
  @IsIn(['OPERADOR', 'SIGBO', 'METEOROLOGIA', 'OCR']) origen: string;
  @IsOptional() @IsISO8601() observadoEn: string | null;
  @IsOptional() @IsUUID() evidenciaId: string | null;
  @IsOptional() @IsUUID() fuenteDatoId: string | null;
}
export class ParametrosMatpelDto {
  @ValidateNested() @Type(() => DatoMatpelDto) eventos: DatoMatpelDto;
  @ValidateNested() @Type(() => DatoMatpelDto) incendio: DatoMatpelDto;
  @ValidateNested() @Type(() => DatoMatpelDto) cantidad: DatoMatpelDto;
  @ValidateNested() @Type(() => DatoMatpelDto) contactoAgua: DatoMatpelDto;
  @ValidateNested() @Type(() => DatoMatpelDto) periodo: DatoMatpelDto;
  @ValidateNested() @Type(() => DatoMatpelDto) contenedor: DatoMatpelDto;
  @IsOptional() @ValidateNested() @Type(() => DatoMatpelDto) cantidadContenedor?: DatoMatpelDto;
  @IsOptional() @ValidateNested() @Type(() => DatoMatpelDto) numeroContenedores?: DatoMatpelDto;
  @ValidateNested() @Type(() => DatoMatpelDto) viento: DatoMatpelDto;
  @ValidateNested() @Type(() => DatoMatpelDto) ubicacion: DatoMatpelDto;
}
export class EvaluarMatpelDto extends VersionMatpelDto {
  @IsArray() @ArrayMaxSize(20) @ArrayUnique() @IsUUID(undefined, { each: true }) entradaIds: string[];
  @ValidateNested() @Type(() => ParametrosMatpelDto) parametros: ParametrosMatpelDto;
}
export class IdentificacionConsultaDto {
  @IsUUID() entradaId: string;
  @IsOptional() @IsString() @MaxLength(2000) observacionOriginal: string | null;
  @IsIn(['DESCONOCIDO', 'NO_CONFIRMADO', 'ESTIMADO', 'CONFIRMADO']) certeza: string;
  @IsIn(['MANUAL', 'PLACA', 'OCR', 'DESCONOCIDO']) metodo: string;
  @IsOptional() @IsISO8601() observadoEn: string | null;
  @IsOptional() @IsUUID() evidenciaId: string | null;
}
export class EvaluarMatpelV2Dto extends EvaluarMatpelDto {
  @IsOptional() @IsArray() @ArrayMaxSize(20) @ValidateNested({ each: true })
  @Type(() => IdentificacionConsultaDto) identificaciones?: IdentificacionConsultaDto[];
  @IsOptional() @IsIn(['TRANSPORTE_TERRESTRE', 'INSTALACION_FIJA', 'AEREO_MARITIMO', 'DESCONOCIDO']) ambito?: string;
}

export function validarContextoConsultaMatpel(ids: string[], ctx: ContextoConsultaMatpel) {
  const fallo = () => { throw new BadRequestException('Identificación o ámbito MATPEL inválidos.'); };
  if (!ctx || typeof ctx !== 'object' || Array.isArray(ctx) || Object.keys(ctx).some(k => !['ambito', 'identificaciones'].includes(k))) fallo();
  if (ctx.ambito !== undefined && !['TRANSPORTE_TERRESTRE', 'INSTALACION_FIJA', 'AEREO_MARITIMO', 'DESCONOCIDO'].includes(ctx.ambito)) fallo();
  if (ctx.identificaciones === undefined) return;
  if (!Array.isArray(ctx.identificaciones) || ctx.identificaciones.length !== ids.length) fallo();
  const vistos = new Set<string>();
  for (const i of ctx.identificaciones!) {
    if (!i || typeof i !== 'object' || Array.isArray(i) || Object.keys(i).some(k => !['entradaId', 'observacionOriginal', 'certeza', 'metodo', 'observadoEn', 'evidenciaId'].includes(k)) ||
      typeof i.entradaId !== 'string' || !ids.some(id => id.toLowerCase() === i.entradaId.toLowerCase()) || vistos.has(i.entradaId.toLowerCase()) ||
      !['DESCONOCIDO', 'NO_CONFIRMADO', 'ESTIMADO', 'CONFIRMADO'].includes(i.certeza) ||
      !['MANUAL', 'PLACA', 'OCR', 'DESCONOCIDO'].includes(i.metodo) ||
      (i.observacionOriginal !== null && (typeof i.observacionOriginal !== 'string' || i.observacionOriginal.length > 2000)) ||
      (i.observadoEn !== null && (typeof i.observadoEn !== 'string' || !/(Z|[+-]\d\d:\d\d)$/.test(i.observadoEn) || !Number.isFinite(Date.parse(i.observadoEn)))) ||
      (i.evidenciaId !== null && (typeof i.evidenciaId !== 'string' || !/^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(i.evidenciaId)))) fallo();
    vistos.add(i.entradaId.toLowerCase());
  }
}

/** Validación de unión discriminada: null nunca significa falso/cero; tampoco se
 * admiten claves extra dentro de valor, que el whitelist de Nest no alcanza. */
export function validarParametrosMatpel(p: unknown): asserts p is ParametrosMatpel {
  const fallar = (campo: string): never => { throw new BadRequestException(`Dato MATPEL inválido: ${campo}.`); };
  const keys = ['eventos', 'incendio', 'cantidad', 'contactoAgua', 'periodo', 'contenedor', 'viento', 'ubicacion'];
  const opcionales = ['cantidadContenedor', 'numeroContenedores'];
  if (!p || typeof p !== 'object' || Array.isArray(p) || Object.keys(p).some(k => !keys.includes(k) && !opcionales.includes(k))) fallar('parametros');
  const objeto = (valor: any, campos: string[]) => valor && typeof valor === 'object' && !Array.isArray(valor)
    && Object.keys(valor).every(k => campos.includes(k)) && campos.every(k => Object.prototype.hasOwnProperty.call(valor, k));
  const decimal = (valor: any) => typeof valor === 'string' && valor.length <= 80 && /^\d+(\.\d+)?$/.test(valor);
  const uuid = (valor: any) => valor === null || typeof valor === 'string' && /^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(valor);
  for (const key of [...keys, ...opcionales.filter(k => Object.prototype.hasOwnProperty.call(p, k))]) {
    const d = (p as any)[key];
    if (!objeto(d, ['valor', 'certeza', 'origen', 'observadoEn', 'evidenciaId', 'fuenteDatoId']) ||
        !['DESCONOCIDO', 'NO_CONFIRMADO', 'ESTIMADO', 'CONFIRMADO'].includes(d.certeza) ||
        !['OPERADOR', 'SIGBO', 'METEOROLOGIA', 'OCR'].includes(d.origen) ||
        !uuid(d.evidenciaId) || !uuid(d.fuenteDatoId) ||
        (d.observadoEn !== null && (typeof d.observadoEn !== 'string' || !/(Z|[+-]\d\d:\d\d)$/.test(d.observadoEn) || !Number.isFinite(Date.parse(d.observadoEn)))) ||
        (d.certeza === 'DESCONOCIDO') !== (d.valor === null)) fallar(key);
    const v = d.valor;
    if (v === null) continue;
    if (key === 'eventos' && (!Array.isArray(v) || !v.length || v.length > 5 || new Set(v).size !== v.length || v.some(x => !['DERRAME', 'FUGA', 'INCENDIO', 'EXPLOSION', 'OTRO'].includes(x)))) fallar(key);
    if (key === 'incendio' && typeof v !== 'boolean') fallar(key);
    if ((key === 'cantidad' || key === 'cantidadContenedor') && (!objeto(v, ['valorDecimal', 'unidad']) || !decimal(v.valorDecimal) || !['L', 'm3', 'kg', 't'].includes(v.unidad))) fallar(key);
    if (key === 'numeroContenedores' && (!Number.isSafeInteger(v) || v < 1 || v > 100000)) fallar(key);
    if (key === 'contactoAgua' && !['TIERRA', 'AGUA', 'AMBOS'].includes(v)) fallar(key);
    if (key === 'periodo' && !['DIA', 'NOCHE'].includes(v)) fallar(key);
    if (key === 'contenedor' && (typeof v !== 'string' || !v.trim() || v.length > 200)) fallar(key);
    if (key === 'viento' && (!objeto(v, ['velocidadDecimal', 'unidad', 'direccionDesdeGrados', 'proveedorId']) ||
        (v.velocidadDecimal !== null && !decimal(v.velocidadDecimal)) ||
        ![null, 'km/h', 'mph', 'm/s'].includes(v.unidad) ||
        (v.velocidadDecimal === null) !== (v.unidad === null) ||
        (v.direccionDesdeGrados !== null && (!Number.isFinite(v.direccionDesdeGrados) || v.direccionDesdeGrados < 0 || v.direccionDesdeGrados >= 360)) ||
        (v.proveedorId !== null && (typeof v.proveedorId !== 'string' || v.proveedorId.length > 100)))) fallar(key);
    if (key === 'ubicacion' && (!objeto(v, ['latitud', 'longitud', 'precisionM']) ||
        !Number.isFinite(v.latitud) || Math.abs(v.latitud) > 90 || !Number.isFinite(v.longitud) || Math.abs(v.longitud) > 180 ||
        (v.precisionM !== null && (!Number.isFinite(v.precisionM) || v.precisionM < 0)))) fallar(key);
  }
  const datos = p as ParametrosMatpel;
  if (datos.eventos.valor?.includes('INCENDIO') && datos.incendio.valor === false) fallar('eventos/incendio contradictorios');
}
