import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AcuerdoAporte,
  Aporte,
  Caja,
  CuentaBancaria,
  Factura,
  MovimientoFinanciero,
  NotaCredito,
  OrdenPago,
  Parametro,
  SocioProtector,
} from '../../shared/entities';

/** Indicadores de la pantalla principal de Finanzas (secciones 3 y 35
 * del pedido). Los numeros son siempre calculados en el momento, nunca
 * cacheados/desincronizables. `sociosSinAporteEsteMes` es una
 * definicion simple y literal (socio activo con acuerdo activo sin
 * ningun aporte registrado en el mes) -- no se inventa una regla de
 * "cumplimiento" institucional que no fue definida (seccion 39). */
@Injectable()
export class DashboardFinanzasService {
  constructor(
    @InjectRepository(Caja) private readonly cajaRepo: Repository<Caja>,
    @InjectRepository(CuentaBancaria) private readonly cuentaRepo: Repository<CuentaBancaria>,
    @InjectRepository(MovimientoFinanciero) private readonly movimientoRepo: Repository<MovimientoFinanciero>,
    @InjectRepository(OrdenPago) private readonly ordenRepo: Repository<OrdenPago>,
    @InjectRepository(SocioProtector) private readonly socioRepo: Repository<SocioProtector>,
    @InjectRepository(AcuerdoAporte) private readonly acuerdoRepo: Repository<AcuerdoAporte>,
    @InjectRepository(Aporte) private readonly aporteRepo: Repository<Aporte>,
    @InjectRepository(Factura) private readonly facturaRepo: Repository<Factura>,
    @InjectRepository(NotaCredito) private readonly notaCreditoRepo: Repository<NotaCredito>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
  ) {}

  async indicadores() {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    const inicioMesStr = inicioMes.toISOString().slice(0, 10);

    const [tipoServicios, tipoAcademia, estadoSocioActivo] = await Promise.all([
      this.parametroRepo.findOne({ where: { tipo: 'TIPO_INGRESO_FINANZAS', nombreNormalizado: 'servicios' } }),
      this.parametroRepo.findOne({ where: { tipo: 'TIPO_INGRESO_FINANZAS', nombreNormalizado: 'academia' } }),
      this.parametroRepo.findOne({ where: { tipo: 'ESTADO_SOCIO_PROTECTOR', nombreNormalizado: 'activo' } }),
    ]);

    const [
      totalesCaja,
      totalesCuenta,
      sumaIngresosMes,
      sumaEgresosMes,
      pendientePago,
      recientes,
      sumaAportesMes,
      sumaAportesExtraordinariosMes,
      sociosActivos,
      acuerdosActivos,
      facturacionMes,
      notasCreditoMes,
      ingresosServiciosMes,
      ingresosAcademiaMes,
    ] = await Promise.all([
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
      this.aporteRepo
        .createQueryBuilder('a')
        .select('SUM(a.monto)', 'total')
        .where("a.estado = 'REGISTRADO' AND a.esExtraordinario = 0")
        .andWhere('a.fecha >= :inicioMes', { inicioMes: inicioMesStr })
        .getRawOne<{ total: string | null }>(),
      this.aporteRepo
        .createQueryBuilder('a')
        .select('SUM(a.monto)', 'total')
        .where("a.estado = 'REGISTRADO' AND a.esExtraordinario = 1")
        .andWhere('a.fecha >= :inicioMes', { inicioMes: inicioMesStr })
        .getRawOne<{ total: string | null }>(),
      estadoSocioActivo ? this.socioRepo.count({ where: { estadoId: estadoSocioActivo.id } }) : 0,
      this.acuerdoRepo.find({ where: { estado: 'ACTIVO' } }),
      this.facturaRepo
        .createQueryBuilder('f')
        .select('SUM(f.total)', 'total')
        .where("f.estado = 'EMITIDA'")
        .andWhere('f.fecha >= :inicioMes', { inicioMes: inicioMesStr })
        .getRawOne<{ total: string | null }>(),
      this.notaCreditoRepo
        .createQueryBuilder('n')
        .select('SUM(n.importe)', 'total')
        .where("n.estado = 'EMITIDA'")
        .andWhere('n.fecha >= :inicioMes', { inicioMes: inicioMesStr })
        .getRawOne<{ total: string | null }>(),
      tipoServicios
        ? this.movimientoRepo
            .createQueryBuilder('m')
            .select('SUM(m.importe)', 'total')
            .where("m.tipo = 'INGRESO' AND m.estado = 'REGISTRADO'")
            .andWhere('m.tipoIngresoId = :id', { id: tipoServicios.id })
            .andWhere('m.fecha >= :inicioMes', { inicioMes: inicioMesStr })
            .getRawOne<{ total: string | null }>()
        : null,
      tipoAcademia
        ? this.movimientoRepo
            .createQueryBuilder('m')
            .select('SUM(m.importe)', 'total')
            .where("m.tipo = 'INGRESO' AND m.estado = 'REGISTRADO'")
            .andWhere('m.tipoIngresoId = :id', { id: tipoAcademia.id })
            .andWhere('m.fecha >= :inicioMes', { inicioMes: inicioMesStr })
            .getRawOne<{ total: string | null }>()
        : null,
    ]);

    const saldoCajas = Number(totalesCaja?.total ?? 0);
    const saldoCuentas = Number(totalesCuenta?.total ?? 0);
    const ingresosMes = Number(sumaIngresosMes?.total ?? 0);
    const egresosMes = Number(sumaEgresosMes?.total ?? 0);

    let sociosSinAporteEsteMes = 0;
    if (acuerdosActivos.length > 0) {
      const aportesDelMes = await this.aporteRepo
        .createQueryBuilder('a')
        .select('DISTINCT a.socioProtectorId', 'socioProtectorId')
        .where("a.estado = 'REGISTRADO'")
        .andWhere('a.fecha >= :inicioMes', { inicioMes: inicioMesStr })
        .getRawMany<{ socioProtectorId: string }>();
      const conAporteEsteMes = new Set(aportesDelMes.map((a) => a.socioProtectorId));
      const sociosConAcuerdo = new Set(acuerdosActivos.map((a) => a.socioProtectorId));
      sociosSinAporteEsteMes = [...sociosConAcuerdo].filter((id) => !conAporteEsteMes.has(id)).length;
    }

    return {
      saldoTotal: saldoCajas + saldoCuentas,
      saldoCajas,
      saldoCuentasBancarias: saldoCuentas,
      ingresosMes,
      egresosMes,
      saldoMes: ingresosMes - egresosMes,
      pendienteDePago: Number(pendientePago?.total ?? 0),
      movimientosRecientes: recientes,
      sociosProtectores: {
        activos: sociosActivos,
        sinAporteEsteMes: sociosSinAporteEsteMes,
        aportesMes: Number(sumaAportesMes?.total ?? 0),
        aportesExtraordinariosMes: Number(sumaAportesExtraordinariosMes?.total ?? 0),
      },
      facturacion: {
        totalMes: Number(facturacionMes?.total ?? 0),
        notasCreditoMes: Number(notasCreditoMes?.total ?? 0),
      },
      ingresosPorOrigen: {
        servicios: Number(ingresosServiciosMes?.total ?? 0),
        academia: Number(ingresosAcademiaMes?.total ?? 0),
      },
    };
  }
}
