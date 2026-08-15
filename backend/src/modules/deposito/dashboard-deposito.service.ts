import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Articulo, IncidenciaDeposito, LoteArticulo, TenenciaDeposito } from '../../shared/entities';
import { AlertasDepositoService } from './alertas-deposito.service';

/** Indicadores de la pantalla principal de Deposito (seccion 18 del
 * pedido). Los numeros son siempre calculados en el momento, nunca
 * cacheados/desincronizables. */
@Injectable()
export class DashboardDepositoService {
  constructor(
    @InjectRepository(TenenciaDeposito) private readonly tenenciaRepo: Repository<TenenciaDeposito>,
    @InjectRepository(Articulo) private readonly articuloRepo: Repository<Articulo>,
    @InjectRepository(LoteArticulo) private readonly loteRepo: Repository<LoteArticulo>,
    @InjectRepository(IncidenciaDeposito) private readonly incidenciaRepo: Repository<IncidenciaDeposito>,
    private readonly alertasService: AlertasDepositoService,
  ) {}

  async indicadores() {
    const [
      elementosInventariados,
      totalArticulos,
      porEstadoRaw,
      vencidos,
      incidenciasAbiertas,
      alertas,
    ] = await Promise.all([
      this.tenenciaRepo.createQueryBuilder('t').where("t.tipoElemento = 'EQUIPO'").getCount(),
      this.articuloRepo.count(),
      this.tenenciaRepo
        .createQueryBuilder('t')
        .select('t.estadoElementoId', 'estadoElementoId')
        .addSelect('COUNT(*)', 'total')
        .groupBy('t.estadoElementoId')
        .getRawMany<{ estadoElementoId: string; total: string }>(),
      this.loteRepo.count({ where: { estado: 'VENCIDO' } }),
      this.incidenciaRepo.count({ where: { estado: 'ABIERTA' } }),
      this.alertasService.resumen(),
    ]);

    return {
      elementosInventariados,
      totalArticulos,
      porEstadoElemento: Object.fromEntries(porEstadoRaw.map((r) => [r.estadoElementoId, Number(r.total)])),
      vencidos,
      conIncidencia: incidenciasAbiertas,
      stockBajo: alertas.totales.stockBajo,
      prestamosVencidos: alertas.totales.prestamosVencidos,
      lotesProximosAVencer: alertas.totales.vencimientos,
    };
  }
}
