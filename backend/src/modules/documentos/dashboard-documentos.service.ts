import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento, Parametro } from '../../shared/entities';

/** Indicadores de la pantalla principal de Documentos (seccion 36 del
 * pedido). Siempre calculados en el momento, nunca cacheados. */
@Injectable()
export class DashboardDocumentosService {
  constructor(
    @InjectRepository(Documento) private readonly repo: Repository<Documento>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
  ) {}

  async indicadores() {
    const hoy = new Date().toISOString().slice(0, 10);
    const limite = new Date();
    limite.setDate(limite.getDate() + 30);
    const limiteStr = limite.toISOString().slice(0, 10);

    const [estadoBorrador, estadoVigente, estadoPublicado, estadoFirmado, estadoAprobado] = await Promise.all([
      this.parametroRepo.findOne({ where: { tipo: 'ESTADO_DOCUMENTO', nombre: 'Borrador' } }),
      this.parametroRepo.findOne({ where: { tipo: 'ESTADO_DOCUMENTO', nombre: 'Vigente' } }),
      this.parametroRepo.findOne({ where: { tipo: 'ESTADO_DOCUMENTO', nombre: 'Publicado' } }),
      this.parametroRepo.findOne({ where: { tipo: 'ESTADO_DOCUMENTO', nombre: 'Firmado' } }),
      this.parametroRepo.findOne({ where: { tipo: 'ESTADO_DOCUMENTO', nombre: 'Aprobado' } }),
    ]);
    const idsVigentes = [estadoVigente?.id, estadoPublicado?.id, estadoFirmado?.id, estadoAprobado?.id].filter((id): id is string => !!id);

    const [total, vigentes, proximosAVencer, vencidos, borradores, recientes, proximos, ultimosCargados, ultimosModificados] = await Promise.all([
      this.repo.count(),
      idsVigentes.length ? this.repo.createQueryBuilder('d').where('d.estadoId IN (:...ids)', { ids: idsVigentes }).getCount() : 0,
      this.repo
        .createQueryBuilder('d')
        .where('d.fechaVencimiento >= :hoy AND d.fechaVencimiento <= :limite', { hoy, limite: limiteStr })
        .getCount(),
      this.repo.createQueryBuilder('d').where('d.fechaVencimiento < :hoy', { hoy }).getCount(),
      estadoBorrador ? this.repo.count({ where: { estadoId: estadoBorrador.id } }) : 0,
      this.repo.find({ order: { creadoEn: 'DESC' }, take: 10 }),
      this.repo
        .createQueryBuilder('d')
        .where('d.fechaVencimiento >= :hoy AND d.fechaVencimiento <= :limite', { hoy, limite: limiteStr })
        .orderBy('d.fechaVencimiento', 'ASC')
        .take(10)
        .getMany(),
      this.repo.find({ order: { creadoEn: 'DESC' }, take: 10 }),
      this.repo.find({ order: { actualizadoEn: 'DESC' }, take: 10 }),
    ]);

    return { total, vigentes, proximosAVencer, vencidos, borradores, recientes, proximosAVencerDetalle: proximos, ultimosCargados, ultimosModificados };
  }
}
