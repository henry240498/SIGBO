import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CuentaBancaria, MovimientoBancario, MovimientoFinanciero } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { ConciliarMovimientoBancarioDto, CreateMovimientoBancarioDto } from './dto/movimiento-bancario.dto';

/** Extracto bancario cargado a mano en SIGBO (seccion 12) con
 * conciliacion simple (seccion 13): nunca ajusta automaticamente un
 * movimiento para hacerlo coincidir -- solo marca el estado, la
 * diferencia queda visible para revision manual. */
@Injectable()
export class MovimientosBancariosService {
  constructor(
    @InjectRepository(MovimientoBancario) private readonly repo: Repository<MovimientoBancario>,
    @InjectRepository(CuentaBancaria) private readonly cuentaRepo: Repository<CuentaBancaria>,
    @InjectRepository(MovimientoFinanciero) private readonly movimientoFinancieroRepo: Repository<MovimientoFinanciero>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(filtros: { cuentaBancariaId?: string; estadoConciliacion?: string; desde?: string; hasta?: string }) {
    const qb = this.repo.createQueryBuilder('m').orderBy('m.fecha', 'DESC');
    if (filtros.cuentaBancariaId) qb.andWhere('m.cuentaBancariaId = :cuentaBancariaId', { cuentaBancariaId: filtros.cuentaBancariaId });
    if (filtros.estadoConciliacion) qb.andWhere('m.estadoConciliacion = :estadoConciliacion', { estadoConciliacion: filtros.estadoConciliacion });
    if (filtros.desde) qb.andWhere('m.fecha >= :desde', { desde: filtros.desde });
    if (filtros.hasta) qb.andWhere('m.fecha <= :hasta', { hasta: filtros.hasta });
    return qb.getMany();
  }

  async findOne(id: string) {
    const movimiento = await this.repo.findOne({ where: { id } });
    if (!movimiento) throw new NotFoundException(`Movimiento bancario ${id} no encontrado`);
    return movimiento;
  }

  async create(dto: CreateMovimientoBancarioDto, actorId: string, ip?: string) {
    const cuenta = await this.cuentaRepo.findOne({ where: { id: dto.cuentaBancariaId } });
    if (!cuenta) throw new NotFoundException(`Cuenta bancaria ${dto.cuentaBancariaId} no encontrada`);
    if (dto.movimientoFinancieroId) {
      const asociado = await this.movimientoFinancieroRepo.findOne({ where: { id: dto.movimientoFinancieroId } });
      if (!asociado) throw new NotFoundException(`Movimiento financiero ${dto.movimientoFinancieroId} no encontrado`);
    }

    const movimiento = await this.repo.save(
      this.repo.create({
        cuentaBancariaId: dto.cuentaBancariaId,
        tipo: dto.tipo as any,
        fecha: dto.fecha,
        importe: dto.importe,
        descripcion: dto.descripcion,
        movimientoFinancieroId: dto.movimientoFinancieroId ?? null,
        observacion: dto.observacion ?? null,
        creadoPor: actorId,
      }),
    );

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'finanzas.movimientos_bancarios',
      recursoId: movimiento.id,
      datosDespues: movimiento,
      ip: ip ?? null,
    });
    return movimiento;
  }

  async conciliar(id: string, dto: ConciliarMovimientoBancarioDto, actorId: string, ip?: string) {
    const movimiento = await this.findOne(id);
    if (movimiento.estadoConciliacion === 'CONCILIADO') throw new BadRequestException('Este movimiento ya esta conciliado');

    await this.repo.update(id, {
      estadoConciliacion: dto.estadoConciliacion as any,
      fechaConciliacion: new Date(),
      conciliadoPor: actorId,
      observacion: dto.observacion ?? movimiento.observacion,
    });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CONCILIAR',
      recurso: 'finanzas.movimientos_bancarios',
      recursoId: id,
      datosAntes: movimiento,
      datosDespues: { estadoConciliacion: dto.estadoConciliacion },
      ip: ip ?? null,
    });
    return this.findOne(id);
  }
}
