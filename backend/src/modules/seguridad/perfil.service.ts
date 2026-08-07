import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, UsuarioCorreo, UsuarioTelefono } from '../../shared/entities';
import { borrarImagenSiExiste, guardarImagen } from '../../shared/utils/almacenamiento';
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
    const nuevaRuta = await guardarImagen(file, CARPETA_FOTOS);
    await this.usuarioRepo.update(usuarioId, { avatarUrl: nuevaRuta });
    await borrarImagenSiExiste(rutaAnterior, CARPETA_FOTOS);

    return this.obtenerPerfil(usuarioId, []);
  }
}
