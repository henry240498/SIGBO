import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Caja, TurnoCaja } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { AbrirCajaDto, CerrarCajaDto, CreateCajaDto, UpdateCajaDto } from './dto/caja.dto';

/** Cajas fisicas de efectivo (seccion 4) y sus turnos de
 * apertura/cierre (seccion 5). `Caja.saldoActual` es mantenido
 * exclusivamente por MovimientosFinancierosService; esta clase nunca
 * lo edita directamente salvo al abrir un turno nuevo. */
@Injectable()
export class CajasService {
  constructor(
    @InjectRepository(Caja) private readonly cajaRepo: Repository<Caja>,
    @InjectRepository(TurnoCaja) private readonly turnoRepo: Repository<TurnoCaja>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(estado?: string) {
    const qb = this.cajaRepo.createQueryBuilder('c').orderBy('c.nombre', 'ASC');
    if (estado) qb.andWhere('c.estado = :estado', { estado });
    return qb.getMany();
  }

  async findOne(id: string) {
    const caja = await this.cajaRepo.findOne({ where: { id } });
    if (!caja) throw new NotFoundException(`Caja ${id} no encontrada`);
    return caja;
  }

  async create(dto: CreateCajaDto, actorId: string, ip?: string) {
    const caja = await this.cajaRepo.save(
      this.cajaRepo.create({
        nombre: dto.nombre,
        responsableId: dto.responsableId ?? null,
        observacion: dto.observacion ?? null,
        creadoPor: actorId,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'finanzas.cajas',
      recursoId: caja.id,
      datosDespues: caja,
      ip: ip ?? null,
    });
    return caja;
  }

  async update(id: string, dto: UpdateCajaDto, actorId: string, ip?: string) {
    const antes = await this.findOne(id);
    await this.cajaRepo.update(id, {
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.responsableId !== undefined ? { responsableId: dto.responsableId } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado as any } : {}),
      ...(dto.observacion !== undefined ? { observacion: dto.observacion } : {}),
      actualizadoPor: actorId,
    });
    const despues = await this.findOne(id);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'EDITAR',
      recurso: 'finanzas.cajas',
      recursoId: id,
      datosAntes: antes,
      datosDespues: despues,
      ip: ip ?? null,
    });
    return despues;
  }

  /* ------------------------------------------------------------ */
  /* Turnos (apertura/cierre)                                       */
  /* ------------------------------------------------------------ */

  turnos(cajaId: string) {
    return this.turnoRepo.find({ where: { cajaId }, order: { fechaApertura: 'DESC' } });
  }

  turnoAbierto(cajaId: string) {
    return this.turnoRepo.findOne({ where: { cajaId, estado: 'ABIERTO' } });
  }

  async abrir(cajaId: string, dto: AbrirCajaDto, actorId: string, ip?: string) {
    const caja = await this.findOne(cajaId);
    const abierto = await this.turnoAbierto(cajaId);
    if (abierto) throw new ConflictException('Esta caja ya tiene un turno abierto -- debe cerrarse antes de abrir uno nuevo');

    // `Caja.saldoActual` es un total perpetuo (nunca se reinicia por
    // turno, se mueve exclusivamente via MovimientosFinancierosService).
    // El primer turno de una caja recien creada es la unica vez que
    // `saldoInicial` establece ese punto de partida (ej. caja que ya
    // tenia efectivo antes de cargarse en SIGBO); en aperturas
    // siguientes, saldoInicial es solo el conteo fisico declarado al
    // arrancar el turno -- debe coincidir con el saldo ya trackeado, y
    // si no coincide, la diferencia quedara visible igual en el cierre
    // (nunca se ajusta silenciosamente el saldo trackeado).
    const esPrimerTurno = (await this.turnoRepo.count({ where: { cajaId } })) === 0;
    if (esPrimerTurno && caja.saldoActual === 0 && dto.saldoInicial !== 0) {
      await this.cajaRepo.update(cajaId, { saldoActual: dto.saldoInicial });
    }

    const turno = await this.turnoRepo.save(
      this.turnoRepo.create({
        cajaId,
        fechaApertura: new Date(),
        usuarioApertura: actorId,
        saldoInicial: dto.saldoInicial,
      }),
    );

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ABRIR_CAJA',
      recurso: 'finanzas.turnos_caja',
      recursoId: turno.id,
      datosDespues: turno,
      ip: ip ?? null,
    });
    return turno;
  }

  /** Saldo teorico = saldo actual de la caja en el momento del cierre
   * (mantenido por MovimientosFinancierosService movimiento a
   * movimiento). La diferencia contra el conteo fisico queda siempre
   * visible -- nunca se ajusta el saldo para que coincidan (seccion 5:
   * "Si existe diferencia: debe quedar registrada y auditada"). */
  async cerrar(cajaId: string, dto: CerrarCajaDto, actorId: string, ip?: string) {
    const caja = await this.findOne(cajaId);
    const turno = await this.turnoAbierto(cajaId);
    if (!turno) throw new BadRequestException('Esta caja no tiene un turno abierto');

    const saldoTeorico = caja.saldoActual;
    const diferencia = dto.saldoFisico - saldoTeorico;

    await this.turnoRepo.update(turno.id, {
      fechaCierre: new Date(),
      usuarioCierre: actorId,
      saldoTeorico,
      saldoFisico: dto.saldoFisico,
      diferencia,
      observacionCierre: dto.observacion ?? null,
      estado: 'CERRADO',
    });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CERRAR_CAJA',
      recurso: 'finanzas.turnos_caja',
      recursoId: turno.id,
      datosAntes: turno,
      datosDespues: { saldoTeorico, saldoFisico: dto.saldoFisico, diferencia },
      metadata: diferencia !== 0 ? { alerta: 'DIFERENCIA_DE_CAJA', diferencia } : undefined,
      ip: ip ?? null,
    });

    return this.turnoRepo.findOne({ where: { id: turno.id } });
  }
}
