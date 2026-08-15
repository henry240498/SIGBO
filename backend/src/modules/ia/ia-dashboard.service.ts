import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversacionIa, EjecucionHerramientaIa, MensajeIa } from '../../shared/entities';

/** Indicadores de monitoreo (secciones 47/56 del pedido). Todo calculado
 * en el momento a partir de ia.mensajes/ia.ejecuciones_herramientas --
 * mismo criterio que el resto de SIGBO: nunca se guarda un total
 * precalculado que pueda desincronizarse. Sin tokens/costo: el motor de
 * razonamiento es local, no hay proveedor externo que facture (pivote de
 * arquitectura). El indicador de "uso" pasa a ser por herramienta, que
 * es informacion real y util para decidir que temas consulta mas la gente. */
@Injectable()
export class IaDashboardService {
  constructor(
    @InjectRepository(MensajeIa) private readonly mensajeRepo: Repository<MensajeIa>,
    @InjectRepository(ConversacionIa) private readonly conversacionRepo: Repository<ConversacionIa>,
    @InjectRepository(EjecucionHerramientaIa) private readonly ejecucionRepo: Repository<EjecucionHerramientaIa>,
  ) {}

  async indicadores() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const [consultasHoy, consultasMes, errores, bloqueadas, usuariosActivos, ultimosErrores, ultimosBloqueos] = await Promise.all([
      this.mensajeRepo.createQueryBuilder('m').where("m.rol = 'IA' AND m.creadoEn >= :hoy", { hoy }).getCount(),
      this.mensajeRepo.createQueryBuilder('m').where("m.rol = 'IA' AND m.creadoEn >= :inicioMes", { inicioMes }).getCount(),
      this.mensajeRepo.createQueryBuilder('m').where("m.rol = 'IA' AND m.resultado = 'ERROR' AND m.creadoEn >= :inicioMes", { inicioMes }).getCount(),
      this.ejecucionRepo.createQueryBuilder('e').where("e.resultado = 'DENEGADO' AND e.creadoEn >= :inicioMes", { inicioMes }).getCount(),
      this.conversacionRepo.createQueryBuilder('c').select('COUNT(DISTINCT c.usuarioId)', 'total').where('c.ultimaActividadEn >= :inicioMes', { inicioMes }).getRawOne(),
      this.mensajeRepo.find({ where: { resultado: 'ERROR' }, order: { creadoEn: 'DESC' }, take: 10 }),
      this.ejecucionRepo.find({ where: { resultado: 'DENEGADO' }, order: { creadoEn: 'DESC' }, take: 10 }),
    ]);

    return {
      consultasHoy,
      consultasMes,
      errores,
      consultasBloqueadas: bloqueadas,
      usuariosActivosMes: Number(usuariosActivos?.total ?? 0),
      ultimosErrores,
      ultimosBloqueos,
    };
  }

  async usoPorHerramienta(desde?: string, hasta?: string) {
    const qb = this.ejecucionRepo
      .createQueryBuilder('e')
      .select('e.herramienta', 'herramienta')
      .addSelect('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN e.resultado = :permitido THEN 1 ELSE 0 END)', 'permitidas')
      .addSelect('SUM(CASE WHEN e.resultado = :denegado THEN 1 ELSE 0 END)', 'denegadas')
      .setParameters({ permitido: 'PERMITIDO', denegado: 'DENEGADO' })
      .groupBy('e.herramienta');
    if (desde) qb.andWhere('e.creadoEn >= :desde', { desde });
    if (hasta) qb.andWhere('e.creadoEn <= :hasta', { hasta });
    const filas = await qb.getRawMany();
    return filas
      .map((f) => ({ herramienta: f.herramienta, total: Number(f.total), permitidas: Number(f.permitidas), denegadas: Number(f.denegadas) }))
      .sort((a, b) => b.total - a.total);
  }
}
