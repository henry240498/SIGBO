import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bombero, IdiomaBombero, Parametro } from '../../shared/entities';
import { IdiomaDto } from './dto/idioma.dto';

@Injectable()
export class IdiomasService {
  constructor(
    @InjectRepository(IdiomaBombero) private readonly idiomaRepo: Repository<IdiomaBombero>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
  ) {}

  async listar(bomberoId: string) {
    const idiomas = await this.idiomaRepo.find({ where: { bomberoId } });
    if (idiomas.length === 0) return [];

    const parametroIds = [
      ...new Set([...idiomas.map((i) => i.idiomaId), ...idiomas.flatMap((i) => (i.nivelIdiomaId ? [i.nivelIdiomaId] : []))]),
    ];
    const parametros = await this.parametroRepo
      .createQueryBuilder('p')
      .where('p.id IN (:...ids)', { ids: parametroIds })
      .getMany();
    const mapa = new Map(parametros.map((p) => [p.id, p]));

    return idiomas
      .map((i) => ({
        id: i.id,
        idiomaId: i.idiomaId,
        idioma: mapa.get(i.idiomaId)?.nombre ?? '(parametro eliminado)',
        nivelIdiomaId: i.nivelIdiomaId,
        nivel: i.nivelIdiomaId ? mapa.get(i.nivelIdiomaId)?.nombre ?? null : null,
        certificacion: i.certificacion,
      }))
      .sort((a, b) => a.idioma.localeCompare(b.idioma));
  }

  async reemplazar(bomberoId: string, idiomas: IdiomaDto[]) {
    const bombero = await this.bomberoRepo.findOne({ where: { id: bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${bomberoId} no encontrado`);

    const idiomaIds = idiomas.map((i) => i.idiomaId);
    if (new Set(idiomaIds).size !== idiomaIds.length) {
      throw new BadRequestException('No se puede asignar el mismo idioma dos veces a la misma persona.');
    }

    await this.idiomaRepo.delete({ bomberoId });

    for (const item of idiomas) {
      await this.idiomaRepo.save(
        this.idiomaRepo.create({
          bomberoId,
          idiomaId: item.idiomaId,
          nivelIdiomaId: item.nivelIdiomaId ?? null,
          certificacion: item.certificacion ?? null,
        }),
      );
    }

    return this.listar(bomberoId);
  }
}
