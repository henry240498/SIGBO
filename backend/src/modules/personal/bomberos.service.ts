import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bombero, HistorialCodigo, HistorialInstitucional } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreateBomberoDto } from './dto/create-bombero.dto';
import { UpdateBomberoDto } from './dto/update-bombero.dto';

/** Traduce un cambio de `estado` al tipo de movimiento mas especifico posible. */
function tipoMovimientoPorEstado(estadoNuevo: string): string {
  if (estadoNuevo === 'LICENCIA') return 'LICENCIA';
  if (estadoNuevo === 'SUSPENDIDO') return 'SUSPENSION';
  if (estadoNuevo === 'RETIRADO') return 'RETIRO';
  return 'CAMBIO_CONDICION';
}

/** Campos de bomberos cuyo cambio queda registrado automaticamente en historial_institucional. */
const CAMPOS_HISTORIAL: Record<string, string> = {
  condicionInstitucional: 'CAMBIO_CONDICION',
  rangoId: 'CAMBIO_RANGO',
  cargoPrincipalId: 'CAMBIO_CARGO',
  companiaId: 'CAMBIO_COMPANIA',
};

/** Tablas con datos historicos/relacionados que impiden el borrado fisico de un
 * bombero. Se consultan con SQL parametrizado porque varias viven en esquemas
 * (finanzas, documentos, deposito) que todavia no tienen entidades TypeORM
 * propias en este modulo. */
const DEPENDENCIAS_BOMBERO: Array<{ etiqueta: string; sql: string }> = [
  { etiqueta: 'especialidades', sql: 'SELECT COUNT(*) AS c FROM personal.bombero_especialidades WHERE bombero_id = @0' },
  { etiqueta: 'certificaciones', sql: 'SELECT COUNT(*) AS c FROM personal.certificaciones WHERE bombero_id = @0' },
  { etiqueta: 'historial institucional', sql: 'SELECT COUNT(*) AS c FROM personal.historial_institucional WHERE bombero_id = @0' },
  { etiqueta: 'historial de codigo', sql: 'SELECT COUNT(*) AS c FROM personal.historial_codigo WHERE bombero_id = @0' },
  { etiqueta: 'condicion de incorporado', sql: 'SELECT COUNT(*) AS c FROM personal.condicion_incorporado WHERE bombero_id = @0' },
  { etiqueta: 'condicion de combatiente', sql: 'SELECT COUNT(*) AS c FROM personal.condicion_combatiente WHERE bombero_id = @0' },
  { etiqueta: 'condicion de apoyo economico', sql: 'SELECT COUNT(*) AS c FROM personal.condicion_apoyo_economico WHERE bombero_id = @0' },
  { etiqueta: 'condicion de honorario', sql: 'SELECT COUNT(*) AS c FROM personal.condicion_honorario WHERE bombero_id = @0' },
  { etiqueta: 'actividad profesional', sql: 'SELECT COUNT(*) AS c FROM personal.actividad_profesional WHERE bombero_id = @0' },
  { etiqueta: 'idiomas', sql: 'SELECT COUNT(*) AS c FROM personal.idiomas_bombero WHERE bombero_id = @0' },
  { etiqueta: 'vehiculos autorizados', sql: 'SELECT COUNT(*) AS c FROM personal.vehiculos_autorizados WHERE bombero_id = @0' },
  { etiqueta: 'seguros', sql: 'SELECT COUNT(*) AS c FROM personal.seguros_bombero WHERE bombero_id = @0' },
  { etiqueta: 'fojas de servicio', sql: 'SELECT COUNT(*) AS c FROM personal.fojas_servicio WHERE bombero_id = @0' },
  { etiqueta: 'prestamos de equipos', sql: 'SELECT COUNT(*) AS c FROM equipos.prestamos_equipos WHERE bombero_id = @0' },
  { etiqueta: 'designaciones', sql: 'SELECT COUNT(*) AS c FROM organizacion.designaciones WHERE bombero_id = @0' },
  { etiqueta: 'ascensos', sql: 'SELECT COUNT(*) AS c FROM organizacion.ascensos WHERE bombero_id = @0' },
  { etiqueta: 'servicios (participacion)', sql: 'SELECT COUNT(*) AS c FROM servicios.personal_servicio WHERE bombero_id = @0' },
  { etiqueta: 'movimientos financieros (donante)', sql: 'SELECT COUNT(*) AS c FROM finanzas.movimientos WHERE donante_id = @0' },
  { etiqueta: 'documentos', sql: 'SELECT COUNT(*) AS c FROM documentos.documentos WHERE bombero_id = @0' },
  { etiqueta: 'movimientos de deposito', sql: 'SELECT COUNT(*) AS c FROM deposito.movimientos_deposito WHERE bombero_id = @0' },
];

@Injectable()
export class BomberosService {
  constructor(
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(HistorialCodigo) private readonly historialCodigoRepo: Repository<HistorialCodigo>,
    @InjectRepository(HistorialInstitucional)
    private readonly historialInstitucionalRepo: Repository<HistorialInstitucional>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(estado?: string) {
    return this.bomberoRepo.find({
      where: estado ? { estado: estado as any } : undefined,
      order: { apellido: 'ASC', nombre: 'ASC' },
    });
  }

  async filasExportables(estado?: string) {
    const bomberos = await this.findAll(estado);
    return bomberos.map((b) => ({
      Codigo: b.numeroBombero,
      Cedula: b.cedula,
      Nombre: b.nombre,
      Apellido: b.apellido,
      Rango: b.rango,
      Cargo: b.cargo ?? '',
      Estado: b.estado,
      Condicion: b.condicionInstitucional ?? '',
      Telefono: b.telefonoPrincipal,
      Email: b.email ?? '',
      FechaIngreso: b.fechaIngreso,
    }));
  }

  async findOne(id: string) {
    const bombero = await this.bomberoRepo.findOne({ where: { id } });
    if (!bombero) throw new NotFoundException(`Bombero ${id} no encontrado`);
    return bombero;
  }

  async create(dto: CreateBomberoDto, creadoPor: string, ip?: string) {
    const porCedula = await this.bomberoRepo.findOne({ where: { cedula: dto.cedula } });
    if (porCedula) {
      throw new ConflictException(`Ya existe un bombero registrado con la cedula ${dto.cedula}.`);
    }

    const porCodigo = await this.bomberoRepo.findOne({ where: { numeroBombero: dto.numeroBombero } });
    if (porCodigo) {
      throw new ConflictException(
        `El codigo bomberil ${dto.numeroBombero} ya se encuentra asignado a otro integrante de esta institucion.`,
      );
    }

    const bombero = this.bomberoRepo.create({
      ...dto,
      estado: (dto.estado as any) ?? 'ACTIVO',
      contactosEmergencia: '[]',
      creadoPor,
    } as unknown as Bombero);
    const guardado = await this.bomberoRepo.save(bombero);

    await this.historialInstitucionalRepo.save(
      this.historialInstitucionalRepo.create({
        bomberoId: guardado.id,
        tipoMovimiento: 'INGRESO',
        fecha: new Date().toISOString().slice(0, 10),
        usuarioResponsableId: creadoPor,
        motivo: 'Alta de personal',
      }),
    );

    await this.registrarAuditoria(creadoPor, 'CREAR', guardado.id, null, guardado, ip);

    return guardado;
  }

  async update(id: string, dto: UpdateBomberoDto, actualizadoPor: string, ip?: string) {
    const anterior = await this.findOne(id);

    if (dto.numeroBombero && dto.numeroBombero !== anterior.numeroBombero) {
      const porCodigo = await this.bomberoRepo.findOne({ where: { numeroBombero: dto.numeroBombero } });
      if (porCodigo && porCodigo.id !== id) {
        throw new ConflictException(
          `El codigo bomberil ${dto.numeroBombero} ya se encuentra asignado a otro integrante de esta institucion.`,
        );
      }
    }

    await this.bomberoRepo.update(id, { ...dto, actualizadoPor } as any);
    const fecha = new Date().toISOString().slice(0, 10);

    if (dto.numeroBombero && dto.numeroBombero !== anterior.numeroBombero) {
      await this.historialCodigoRepo.save(
        this.historialCodigoRepo.create({
          bomberoId: id,
          codigoAnterior: anterior.numeroBombero,
          codigoNuevo: dto.numeroBombero,
          motivo: 'Actualizacion de codigo institucional',
          fechaCambio: new Date(),
          cambiadoPor: actualizadoPor,
        }),
      );
      await this.historialInstitucionalRepo.save(
        this.historialInstitucionalRepo.create({
          bomberoId: id,
          tipoMovimiento: 'CAMBIO_CODIGO',
          fecha,
          usuarioResponsableId: actualizadoPor,
          motivo: `Codigo cambiado de ${anterior.numeroBombero} a ${dto.numeroBombero}`,
        }),
      );
    }

    if (dto.tipoBomberoId !== undefined && dto.tipoBomberoId !== anterior.tipoBomberoId) {
      await this.historialInstitucionalRepo.save(
        this.historialInstitucionalRepo.create({
          bomberoId: id,
          tipoMovimiento: 'CAMBIO_CONDICION',
          fecha,
          usuarioResponsableId: actualizadoPor,
          motivo: `Tipo de bombero cambiado (id anterior: ${anterior.tipoBomberoId ?? '(sin dato)'} -> ${dto.tipoBomberoId})`,
        }),
      );
    }

    for (const [campo, tipoMovimiento] of Object.entries(CAMPOS_HISTORIAL)) {
      const valorNuevo = (dto as any)[campo];
      const valorAnterior = (anterior as any)[campo];
      if (valorNuevo !== undefined && valorNuevo !== valorAnterior) {
        await this.historialInstitucionalRepo.save(
          this.historialInstitucionalRepo.create({
            bomberoId: id,
            tipoMovimiento: tipoMovimiento as any,
            fecha,
            usuarioResponsableId: actualizadoPor,
            motivo: `${campo}: ${valorAnterior ?? '(sin dato)'} -> ${valorNuevo}`,
          }),
        );
      }
    }

    if (dto.estado && dto.estado !== anterior.estado) {
      await this.historialInstitucionalRepo.save(
        this.historialInstitucionalRepo.create({
          bomberoId: id,
          tipoMovimiento: tipoMovimientoPorEstado(dto.estado) as any,
          fecha,
          usuarioResponsableId: actualizadoPor,
          motivo: `Estado cambiado de ${anterior.estado} a ${dto.estado}`,
        }),
      );
    }

    const actualizado = await this.findOne(id);
    await this.registrarAuditoria(actualizadoPor, 'ACTUALIZAR', id, anterior, actualizado, ip);
    return actualizado;
  }

  async darBaja(id: string, motivo: string, actualizadoPor: string, ip?: string) {
    const anterior = await this.findOne(id);
    await this.bomberoRepo.update(id, {
      estado: 'RETIRADO',
      fechaBaja: new Date().toISOString().slice(0, 10),
      motivoBaja: motivo,
      actualizadoPor,
    });
    await this.historialInstitucionalRepo.save(
      this.historialInstitucionalRepo.create({
        bomberoId: id,
        tipoMovimiento: 'RETIRO',
        fecha: new Date().toISOString().slice(0, 10),
        usuarioResponsableId: actualizadoPor,
        motivo,
      }),
    );
    const actualizado = await this.findOne(id);
    await this.registrarAuditoria(actualizadoPor, 'BAJA', id, anterior, actualizado, ip);
    return actualizado;
  }

  /** Elimina fisicamente un bombero, solo si no tiene NINGUN dato relacionado
   * en el resto del sistema. Si tiene, se rechaza y se sugiere usar "Dar de
   * baja" (baja logica, que preserva todo el historial). */
  async eliminarFisico(id: string, actorId: string, ip?: string) {
    const bombero = await this.findOne(id);

    const bloqueos: string[] = [];
    for (const dep of DEPENDENCIAS_BOMBERO) {
      const resultado = await this.bomberoRepo.manager.query(dep.sql, [id]);
      const cantidad = Number(resultado?.[0]?.c ?? 0);
      if (cantidad > 0) {
        bloqueos.push(`${dep.etiqueta} (${cantidad})`);
      }
    }

    if (bloqueos.length > 0) {
      throw new ConflictException(
        `No se puede eliminar fisicamente a ${bombero.nombre} ${bombero.apellido}: tiene datos relacionados en ` +
          `${bloqueos.join(', ')}. Use "Dar de baja" para preservar el historial institucional.`,
      );
    }

    await this.registrarAuditoria(actorId, 'ELIMINACION_FISICA', id, bombero, null, ip);
    await this.bomberoRepo.delete(id);
    return { eliminado: true, id };
  }

  private async registrarAuditoria(
    usuarioId: string | null,
    accion: string,
    recursoId: string,
    datosAntes: unknown,
    datosDespues: unknown,
    ip?: string,
  ) {
    await this.auditoriaService.registrar({
      usuarioId,
      accion,
      recurso: 'personal.bomberos',
      recursoId,
      ip: ip ?? null,
      datosAntes: datosAntes ?? undefined,
      datosDespues: datosDespues ?? undefined,
    });
  }
}
