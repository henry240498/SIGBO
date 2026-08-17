import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura, NotaCredito } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateNotaCreditoDto } from './dto/factura.dto';

/** Correccion NO destructiva de una Factura (seccion 17 del pedido):
 * esta fila se AGREGA, la factura original nunca se edita ni se
 * elimina -- la trazabilidad completa queda en ambas tablas. */
@Injectable()
export class NotasCreditoService {
  constructor(
    @InjectRepository(NotaCredito) private readonly repo: Repository<NotaCredito>,
    @InjectRepository(Factura) private readonly facturaRepo: Repository<Factura>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(filtros: { facturaId?: string }) {
    const qb = this.repo.createQueryBuilder('n').orderBy('n.fecha', 'DESC');
    if (filtros.facturaId) qb.andWhere('n.facturaId = :facturaId', { facturaId: filtros.facturaId });
    return qb.getMany();
  }

  async findOne(id: string) {
    const nota = await this.repo.findOne({ where: { id } });
    if (!nota) throw new NotFoundException(`Nota de credito ${id} no encontrada`);
    return nota;
  }

  async create(dto: CreateNotaCreditoDto, actorId: string, ip?: string) {
    const factura = await this.facturaRepo.findOne({ where: { id: dto.facturaId } });
    if (!factura) throw new NotFoundException(`Factura ${dto.facturaId} no encontrada`);
    if (factura.estado === 'ANULADA') throw new BadRequestException('No se puede emitir una nota de credito sobre una factura anulada');
    if (dto.importe > factura.total) throw new BadRequestException(`El importe de la nota (${dto.importe}) supera el total de la factura (${factura.total})`);

    const nota = await this.repo.save(
      this.repo.create({
        facturaId: dto.facturaId,
        numero: dto.numero,
        fecha: dto.fecha,
        motivoId: dto.motivoId,
        concepto: dto.concepto ?? null,
        importe: dto.importe,
        archivoUrl: dto.archivoUrl ?? null,
        creadoPor: actorId,
      }),
    );

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'finanzas.notas_credito',
      recursoId: nota.id,
      datosDespues: { ...nota, facturaOriginal: factura },
      ip: ip ?? null,
    });

    return nota;
  }
}
