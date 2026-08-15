import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CuentaBancaria } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateCuentaBancariaDto, UpdateCuentaBancariaDto } from './dto/cuenta-bancaria.dto';

@Injectable()
export class CuentasBancariasService {
  constructor(
    @InjectRepository(CuentaBancaria) private readonly repo: Repository<CuentaBancaria>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(estado?: string) {
    const qb = this.repo.createQueryBuilder('c').orderBy('c.banco', 'ASC');
    if (estado) qb.andWhere('c.estado = :estado', { estado });
    return qb.getMany();
  }

  async findOne(id: string) {
    const cuenta = await this.repo.findOne({ where: { id } });
    if (!cuenta) throw new NotFoundException(`Cuenta bancaria ${id} no encontrada`);
    return cuenta;
  }

  private async verificarDuplicado(banco: string, numeroCuenta: string, idExcluido?: string) {
    const existente = await this.repo.findOne({ where: { banco, numeroCuenta } });
    if (existente && existente.id !== idExcluido) {
      throw new ConflictException(`Ya existe una cuenta registrada en ${banco} con el numero ${numeroCuenta}`);
    }
  }

  async create(dto: CreateCuentaBancariaDto, actorId: string, ip?: string) {
    await this.verificarDuplicado(dto.banco, dto.numeroCuenta);
    const cuenta = await this.repo.save(
      this.repo.create({
        banco: dto.banco,
        numeroCuenta: dto.numeroCuenta,
        tipoCuentaId: dto.tipoCuentaId ?? null,
        moneda: dto.moneda ?? 'PYG',
        responsableId: dto.responsableId ?? null,
        observacion: dto.observacion ?? null,
        creadoPor: actorId,
      }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'finanzas.cuentas_bancarias',
      recursoId: cuenta.id,
      datosDespues: cuenta,
      ip: ip ?? null,
    });
    return cuenta;
  }

  async update(id: string, dto: UpdateCuentaBancariaDto, actorId: string, ip?: string) {
    const antes = await this.findOne(id);
    if (dto.banco !== undefined || dto.numeroCuenta !== undefined) {
      await this.verificarDuplicado(dto.banco ?? antes.banco, dto.numeroCuenta ?? antes.numeroCuenta, id);
    }
    await this.repo.update(id, {
      ...(dto.banco !== undefined ? { banco: dto.banco } : {}),
      ...(dto.numeroCuenta !== undefined ? { numeroCuenta: dto.numeroCuenta } : {}),
      ...(dto.tipoCuentaId !== undefined ? { tipoCuentaId: dto.tipoCuentaId } : {}),
      ...(dto.moneda !== undefined ? { moneda: dto.moneda } : {}),
      ...(dto.responsableId !== undefined ? { responsableId: dto.responsableId } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado as any } : {}),
      ...(dto.observacion !== undefined ? { observacion: dto.observacion } : {}),
      actualizadoPor: actorId,
    });
    const despues = await this.findOne(id);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'EDITAR',
      recurso: 'finanzas.cuentas_bancarias',
      recursoId: id,
      datosAntes: antes,
      datosDespues: despues,
      ip: ip ?? null,
    });
    return despues;
  }
}
