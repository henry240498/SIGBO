import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdentidadInstitucional } from '../../shared/entities';
import { borrarImagenSiExiste, guardarImagen, CARPETA_IDENTIDAD_INSTITUCIONAL } from '../../shared/utils/almacenamiento';
import { ActualizarIdentidadInstitucionalDto } from './dto/actualizar-identidad-institucional.dto';

export type CampoLogo = 'logoIzquierdaUrl' | 'logoDerechaUrl';

/** Identidad documental institucional (fila unica, patron AparienciaService):
 * membrete, datos de contacto y logos reutilizables por cualquier modulo
 * que genere documentos PDF/DOCX. */
@Injectable()
export class IdentidadInstitucionalService {
  constructor(
    @InjectRepository(IdentidadInstitucional)
    private readonly repo: Repository<IdentidadInstitucional>,
  ) {}

  async obtener(): Promise<IdentidadInstitucional> {
    const [fila] = await this.repo.find({ take: 1 });
    if (fila) return fila;
    // Solo pasa en una BD nueva sin la fila sembrada por la migracion.
    return this.repo.save(this.repo.create({ nombreInstitucion: 'SIGBO' }));
  }

  /** Nunca inserta: siempre actualiza la fila unica existente. */
  async actualizar(dto: ActualizarIdentidadInstitucionalDto, actorId: string): Promise<IdentidadInstitucional> {
    const actual = await this.obtener();
    const cambios: Record<string, unknown> = { ...dto, actualizadoPor: actorId };
    if (dto.lineasDestacadas) {
      cambios.lineasDestacadas = JSON.stringify(dto.lineasDestacadas);
    }
    await this.repo.update(actual.id, cambios as any);
    return this.obtener();
  }

  async actualizarLogo(campo: CampoLogo, file: Express.Multer.File, actorId: string): Promise<IdentidadInstitucional> {
    const actual = await this.obtener();
    const rutaAnterior = actual[campo];

    const nuevaRuta = await guardarImagen(file, CARPETA_IDENTIDAD_INSTITUCIONAL);
    await this.repo.update(actual.id, { [campo]: nuevaRuta, actualizadoPor: actorId });

    await borrarImagenSiExiste(rutaAnterior, CARPETA_IDENTIDAD_INSTITUCIONAL);

    return this.obtener();
  }
}
