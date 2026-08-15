import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bombero, Certificacion, Usuario } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CARPETA_CERTIFICACIONES, borrarImagenSiExiste, guardarImagen } from '../../shared/utils/almacenamiento';
import { DocumentosService } from '../documentos/documentos.service';
import { CreateCertificacionDto } from './dto/create-certificacion.dto';
import { UpdateCertificacionDto } from './dto/update-certificacion.dto';

@Injectable()
export class CertificacionesAcademiaService {
  constructor(
    @InjectRepository(Certificacion) private readonly certificacionRepo: Repository<Certificacion>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    private readonly auditoriaService: AuditoriaService,
    private readonly documentosService: DocumentosService,
  ) {}

  /** Un usuario puede gestionar la certificacion de un bombero si: (a) tiene
   * academia:certificar (gestiona certificaciones de cualquiera), o (b) el
   * bombero objetivo es el suyo propio (autoservicio, seccion 15 del pedido:
   * "no debe poder modificar arbitrariamente la certificacion de otra
   * persona"). */
  private async verificarAcceso(actorUserId: string, actorPermisos: string[], bomberoId: string) {
    if (actorPermisos.includes('academia:certificar')) return;
    const usuario = await this.usuarioRepo.findOne({ where: { id: actorUserId } });
    if (usuario?.bomberoId === bomberoId) return;
    throw new ForbiddenException('No tiene permiso para gestionar la certificacion de otra persona');
  }

  async listarPorBombero(bomberoId: string) {
    const bombero = await this.bomberoRepo.findOne({ where: { id: bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${bomberoId} no encontrado`);
    return this.certificacionRepo.find({ where: { bomberoId }, order: { fechaObtencion: 'DESC' } });
  }

  async findOne(id: string) {
    const certificacion = await this.certificacionRepo.findOne({ where: { id } });
    if (!certificacion) throw new NotFoundException(`Certificacion ${id} no encontrada`);
    return certificacion;
  }

  async create(dto: CreateCertificacionDto, file: Express.Multer.File | undefined, actorUserId: string, actorPermisos: string[], ip?: string) {
    const bombero = await this.bomberoRepo.findOne({ where: { id: dto.bomberoId } });
    if (!bombero) throw new NotFoundException(`Bombero ${dto.bomberoId} no encontrado`);
    await this.verificarAcceso(actorUserId, actorPermisos, dto.bomberoId);

    const archivoUrl = file ? await guardarImagen(file, CARPETA_CERTIFICACIONES) : null;

    const certificacion = await this.certificacionRepo.save(
      this.certificacionRepo.create({
        bomberoId: dto.bomberoId,
        tipo: dto.tipo as any,
        nombre: dto.nombre,
        institucion: dto.institucion ?? null,
        fechaObtencion: dto.fechaObtencion,
        fechaVencimiento: dto.fechaVencimiento ?? null,
        numeroCertificado: dto.numeroCertificado ?? null,
        estado: (dto.estado as any) ?? 'VIGENTE',
        duracionHoras: dto.duracionHoras ?? null,
        instructor: dto.instructor ?? null,
        actividadAcademicaId: dto.actividadAcademicaId ?? null,
        archivoUrl,
      }),
    );

    await this.auditoriaService.registrar({
      usuarioId: actorUserId,
      accion: 'CREAR',
      recurso: 'personal.certificaciones',
      recursoId: certificacion.id,
      datosDespues: certificacion,
      ip: ip ?? null,
    });

    // El archivo sigue viviendo en Certificacion.archivoUrl (no se duplica
    // almacenamiento ni se toca esa pantalla) -- ademas se indexa como
    // Documento transversal para que aparezca en la ficha de Personal y en
    // busquedas/vencimientos de Documentos (seccion 19 del pedido).
    if (file && archivoUrl) {
      await this.documentosService.registrarDesdeOtroModulo(
        {
          tipoDocumentoNombre: 'Certificado',
          categoriaDocumentoNombre: 'Academia',
          titulo: dto.nombre,
          descripcion: dto.institucion ? `Emitido por ${dto.institucion}` : undefined,
          fechaEmision: dto.fechaObtencion,
          fechaVencimiento: dto.fechaVencimiento ?? undefined,
          archivoUrl,
          archivoNombreOriginal: file.originalname,
          archivoExtension: (file.originalname.split('.').pop() ?? '').toLowerCase(),
          generadoPorModulo: 'academia',
          estadoNombre: 'Publicado',
          relaciones: [
            { modulo: 'personal', entidad: 'bombero', registroId: dto.bomberoId, etiqueta: 'Certificacion' },
            { modulo: 'academia', entidad: 'certificacion', registroId: certificacion.id, etiqueta: 'Certificacion' },
          ],
        },
        actorUserId,
      );
    }

    return certificacion;
  }

  async update(id: string, dto: UpdateCertificacionDto, file: Express.Multer.File | undefined, actorUserId: string, actorPermisos: string[], ip?: string) {
    const anterior = await this.findOne(id);
    await this.verificarAcceso(actorUserId, actorPermisos, anterior.bomberoId);

    let archivoUrl = anterior.archivoUrl;
    if (file) {
      await borrarImagenSiExiste(anterior.archivoUrl, CARPETA_CERTIFICACIONES);
      archivoUrl = await guardarImagen(file, CARPETA_CERTIFICACIONES);
    }

    await this.certificacionRepo.update(id, {
      ...(dto.tipo !== undefined ? { tipo: dto.tipo as any } : {}),
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.institucion !== undefined ? { institucion: dto.institucion } : {}),
      ...(dto.fechaObtencion !== undefined ? { fechaObtencion: dto.fechaObtencion } : {}),
      ...(dto.fechaVencimiento !== undefined ? { fechaVencimiento: dto.fechaVencimiento } : {}),
      ...(dto.numeroCertificado !== undefined ? { numeroCertificado: dto.numeroCertificado } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado as any } : {}),
      ...(dto.duracionHoras !== undefined ? { duracionHoras: dto.duracionHoras } : {}),
      ...(dto.instructor !== undefined ? { instructor: dto.instructor } : {}),
      ...(dto.actividadAcademicaId !== undefined ? { actividadAcademicaId: dto.actividadAcademicaId } : {}),
      archivoUrl,
    });

    const actualizado = await this.findOne(id);
    await this.auditoriaService.registrar({
      usuarioId: actorUserId,
      accion: 'ACTUALIZAR',
      recurso: 'personal.certificaciones',
      recursoId: id,
      datosAntes: anterior,
      datosDespues: actualizado,
      ip: ip ?? null,
    });
    return actualizado;
  }

  async eliminar(id: string, actorUserId: string, actorPermisos: string[], ip?: string) {
    const certificacion = await this.findOne(id);
    await this.verificarAcceso(actorUserId, actorPermisos, certificacion.bomberoId);

    await borrarImagenSiExiste(certificacion.archivoUrl, CARPETA_CERTIFICACIONES);
    await this.certificacionRepo.delete(id);

    await this.auditoriaService.registrar({
      usuarioId: actorUserId,
      accion: 'ELIMINAR',
      recurso: 'personal.certificaciones',
      recursoId: id,
      datosAntes: certificacion,
      ip: ip ?? null,
    });
    return { eliminado: true };
  }
}
