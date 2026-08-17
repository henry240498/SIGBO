import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AcuerdoAporte,
  Aporte,
  Bombero,
  Factura,
  MovimientoFinanciero,
  SocioHistorialCodigo,
  SocioProtector,
} from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateSocioProtectorDto, UpdateSocioProtectorDto } from './dto/socio-protector.dto';

const PREFIJO_CODIGO = 'SC';

/** Socios Protectores (personas fisicas, juridicas, o un bombero
 * existente vinculado por bomberoId -- nunca se duplica el registro
 * de Personal). El codigo visible (SC001) es independiente del PK y
 * sus cambios se auditan en SocioHistorialCodigo (seccion 3 del
 * pedido: SC001 -> SC125 debe dejar rastro). */
@Injectable()
export class SociosProtectoresService {
  constructor(
    @InjectRepository(SocioProtector) private readonly repo: Repository<SocioProtector>,
    @InjectRepository(SocioHistorialCodigo) private readonly historialRepo: Repository<SocioHistorialCodigo>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(AcuerdoAporte) private readonly acuerdoRepo: Repository<AcuerdoAporte>,
    @InjectRepository(Aporte) private readonly aporteRepo: Repository<Aporte>,
    @InjectRepository(Factura) private readonly facturaRepo: Repository<Factura>,
    @InjectRepository(MovimientoFinanciero) private readonly movimientoRepo: Repository<MovimientoFinanciero>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async findAll(filtros: { estadoId?: string; tipoPersona?: string; q?: string }) {
    const qb = this.repo.createQueryBuilder('s').orderBy('s.codigo', 'ASC');
    if (filtros.estadoId) qb.andWhere('s.estadoId = :estadoId', { estadoId: filtros.estadoId });
    if (filtros.tipoPersona) qb.andWhere('s.tipoPersona = :tipoPersona', { tipoPersona: filtros.tipoPersona });
    if (filtros.q) {
      qb.andWhere(
        '(s.codigo LIKE :q OR s.nombre LIKE :q OR s.apellido LIKE :q OR s.razonSocial LIKE :q OR s.nombreComercial LIKE :q OR s.ci LIKE :q OR s.ruc LIKE :q)',
        { q: `%${filtros.q}%` },
      );
    }
    const socios = await qb.getMany();
    return this.conDatosPersona(socios);
  }

  async findOne(id: string) {
    const socio = await this.repo.findOne({ where: { id } });
    if (!socio) throw new NotFoundException(`Socio Protector ${id} no encontrado`);
    const [conDatos] = await this.conDatosPersona([socio]);
    return conDatos;
  }

  /** Cuando el socio esta vinculado a un bombero, sus datos personales se
   * resuelven por join en vez de duplicarse en socios_protectores. */
  private async conDatosPersona(socios: SocioProtector[]) {
    const idsBombero = [...new Set(socios.map((s) => s.bomberoId).filter((id): id is string => !!id))];
    const bomberos = idsBombero.length
      ? await this.bomberoRepo.createQueryBuilder('b').where('b.id IN (:...ids)', { ids: idsBombero }).getMany()
      : [];
    const porId = new Map(bomberos.map((b): [string, Bombero] => [b.id, b]));
    return socios.map((s) => {
      const bombero = s.bomberoId ? porId.get(s.bomberoId) : undefined;
      return {
        ...s,
        nombre: bombero ? bombero.nombre : s.nombre,
        apellido: bombero ? bombero.apellido : s.apellido,
        ci: bombero ? bombero.cedula : s.ci,
        fechaNacimiento: bombero ? bombero.fechaNacimiento : s.fechaNacimiento,
        telefono: s.telefono ?? bombero?.telefonoPrincipal ?? null,
        email: s.email ?? bombero?.email ?? null,
        bomberoNumero: bombero?.numeroBombero ?? null,
      };
    });
  }

  private async sugerirCodigo(): Promise<string> {
    const ultimo = await this.repo
      .createQueryBuilder('s')
      .where('s.codigo LIKE :prefijo', { prefijo: `${PREFIJO_CODIGO}%` })
      .orderBy('s.codigo', 'DESC')
      .getOne();
    const numeroAnterior = ultimo ? parseInt(ultimo.codigo.replace(PREFIJO_CODIGO, ''), 10) || 0 : 0;
    return `${PREFIJO_CODIGO}${String(numeroAnterior + 1).padStart(3, '0')}`;
  }

  private validarPorTipo(dto: CreateSocioProtectorDto) {
    if (dto.tipoPersona === 'FISICA') {
      if (!dto.bomberoId && (!dto.nombre || !dto.apellido || !dto.ci)) {
        throw new BadRequestException('Persona fisica: se requiere nombre, apellido y CI (o vincular un bombero existente)');
      }
    } else if (dto.tipoPersona === 'JURIDICA') {
      if (!dto.razonSocial || !dto.ruc) {
        throw new BadRequestException('Persona juridica: se requiere razon social y RUC');
      }
    }
  }

  async create(dto: CreateSocioProtectorDto, actorId: string, ip?: string) {
    this.validarPorTipo(dto);

    if (dto.bomberoId) {
      const bombero = await this.bomberoRepo.findOne({ where: { id: dto.bomberoId } });
      if (!bombero) throw new NotFoundException(`Bombero ${dto.bomberoId} no encontrado`);
      const yaVinculado = await this.repo.findOne({ where: { bomberoId: dto.bomberoId } });
      if (yaVinculado) throw new ConflictException('Este bombero ya esta vinculado a otro Socio Protector');
    }

    const codigo = dto.codigo?.trim() || (await this.sugerirCodigo());
    const existente = await this.repo.findOne({ where: { codigo } });
    if (existente) throw new ConflictException(`Ya existe un Socio Protector con el codigo ${codigo}`);

    const socio = await this.repo.save(
      this.repo.create({
        codigo,
        tipoPersona: dto.tipoPersona as any,
        bomberoId: dto.bomberoId ?? null,
        // Si esta vinculado a un bombero, no se duplican sus datos personales.
        nombre: dto.bomberoId ? null : dto.nombre ?? null,
        apellido: dto.bomberoId ? null : dto.apellido ?? null,
        ci: dto.bomberoId ? null : dto.ci ?? null,
        fechaNacimiento: dto.bomberoId ? null : dto.fechaNacimiento ?? null,
        razonSocial: dto.razonSocial ?? null,
        ruc: dto.ruc ?? null,
        nombreComercial: dto.nombreComercial ?? null,
        representanteNombre: dto.representanteNombre ?? null,
        representanteCi: dto.representanteCi ?? null,
        telefono: dto.telefono ?? null,
        celular: dto.celular ?? null,
        email: dto.email ?? null,
        direccion: dto.direccion ?? null,
        paisId: dto.paisId ?? null,
        departamentoId: dto.departamentoId ?? null,
        ciudadId: dto.ciudadId ?? null,
        barrioId: dto.barrioId ?? null,
        estadoId: dto.estadoId,
        observaciones: dto.observaciones ?? null,
        creadoPor: actorId,
      }),
    );

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'finanzas.socios_protectores',
      recursoId: socio.id,
      datosDespues: socio,
      ip: ip ?? null,
    });
    return this.findOne(socio.id);
  }

  async update(id: string, dto: UpdateSocioProtectorDto, actorId: string, ip?: string) {
    const anterior = await this.repo.findOne({ where: { id } });
    if (!anterior) throw new NotFoundException(`Socio Protector ${id} no encontrado`);

    const nuevoCodigo = dto.codigo?.trim();
    if (nuevoCodigo && nuevoCodigo !== anterior.codigo) {
      const existente = await this.repo.findOne({ where: { codigo: nuevoCodigo } });
      if (existente && existente.id !== id) throw new ConflictException(`Ya existe un Socio Protector con el codigo ${nuevoCodigo}`);
    }

    if (dto.bomberoId && dto.bomberoId !== anterior.bomberoId) {
      const yaVinculado = await this.repo.findOne({ where: { bomberoId: dto.bomberoId } });
      if (yaVinculado && yaVinculado.id !== id) throw new ConflictException('Este bombero ya esta vinculado a otro Socio Protector');
    }

    const bomberoId = dto.bomberoId !== undefined ? dto.bomberoId ?? null : anterior.bomberoId;

    await this.repo.update(id, {
      ...(nuevoCodigo ? { codigo: nuevoCodigo } : {}),
      ...(dto.tipoPersona ? { tipoPersona: dto.tipoPersona as any } : {}),
      bomberoId,
      nombre: bomberoId ? null : dto.nombre !== undefined ? dto.nombre : anterior.nombre,
      apellido: bomberoId ? null : dto.apellido !== undefined ? dto.apellido : anterior.apellido,
      ci: bomberoId ? null : dto.ci !== undefined ? dto.ci : anterior.ci,
      fechaNacimiento: bomberoId ? null : dto.fechaNacimiento !== undefined ? dto.fechaNacimiento : anterior.fechaNacimiento,
      ...(dto.razonSocial !== undefined ? { razonSocial: dto.razonSocial } : {}),
      ...(dto.ruc !== undefined ? { ruc: dto.ruc } : {}),
      ...(dto.nombreComercial !== undefined ? { nombreComercial: dto.nombreComercial } : {}),
      ...(dto.representanteNombre !== undefined ? { representanteNombre: dto.representanteNombre } : {}),
      ...(dto.representanteCi !== undefined ? { representanteCi: dto.representanteCi } : {}),
      ...(dto.telefono !== undefined ? { telefono: dto.telefono } : {}),
      ...(dto.celular !== undefined ? { celular: dto.celular } : {}),
      ...(dto.email !== undefined ? { email: dto.email } : {}),
      ...(dto.direccion !== undefined ? { direccion: dto.direccion } : {}),
      ...(dto.paisId !== undefined ? { paisId: dto.paisId } : {}),
      ...(dto.departamentoId !== undefined ? { departamentoId: dto.departamentoId } : {}),
      ...(dto.ciudadId !== undefined ? { ciudadId: dto.ciudadId } : {}),
      ...(dto.barrioId !== undefined ? { barrioId: dto.barrioId } : {}),
      ...(dto.estadoId ? { estadoId: dto.estadoId } : {}),
      ...(dto.observaciones !== undefined ? { observaciones: dto.observaciones } : {}),
      actualizadoPor: actorId,
    });

    if (nuevoCodigo && nuevoCodigo !== anterior.codigo) {
      await this.historialRepo.save(
        this.historialRepo.create({
          socioProtectorId: id,
          codigoAnterior: anterior.codigo,
          codigoNuevo: nuevoCodigo,
          motivo: dto.motivoCambioCodigo ?? null,
          fechaCambio: new Date(),
          cambiadoPor: actorId,
        }),
      );
      await this.auditoriaService.registrar({
        usuarioId: actorId,
        accion: 'CAMBIAR_CODIGO',
        recurso: 'finanzas.socios_protectores',
        recursoId: id,
        datosAntes: { codigo: anterior.codigo },
        datosDespues: { codigo: nuevoCodigo, motivo: dto.motivoCambioCodigo ?? null },
        ip: ip ?? null,
      });
    }

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'EDITAR',
      recurso: 'finanzas.socios_protectores',
      recursoId: id,
      datosAntes: anterior,
      ip: ip ?? null,
    });

    return this.findOne(id);
  }

  async historialCodigo(id: string) {
    return this.historialRepo.find({ where: { socioProtectorId: id }, order: { fechaCambio: 'DESC' } });
  }

  /** Vista consolidada del socio: acuerdos, aportes, facturas y notas de
   * credito relacionadas, mas totales simples. No se inventan reglas de
   * "cumplimiento" no definidas por la institucion (seccion 6 y 39 del
   * pedido) -- se muestran los datos, el criterio de cumplimiento queda
   * para cuando la institucion lo defina. */
  async estadoDeCuenta(id: string) {
    await this.findOne(id);

    const [acuerdos, aportes, facturas] = await Promise.all([
      this.acuerdoRepo.find({ where: { socioProtectorId: id }, order: { fechaInicio: 'DESC' } }),
      this.aporteRepo.find({ where: { socioProtectorId: id }, order: { fecha: 'DESC' } }),
      this.facturaRepo.find({ where: { socioProtectorId: id }, order: { fecha: 'DESC' } }),
    ]);

    const aportesVigentes = aportes.filter((a) => a.estado === 'REGISTRADO');
    const totalAportado = aportesVigentes.filter((a) => !a.esExtraordinario).reduce((acc, a) => acc + Number(a.monto), 0);
    const totalExtraordinario = aportesVigentes.filter((a) => a.esExtraordinario).reduce((acc, a) => acc + Number(a.monto), 0);

    const resumenPorAcuerdo = acuerdos.map((acuerdo) => {
      const aportadoAlAcuerdo = aportesVigentes
        .filter((a) => a.acuerdoAporteId === acuerdo.id)
        .reduce((acc, a) => acc + Number(a.monto), 0);
      return { acuerdo, aportadoAlAcuerdo };
    });

    return {
      socio: await this.findOne(id),
      acuerdos: resumenPorAcuerdo,
      aportes,
      facturas,
      totales: {
        totalAportado,
        totalExtraordinario,
        totalGeneral: totalAportado + totalExtraordinario,
      },
    };
  }
}
