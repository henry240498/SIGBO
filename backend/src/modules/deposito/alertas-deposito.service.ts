import { Injectable } from '@nestjs/common';
import { ArticulosService } from './articulos.service';
import { LotesArticuloService } from './lotes-articulo.service';
import { PrestamosService } from './prestamos.service';

/** Consolida las 3 alertas del pedido (stock bajo -- seccion 16, vencimiento
 * de lotes -- seccion 17, prestamo vencido -- seccion 7) en un solo lugar
 * para el dashboard. Nunca actua sola -- solo informa/sugiere (seccion 16:
 * "no realizar compras automaticamente, solo generar alerta"). */
@Injectable()
export class AlertasDepositoService {
  constructor(
    private readonly articulosService: ArticulosService,
    private readonly lotesService: LotesArticuloService,
    private readonly prestamosService: PrestamosService,
  ) {}

  async resumen() {
    const [stockBajo, vencimientos, prestamosVencidos] = await Promise.all([
      this.articulosService.findAll({ stockBajo: 'true' }),
      this.lotesService.proximosAVencer(30),
      this.prestamosService.vencidos(),
    ]);

    return {
      stockBajo: stockBajo.map((a) => ({ id: a.id, codigo: a.codigo, nombre: a.nombre, stockActual: a.stockActual, stockMinimo: a.stockMinimo })),
      vencimientos: vencimientos.map((l) => ({ id: l.id, articuloId: l.articuloId, numeroLote: l.numeroLote, fechaVencimiento: l.fechaVencimiento, cantidad: l.cantidad })),
      prestamosVencidos: prestamosVencidos.map((p) => ({ id: p.id, solicitanteBomberoId: p.solicitanteBomberoId, solicitanteExterno: p.solicitanteExterno, fechaDevolucionComprometida: p.fechaDevolucionComprometida })),
      totales: { stockBajo: stockBajo.length, vencimientos: vencimientos.length, prestamosVencidos: prestamosVencidos.length },
    };
  }
}
