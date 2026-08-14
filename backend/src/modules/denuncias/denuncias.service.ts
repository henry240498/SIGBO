import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { CategoriaDenuncia, Denuncia, EstadoDenuncia, EvidenciaDenuncia, HistorialEstadoDenuncia, Servicio, TipoServicio, Usuario, Vehiculo, ComunicacionServicio } from '../../shared/entities';
import { guardarBufferPrivado, leerBufferPrivado } from '../../shared/utils/almacenamiento';
import { normalizarTexto } from '../../shared/utils/normalizar-texto';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { CrearDenunciaPublicaDto } from './dto/crear-denuncia-publica.dto';
import { ActualizarCategoriaDenunciaDto, CrearCategoriaDenunciaDto } from './dto/categoria-denuncia.dto';

type Archivo = Express.Multer.File;
type Contexto = { usuarioId: string | null; ip: string | null; userAgent: string | null };
type Filtros = { q?: string; estado?: string; categoriaId?: string; servicioId?: string; vehiculoId?: string; desde?: string; hasta?: string };

const ESTADOS: EstadoDenuncia[] = ['NUEVA', 'EN_REVISION', 'ASIGNADA', 'EN_INVESTIGACION', 'RESUELTA', 'CERRADA', 'DESCARTADA', 'DUPLICADA'];
const TRANSICIONES: Record<EstadoDenuncia, EstadoDenuncia[]> = {
  NUEVA: ['EN_REVISION', 'ASIGNADA', 'DESCARTADA', 'DUPLICADA'],
  EN_REVISION: ['ASIGNADA', 'EN_INVESTIGACION', 'RESUELTA', 'DESCARTADA', 'DUPLICADA'],
  ASIGNADA: ['EN_REVISION', 'EN_INVESTIGACION', 'RESUELTA', 'DESCARTADA', 'DUPLICADA'],
  EN_INVESTIGACION: ['ASIGNADA', 'RESUELTA', 'DESCARTADA', 'DUPLICADA'],
  RESUELTA: ['CERRADA', 'EN_INVESTIGACION'],
  CERRADA: ['EN_REVISION'],
  DESCARTADA: ['EN_REVISION'],
  DUPLICADA: ['EN_REVISION'],
};
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const MAX_EVIDENCIA_BYTES = 5 * 1024 * 1024;

@Injectable()
export class DenunciasService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Denuncia) private readonly denunciaRepo: Repository<Denuncia>,
    @InjectRepository(CategoriaDenuncia) private readonly categoriaRepo: Repository<CategoriaDenuncia>,
    @InjectRepository(HistorialEstadoDenuncia) private readonly historialRepo: Repository<HistorialEstadoDenuncia>,
    @InjectRepository(EvidenciaDenuncia) private readonly evidenciaRepo: Repository<EvidenciaDenuncia>,
    @InjectRepository(Servicio) private readonly servicioRepo: Repository<Servicio>,
    @InjectRepository(TipoServicio) private readonly tipoServicioRepo: Repository<TipoServicio>,
    @InjectRepository(Vehiculo) private readonly vehiculoRepo: Repository<Vehiculo>,
    @InjectRepository(ComunicacionServicio) private readonly comunicacionRepo: Repository<ComunicacionServicio>,
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    private readonly auditoria: AuditoriaService,
  ) {}

  categoriasPublicas() { return this.categoriaRepo.find({ where: { activo: true }, order: { orden: 'ASC', nombre: 'ASC' } }); }
  categoriasInternas() { return this.categoriaRepo.find({ order: { orden: 'ASC', nombre: 'ASC' } }); }

  async crearCategoria(dto: CrearCategoriaDenunciaDto) {
    const normalizado = normalizarTexto(dto.nombre);
    if (await this.categoriaRepo.exist({ where: { nombreNormalizado: normalizado } })) throw new ConflictException('Ya existe una categoría con ese nombre');
    return this.categoriaRepo.save(this.categoriaRepo.create({ nombre: dto.nombre.trim(), nombreNormalizado: normalizado, orden: dto.orden ?? 0, activo: true }));
  }

  async actualizarCategoria(id: string, dto: ActualizarCategoriaDenunciaDto) {
    const actual = await this.categoriaRepo.findOne({ where: { id } });
    if (!actual) throw new NotFoundException('Categoría no encontrada');
    const nombreNormalizado = dto.nombre === undefined ? actual.nombreNormalizado : normalizarTexto(dto.nombre);
    if (nombreNormalizado !== actual.nombreNormalizado && await this.categoriaRepo.exist({ where: { nombreNormalizado } })) throw new ConflictException('Ya existe una categoría con ese nombre');
    await this.categoriaRepo.update(id, { ...(dto.nombre !== undefined ? { nombre: dto.nombre.trim(), nombreNormalizado } : {}), ...(dto.orden !== undefined ? { orden: dto.orden } : {}), ...(dto.activo !== undefined ? { activo: dto.activo } : {}) });
    return this.categoriaRepo.findOneByOrFail({ id });
  }

  async buscarServiciosPublicos(q?: string) {
    const consulta = this.servicioRepo.createQueryBuilder('s').where('s.fechaHoraAviso >= DATEADD(day, -90, SYSDATETIMEOFFSET())').orderBy('s.fechaHoraAviso', 'DESC').take(50);
    if (q?.trim()) consulta.andWhere('(s.numeroServicio LIKE :q OR s.direccion LIKE :q OR s.descripcion LIKE :q)', { q: `%${q.trim()}%` });
    const servicios = await consulta.getMany();
    const tipos = servicios.length ? await this.tipoServicioRepo.find({ where: { id: In(servicios.map((s) => s.tipoServicioId)) } }) : [];
    const tipoPorId = new Map(tipos.map((t) => [t.id, t.nombre]));
    const vehiculos = await this.vehiculosDeServicios(servicios);
    return servicios.map((s) => ({ id: s.id, numero: s.numeroServicio, fechaHora: s.fechaHoraAviso, tipo: tipoPorId.get(s.tipoServicioId) ?? 'Servicio', direccion: s.direccion, moviles: vehiculos.get(s.id) ?? [] }));
  }

  asignables() { return this.usuarioRepo.find({ where: { estado: 'ACTIVO' }, select: { id: true, username: true }, order: { username: 'ASC' } }); }

  async crearPublica(dto: CrearDenunciaPublicaDto, archivos: { audio?: Archivo[]; evidencias?: Archivo[] }, contexto: Contexto) {
    const clave = dto.claveIdempotencia?.toLowerCase() ?? null;
    if (clave) {
      const previa = await this.denunciaRepo.findOne({ where: { claveIdempotencia: clave } });
      if (previa) return this.confirmacion(previa);
    }
    await this.aplicarLimitePublico(contexto.ip);
    const audio = archivos.audio?.[0];
    const evidencias = archivos.evidencias ?? [];
    this.validarSolicitud(dto, audio);
    this.validarArchivos(audio, evidencias);
    const categoria = await this.categoriaRepo.findOne({ where: { id: dto.categoriaId, activo: true } });
    if (!categoria) throw new BadRequestException('Seleccioná un tipo de denuncia válido');
    if (normalizarTexto(categoria.nombre) === 'otro' && !dto.asuntoOtro) throw new BadRequestException('Contanos brevemente sobre qué es la denuncia');
    const [servicio, vehiculo] = await Promise.all([
      dto.servicioId ? this.servicioRepo.findOne({ where: { id: dto.servicioId } }) : null,
      dto.vehiculoId ? this.vehiculoRepo.findOne({ where: { id: dto.vehiculoId } }) : null,
    ]);
    if (dto.servicioId && !servicio) throw new BadRequestException('El servicio seleccionado ya no está disponible');
    if (dto.vehiculoId && !vehiculo) throw new BadRequestException('El móvil seleccionado ya no está disponible');
    if (dto.vehiculoId && dto.servicioId && !(await this.vehiculoPerteneceServicio(dto.vehiculoId, servicio!))) throw new BadRequestException('El móvil no corresponde al servicio seleccionado');

    try {
      const creada = await this.dataSource.transaction(async (manager) => {
        const codigo = await this.siguienteCodigo(manager);
        const denuncia = await manager.getRepository(Denuncia).save(manager.getRepository(Denuncia).create({
          codigo, claveIdempotencia: clave, usuarioId: contexto.usuarioId,
          nombreDenunciante: dto.nombre.trim(), telefono: this.normalizarTelefono(dto.telefono), categoriaId: categoria.id,
          asuntoOtro: dto.asuntoOtro?.trim() ?? null, descripcion: dto.descripcion?.trim() ?? null,
          servicioId: dto.servicioId ?? null, vehiculoId: dto.vehiculoId ?? null,
          latitud: dto.latitud ?? null, longitud: dto.longitud ?? null, precisionUbicacion: dto.precisionUbicacion ?? null,
          ubicacionCapturadaEn: dto.latitud !== undefined ? new Date() : null,
          ip: contexto.ip, userAgent: contexto.userAgent?.slice(0, 500) ?? null, tipoDispositivo: this.tipoDispositivo(contexto.userAgent), estado: 'NUEVA', asignadoA: null,
        }));
        await manager.getRepository(HistorialEstadoDenuncia).save(manager.getRepository(HistorialEstadoDenuncia).create({ denunciaId: denuncia.id, estadoAnterior: null, estadoNuevo: 'NUEVA', usuarioId: contexto.usuarioId, comentario: 'Denuncia recibida' }));
        for (const archivo of [audio, ...evidencias].filter((x): x is Archivo => !!x)) await this.guardarEvidencia(manager, denuncia.id, archivo, archivo === audio ? 'AUDIO' : 'EVIDENCIA', archivo === audio ? dto.duracionAudioSegundos ?? null : null);
        return denuncia;
      });
      await this.auditoria.registrar({ usuarioId: contexto.usuarioId, accion: 'CREAR', recurso: 'denuncias.denuncias', recursoId: creada.id, datosDespues: { codigo: creada.codigo, estado: creada.estado, categoriaId: creada.categoriaId }, ip: contexto.ip, userAgent: contexto.userAgent, metadata: { origen: contexto.usuarioId ? 'AUTENTICADO' : 'PUBLICO' } });
      return this.confirmacion(creada);
    } catch (error) {
      if (clave && this.esUnico(error)) {
        const previa = await this.denunciaRepo.findOne({ where: { claveIdempotencia: clave } });
        if (previa) return this.confirmacion(previa);
      }
      throw error;
    }
  }

  async listar(filtros: Filtros) {
    const qb = this.denunciaRepo.createQueryBuilder('d').orderBy('d.creadoEn', 'DESC');
    if (filtros.estado) qb.andWhere('d.estado = :estado', { estado: filtros.estado });
    if (filtros.categoriaId) qb.andWhere('d.categoriaId = :categoriaId', { categoriaId: filtros.categoriaId });
    if (filtros.servicioId) qb.andWhere('d.servicioId = :servicioId', { servicioId: filtros.servicioId });
    if (filtros.vehiculoId) qb.andWhere('d.vehiculoId = :vehiculoId', { vehiculoId: filtros.vehiculoId });
    if (filtros.desde) qb.andWhere('d.creadoEn >= :desde', { desde: filtros.desde });
    if (filtros.hasta) qb.andWhere('d.creadoEn < DATEADD(day, 1, :hasta)', { hasta: filtros.hasta });
    if (filtros.q?.trim()) qb.andWhere('(d.codigo LIKE :q OR d.nombreDenunciante LIKE :q OR d.telefono LIKE :q OR d.descripcion LIKE :q)', { q: `%${filtros.q.trim()}%` });
    const items = await qb.getMany();
    const categorias = items.length ? await this.categoriaRepo.find({ where: { id: In(items.map((x) => x.categoriaId)) } }) : [];
    const porCategoria = new Map(categorias.map((c) => [c.id, c.nombre]));
    return items.map((x) => ({ id: x.id, codigo: x.codigo, estado: x.estado, creadoEn: x.creadoEn, categoria: porCategoria.get(x.categoriaId) ?? 'Sin categoría', nombreDenunciante: x.nombreDenunciante, servicioId: x.servicioId, vehiculoId: x.vehiculoId }));
  }

  async resumen() { const items = await this.denunciaRepo.find({ select: { estado: true } }); return Object.fromEntries(ESTADOS.map((estado) => [estado, items.filter((x) => x.estado === estado).length])); }

  async obtener(id: string, puedeVerTecnicos: boolean) {
    const denuncia = await this.denunciaRepo.findOne({ where: { id } });
    if (!denuncia) throw new NotFoundException('Denuncia no encontrada');
    const [categoria, servicio, vehiculo, historial, evidencias, asignado] = await Promise.all([
      this.categoriaRepo.findOne({ where: { id: denuncia.categoriaId } }),
      denuncia.servicioId ? this.servicioRepo.findOne({ where: { id: denuncia.servicioId } }) : null,
      denuncia.vehiculoId ? this.vehiculoRepo.findOne({ where: { id: denuncia.vehiculoId } }) : null,
      this.historialRepo.find({ where: { denunciaId: id }, order: { fecha: 'ASC' } }),
      this.evidenciaRepo.find({ where: { denunciaId: id }, order: { creadoEn: 'ASC' } }),
      denuncia.asignadoA ? this.usuarioRepo.findOne({ where: { id: denuncia.asignadoA }, select: { id: true, username: true } }) : null,
    ]);
    return {
      id: denuncia.id, codigo: denuncia.codigo, estado: denuncia.estado, nombreDenunciante: denuncia.nombreDenunciante, telefono: denuncia.telefono,
      categoria: categoria?.nombre ?? 'Sin categoría', asuntoOtro: denuncia.asuntoOtro, descripcion: denuncia.descripcion, creadoEn: denuncia.creadoEn,
      servicio: servicio ? { id: servicio.id, numero: servicio.numeroServicio, fechaHora: servicio.fechaHoraAviso, direccion: servicio.direccion } : null,
      vehiculo: vehiculo ? { id: vehiculo.id, nombre: [vehiculo.numeroInterno, vehiculo.tipo, vehiculo.marca, vehiculo.modelo].filter(Boolean).join(' · ') } : null,
      asignado, historial, evidencias: evidencias.map((e) => ({ id: e.id, tipo: e.tipo, nombre: e.nombreOriginal, mimeType: e.mimeType, tamanoBytes: e.tamanoBytes, duracionSegundos: e.duracionSegundos })),
      tecnico: puedeVerTecnicos ? { ip: denuncia.ip, userAgent: denuncia.userAgent, tipoDispositivo: denuncia.tipoDispositivo, latitud: denuncia.latitud, longitud: denuncia.longitud, precisionUbicacion: denuncia.precisionUbicacion, ubicacionCapturadaEn: denuncia.ubicacionCapturadaEn, usuarioId: denuncia.usuarioId } : undefined,
    };
  }

  async cambiarEstado(id: string, destino: EstadoDenuncia, comentario: string | undefined, actor: Contexto) {
    const denuncia = await this.denunciaRepo.findOne({ where: { id } });
    if (!denuncia) throw new NotFoundException('Denuncia no encontrada');
    if (!ESTADOS.includes(destino) || !TRANSICIONES[denuncia.estado].includes(destino)) throw new ConflictException('No se permite ese cambio de estado');
    if (['DESCARTADA', 'DUPLICADA', 'RESUELTA', 'CERRADA'].includes(destino) && !comentario?.trim()) throw new BadRequestException('Indicá brevemente el motivo de esta decisión');
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Denuncia).update(id, { estado: destino });
      await manager.getRepository(HistorialEstadoDenuncia).save(manager.getRepository(HistorialEstadoDenuncia).create({ denunciaId: id, estadoAnterior: denuncia.estado, estadoNuevo: destino, usuarioId: actor.usuarioId, comentario: comentario?.trim() ?? null }));
    });
    await this.auditoria.registrar({ usuarioId: actor.usuarioId, accion: 'CAMBIAR_ESTADO', recurso: 'denuncias.denuncias', recursoId: id, datosAntes: { estado: denuncia.estado }, datosDespues: { estado: destino }, ip: actor.ip, userAgent: actor.userAgent });
    return this.obtener(id, false);
  }

  async asignar(id: string, usuarioId: string, comentario: string | undefined, actor: Contexto) {
    const [denuncia, usuario] = await Promise.all([this.denunciaRepo.findOne({ where: { id } }), this.usuarioRepo.findOne({ where: { id: usuarioId } })]);
    if (!denuncia) throw new NotFoundException('Denuncia no encontrada');
    if (!usuario || usuario.estado !== 'ACTIVO') throw new BadRequestException('La persona asignada no está disponible');
    const nuevoEstado: EstadoDenuncia = denuncia.estado === 'NUEVA' || denuncia.estado === 'EN_REVISION' ? 'ASIGNADA' : denuncia.estado;
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(Denuncia).update(id, { asignadoA: usuarioId, estado: nuevoEstado });
      await manager.getRepository(HistorialEstadoDenuncia).save(manager.getRepository(HistorialEstadoDenuncia).create({ denunciaId: id, estadoAnterior: denuncia.estado === nuevoEstado ? null : denuncia.estado, estadoNuevo: nuevoEstado, usuarioId: actor.usuarioId, comentario: comentario?.trim() ?? `Asignada a ${usuario.username}` }));
    });
    await this.auditoria.registrar({ usuarioId: actor.usuarioId, accion: 'ASIGNAR', recurso: 'denuncias.denuncias', recursoId: id, datosAntes: { asignadoA: denuncia.asignadoA }, datosDespues: { asignadoA: usuarioId, estado: nuevoEstado }, ip: actor.ip, userAgent: actor.userAgent });
    return this.obtener(id, false);
  }

  async leerEvidencia(denunciaId: string, evidenciaId: string) {
    const evidencia = await this.evidenciaRepo.findOne({ where: { id: evidenciaId, denunciaId } });
    if (!evidencia) throw new NotFoundException('Evidencia no encontrada');
    try { return { evidencia, buffer: await leerBufferPrivado(evidencia.nombreAlmacenado, 'denuncias') }; }
    catch { throw new NotFoundException('El archivo privado no está disponible'); }
  }

  private async aplicarLimitePublico(ip: string | null) {
    if (!ip) return;
    const desde = new Date(Date.now() - 60 * 60 * 1000);
    const cantidad = await this.denunciaRepo.createQueryBuilder('d').where('d.ip = :ip AND d.creadoEn >= :desde', { ip, desde }).getCount();
    if (cantidad >= 10) throw new HttpException('Recibimos muchos envíos desde esta conexión. Esperá un momento e intentá nuevamente.', HttpStatus.TOO_MANY_REQUESTS);
  }

  private validarSolicitud(dto: CrearDenunciaPublicaDto, audio?: Archivo) {
    if (!this.telefonoValido(dto.telefono)) throw new BadRequestException('Revisá el número de celular ingresado');
    if (!dto.descripcion?.trim() && !audio) throw new BadRequestException('Contanos brevemente qué ocurrió o grabá un audio');
    if (audio && !dto.duracionAudioSegundos) throw new BadRequestException('No pudimos validar la duración del audio. Volvé a grabarlo e intentá nuevamente.');
    const tieneLatitud = dto.latitud !== undefined, tieneLongitud = dto.longitud !== undefined;
    if (tieneLatitud !== tieneLongitud) throw new BadRequestException('La ubicación compartida está incompleta');
    if (dto.precisionUbicacion !== undefined && !tieneLatitud) throw new BadRequestException('La precisión requiere una ubicación');
  }

  private validarArchivos(audio: Archivo | undefined, evidencias: Archivo[]) {
    if (audio) this.validarArchivo(audio, 'AUDIO');
    if (evidencias.length > 3) throw new BadRequestException('Podés adjuntar hasta tres evidencias');
    evidencias.forEach((archivo) => this.validarArchivo(archivo, 'EVIDENCIA'));
  }

  private validarArchivo(archivo: Archivo, tipo: 'AUDIO' | 'EVIDENCIA') {
    if (!archivo?.buffer?.length) throw new BadRequestException('Uno de los archivos está vacío');
    if (archivo.size > (tipo === 'AUDIO' ? MAX_AUDIO_BYTES : MAX_EVIDENCIA_BYTES)) throw new BadRequestException(tipo === 'AUDIO' ? 'El audio supera el límite de 10 MB' : 'Cada evidencia puede pesar hasta 5 MB');
    const detectado = this.detectarMime(archivo.buffer);
    if (!detectado || (tipo === 'AUDIO' ? !detectado.startsWith('audio/') : !['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(detectado))) throw new BadRequestException(tipo === 'AUDIO' ? 'El audio no tiene un formato permitido' : 'La evidencia debe ser una imagen JPG, PNG, WebP o un PDF válido');
  }

  private async guardarEvidencia(manager: EntityManager, denunciaId: string, archivo: Archivo, tipo: 'AUDIO' | 'EVIDENCIA', duracionSegundos: number | null) {
    const mime = this.detectarMime(archivo.buffer)!;
    const extension = this.extensionMime(mime);
    const nombre = await guardarBufferPrivado(archivo.buffer, extension, 'denuncias');
    await manager.getRepository(EvidenciaDenuncia).save(manager.getRepository(EvidenciaDenuncia).create({ denunciaId, tipo, nombreOriginal: this.nombreSeguro(archivo.originalname, extension), nombreAlmacenado: nombre, mimeType: mime, tamanoBytes: archivo.size, duracionSegundos, hashSha256: createHash('sha256').update(archivo.buffer).digest('hex') }));
  }

  private async siguienteCodigo(manager: EntityManager) { const filas = await manager.query('SELECT NEXT VALUE FOR denuncias.secuencia_codigo AS valor'); return `DEN-${new Date().getFullYear()}-${String(filas[0].valor).padStart(6, '0')}`; }
  private confirmacion(denuncia: Denuncia) { return { id: denuncia.id, codigo: denuncia.codigo, estado: denuncia.estado, creadoEn: denuncia.creadoEn }; }
  private normalizarTelefono(valor: string) { const digitos = valor.replace(/\D/g, ''); if (digitos.startsWith('595')) return `+${digitos}`; if (digitos.startsWith('0')) return `+595${digitos.slice(1)}`; return `+595${digitos}`; }
  private telefonoValido(valor: string) { const normalizado = this.normalizarTelefono(valor); return /^\+5959\d{8}$/.test(normalizado); }
  private tipoDispositivo(agente: string | null) { if (!agente) return null; return /mobile|android|iphone|ipad/i.test(agente) ? 'MOVIL' : 'ESCRITORIO'; }
  private esUnico(error: any) { return error?.number === 2601 || error?.number === 2627 || /duplicate|unique/i.test(String(error?.message ?? '')); }
  private nombreSeguro(nombre: string, extension: string) { const base = nombre.replace(/[^a-z0-9._-]/gi, '_').slice(0, 220) || `archivo${extension}`; return base.endsWith(extension) ? base : `${base}${extension}`; }
  private extensionMime(mime: string) { return ({ 'audio/webm': '.webm', 'audio/ogg': '.ogg', 'audio/wav': '.wav', 'audio/mp4': '.m4a', 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'application/pdf': '.pdf' } as Record<string, string>)[mime] ?? '.bin'; }
  private detectarMime(buffer: Buffer): string | null { if (buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) return 'audio/webm'; if (buffer.subarray(0, 4).toString() === 'OggS') return 'audio/ogg'; if (buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WAVE') return 'audio/wav'; if (buffer.subarray(4, 8).toString() === 'ftyp') return 'audio/mp4'; if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'image/jpeg'; if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'; if (buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') return 'image/webp'; if (buffer.subarray(0, 5).toString() === '%PDF-') return 'application/pdf'; return null; }
  private async vehiculosDeServicios(servicios: Servicio[]) {
    const resultado = new Map<string, { id: string; nombre: string }[]>();
    if (!servicios.length) return resultado;
    const comunicaciones = await this.comunicacionRepo.find({ where: { servicioId: In(servicios.map((s) => s.id)) } });
    const referencias = new Map<string, string[]>();
    servicios.forEach((s) => referencias.set(s.id, s.vehiculoPrincipalId ? [s.vehiculoPrincipalId] : []));
    comunicaciones.forEach((c) => { try { const filas = JSON.parse(c.datos)?.movilesDespachados; if (Array.isArray(filas)) referencias.set(c.servicioId, [...new Set([...(referencias.get(c.servicioId) ?? []), ...filas.filter((m: { seleccionado?: boolean; movilId?: string }) => m.seleccionado && m.movilId).map((m: { movilId: string }) => m.movilId)])]); } catch { /* comunicación histórica sin móviles legibles */ } });
    const todos = await this.vehiculoRepo.find({ select: { id: true, numeroInterno: true, tipo: true, marca: true, modelo: true } });
    const porId = new Map(todos.map((v) => [v.id, v])); const porNumero = new Map(todos.map((v) => [normalizarTexto(v.numeroInterno), v]));
    referencias.forEach((moviles, servicioId) => { const vistos = new Set<string>(); const lista = moviles.map((referencia) => porId.get(referencia) ?? porNumero.get(normalizarTexto(referencia))).filter((v): v is Vehiculo => !!v).filter((v) => !vistos.has(v.id) && !!vistos.add(v.id)).map((v) => ({ id: v.id, nombre: [v.numeroInterno, v.tipo, v.marca, v.modelo].filter(Boolean).join(' · ') })); if (lista.length) resultado.set(servicioId, lista); });
    return resultado;
  }
  private async vehiculoPerteneceServicio(vehiculoId: string, servicio: Servicio) { if (servicio.vehiculoPrincipalId === vehiculoId) return true; const comunicaciones = await this.comunicacionRepo.find({ where: { servicioId: servicio.id } }); return comunicaciones.some((c) => { try { const moviles = JSON.parse(c.datos)?.movilesDespachados; return Array.isArray(moviles) && moviles.some((m: { movilId?: string; seleccionado?: boolean }) => m.seleccionado && m.movilId === vehiculoId); } catch { return false; } }); }
}
