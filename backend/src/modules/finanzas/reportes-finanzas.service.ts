import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Bombero,
  Caja,
  Cargo,
  CuentaBancaria,
  Designacion,
  DocumentoRespaldo,
  IdentidadInstitucional,
  MovimientoFinanciero,
  Parametro,
  ProveedorDeposito,
  Rango,
} from '../../shared/entities';
import { resolverEncabezadoInstitucional } from '../../shared/utils/identidad-institucional';
import { resolverFirmante } from '../../shared/utils/firmantes-institucionales';
import { generarComprobanteFinancieroPdf } from '../../shared/utils/reporte-comprobante-financiero-pdf';
import { guardarBuffer } from '../../shared/utils/almacenamiento';

const CARPETA_REPORTES = 'reportes-finanzas';

/** Genera el comprobante de un movimiento financiero (secciones 6, 8,
 * 10, 24 del pedido), reutilizando el mismo motor documental (membrete
 * institucional + firmante por cargo) que Academia y Ordenes de
 * Guardia -- ver shared/utils/identidad-institucional.ts y
 * firmantes-institucionales.ts. Las exportaciones tabulares (Excel/PDF
 * de grillas) usan directamente el exportador generico del proyecto
 * (shared/utils/excel.ts, pdf.ts) desde el controller, sin pasar por
 * este service. */
@Injectable()
export class ReportesFinanzasService {
  constructor(
    @InjectRepository(MovimientoFinanciero) private readonly movimientoRepo: Repository<MovimientoFinanciero>,
    @InjectRepository(DocumentoRespaldo) private readonly documentoRepo: Repository<DocumentoRespaldo>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
    @InjectRepository(Caja) private readonly cajaRepo: Repository<Caja>,
    @InjectRepository(CuentaBancaria) private readonly cuentaRepo: Repository<CuentaBancaria>,
    @InjectRepository(ProveedorDeposito) private readonly proveedorRepo: Repository<ProveedorDeposito>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(IdentidadInstitucional) private readonly identidadRepo: Repository<IdentidadInstitucional>,
    @InjectRepository(Cargo) private readonly cargoRepo: Repository<Cargo>,
    @InjectRepository(Designacion) private readonly designacionRepo: Repository<Designacion>,
    @InjectRepository(Rango) private readonly rangoRepo: Repository<Rango>,
  ) {}

  async generarComprobantePdf(movimientoId: string, cargoFirmanteId?: string): Promise<string> {
    const movimiento = await this.movimientoRepo.findOne({ where: { id: movimientoId } });
    if (!movimiento) throw new NotFoundException(`Movimiento ${movimientoId} no encontrado`);

    const [clasificacion, caja, cuenta, proveedor, bombero, documento, institucional, firmante] = await Promise.all([
      movimiento.tipo === 'INGRESO'
        ? movimiento.tipoIngresoId ? this.parametroRepo.findOne({ where: { id: movimiento.tipoIngresoId } }) : null
        : movimiento.categoriaEgresoId ? this.parametroRepo.findOne({ where: { id: movimiento.categoriaEgresoId } }) : null,
      movimiento.cajaId ? this.cajaRepo.findOne({ where: { id: movimiento.cajaId } }) : null,
      movimiento.cuentaBancariaId ? this.cuentaRepo.findOne({ where: { id: movimiento.cuentaBancariaId } }) : null,
      movimiento.proveedorId ? this.proveedorRepo.findOne({ where: { id: movimiento.proveedorId } }) : null,
      movimiento.bomberoId ? this.bomberoRepo.findOne({ where: { id: movimiento.bomberoId } }) : null,
      this.documentoRepo.findOne({ where: { movimientoId } }),
      resolverEncabezadoInstitucional(this.identidadRepo),
      cargoFirmanteId
        ? resolverFirmante(
            { cargoRepo: this.cargoRepo, designacionRepo: this.designacionRepo, bomberoRepo: this.bomberoRepo, rangoRepo: this.rangoRepo },
            cargoFirmanteId,
            null,
          )
        : Promise.resolve(null),
    ]);

    const tipoDocumento = documento?.tipoDocumentoId ? await this.parametroRepo.findOne({ where: { id: documento.tipoDocumentoId } }) : null;

    const buffer = await generarComprobanteFinancieroPdf({
      generadoEn: new Date().toISOString(),
      institucional,
      movimiento: {
        tipo: movimiento.tipo,
        fecha: movimiento.fecha,
        concepto: movimiento.concepto,
        importe: movimiento.importe,
        moneda: movimiento.moneda,
        clasificacion: clasificacion?.nombre ?? null,
        origenDestino: caja?.nombre ?? (cuenta ? `${cuenta.banco} - ${cuenta.numeroCuenta}` : '-'),
        proveedor: proveedor?.razonSocial ?? null,
        personaRelacionada: bombero ? `${bombero.nombre} ${bombero.apellido}` : movimiento.entidadExterna,
        responsable: null,
        observacion: movimiento.observacion,
        estado: movimiento.estado,
      },
      documento: documento ? { tipo: tipoDocumento?.nombre ?? 'Documento', numero: documento.numero, timbrado: documento.timbrado } : null,
      firmante,
    });

    return guardarBuffer(buffer, '.pdf', CARPETA_REPORTES);
  }
}
