import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropuestaMejoraIa } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CreatePropuestaMejoraDto, DecidirPropuestaMejoraDto } from './dto/propuesta-mejora.dto';

/** BORRADOR -> PROPUESTA -> REVISION -> APROBADO/RECHAZADO -> PUBLICADO
 * (secciones 36-39 del pedido). La IA puede ORIGINAR una propuesta
 * (`origen='IA'`, sin `creadoPor`) analizando conversaciones, pero jamas
 * aprueba, rechaza ni publica la suya propia -- eso siempre lo hace un
 * usuario con `inteligencia:gestionar_mejoras` (seccion 37: "la IA no se
 * modifica a si misma"). "Publicar" tampoco reprograma nada solo: deja la
 * propuesta en estado PUBLICADO para que un administrador traslade el
 * cambio a ConfiguracionIa desde el panel, con su propio registro en
 * HistorialConfiguracionIa. */
const TRANSICIONES: Record<string, string[]> = {
  BORRADOR: ['PROPUESTA'],
  PROPUESTA: ['REVISION'],
  REVISION: ['APROBADO', 'RECHAZADO'],
  APROBADO: ['PUBLICADO'],
  RECHAZADO: [],
  PUBLICADO: [],
};

@Injectable()
export class IaPropuestasMejoraService {
  constructor(
    @InjectRepository(PropuestaMejoraIa) private readonly repo: Repository<PropuestaMejoraIa>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(estado?: string) {
    const qb = this.repo.createQueryBuilder('p').orderBy('p.creadoEn', 'DESC');
    if (estado) qb.andWhere('p.estado = :estado', { estado });
    return qb.getMany();
  }

  async findOne(id: string) {
    const propuesta = await this.repo.findOne({ where: { id } });
    if (!propuesta) throw new NotFoundException(`Propuesta ${id} no encontrada`);
    return propuesta;
  }

  /** Alta manual por un usuario de Seguridad (seccion 36, ej. "Snoopy esta
   * respondiendo demasiado informalmente..."), ya nace en estado PROPUESTA
   * -- a diferencia de una futura generacion automatica por la IA, que
   * quedaria en BORRADOR para que alguien la revise antes de elevarla. */
  async crear(dto: CreatePropuestaMejoraDto, actorId: string, ip: string | null) {
    const propuesta = await this.repo.save(
      this.repo.create({ origen: 'USUARIO', problemaDetectado: dto.problemaDetectado, propuestaTexto: dto.propuestaTexto, estado: 'PROPUESTA', creadoPor: actorId }),
    );
    await this.auditoriaService.registrar({ usuarioId: actorId, accion: 'CREAR', recurso: 'ia.propuestas_mejora', recursoId: propuesta.id, datosDespues: propuesta, ip });
    return propuesta;
  }

  private async transicionar(id: string, estadoNuevo: string, actorId: string, ip: string | null, motivoDecision?: string) {
    const propuesta = await this.findOne(id);
    const permitidas = TRANSICIONES[propuesta.estado] ?? [];
    if (!permitidas.includes(estadoNuevo)) {
      throw new BadRequestException(`No se puede pasar una propuesta de ${propuesta.estado} a ${estadoNuevo}`);
    }
    await this.repo.update(id, {
      estado: estadoNuevo as PropuestaMejoraIa['estado'],
      revisadoPor: ['APROBADO', 'RECHAZADO'].includes(estadoNuevo) ? actorId : propuesta.revisadoPor,
      fechaRevision: ['APROBADO', 'RECHAZADO'].includes(estadoNuevo) ? new Date() : propuesta.fechaRevision,
      motivoDecision: motivoDecision ?? propuesta.motivoDecision,
    });
    const actualizada = await this.findOne(id);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: `PROPUESTA_${estadoNuevo}`,
      recurso: 'ia.propuestas_mejora',
      recursoId: id,
      datosAntes: { estado: propuesta.estado },
      datosDespues: { estado: estadoNuevo, motivo: motivoDecision ?? null },
      ip,
    });
    return actualizada;
  }

  enviarARevision(id: string, actorId: string, ip: string | null) {
    return this.transicionar(id, 'REVISION', actorId, ip);
  }

  aprobar(id: string, dto: DecidirPropuestaMejoraDto, actorId: string, ip: string | null) {
    return this.transicionar(id, 'APROBADO', actorId, ip, dto.motivoDecision);
  }

  rechazar(id: string, dto: DecidirPropuestaMejoraDto, actorId: string, ip: string | null) {
    return this.transicionar(id, 'RECHAZADO', actorId, ip, dto.motivoDecision);
  }

  publicar(id: string, actorId: string, ip: string | null) {
    return this.transicionar(id, 'PUBLICADO', actorId, ip);
  }
}
