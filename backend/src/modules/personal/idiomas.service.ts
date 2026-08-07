import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bombero, IdiomaBombero } from '../../shared/entities';
import { IdiomaDto } from './dto/idioma.dto';

@Injectable()
export class IdiomasService {
  constructor(
    @InjectRepository(IdiomaBombero) private readonly idiomaRepo: Repository<IdiomaBombero>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
  ) {}

  async listar(bomberoId: string) {
    return this.idiomaRepo.find({ where: { bomberoId }, order: { idioma: 'ASC' } });
  }

  async reemplazar(bomberoId: string, idiomas: IdiomaDto[]) {
    const bombero = await this.bomberoRepo.findOne({ where: { id: bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${bomberoId} no encontrado`);

    await this.idiomaRepo.delete({ bomberoId });

    for (const item of idiomas) {
      await this.idiomaRepo.save(
        this.idiomaRepo.create({
          bomberoId,
          idioma: item.idioma,
          nivel: item.nivel ?? null,
          certificacion: item.certificacion ?? null,
        }),
      );
    }

    return this.listar(bomberoId);
  }
}
