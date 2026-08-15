import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento, Parametro } from '../../shared/entities';

/**
 * Capa de consulta de SOLO LECTURA preparada para Snoopy (seccion 44
 * del pedido). Nunca modifica, elimina, firma ni aprueba documentos.
 * Respeta exactamente los mismos permisos que ya evaluo el guard del
 * controller que la invoca -- no decide autorizacion por su cuenta.
 */
@Injectable()
export class ConsultasDocumentosService {
  constructor(
    @InjectRepository(Documento) private readonly repo: Repository<Documento>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
  ) {}

  /** "Donde esta el reglamento de la institucion" -- busqueda libre
   * por titulo/numero, devuelve el enlace interno (ruta de frontend). */
  async buscar(q: string) {
    const documentos = await this.repo
      .createQueryBuilder('d')
      .where('d.titulo LIKE :q OR d.numeroDocumental LIKE :q', { q: `%${q}%` })
      .orderBy('d.creadoEn', 'DESC')
      .take(10)
      .getMany();
    return documentos.map((d) => ({ id: d.id, titulo: d.titulo, numeroDocumental: d.numeroDocumental, enlace: `/dashboard/documentos/${d.id}` }));
  }

  /** "Que certificados vencen en los proximos N dias" */
  async proximosAVencer(dias = 30) {
    const hoy = new Date().toISOString().slice(0, 10);
    const limite = new Date();
    limite.setDate(limite.getDate() + dias);
    const documentos = await this.repo
      .createQueryBuilder('d')
      .where('d.fechaVencimiento >= :hoy AND d.fechaVencimiento <= :limite', { hoy, limite: limite.toISOString().slice(0, 10) })
      .orderBy('d.fechaVencimiento', 'ASC')
      .getMany();
    return documentos.map((d) => ({ id: d.id, titulo: d.titulo, fechaVencimiento: d.fechaVencimiento, enlace: `/dashboard/documentos/${d.id}` }));
  }
}
