import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Articulo, Equipo, Parametro, PrestamoDeposito, TenenciaDeposito } from '../../shared/entities';
import { IntegracionDepositoService } from './integracion-deposito.service';

/**
 * Capa de consulta de SOLO LECTURA preparada para Snoopy (seccion 23 del
 * pedido). Ningun metodo escribe nada. La IA hereda exactamente los
 * permisos del usuario que consulta (RequirePermission del controller) --
 * nunca decide autorizacion por su cuenta, nunca modifica inventarios,
 * nunca aprueba bajas ni registra movimientos.
 */
@Injectable()
export class ConsultasDepositoService {
  constructor(
    @InjectRepository(Articulo) private readonly articuloRepo: Repository<Articulo>,
    @InjectRepository(Equipo) private readonly equipoRepo: Repository<Equipo>,
    @InjectRepository(TenenciaDeposito) private readonly tenenciaRepo: Repository<TenenciaDeposito>,
    @InjectRepository(PrestamoDeposito) private readonly prestamoRepo: Repository<PrestamoDeposito>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
    private readonly integracionService: IntegracionDepositoService,
  ) {}

  /** "Cuantos equipos ERA disponibles tenemos" -- cuenta equipos de una
   * categoria cuya tenencia actual tiene estado "Disponible". */
  async disponiblesPorCategoria(categoriaEquipoId: string) {
    const equipos = await this.equipoRepo.find({ where: { categoriaId: categoriaEquipoId } });
    if (equipos.length === 0) return { categoriaEquipoId, total: 0, disponibles: 0 };

    const estadoDisponible = await this.parametroRepo.findOne({ where: { tipo: 'ESTADO_ELEMENTO_DEPOSITO', nombre: 'Disponible' } });
    const tenencias = await this.tenenciaRepo
      .createQueryBuilder('t')
      .where('t.equipoId IN (:...ids)', { ids: equipos.map((e) => e.id) })
      .getMany();
    const disponibles = tenencias.filter((t) => t.estadoElementoId === estadoDisponible?.id).length;

    return { categoriaEquipoId, total: equipos.length, disponibles };
  }

  /** "Quien tiene actualmente el radio RAD-005" */
  async quienTiene(equipoId: string) {
    const equipo = await this.equipoRepo.findOne({ where: { id: equipoId } });
    if (!equipo) throw new NotFoundException(`Equipo ${equipoId} no encontrado`);
    return this.integracionService.ubicacionDeEquipo(equipoId);
  }

  /** "Que prestamos estan vencidos" */
  vencidos() {
    return this.prestamoRepo
      .createQueryBuilder('p')
      .where('p.estado IN (:...estados)', { estados: ['ACTIVO', 'DEVUELTO_PARCIAL'] })
      .andWhere('p.fechaDevolucionComprometida < :ahora', { ahora: new Date() })
      .getMany();
  }

  /** "Que equipos del REGA 5 estan en mantenimiento" -- filtra por
   * vehiculo + estado, reutilizando el mismo mecanismo que el endpoint de
   * comparacion esperado-vs-real. */
  async porVehiculoYEstado(vehiculoId: string, nombreEstado: string) {
    const estado = await this.parametroRepo.findOne({ where: { tipo: 'ESTADO_ELEMENTO_DEPOSITO', nombre: nombreEstado } });
    if (!estado) throw new NotFoundException(`Estado '${nombreEstado}' no encontrado en ESTADO_ELEMENTO_DEPOSITO`);

    const tenencias = await this.tenenciaRepo.find({ where: { vehiculoId, tipoElemento: 'EQUIPO', estadoElementoId: estado.id } });
    if (tenencias.length === 0) return [];
    const equipoIds = tenencias.map((t) => t.equipoId).filter((id): id is string => !!id);
    const equipos = equipoIds.length
      ? await this.equipoRepo.createQueryBuilder('e').where('e.id IN (:...ids)', { ids: equipoIds }).getMany()
      : [];
    return equipos.map((e) => ({ id: e.id, codigoInterno: e.codigoInterno, nombre: e.nombre }));
  }
}
