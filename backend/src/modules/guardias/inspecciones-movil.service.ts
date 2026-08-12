import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistItemVehiculo, Equipo, Guardia, InspeccionMovil, Vehiculo } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateInspeccionMovilDto } from './dto/create-inspeccion-movil.dto';

/** Condicion de moviles dentro de una guardia (secciones 12/31/36-40 del
 * pedido): Guardias solo CONSULTA los vehiculos/equipos ya administrados en
 * sus propios modulos (Vehiculos/Equipos, ya construidos) -- nunca duplica
 * su almacenamiento, solo agrega el registro de "se reviso, resultado X"
 * propio del checklist de la guardia. */
@Injectable()
export class InspeccionesMovilService {
  constructor(
    @InjectRepository(InspeccionMovil) private readonly inspeccionRepo: Repository<InspeccionMovil>,
    @InjectRepository(Guardia) private readonly guardiaRepo: Repository<Guardia>,
    @InjectRepository(Vehiculo) private readonly vehiculoRepo: Repository<Vehiculo>,
    @InjectRepository(ChecklistItemVehiculo) private readonly checklistRepo: Repository<ChecklistItemVehiculo>,
    @InjectRepository(Equipo) private readonly equipoRepo: Repository<Equipo>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  private async requireGuardia(guardiaId: string) {
    const guardia = await this.guardiaRepo.findOne({ where: { id: guardiaId } });
    if (!guardia) throw new NotFoundException(`Guardia ${guardiaId} no encontrada`);
    return guardia;
  }

  /** Recupera automaticamente, para cada vehiculo no dado de baja: los items
   * de checklist aplicables (por tipo o generales) y el equipamiento que
   * tiene asignado -- toda informacion ya administrada en Vehiculos/Equipos,
   * nunca datos propios de Guardias. */
  async movilesARevisar(guardiaId: string) {
    await this.requireGuardia(guardiaId);
    const [vehiculos, items, equipos] = await Promise.all([
      this.vehiculoRepo.createQueryBuilder('v').where("v.estado <> 'BAJA'").orderBy('v.numeroInterno', 'ASC').getMany(),
      this.checklistRepo.find({ where: { activo: true }, order: { orden: 'ASC' } }),
      this.equipoRepo.createQueryBuilder('e').where('e.vehiculoAsignadoId IS NOT NULL').getMany(),
    ]);
    const equiposPorVehiculo = new Map<string, Equipo[]>();
    for (const e of equipos) {
      const lista = equiposPorVehiculo.get(e.vehiculoAsignadoId as string) ?? [];
      lista.push(e);
      equiposPorVehiculo.set(e.vehiculoAsignadoId as string, lista);
    }
    return vehiculos.map((v) => ({
      vehiculo: v,
      checklistItems: items.filter((i) => i.tipoVehiculo === null || i.tipoVehiculo === v.tipo),
      equipos: equiposPorVehiculo.get(v.id) ?? [],
    }));
  }

  async listar(guardiaId: string) {
    const inspecciones = await this.inspeccionRepo.find({ where: { guardiaId }, order: { creadoEn: 'ASC' } });
    if (inspecciones.length === 0) return [];
    const vehiculoIds = [...new Set(inspecciones.map((i) => i.vehiculoId))];
    const itemIds = [...new Set(inspecciones.map((i) => i.checklistItemId))];
    const [vehiculos, items] = await Promise.all([
      this.vehiculoRepo.createQueryBuilder('v').where('v.id IN (:...ids)', { ids: vehiculoIds }).getMany(),
      this.checklistRepo.createQueryBuilder('i').where('i.id IN (:...ids)', { ids: itemIds }).getMany(),
    ]);
    const vehiculoPorId = new Map(vehiculos.map((v) => [v.id, v]));
    const itemPorId = new Map(items.map((i) => [i.id, i]));
    return inspecciones.map((i) => ({
      ...i,
      vehiculoNombre: vehiculoPorId.get(i.vehiculoId)?.numeroInterno ?? '(desconocido)',
      checklistItemNombre: itemPorId.get(i.checklistItemId)?.nombre ?? '(desconocido)',
    }));
  }

  async crear(guardiaId: string, dto: CreateInspeccionMovilDto, actorId: string, ip?: string) {
    await this.requireGuardia(guardiaId);
    const vehiculo = await this.vehiculoRepo.findOne({ where: { id: dto.vehiculoId } });
    if (!vehiculo) throw new NotFoundException(`Vehiculo ${dto.vehiculoId} no encontrado`);
    const item = await this.checklistRepo.findOne({ where: { id: dto.checklistItemId } });
    if (!item) throw new NotFoundException(`Item de checklist ${dto.checklistItemId} no encontrado`);

    const inspeccion = await this.inspeccionRepo.save(
      this.inspeccionRepo.create({
        guardiaId,
        vehiculoId: dto.vehiculoId,
        checklistItemId: dto.checklistItemId,
        estado: dto.estado as InspeccionMovil['estado'],
        observacion: dto.observacion ?? null,
        responsableId: dto.responsableId ?? null,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'operaciones.inspecciones_movil',
      recursoId: inspeccion.id,
      datosDespues: inspeccion,
      ip: ip ?? null,
    });
    return inspeccion;
  }
}
