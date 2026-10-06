import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Adjunto, Despacho, EntidadAdjunto, Hidrante, PuntoRiesgo, Servicio, Vehiculo } from '../../shared/entities';
import {
  borrarImagenSiExiste,
  detectarImagen,
  guardarBufferRestringido,
  leerBufferRestringido,
  mimeImagenPorReferencia,
} from '../../shared/utils/almacenamiento';
import { instanteDelHecho } from '../../shared/utils/instante';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { SubirAdjuntoDto } from './dto/campo.dto';

export const CARPETA_ADJUNTOS = 'adjuntos-campo';
export const MAX_BYTES_ADJUNTO = 8 * 1024 * 1024;
export const MAX_ADJUNTOS_POR_ENTIDAD = 30;

const ENTIDADES: Record<EntidadAdjunto, new () => object> = {
  SERVICIO: Servicio,
  DESPACHO: Despacho,
  VEHICULO: Vehiculo,
  HIDRANTE: Hidrante,
  PUNTO_RIESGO: PuntoRiesgo,
};

export interface ContextoCampo {
  usuarioId: string;
  ip?: string | null;
  userAgent?: string | null;
}

const metadatos = (a: Adjunto) => ({
  id: a.id,
  entidad: a.entidad,
  entidadId: a.entidadId,
  tipo: a.tipo,
  descripcion: a.descripcion,
  tamanoBytes: a.tamanoBytes,
  tomadoEn: a.tomadoEn,
  subidoPor: a.subidoPor,
});

@Injectable()
export class AdjuntosService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
  ) {}

  async subir(file: Express.Multer.File | undefined, dto: SubirAdjuntoDto, ctx: ContextoCampo) {
    const repo = this.dataSource.getRepository(Adjunto);
    // Reintento del mismo envio (el celular no supo si llego): se devuelve lo ya guardado.
    if (dto.claveIdempotencia) {
      const previo = await repo.findOne({ where: { claveIdempotencia: dto.claveIdempotencia } });
      if (previo) return metadatos(previo);
    }
    if (!file?.buffer?.length) throw new BadRequestException('Falta el archivo (campo "archivo").');
    if (file.buffer.length > MAX_BYTES_ADJUNTO) throw new BadRequestException('El archivo supera los 8 MB.');
    const imagen = detectarImagen(file.buffer);
    if (!imagen) throw new BadRequestException('El contenido no es una imagen PNG, JPG, WEBP o GIF valida.');

    const existe = await this.dataSource.getRepository(ENTIDADES[dto.entidad] as never).findOne({ where: { id: dto.entidadId } as never });
    if (!existe) throw new NotFoundException(`No existe ese registro (${dto.entidad}).`);
    const cantidad = (await repo.find({ where: { entidad: dto.entidad, entidadId: dto.entidadId } })).length;
    if (cantidad >= MAX_ADJUNTOS_POR_ENTIDAD) {
      throw new ConflictException(`Ya tiene ${MAX_ADJUNTOS_POR_ENTIDAD} adjuntos; no admite mas.`);
    }

    const referencia = await guardarBufferRestringido(file.buffer, imagen.extension, CARPETA_ADJUNTOS);
    try {
      const a = await repo.save(
        repo.create({
          entidad: dto.entidad,
          entidadId: dto.entidadId,
          tipo: dto.tipo,
          descripcion: dto.descripcion ?? null,
          referencia,
          tamanoBytes: file.buffer.length,
          claveIdempotencia: dto.claveIdempotencia ?? null,
          subidoPor: ctx.usuarioId,
          tomadoEn: instanteDelHecho(dto.tomadoEn),
        }),
      );
      await this.auditoria.registrar({
        usuarioId: ctx.usuarioId,
        accion: 'SUBIR',
        recurso: 'servicios.adjunto',
        recursoId: a.id,
        datosDespues: { entidad: a.entidad, entidadId: a.entidadId, tipo: a.tipo, tamanoBytes: a.tamanoBytes },
        ip: ctx.ip ?? null,
        userAgent: ctx.userAgent ?? null,
      });
      return metadatos(a);
    } catch (error) {
      // Si el registro no se pudo guardar, no queda un archivo huerfano.
      await borrarImagenSiExiste(referencia, CARPETA_ADJUNTOS);
      throw error;
    }
  }

  async listar(entidad: EntidadAdjunto, entidadId: string) {
    const filas = await this.dataSource.getRepository(Adjunto).find({ where: { entidad, entidadId }, order: { creadoEn: 'DESC' } });
    return filas.map(metadatos);
  }

  async archivo(id: string): Promise<{ buffer: Buffer; mime: string }> {
    const a = await this.dataSource.getRepository(Adjunto).findOne({ where: { id } });
    if (!a) throw new NotFoundException('Adjunto no encontrado');
    try {
      return { buffer: await leerBufferRestringido(a.referencia, CARPETA_ADJUNTOS), mime: mimeImagenPorReferencia(a.referencia) ?? 'application/octet-stream' };
    } catch {
      throw new NotFoundException('El archivo ya no esta disponible.');
    }
  }
}
