import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NumeracionComprobante } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateNumeracionComprobanteDto } from './dto/numeracion-comprobante.dto';

/** Configuracion de numeracion de comprobantes (seccion 18 del
 * pedido): establecimiento/punto de expedicion/serie/timbrado/
 * vigencia. Solo se consume al emitir una Factura con origen=SIGBO
 * (todavia no implementado -- queda preparado). */
@Injectable()
export class NumeracionesComprobantesService {
  constructor(
    @InjectRepository(NumeracionComprobante) private readonly repo: Repository<NumeracionComprobante>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll() {
    return this.repo.find({ order: { creadoEn: 'DESC' } });
  }

  async findOne(id: string) {
    const numeracion = await this.repo.findOne({ where: { id } });
    if (!numeracion) throw new NotFoundException(`Numeracion de comprobante ${id} no encontrada`);
    return numeracion;
  }

  async create(dto: CreateNumeracionComprobanteDto, actorId: string, ip?: string) {
    if (dto.numeracionHasta < dto.numeracionDesde) throw new ConflictException('El numero final debe ser mayor o igual al inicial');

    const numeracion = await this.repo.save(
      this.repo.create({
        tipoComprobanteId: dto.tipoComprobanteId,
        establecimiento: dto.establecimiento,
        puntoExpedicion: dto.puntoExpedicion,
        serie: dto.serie ?? null,
        timbrado: dto.timbrado,
        numeracionDesde: dto.numeracionDesde,
        numeracionHasta: dto.numeracionHasta,
        vigenciaDesde: dto.vigenciaDesde,
        vigenciaHasta: dto.vigenciaHasta ?? null,
        creadoPor: actorId,
      }),
    );

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'finanzas.numeraciones_comprobantes',
      recursoId: numeracion.id,
      datosDespues: numeracion,
      ip: ip ?? null,
    });
    return numeracion;
  }
}
