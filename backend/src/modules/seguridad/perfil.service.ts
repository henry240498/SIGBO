import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AsignacionGuardia, Guardia, PersonalServicio, Servicio, TipoServicio, Usuario, UsuarioCorreo, UsuarioTelefono } from '../../shared/entities';
import { borrarImagenSiExiste, guardarImagenRestringida, leerBufferRestringido, mimeImagenPorReferencia } from '../../shared/utils/almacenamiento';
import { AparienciaService } from './apariencia.service';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';

const MENSAJE_BLOQUEADO =
  'La edicion de datos personales ha sido bloqueada por el Administrador. Contacte a soporte para realizar cambios.';
const PERMISO_BYPASS = 'seguridad:editar_usuario';
const CARPETA_FOTOS = 'perfiles';

@Injectable()
export class PerfilService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(UsuarioTelefono) private readonly telefonoRepo: Repository<UsuarioTelefono>,
    @InjectRepository(UsuarioCorreo) private readonly correoRepo: Repository<UsuarioCorreo>,
    @InjectRepository(AsignacionGuardia) private readonly asignacionGuardiaRepo: Repository<AsignacionGuardia>,
    @InjectRepository(Guardia) private readonly guardiaRepo: Repository<Guardia>,
    @InjectRepository(PersonalServicio) private readonly personalServicioRepo: Repository<PersonalServicio>,
    @InjectRepository(Servicio) private readonly servicioRepo: Repository<Servicio>,
    @InjectRepository(TipoServicio) private readonly tipoServicioRepo: Repository<TipoServicio>,
    private readonly aparienciaService: AparienciaService,
  ) {}

  async puedeEditar(permisos: string[]): Promise<boolean> {
    const config = await this.aparienciaService.obtener();
    return config.perfilEdicionLibre || permisos.includes(PERMISO_BYPASS);
  }

  async obtenerPerfil(usuarioId: string, permisos: string[]) {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException(`Usuario ${usuarioId} no encontrado`);

    const [telefonos, correos, puedeEditar] = await Promise.all([
      this.telefonoRepo.find({ where: { usuarioId }, order: { creadoEn: 'ASC' } }),
      this.correoRepo.find({ where: { usuarioId }, order: { creadoEn: 'ASC' } }),
      this.puedeEditar(permisos),
    ]);

    return {
      avatarUrl: usuario.avatarUrl,
      whatsapp: usuario.whatsapp,
      facebookUrl: usuario.facebookUrl,
      instagramUrl: usuario.instagramUrl,
      xUrl: usuario.xUrl,
      telefonos,
      correos,
      puedeEditar,
    };
  }

  /** Datos operativos del propio bombero. La vinculacion usuario-bombero es
   * el limite de acceso; no se acepta un identificador desde el cliente. */
  async obtenerInicioPropio(usuarioId: string) {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId }, select: { id: true, bomberoId: true } });
    if (!usuario?.bomberoId) return { tienePerfilBombero: false, proximasGuardias: [], ultimosServicios: [] };

    const hoy = fechaActualAsuncion();
    const [asignaciones, participaciones] = await Promise.all([
      this.asignacionGuardiaRepo.find({ where: { bomberoId: usuario.bomberoId } }),
      this.personalServicioRepo.find({ where: { bomberoId: usuario.bomberoId } }),
    ]);
    const guardiaIds = [...new Set(asignaciones.map((item) => item.guardiaId))];
    const servicioIds = [...new Set(participaciones.map((item) => item.servicioId))];
    const [guardias, servicios] = await Promise.all([
      guardiaIds.length ? this.guardiaRepo.find({ where: { id: In(guardiaIds) } }) : Promise.resolve<Guardia[]>([]),
      servicioIds.length ? this.servicioRepo.find({ where: { id: In(servicioIds) } }) : Promise.resolve<Servicio[]>([]),
    ]);
    const tiposIds = [...new Set(servicios.map((servicio) => servicio.tipoServicioId))];
    const tipos = tiposIds.length ? await this.tipoServicioRepo.find({ where: { id: In(tiposIds) } }) : [];
    const asignacionPorGuardia = new Map(asignaciones.map((item) => [item.guardiaId, item]));
    const participacionPorServicio = new Map(participaciones.map((item) => [item.servicioId, item]));
    const tipoPorId = new Map(tipos.map((item) => [item.id, item]));

    return {
      tienePerfilBombero: true,
      proximasGuardias: guardias
        .filter((guardia) => guardia.fecha >= hoy && !['CANCELADA', 'ANULADA'].includes(guardia.estado))
        .sort((a, b) => `${a.fecha} ${a.horaInicio}`.localeCompare(`${b.fecha} ${b.horaInicio}`))
        .slice(0, 5)
        .map((guardia) => ({
          id: guardia.id, fecha: guardia.fecha, horaInicio: guardia.horaInicio, horaFin: guardia.horaFin,
          turno: guardia.turno, estado: guardia.estado, rol: asignacionPorGuardia.get(guardia.id)?.rol ?? null,
        })),
      ultimosServicios: servicios
        .filter((servicio) => servicio.fechaHoraAviso <= new Date())
        .sort((a, b) => b.fechaHoraAviso.getTime() - a.fechaHoraAviso.getTime())
        .slice(0, 5)
        .map((servicio) => ({
          id: servicio.id, numeroServicio: servicio.numeroServicio, fechaHoraAviso: servicio.fechaHoraAviso,
          estado: servicio.estado, tipo: tipoPorId.get(servicio.tipoServicioId)?.nombre ?? null,
          rol: participacionPorServicio.get(servicio.id)?.rol ?? null,
          horasServicio: participacionPorServicio.get(servicio.id)?.horasServicio ?? null,
        })),
    };
  }

  async actualizarPerfilPropio(usuarioId: string, dto: ActualizarPerfilDto, permisos: string[]) {
    if (!(await this.puedeEditar(permisos))) {
      throw new ForbiddenException(MENSAJE_BLOQUEADO);
    }
    return this.guardarCambios(usuarioId, dto);
  }

  async actualizarPerfilComoAdmin(usuarioId: string, dto: ActualizarPerfilDto) {
    return this.guardarCambios(usuarioId, dto);
  }

  async actualizarFotoPropia(usuarioId: string, file: Express.Multer.File, permisos: string[]) {
    if (!(await this.puedeEditar(permisos))) {
      throw new ForbiddenException(MENSAJE_BLOQUEADO);
    }
    return this.guardarFoto(usuarioId, file);
  }

  async actualizarFotoComoAdmin(usuarioId: string, file: Express.Multer.File) {
    return this.guardarFoto(usuarioId, file);
  }

  async obtenerFoto(usuarioId: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario?.avatarUrl) throw new NotFoundException('Este usuario no tiene una foto de perfil registrada');
    const mimeType = mimeImagenPorReferencia(usuario.avatarUrl);
    if (!mimeType) throw new NotFoundException('La foto de perfil tiene un formato no disponible');
    try {
      return { buffer: await leerBufferRestringido(usuario.avatarUrl, CARPETA_FOTOS), mimeType };
    } catch {
      throw new NotFoundException('El archivo de foto de perfil no está disponible');
    }
  }

  private async guardarCambios(usuarioId: string, dto: ActualizarPerfilDto) {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException(`Usuario ${usuarioId} no encontrado`);

    await this.usuarioRepo.update(usuarioId, {
      ...(dto.whatsapp !== undefined ? { whatsapp: dto.whatsapp || null } : {}),
      ...(dto.facebookUrl !== undefined ? { facebookUrl: dto.facebookUrl || null } : {}),
      ...(dto.instagramUrl !== undefined ? { instagramUrl: dto.instagramUrl || null } : {}),
      ...(dto.xUrl !== undefined ? { xUrl: dto.xUrl || null } : {}),
    });

    if (dto.telefonos !== undefined) {
      await this.telefonoRepo.delete({ usuarioId });
      for (const t of dto.telefonos) {
        await this.telefonoRepo.save(
          this.telefonoRepo.create({ usuarioId, numero: t.numero, etiqueta: t.etiqueta ?? null }),
        );
      }
    }

    if (dto.correos !== undefined) {
      await this.correoRepo.delete({ usuarioId });
      for (const c of dto.correos) {
        await this.correoRepo.save(
          this.correoRepo.create({ usuarioId, correo: c.correo, etiqueta: c.etiqueta ?? null }),
        );
      }
    }

    return this.obtenerPerfil(usuarioId, []);
  }

  private async guardarFoto(usuarioId: string, file: Express.Multer.File) {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException(`Usuario ${usuarioId} no encontrado`);

    const rutaAnterior = usuario.avatarUrl;
    const nuevaRuta = await guardarImagenRestringida(file, CARPETA_FOTOS);
    await this.usuarioRepo.update(usuarioId, { avatarUrl: nuevaRuta });
    await borrarImagenSiExiste(rutaAnterior, CARPETA_FOTOS);

    return this.obtenerPerfil(usuarioId, []);
  }
}

function fechaActualAsuncion(): string {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Asuncion', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const valor = (tipo: string) => partes.find((parte) => parte.type === tipo)?.value ?? '';
  return `${valor('year')}-${valor('month')}-${valor('day')}`;
}
