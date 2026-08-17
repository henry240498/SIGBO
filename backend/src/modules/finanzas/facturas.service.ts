import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aporte, Factura, OrigenFactura } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { MovimientosFinancierosService } from './movimientos-financieros.service';
import { CreateFacturaDto } from './dto/factura.dto';

/** Registro de facturacion (seccion 15-16 del pedido). Una factura con
 * `aporteId` es documental sobre un ingreso YA registrado por el
 * Aporte -- no genera un segundo movimiento (evita duplicar el
 * ingreso). Una factura sin aporteId puede, si se pide
 * explicitamente (`generarIngreso`), registrar su propio ingreso --
 * nunca de forma implicita. */
@Injectable()
export class FacturasService {
  constructor(
    @InjectRepository(Factura) private readonly repo: Repository<Factura>,
    @InjectRepository(Aporte) private readonly aporteRepo: Repository<Aporte>,
    private readonly movimientosService: MovimientosFinancierosService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(filtros: { socioProtectorId?: string; estado?: string; origen?: string; desde?: string; hasta?: string }) {
    const qb = this.repo.createQueryBuilder('f').orderBy('f.fecha', 'DESC').addOrderBy('f.creadoEn', 'DESC');
    if (filtros.socioProtectorId) qb.andWhere('f.socioProtectorId = :socioProtectorId', { socioProtectorId: filtros.socioProtectorId });
    if (filtros.estado) qb.andWhere('f.estado = :estado', { estado: filtros.estado });
    if (filtros.origen) qb.andWhere('f.origen = :origen', { origen: filtros.origen });
    if (filtros.desde) qb.andWhere('f.fecha >= :desde', { desde: filtros.desde });
    if (filtros.hasta) qb.andWhere('f.fecha <= :hasta', { hasta: filtros.hasta });
    return qb.getMany();
  }

  async findOne(id: string) {
    const factura = await this.repo.findOne({ where: { id } });
    if (!factura) throw new NotFoundException(`Factura ${id} no encontrada`);
    return factura;
  }

  async create(dto: CreateFacturaDto, actorId: string, ip?: string) {
    const cantidad = dto.cantidad ?? 1;
    const descuento = dto.descuento ?? 0;
    const impuestos = dto.impuestos ?? 0;
    const total = cantidad * dto.precioUnitario - descuento + impuestos;
    if (total < 0) throw new BadRequestException('El total de la factura no puede ser negativo');

    const existente = await this.repo
      .createQueryBuilder('f')
      .where('f.numero = :numero', { numero: dto.numero })
      .andWhere(dto.timbrado ? 'f.timbrado = :timbrado' : 'f.timbrado IS NULL', dto.timbrado ? { timbrado: dto.timbrado } : {})
      .andWhere(dto.establecimiento ? 'f.establecimiento = :establecimiento' : 'f.establecimiento IS NULL', dto.establecimiento ? { establecimiento: dto.establecimiento } : {})
      .andWhere(dto.puntoExpedicion ? 'f.puntoExpedicion = :puntoExpedicion' : 'f.puntoExpedicion IS NULL', dto.puntoExpedicion ? { puntoExpedicion: dto.puntoExpedicion } : {})
      .getOne();
    if (existente) throw new ConflictException('Ya existe una factura registrada con esa numeracion/timbrado');

    let aporte: Aporte | null = null;
    if (dto.aporteId) {
      aporte = await this.aporteRepo.findOne({ where: { id: dto.aporteId } });
      if (!aporte) throw new NotFoundException(`Aporte ${dto.aporteId} no encontrado`);
    }

    if (dto.generarIngreso && dto.aporteId) {
      throw new BadRequestException('Una factura vinculada a un aporte no debe generar un ingreso adicional (ya existe el del aporte)');
    }
    if (dto.generarIngreso && (!dto.tipoIngresoId || (!dto.cajaId && !dto.cuentaBancariaId))) {
      throw new BadRequestException('Para generar un ingreso se requiere tipoIngresoId y caja o cuenta bancaria');
    }

    const factura = await this.repo.save(
      this.repo.create({
        origen: (dto.origen as OrigenFactura) ?? 'MANUAL',
        tipoComprobanteId: dto.tipoComprobanteId,
        numero: dto.numero,
        establecimiento: dto.establecimiento ?? null,
        puntoExpedicion: dto.puntoExpedicion ?? null,
        serie: dto.serie ?? null,
        timbrado: dto.timbrado ?? null,
        fecha: dto.fecha,
        socioProtectorId: dto.socioProtectorId ?? null,
        clienteNombre: dto.clienteNombre ?? null,
        clienteRucCi: dto.clienteRucCi ?? null,
        concepto: dto.concepto,
        detalle: dto.detalle ?? null,
        cantidad,
        precioUnitario: dto.precioUnitario,
        descuento,
        impuestos,
        total,
        moneda: dto.moneda ?? 'PYG',
        formaPagoId: dto.formaPagoId ?? null,
        aporteId: dto.aporteId ?? null,
        inscripcionAcademiaId: dto.inscripcionAcademiaId ?? null,
        archivoUrl: dto.archivoUrl ?? null,
        movimientoFinancieroId: aporte?.movimientoFinancieroId ?? null,
        creadoPor: actorId,
      }),
    );

    if (dto.generarIngreso && !dto.aporteId) {
      const movimiento = await this.movimientosService.registrar(
        {
          tipo: 'INGRESO',
          fecha: dto.fecha,
          tipoIngresoId: dto.tipoIngresoId,
          concepto: `Factura ${dto.numero} -- ${dto.concepto}`,
          importe: total,
          cajaId: dto.cajaId,
          cuentaBancariaId: dto.cuentaBancariaId,
          socioProtectorId: dto.socioProtectorId,
          facturaId: factura.id,
        },
        actorId,
        ip,
      );
      await this.repo.update(factura.id, { movimientoFinancieroId: movimiento.id });
    }

    if (dto.aporteId && aporte && !aporte.facturaId) {
      await this.aporteRepo.update(aporte.id, { facturaId: factura.id });
    }

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'finanzas.facturas',
      recursoId: factura.id,
      datosDespues: factura,
      ip: ip ?? null,
    });

    return this.findOne(factura.id);
  }

  /** Correccion NO destructiva (seccion 17 del pedido): una factura
   * "anulada" sigue existiendo tal cual se emitio, solo cambia su
   * estado -- la correccion real del importe se hace con una Nota de
   * Credito, nunca editando esta fila. */
  async anular(id: string, motivo: string, actorId: string, ip?: string) {
    const factura = await this.findOne(id);
    if (factura.estado === 'ANULADA') throw new BadRequestException('Esta factura ya esta anulada');

    await this.repo.update(id, {
      estado: 'ANULADA',
      anuladoPor: actorId,
      fechaAnulacion: new Date(),
      motivoAnulacion: motivo,
    });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ANULAR',
      recurso: 'finanzas.facturas',
      recursoId: id,
      datosAntes: factura,
      datosDespues: { estado: 'ANULADA', motivo },
      ip: ip ?? null,
    });
    return this.findOne(id);
  }
}
