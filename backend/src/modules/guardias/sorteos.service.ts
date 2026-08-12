import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bombero, EsquemaHorarioGuardia, SorteoGuardia, SorteoParticipante } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { GuardiasService } from './guardias.service';
import { CrearGuardiaDesdeSorteoDto, GenerarSorteoDto } from './dto/generar-sorteo.dto';

/** Sorteo de personal para fechas especiales (seccion 20 del pedido: 8 de
 * diciembre, Nochebuena, Navidad, vispera de Ano Nuevo, Ano Nuevo). Regla de
 * candidatos, explicita del pedido: `estado='ACTIVO' AND realizaGuardiasEspeciales=true`.
 * Se persisten TODOS los elegibles (seleccionados y no) para que quede
 * trazabilidad completa de que el sorteo respeto ese criterio. */
@Injectable()
export class SorteosService {
  constructor(
    @InjectRepository(SorteoGuardia) private readonly sorteoRepo: Repository<SorteoGuardia>,
    @InjectRepository(SorteoParticipante) private readonly participanteRepo: Repository<SorteoParticipante>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(EsquemaHorarioGuardia) private readonly esquemaRepo: Repository<EsquemaHorarioGuardia>,
    private readonly auditoriaService: AuditoriaService,
    private readonly guardiasService: GuardiasService,
  ) {}

  findAll(desde?: string, hasta?: string) {
    const query = this.sorteoRepo.createQueryBuilder('s').orderBy('s.fecha', 'DESC');
    if (desde) query.andWhere('s.fecha >= :desde', { desde });
    if (hasta) query.andWhere('s.fecha <= :hasta', { hasta });
    return query.getMany();
  }

  async findOne(id: string) {
    const sorteo = await this.sorteoRepo.findOne({ where: { id } });
    if (!sorteo) throw new NotFoundException(`Sorteo ${id} no encontrado`);
    return sorteo;
  }

  async listarParticipantes(sorteoId: string) {
    await this.findOne(sorteoId);
    const participantes = await this.participanteRepo.find({ where: { sorteoId }, order: { orden: 'ASC' } });
    if (participantes.length === 0) return [];
    const bomberoIds = [...new Set(participantes.map((p) => p.bomberoId))];
    const bomberos = await this.bomberoRepo.createQueryBuilder('b').where('b.id IN (:...ids)', { ids: bomberoIds }).getMany();
    const mapa = new Map(bomberos.map((b) => [b.id, b]));
    return participantes.map((p) => ({
      ...p,
      nombreCompleto: mapa.get(p.bomberoId) ? `${mapa.get(p.bomberoId)!.nombre} ${mapa.get(p.bomberoId)!.apellido}` : '(desconocido)',
      codigoBombero: mapa.get(p.bomberoId)?.numeroBombero ?? null,
    }));
  }

  async detalle(id: string) {
    const sorteo = await this.findOne(id);
    const participantes = await this.listarParticipantes(id);
    return { sorteo, participantes };
  }

  async generar(dto: GenerarSorteoDto, actorId: string, ip?: string) {
    const candidatos = await this.bomberoRepo.find({ where: { estado: 'ACTIVO', realizaGuardiasEspeciales: true } });
    if (candidatos.length === 0) {
      throw new BadRequestException(
        'No hay candidatos elegibles: ningun bombero ACTIVO tiene marcado "Realiza guardias especiales" en su ficha',
      );
    }
    if (dto.cantidadASeleccionar > candidatos.length) {
      throw new BadRequestException(
        `Se pidio seleccionar ${dto.cantidadASeleccionar} personas pero solo hay ${candidatos.length} candidatos elegibles`,
      );
    }

    // Fisher-Yates: cada posicion queda con probabilidad uniforme.
    const barajados = [...candidatos];
    for (let i = barajados.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [barajados[i], barajados[j]] = [barajados[j], barajados[i]];
    }

    const sorteo = await this.sorteoRepo.save(
      this.sorteoRepo.create({
        fecha: dto.fecha,
        motivo: dto.motivo,
        cantidadASeleccionar: dto.cantidadASeleccionar,
        esquemaHorarioId: dto.esquemaHorarioId ?? null,
        ejecutadoPor: actorId,
      }),
    );

    const participantes: SorteoParticipante[] = [];
    for (let i = 0; i < barajados.length; i++) {
      participantes.push(
        await this.participanteRepo.save(
          this.participanteRepo.create({
            sorteoId: sorteo.id,
            bomberoId: barajados[i].id,
            seleccionado: i < dto.cantidadASeleccionar,
            orden: i,
          }),
        ),
      );
    }

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'GENERAR_SORTEO_GUARDIA',
      recurso: 'operaciones.sorteos_guardia',
      recursoId: sorteo.id,
      datosDespues: sorteo,
      metadata: {
        motivo: dto.motivo,
        candidatosElegibles: candidatos.length,
        seleccionados: participantes.filter((p) => p.seleccionado).map((p) => p.bomberoId),
        noSeleccionados: participantes.filter((p) => !p.seleccionado).map((p) => p.bomberoId),
      },
      ip: ip ?? null,
    });

    return this.detalle(sorteo.id);
  }

  /** Atajo opcional (seccion 20): arma una Guardia para la fecha del sorteo
   * usando el EsquemaHorarioGuardia indicado, con los seleccionados como
   * titulares. Reutiliza GuardiasService.asignarPersonal en vez de duplicar
   * logica de creacion/validacion de asignaciones. */
  async crearGuardiaDesdeSorteo(id: string, dto: CrearGuardiaDesdeSorteoDto, actorId: string, ip?: string) {
    const sorteo = await this.findOne(id);
    if (sorteo.guardiaId) {
      throw new BadRequestException('Este sorteo ya tiene una guardia creada');
    }
    const esquemaId = dto.esquemaHorarioId ?? sorteo.esquemaHorarioId;
    if (!esquemaId) {
      throw new BadRequestException('Indica un esquemaHorarioId (el sorteo no tenia uno definido)');
    }
    const esquema = await this.esquemaRepo.findOne({ where: { id: esquemaId } });
    if (!esquema) throw new NotFoundException(`Esquema de horario ${esquemaId} no encontrado`);

    const seleccionados = await this.participanteRepo.find({ where: { sorteoId: id, seleccionado: true } });
    if (seleccionados.length === 0) {
      throw new BadRequestException('El sorteo no tiene participantes seleccionados');
    }

    const guardia = await this.guardiasService.create(
      {
        fecha: sorteo.fecha,
        turno: esquema.cruzaMedianoche ? 'NOCTURNO' : 'DIURNO',
        horaInicio: esquema.horaInicio,
        horaFin: esquema.horaFin,
        tipo: esquema.esEspecial ? 'ESPECIAL' : 'ORDINARIA',
        observaciones: `Generada desde sorteo (${sorteo.motivo})`,
        esquemaHorarioId: esquema.id,
      },
      actorId,
      ip,
    );

    for (const p of seleccionados) {
      await this.guardiasService.asignarPersonal(guardia.id, { bomberoId: p.bomberoId, tipoParticipacion: 'TITULAR' }, actorId, ip);
    }

    await this.sorteoRepo.update(id, { guardiaId: guardia.id });
    const actualizado = await this.findOne(id);

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR_GUARDIA_DESDE_SORTEO',
      recurso: 'operaciones.sorteos_guardia',
      recursoId: id,
      datosDespues: actualizado,
      metadata: { guardiaId: guardia.id, seleccionados: seleccionados.map((p) => p.bomberoId) },
      ip: ip ?? null,
    });

    return { sorteo: actualizado, guardia };
  }
}
