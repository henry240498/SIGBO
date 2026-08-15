import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Caja, CuentaBancaria, MovimientoFinanciero, OrdenPago, Parametro } from '../../shared/entities';

/**
 * Capa de consulta de SOLO LECTURA preparada para Snoopy (seccion 33
 * del pedido). Ningun metodo escribe nada. La IA hereda exactamente
 * los permisos del usuario que consulta (RequirePermission del
 * controller) -- nunca decide autorizacion por su cuenta, nunca
 * registra movimientos, modifica importes, aprueba gastos, anula
 * operaciones ni autoriza pagos.
 */
@Injectable()
export class ConsultasFinanzasService {
  constructor(
    @InjectRepository(Caja) private readonly cajaRepo: Repository<Caja>,
    @InjectRepository(CuentaBancaria) private readonly cuentaRepo: Repository<CuentaBancaria>,
    @InjectRepository(MovimientoFinanciero) private readonly movimientoRepo: Repository<MovimientoFinanciero>,
    @InjectRepository(OrdenPago) private readonly ordenRepo: Repository<OrdenPago>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
  ) {}

  /** "Cual es el saldo actual de caja" */
  async saldoDeCajas() {
    const cajas = await this.cajaRepo.find({ where: { estado: 'ACTIVA' } });
    return {
      cajas: cajas.map((c) => ({ id: c.id, nombre: c.nombre, saldoActual: c.saldoActual })),
      total: cajas.reduce((suma, c) => suma + c.saldoActual, 0),
    };
  }

  /** "Cuanto gastamos en combustible este anio" -- por nombre de
   * categoria (CATEGORIA_EGRESO_FINANZAS) y rango de fechas. */
  async gastoPorCategoria(nombreCategoria: string, desde?: string, hasta?: string) {
    const categoria = await this.parametroRepo.findOne({ where: { tipo: 'CATEGORIA_EGRESO_FINANZAS', nombre: nombreCategoria } });
    if (!categoria) throw new NotFoundException(`Categoria de egreso '${nombreCategoria}' no encontrada`);

    const qb = this.movimientoRepo
      .createQueryBuilder('m')
      .select('SUM(m.importe)', 'total')
      .where("m.tipo = 'EGRESO' AND m.estado = 'REGISTRADO'")
      .andWhere('m.categoriaEgresoId = :categoriaId', { categoriaId: categoria.id });
    if (desde) qb.andWhere('m.fecha >= :desde', { desde });
    if (hasta) qb.andWhere('m.fecha <= :hasta', { hasta });
    const resultado = await qb.getRawOne<{ total: string | null }>();
    return { categoria: nombreCategoria, desde: desde ?? null, hasta: hasta ?? null, total: Number(resultado?.total ?? 0) };
  }

  /** "Cuanto ingreso por donaciones este mes" -- por nombre de tipo
   * (TIPO_INGRESO_FINANZAS) y rango de fechas. */
  async ingresoPorTipo(nombreTipo: string, desde?: string, hasta?: string) {
    const tipo = await this.parametroRepo.findOne({ where: { tipo: 'TIPO_INGRESO_FINANZAS', nombre: nombreTipo } });
    if (!tipo) throw new NotFoundException(`Tipo de ingreso '${nombreTipo}' no encontrado`);

    const qb = this.movimientoRepo
      .createQueryBuilder('m')
      .select('SUM(m.importe)', 'total')
      .where("m.tipo = 'INGRESO' AND m.estado = 'REGISTRADO'")
      .andWhere('m.tipoIngresoId = :tipoId', { tipoId: tipo.id });
    if (desde) qb.andWhere('m.fecha >= :desde', { desde });
    if (hasta) qb.andWhere('m.fecha <= :hasta', { hasta });
    const resultado = await qb.getRawOne<{ total: string | null }>();
    return { tipo: nombreTipo, desde: desde ?? null, hasta: hasta ?? null, total: Number(resultado?.total ?? 0) };
  }

  /** "Que facturas/ordenes estan pendientes" -- ordenes de pago que
   * todavia no llegaron a PAGADO ni a un estado terminal. */
  ordenesPendientes() {
    return this.ordenRepo
      .createQueryBuilder('o')
      .where('o.estado IN (:...estados)', { estados: ['SOLICITADO', 'PENDIENTE_AUTORIZACION', 'AUTORIZADO'] })
      .orderBy('o.creadoEn', 'ASC')
      .getMany();
  }
}
