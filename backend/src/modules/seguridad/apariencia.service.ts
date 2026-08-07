import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfiguracionSistema } from '../../shared/entities';
import { borrarImagenSiExiste, guardarImagen } from '../../shared/utils/almacenamiento';
import { ActualizarAparienciaDto } from './dto/actualizar-apariencia.dto';

export type CampoImagen = 'logoLogin' | 'fondoLogin' | 'logoMenu';

@Injectable()
export class AparienciaService {
  constructor(
    @InjectRepository(ConfiguracionSistema)
    private readonly repo: Repository<ConfiguracionSistema>,
  ) {}

  async obtener(): Promise<ConfiguracionSistema> {
    const [fila] = await this.repo.find({ take: 1 });
    if (fila) return fila;
    // Solo pasa en una BD nueva sin la fila sembrada por la migracion.
    return this.repo.save(this.repo.create({}));
  }

  /** Nunca inserta: siempre actualiza la fila unica existente. */
  async actualizarTextos(dto: ActualizarAparienciaDto, actorId: string): Promise<ConfiguracionSistema> {
    const actual = await this.obtener();
    await this.repo.update(actual.id, { ...dto, actualizadoPor: actorId });
    return this.obtener();
  }

  async actualizarImagen(
    campo: CampoImagen,
    file: Express.Multer.File,
    actorId: string,
  ): Promise<ConfiguracionSistema> {
    const actual = await this.obtener();
    const rutaAnterior = actual[campo];

    const nuevaRuta = await guardarImagen(file);
    await this.repo.update(actual.id, { [campo]: nuevaRuta, actualizadoPor: actorId });

    await borrarImagenSiExiste(rutaAnterior);

    return this.obtener();
  }

  /** Interruptor Libre/Fijo que gobierna si el usuario comun puede editar su propio perfil. */
  async actualizarPoliticaPerfil(perfilEdicionLibre: boolean, actorId: string): Promise<ConfiguracionSistema> {
    const actual = await this.obtener();
    await this.repo.update(actual.id, { perfilEdicionLibre, actualizadoPor: actorId });
    return this.obtener();
  }
}
