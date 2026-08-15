import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Articulo, Bombero, Equipo, Servicio, TenenciaDeposito, UbicacionDeposito, Vehiculo } from '../../shared/entities';
import { MovimientosDepositoService } from './movimientos-deposito.service';

/** Integracion de solo-consulta con Equipos y Vehiculos (seccion 2 y 9 del
 * pedido) -- Deposito nunca duplica la ficha del equipo ni la del vehiculo,
 * solo resuelve nombres legibles sobre lo que ya tiene en tenencias. */
@Injectable()
export class IntegracionDepositoService {
  constructor(
    @InjectRepository(TenenciaDeposito) private readonly tenenciaRepo: Repository<TenenciaDeposito>,
    @InjectRepository(Equipo) private readonly equipoRepo: Repository<Equipo>,
    @InjectRepository(Vehiculo) private readonly vehiculoRepo: Repository<Vehiculo>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(Servicio) private readonly servicioRepo: Repository<Servicio>,
    @InjectRepository(UbicacionDeposito) private readonly ubicacionRepo: Repository<UbicacionDeposito>,
    @InjectRepository(Articulo) private readonly articuloRepo: Repository<Articulo>,
    private readonly movimientosService: MovimientosDepositoService,
  ) {}

  /** Vista resuelta de "donde esta esto" para la ficha de un equipo
   * (ejemplo del pedido: EQUIPOS ERA-004 -> DEPOSITO Ubicacion actual /
   * Estado / Responsable). */
  async ubicacionDeEquipo(equipoId: string) {
    const equipo = await this.equipoRepo.findOne({ where: { id: equipoId } });
    if (!equipo) throw new NotFoundException(`Equipo ${equipoId} no encontrado`);

    const tenencia = await this.movimientosService.tenenciaDeEquipo(equipoId);
    if (!tenencia) return { equipoId, ubicacionActual: null, estado: null, responsable: null };

    const [ubicacion, vehiculo, bombero, servicio] = await Promise.all([
      tenencia.ubicacionId ? this.ubicacionRepo.findOne({ where: { id: tenencia.ubicacionId } }) : null,
      tenencia.vehiculoId ? this.vehiculoRepo.findOne({ where: { id: tenencia.vehiculoId } }) : null,
      tenencia.bomberoId ? this.bomberoRepo.findOne({ where: { id: tenencia.bomberoId } }) : null,
      tenencia.servicioId ? this.servicioRepo.findOne({ where: { id: tenencia.servicioId } }) : null,
    ]);

    return {
      equipoId,
      tenenciaId: tenencia.id,
      ubicacionActual: ubicacion?.nombre ?? vehiculo?.numeroInterno ?? (bombero ? `${bombero.nombre} ${bombero.apellido}` : null) ?? servicio?.numeroServicio ?? null,
      responsable: bombero ? { id: bombero.id, nombreCompleto: `${bombero.nombre} ${bombero.apellido}`, numeroBombero: bombero.numeroBombero } : null,
      vehiculo: vehiculo ? { id: vehiculo.id, numeroInterno: vehiculo.numeroInterno } : null,
      estadoElementoId: tenencia.estadoElementoId,
      actualizadoEn: tenencia.actualizadoEn,
    };
  }

  /** Equipamiento actualmente en poder de un bombero (seccion 8 del
   * pedido): elementos individuales asignados/prestados con tenencia
   * bomberoId=X, mas el stock de articulos que tenga asignado. Se muestra
   * desde la ficha de Personal sin duplicar nada -- solo lee tenencias. */
  async equipamientoDeBombero(bomberoId: string) {
    const bombero = await this.bomberoRepo.findOne({ where: { id: bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${bomberoId} no encontrado`);

    const tenencias = await this.tenenciaRepo.find({ where: { bomberoId }, order: { actualizadoEn: 'DESC' } });
    if (tenencias.length === 0) return [];

    const equipoIds = tenencias.filter((t) => t.equipoId).map((t) => t.equipoId as string);
    const articuloIds = tenencias.filter((t) => t.articuloId).map((t) => t.articuloId as string);

    const equipos = equipoIds.length
      ? await this.equipoRepo.createQueryBuilder('e').where('e.id IN (:...ids)', { ids: equipoIds }).getMany()
      : [];
    const articulos = articuloIds.length
      ? await this.articuloRepo.createQueryBuilder('a').where('a.id IN (:...ids)', { ids: articuloIds }).getMany()
      : [];
    const equipoPorId = new Map(equipos.map((e) => [e.id, e]));
    const articuloPorId = new Map(articulos.map((a) => [a.id, a]));

    return tenencias.map((t) => {
      if (t.tipoElemento === 'EQUIPO') {
        const equipo = equipoPorId.get(t.equipoId!);
        return {
          tipoElemento: 'EQUIPO' as const,
          equipoId: t.equipoId,
          codigo: equipo?.codigoInterno ?? null,
          nombre: equipo?.nombre ?? '(equipo no encontrado)',
          estadoElementoId: t.estadoElementoId,
          actualizadoEn: t.actualizadoEn,
        };
      }
      const articulo = articuloPorId.get(t.articuloId!);
      return {
        tipoElemento: 'ARTICULO' as const,
        articuloId: t.articuloId,
        codigo: articulo?.codigo ?? null,
        nombre: articulo?.nombre ?? '(articulo no encontrado)',
        cantidad: t.cantidad,
        estadoElementoId: t.estadoElementoId,
        actualizadoEn: t.actualizadoEn,
      };
    });
  }

  /** Compara "que deberia tener el vehiculo" (equipos.equipos.vehiculoAsignadoId,
   * ya gestionado por Equipos) contra "que tiene realmente" (deposito.tenencias
   * con tipoTenencia=En vehiculo para ese vehiculo) -- seccion 9 del pedido,
   * clave para las inspecciones de guardia. */
  async equipamientoDeVehiculo(vehiculoId: string) {
    const vehiculo = await this.vehiculoRepo.findOne({ where: { id: vehiculoId } });
    if (!vehiculo) throw new NotFoundException(`Vehiculo ${vehiculoId} no encontrado`);

    const [esperados, tenenciasReales] = await Promise.all([
      this.equipoRepo.find({ where: { vehiculoAsignadoId: vehiculoId } }),
      this.tenenciaRepo.find({ where: { vehiculoId, tipoElemento: 'EQUIPO' } }),
    ]);

    const idsReales = new Set(tenenciasReales.map((t) => t.equipoId));
    const idsEsperados = new Set(esperados.map((e) => e.id));

    const faltantes = esperados.filter((e) => !idsReales.has(e.id));
    const noRegistrados = tenenciasReales.filter((t) => t.equipoId && !idsEsperados.has(t.equipoId));

    return {
      vehiculoId,
      esperado: esperados.map((e) => ({ id: e.id, codigoInterno: e.codigoInterno, nombre: e.nombre, estado: e.estado })),
      real: tenenciasReales.map((t) => ({ equipoId: t.equipoId, estadoElementoId: t.estadoElementoId })),
      faltantes: faltantes.map((e) => ({ id: e.id, codigoInterno: e.codigoInterno, nombre: e.nombre })),
      noRegistradosComoAsignados: noRegistrados.map((t) => t.equipoId),
    };
  }
}
