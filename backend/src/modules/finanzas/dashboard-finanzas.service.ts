import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Caja, CuentaBancaria, MovimientoFinanciero, OrdenPago } from '../../shared/entities';

/** Indicadores de la pantalla principal de Finanzas (secciones 3 y 35
 * del pedido). Los numeros son siempre calculados en el momento, nunca
 * cacheados/desincronizables. */
@Injectable()
export class DashboardFinanzasService {
  constructor(
    @InjectRepository(Caja) private readonly cajaRepo: Repository<Caja>,
    @InjectRepository(CuentaBancaria) private readonly cuentaRepo: Repository<CuentaBancaria>,
    @InjectRepository(MovimientoFinanciero) private readonly movimientoRepo: Repository<MovimientoFinanciero>,
    @InjectRepository(OrdenPago) private readonly ordenRepo: Repository<OrdenPago>,
  ) {}

  async indicadores() {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    const inicioMesStr = inicioMes.toISOString().slice(0, 10);

    const [totalesCaja, totalesCuenta, sumaIngresosMes, sumaEgresosMes, pendientePago, recientes] = await Promise.all([
      this.cajaRepo.createQueryBuilder('c').select('SUM(c.saldoActual)', 'total').where("c.estado = 'ACTIVA'").getRawOne<{ total: string | null }>(),
      this.cuentaRepo.createQueryBuilder('c').select('SUM(c.saldoActual)', 'total').where("c.estado = 'ACTIVA'").getRawOne<{ total: string | null }>(),
      this.movimientoRepo
        .createQueryBuilder('m')
        .select('SUM(m.importe)', 'total')
        .where("m.tipo = 'INGRESO' AND m.estado = 'REGISTRADO'")
        .andWhere('m.fecha >= :inicioMes', { inicioMes: inicioMesStr })
        .getRawOne<{ total: string | null }>(),
      this.movimientoRepo
        .createQueryBuilder('m')
        .select('SUM(m.importe)', 'total')
        .where("m.tipo = 'EGRESO' AND m.estado = 'REGISTRADO'")
        .andWhere('m.fecha >= :inicioMes', { inicioMes: inicioMesStr })
        .getRawOne<{ total: string | null }>(),
      this.ordenRepo.createQueryBuilder('o').select('SUM(o.importe)', 'total').where("o.estado = 'AUTORIZADO'").getRawOne<{ total: string | null }>(),
      this.movimientoRepo.find({ where: { estado: 'REGISTRADO' }, order: { fecha: 'DESC', creadoEn: 'DESC' }, take: 15 }),
    ]);

    const saldoCajas = Number(totalesCaja?.total ?? 0);
    const saldoCuentas = Number(totalesCuenta?.total ?? 0);
    const ingresosMes = Number(sumaIngresosMes?.total ?? 0);
    const egresosMes = Number(sumaEgresosMes?.total ?? 0);

    return {
      saldoTotal: saldoCajas + saldoCuentas,
      saldoCajas,
      saldoCuentasBancarias: saldoCuentas,
      ingresosMes,
      egresosMes,
      saldoMes: ingresosMes - egresosMes,
      pendienteDePago: Number(pendientePago?.total ?? 0),
      movimientosRecientes: recientes,
    };
  }
}
