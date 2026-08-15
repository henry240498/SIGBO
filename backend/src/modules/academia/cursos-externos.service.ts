import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as cheerio from 'cheerio';
import { CursoExternoCache } from '../../shared/entities';

const URL_COLECCION_OBA = 'https://oba.thinkific.com/collections';
const ORIGEN_OBA = 'https://oba.thinkific.com';
export const URL_LOGIN_OBA = 'https://oba.thinkific.com/users/sign_in';

/** Lee la coleccion PUBLICA de cursos de OBA/Thinkific y la deja en cache
 * local (secciones 19-24 del pedido). Nunca inicia sesion, nunca consulta
 * datos de un usuario particular -- solo la pagina publica de catalogo. Si
 * el sitio cambia de estructura o no responde, no rompe: deja el cache
 * anterior intacto y reporta el error. */
@Injectable()
export class CursosExternosService {
  private readonly logger = new Logger(CursosExternosService.name);

  constructor(
    @InjectRepository(CursoExternoCache) private readonly cacheRepo: Repository<CursoExternoCache>,
  ) {}

  listar() {
    return this.cacheRepo.find({ order: { titulo: 'ASC' } });
  }

  async refrescar(): Promise<{ actualizados: number }> {
    let html: string;
    try {
      const respuesta = await fetch(URL_COLECCION_OBA, {
        headers: { 'User-Agent': 'SIGBO-CBVC-Academia/1.0 (+https://oba.thinkific.com/collections)' },
        signal: AbortSignal.timeout(15000),
      });
      if (!respuesta.ok) {
        throw new Error(`OBA respondio HTTP ${respuesta.status}`);
      }
      html = await respuesta.text();
    } catch (err) {
      this.logger.warn(`No se pudo consultar OBA/Thinkific: ${(err as Error).message}`);
      throw new BadRequestException('No se pudo consultar el catalogo publico de OBA en este momento. Se mantiene el cache anterior.');
    }

    const $ = cheerio.load(html);
    const cursos: Array<{ titulo: string; url: string; imagenUrl: string | null; categoria: string | null; duracionTexto: string | null }> = [];

    $('a.course-card').each((_i, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      const titulo = $(el).find('.course-card__body h3').first().text().trim();
      if (!titulo) return;
      const categoria = $(el).find('.course-card__category').first().text().trim() || null;
      const duracionTexto = $(el).find('.course-card__lesson-count strong').first().text().trim() || null;
      const imagenSrc = $(el).find('.course-card__img-container img').first().attr('src') ?? null;
      const url = href.startsWith('http') ? href : `${ORIGEN_OBA}${href}`;
      cursos.push({ titulo, url, imagenUrl: imagenSrc, categoria, duracionTexto });
    });

    if (cursos.length === 0) {
      this.logger.warn('El parseo de OBA no encontro ningun curso -- probable cambio de estructura. Se mantiene el cache anterior.');
      throw new BadRequestException('No se encontraron cursos en la pagina de OBA (posible cambio de estructura del sitio). Se mantiene el cache anterior.');
    }

    await this.cacheRepo.manager.transaction(async (manager) => {
      await manager.createQueryBuilder().delete().from(CursoExternoCache).execute();
      const ahora = new Date();
      await manager.save(
        CursoExternoCache,
        cursos.map((c) => manager.create(CursoExternoCache, { ...c, fuente: 'OBA', actualizadoEn: ahora })),
      );
    });

    return { actualizados: cursos.length };
  }
}
