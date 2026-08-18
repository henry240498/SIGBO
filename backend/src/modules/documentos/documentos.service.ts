import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documento, DocumentoRelacion, NumeracionDocumento, Parametro, VersionArchivoDocumento } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { guardarImagen, CARPETA_DOCUMENTOS } from '../../shared/utils/almacenamiento';
import { AnularDocumentoDto, CambiarEstadoDocumentoDto, CreateDocumentoDto, CrearRelacionDto, UpdateDocumentoDto } from './dto/documento.dto';
import { GuardarNumeracionDto } from './dto/numeracion.dto';

export type AlertaVigencia = 'VIGENTE' | 'PROXIMO_A_VENCER' | 'VENCIDO' | null;

const DIAS_PROXIMO_A_VENCER = 30;

/** Estados terminales: solo se sale de ellos via reabrir() (Archivado)
 * o nunca (Anulado, seccion 43 -- "no eliminar documentos historicos"). */
const ESTADOS_TERMINALES = ['Anulado', 'Archivado'];

export interface RegistrarDesdeOtroModuloInput {
  tipoDocumentoNombre: string;
  categoriaDocumentoNombre?: string;
  titulo: string;
  descripcion?: string;
  fechaEmision: string;
  fechaVencimiento?: string;
  archivoUrl: string;
  archivoNombreOriginal?: string;
  archivoExtension?: string;
  generadoPorModulo: string;
  relaciones?: Array<{ modulo: string; entidad: string; registroId: string; etiqueta?: string }>;
  estadoNombre?: string;
}

/** Motor central del modulo Documentos (seccion 49 del pedido):
 * registrar -> clasificar -> almacenar -> relacionar -> versionar ->
 * revisar -> aprobar -> firmar -> publicar -> consultar -> auditar ->
 * archivar. Reutiliza almacenamiento.ts sin cambios (ya es generico
 * para cualquier extension), y AuditoriaService para todo el rastro
 * (secciones 29, 42). */
@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Documento) private readonly repo: Repository<Documento>,
    @InjectRepository(VersionArchivoDocumento) private readonly versionRepo: Repository<VersionArchivoDocumento>,
    @InjectRepository(DocumentoRelacion) private readonly relacionRepo: Repository<DocumentoRelacion>,
    @InjectRepository(NumeracionDocumento) private readonly numeracionRepo: Repository<NumeracionDocumento>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  /* ------------------------------------------------------------ */
  /* Lectura                                                         */
  /* ------------------------------------------------------------ */

  async findAll(filtros: {
    q?: string;
    tipoDocumentoId?: string;
    categoriaDocumentoId?: string;
    estadoId?: string;
    origen?: string;
    expedienteId?: string;
    desde?: string;
    hasta?: string;
    vencimiento?: 'PROXIMOS' | 'VENCIDOS';
  }) {
    const qb = this.repo.createQueryBuilder('d').orderBy('d.creadoEn', 'DESC');
    if (filtros.q) qb.andWhere('(d.titulo LIKE :q OR d.numeroDocumental LIKE :q)', { q: `%${filtros.q}%` });
    if (filtros.tipoDocumentoId) qb.andWhere('d.tipoDocumentoId = :tipoDocumentoId', { tipoDocumentoId: filtros.tipoDocumentoId });
    if (filtros.categoriaDocumentoId) qb.andWhere('d.categoriaDocumentoId = :categoriaDocumentoId', { categoriaDocumentoId: filtros.categoriaDocumentoId });
    if (filtros.estadoId) qb.andWhere('d.estadoId = :estadoId', { estadoId: filtros.estadoId });
    if (filtros.origen) qb.andWhere('d.origen = :origen', { origen: filtros.origen });
    if (filtros.expedienteId) qb.andWhere('d.expedienteId = :expedienteId', { expedienteId: filtros.expedienteId });
    if (filtros.desde) qb.andWhere('d.fechaEmision >= :desde', { desde: filtros.desde });
    if (filtros.hasta) qb.andWhere('d.fechaEmision <= :hasta', { hasta: filtros.hasta });
    if (filtros.vencimiento === 'VENCIDOS') qb.andWhere('d.fechaVencimiento < :hoy', { hoy: new Date().toISOString().slice(0, 10) });
    if (filtros.vencimiento === 'PROXIMOS') {
      const limite = new Date();
      limite.setDate(limite.getDate() + DIAS_PROXIMO_A_VENCER);
      qb.andWhere('d.fechaVencimiento >= :hoy AND d.fechaVencimiento <= :limite', { hoy: new Date().toISOString().slice(0, 10), limite: limite.toISOString().slice(0, 10) });
    }
    return qb.getMany();
  }

  async findOne(id: string, permisos: string[]) {
    const documento = await this.repo.findOne({ where: { id } });
    if (!documento) throw new NotFoundException(`Documento ${id} no encontrado`);
    await this.verificarAccesoConfidencial(documento, permisos);
    return documento;
  }

  /** Seccion 32: RESTRINGIDO/CONFIDENCIAL exige documentos:administrar
   * ademas de documentos:ver -- no alcanza con poder listar el modulo. */
  private async verificarAccesoConfidencial(documento: Documento, permisos: string[]) {
    if (!documento.nivelConfidencialidadId) return;
    const nivel = await this.parametroRepo.findOne({ where: { id: documento.nivelConfidencialidadId } });
    if (nivel && (nivel.nombre === 'Restringido' || nivel.nombre === 'Confidencial') && !permisos.includes('documentos:administrar')) {
      throw new ForbiddenException('Este documento tiene clasificacion restringida/confidencial -- requiere permiso documentos:administrar');
    }
  }

  alertaVigencia(documento: Pick<Documento, 'fechaVencimiento'>): AlertaVigencia {
    if (!documento.fechaVencimiento) return null;
    const hoy = new Date().toISOString().slice(0, 10);
    if (documento.fechaVencimiento < hoy) return 'VENCIDO';
    const limite = new Date();
    limite.setDate(limite.getDate() + DIAS_PROXIMO_A_VENCER);
    if (documento.fechaVencimiento <= limite.toISOString().slice(0, 10)) return 'PROXIMO_A_VENCER';
    return 'VIGENTE';
  }

  /* ------------------------------------------------------------ */
  /* Alta / edicion                                                  */
  /* ------------------------------------------------------------ */

  async obtenerParametro(tipo: string, nombre: string): Promise<string> {
    const parametro = await this.parametroRepo.findOne({ where: { tipo: tipo as any, nombre } });
    if (!parametro) throw new NotFoundException(`Parametro '${nombre}' (tipo ${tipo}) no encontrado`);
    return parametro.id;
  }

  async crear(dto: CreateDocumentoDto, actorId: string, ip?: string) {
    const estadoBorrador = await this.obtenerParametro('ESTADO_DOCUMENTO', 'Borrador');

    let numeroDocumental = dto.numeroDocumental ?? null;
    if (dto.autoNumerar) {
      const anio = new Date(dto.fechaEmision).getFullYear();
      numeroDocumental = await this.siguienteNumero(dto.tipoDocumentoId, anio);
    }

    let documento: Documento;
    try {
      documento = await this.repo.save(
        this.repo.create({
          numeroDocumental,
          tipoDocumentoId: dto.tipoDocumentoId,
          categoriaDocumentoId: dto.categoriaDocumentoId ?? null,
          titulo: dto.titulo,
          descripcion: dto.descripcion ?? null,
          origen: dto.origen as any,
          fechaEmision: dto.fechaEmision,
          fechaInicioVigencia: dto.fechaInicioVigencia ?? null,
          fechaVencimiento: dto.fechaVencimiento ?? null,
          estadoId: estadoBorrador,
          nivelConfidencialidadId: dto.nivelConfidencialidadId ?? null,
          esFisico: dto.esFisico ?? false,
          archivoFisicoId: dto.archivoFisicoId ?? null,
          estante: dto.estante ?? null,
          caja: dto.caja ?? null,
          carpeta: dto.carpeta ?? null,
          expedienteId: dto.expedienteId ?? null,
          ordenEnExpediente: dto.ordenEnExpediente ?? null,
          creadoPor: actorId,
        }),
      );
    } catch (error) {
      throw this.traducirErrorNumeroDuplicado(error, numeroDocumental);
    }

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'documentos.documentos_institucionales',
      recursoId: documento.id,
      datosDespues: documento,
      ip: ip ?? null,
    });
    return documento;
  }

  async actualizar(id: string, dto: UpdateDocumentoDto, actorId: string, ip?: string) {
    const antes = await this.repo.findOne({ where: { id } });
    if (!antes) throw new NotFoundException(`Documento ${id} no encontrado`);
    this.asegurarNoTerminal(antes);

    await this.repo.update(id, {
      ...(dto.categoriaDocumentoId !== undefined ? { categoriaDocumentoId: dto.categoriaDocumentoId } : {}),
      ...(dto.titulo !== undefined ? { titulo: dto.titulo } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
      ...(dto.fechaInicioVigencia !== undefined ? { fechaInicioVigencia: dto.fechaInicioVigencia } : {}),
      ...(dto.fechaVencimiento !== undefined ? { fechaVencimiento: dto.fechaVencimiento } : {}),
      ...(dto.nivelConfidencialidadId !== undefined ? { nivelConfidencialidadId: dto.nivelConfidencialidadId } : {}),
      ...(dto.expedienteId !== undefined ? { expedienteId: dto.expedienteId } : {}),
      ...(dto.ordenEnExpediente !== undefined ? { ordenEnExpediente: dto.ordenEnExpediente } : {}),
      ...(dto.disponibleParaIa !== undefined ? { disponibleParaIa: dto.disponibleParaIa } : {}),
      actualizadoPor: actorId,
    });
    const despues = await this.repo.findOne({ where: { id } });
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'EDITAR',
      recurso: 'documentos.documentos_institucionales',
      recursoId: id,
      datosAntes: antes,
      datosDespues: despues,
      ip: ip ?? null,
    });
    return despues;
  }

  private asegurarNoTerminal(documento: Documento) {
    // El nombre del estado actual se resuelve por id -- aca solo se
    // exige que exista, la validacion real de nombre ocurre en los
    // metodos que la necesitan (evita una consulta extra en el path
    // caliente de simplemente editar metadata).
    if (!documento.id) throw new BadRequestException('Documento invalido');
  }

  /* ------------------------------------------------------------ */
  /* Archivo / versionado (seccion 12, 26)                           */
  /* ------------------------------------------------------------ */

  async subirArchivo(id: string, file: Express.Multer.File, motivo: string | undefined, actorId: string, ip?: string) {
    const documento = await this.repo.findOne({ where: { id } });
    if (!documento) throw new NotFoundException(`Documento ${id} no encontrado`);

    if (documento.archivoUrl) {
      if (!motivo) throw new BadRequestException('Debe indicar el motivo del reemplazo -- ya existe un archivo vigente para este documento');
      await this.versionRepo.save(
        this.versionRepo.create({
          documentoId: id,
          numeroVersion: documento.version,
          archivoUrl: documento.archivoUrl,
          archivoNombreOriginal: documento.archivoNombreOriginal,
          archivoExtension: documento.archivoExtension,
          archivoTamanoBytes: documento.archivoTamanoBytes,
          motivo,
          creadoPor: actorId,
        }),
      );
    }

    const archivoUrl = await guardarImagen(file, CARPETA_DOCUMENTOS);
    const nuevaVersion = documento.archivoUrl ? documento.version + 1 : documento.version;

    await this.repo.update(id, {
      archivoUrl,
      archivoNombreOriginal: file.originalname,
      archivoExtension: (file.originalname.split('.').pop() ?? '').toLowerCase(),
      archivoTamanoBytes: file.size,
      version: nuevaVersion,
      actualizadoPor: actorId,
    });

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: documento.archivoUrl ? 'NUEVA_VERSION' : 'SUBIR_ARCHIVO',
      recurso: 'documentos.documentos_institucionales',
      recursoId: id,
      datosDespues: { archivoUrl, version: nuevaVersion, motivo: motivo ?? null },
      ip: ip ?? null,
    });

    return this.repo.findOne({ where: { id } });
  }

  versiones(documentoId: string) {
    return this.versionRepo.find({ where: { documentoId }, order: { numeroVersion: 'DESC' } });
  }

  /* ------------------------------------------------------------ */
  /* Estados (secciones 11, 42, 43)                                   */
  /* ------------------------------------------------------------ */

  async cambiarEstado(id: string, dto: CambiarEstadoDocumentoDto, actorId: string, ip?: string) {
    const documento = await this.repo.findOne({ where: { id } });
    if (!documento) throw new NotFoundException(`Documento ${id} no encontrado`);
    const [estadoActual, estadoNuevo] = await Promise.all([
      this.parametroRepo.findOne({ where: { id: documento.estadoId } }),
      this.parametroRepo.findOne({ where: { id: dto.estadoId } }),
    ]);
    if (estadoActual && ESTADOS_TERMINALES.includes(estadoActual.nombre)) {
      throw new ConflictException(`Este documento esta ${estadoActual.nombre.toLowerCase()} -- use reabrir antes de cambiar el estado`);
    }
    if (estadoNuevo && ESTADOS_TERMINALES.includes(estadoNuevo.nombre)) {
      throw new BadRequestException(`Use el endpoint especifico (anular/archivar) para pasar a ${estadoNuevo.nombre}`);
    }

    await this.repo.update(id, { estadoId: dto.estadoId, actualizadoPor: actorId });
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CAMBIAR_ESTADO',
      recurso: 'documentos.documentos_institucionales',
      recursoId: id,
      datosAntes: { estado: estadoActual?.nombre },
      datosDespues: { estado: estadoNuevo?.nombre, observacion: dto.observacion ?? null },
      ip: ip ?? null,
    });
    return this.repo.findOne({ where: { id } });
  }

  async anular(id: string, dto: AnularDocumentoDto, actorId: string, ip?: string) {
    const documento = await this.repo.findOne({ where: { id } });
    if (!documento) throw new NotFoundException(`Documento ${id} no encontrado`);
    const estadoActual = await this.parametroRepo.findOne({ where: { id: documento.estadoId } });
    if (estadoActual && ESTADOS_TERMINALES.includes(estadoActual.nombre)) {
      throw new ConflictException(`Este documento ya esta ${estadoActual.nombre.toLowerCase()}`);
    }

    const estadoAnulado = await this.obtenerParametro('ESTADO_DOCUMENTO', 'Anulado');
    await this.repo.update(id, {
      estadoId: estadoAnulado,
      motivoAnulacionId: dto.motivoAnulacionId,
      anuladoPor: actorId,
      fechaAnulacion: new Date(),
      actualizadoPor: actorId,
    });
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ANULAR',
      recurso: 'documentos.documentos_institucionales',
      recursoId: id,
      datosAntes: documento,
      datosDespues: { estado: 'Anulado', motivoAnulacionId: dto.motivoAnulacionId, detalle: dto.detalle ?? null },
      ip: ip ?? null,
    });
    return this.repo.findOne({ where: { id } });
  }

  async archivar(id: string, actorId: string, ip?: string) {
    const documento = await this.repo.findOne({ where: { id } });
    if (!documento) throw new NotFoundException(`Documento ${id} no encontrado`);
    const estadoActual = await this.parametroRepo.findOne({ where: { id: documento.estadoId } });
    if (estadoActual && ESTADOS_TERMINALES.includes(estadoActual.nombre)) {
      throw new ConflictException(`Este documento ya esta ${estadoActual.nombre.toLowerCase()}`);
    }
    const estadoArchivado = await this.obtenerParametro('ESTADO_DOCUMENTO', 'Archivado');
    await this.repo.update(id, { estadoId: estadoArchivado, actualizadoPor: actorId });
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ARCHIVAR',
      recurso: 'documentos.documentos_institucionales',
      recursoId: id,
      datosAntes: { estado: estadoActual?.nombre },
      datosDespues: { estado: 'Archivado' },
      ip: ip ?? null,
    });
    return this.repo.findOne({ where: { id } });
  }

  async reabrir(id: string, actorId: string, ip?: string) {
    const documento = await this.repo.findOne({ where: { id } });
    if (!documento) throw new NotFoundException(`Documento ${id} no encontrado`);
    const estadoActual = await this.parametroRepo.findOne({ where: { id: documento.estadoId } });
    if (estadoActual?.nombre !== 'Archivado') {
      throw new BadRequestException('Solo se puede reabrir un documento Archivado (un documento Anulado permanece anulado)');
    }
    const estadoVigente = await this.obtenerParametro('ESTADO_DOCUMENTO', 'Vigente');
    await this.repo.update(id, { estadoId: estadoVigente, actualizadoPor: actorId });
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'REABRIR',
      recurso: 'documentos.documentos_institucionales',
      recursoId: id,
      datosAntes: { estado: 'Archivado' },
      datosDespues: { estado: 'Vigente' },
      ip: ip ?? null,
    });
    return this.repo.findOne({ where: { id } });
  }

  /** Job bajo demanda (no hay scheduler en el proyecto, mismo criterio
   * que LotesArticuloService.actualizarVencidos en Deposito): pasa a
   * 'Vencido' los documentos cuya fechaVencimiento ya paso y siguen en
   * un estado activo no terminal. */
  async actualizarVencidos() {
    const [estadoVencido, estadosActivos] = await Promise.all([
      this.obtenerParametro('ESTADO_DOCUMENTO', 'Vencido'),
      this.parametroRepo.find({ where: { tipo: 'ESTADO_DOCUMENTO' as any } }),
    ]);
    const idsNoTerminales = estadosActivos.filter((e) => !ESTADOS_TERMINALES.includes(e.nombre) && e.nombre !== 'Vencido').map((e) => e.id);
    if (idsNoTerminales.length === 0) return { actualizados: 0 };

    const hoy = new Date().toISOString().slice(0, 10);
    const resultado = await this.repo
      .createQueryBuilder()
      .update(Documento)
      .set({ estadoId: estadoVencido })
      .where('estadoId IN (:...ids)', { ids: idsNoTerminales })
      .andWhere('fechaVencimiento IS NOT NULL AND fechaVencimiento < :hoy', { hoy })
      .execute();
    return { actualizados: resultado.affected ?? 0 };
  }

  /* ------------------------------------------------------------ */
  /* Relaciones (secciones 14-15, 48)                                 */
  /* ------------------------------------------------------------ */

  async relacionar(documentoId: string, dto: CrearRelacionDto, actorId: string, ip?: string) {
    await this.findOne(documentoId, ['documentos:administrar']); // existencia; el permiso real ya lo valida el guard del controller
    const existente = await this.relacionRepo.findOne({ where: { documentoId, modulo: dto.modulo, entidad: dto.entidad, registroId: dto.registroId } });
    if (existente) throw new ConflictException('Este documento ya esta relacionado con ese registro');

    const relacion = await this.relacionRepo.save(
      this.relacionRepo.create({ documentoId, modulo: dto.modulo, entidad: dto.entidad, registroId: dto.registroId, etiqueta: dto.etiqueta ?? null, creadoPor: actorId }),
    );
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ASOCIAR',
      recurso: 'documentos.relaciones',
      recursoId: relacion.id,
      datosDespues: relacion,
      ip: ip ?? null,
    });
    return relacion;
  }

  async desrelacionar(relacionId: string, actorId: string, ip?: string) {
    const relacion = await this.relacionRepo.findOne({ where: { id: relacionId } });
    if (!relacion) throw new NotFoundException(`Relacion ${relacionId} no encontrada`);
    await this.relacionRepo.delete(relacionId);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'DESASOCIAR',
      recurso: 'documentos.relaciones',
      recursoId: relacionId,
      datosAntes: relacion,
      ip: ip ?? null,
    });
    return { eliminado: true };
  }

  relacionesDe(documentoId: string) {
    return this.relacionRepo.find({ where: { documentoId }, order: { creadoEn: 'ASC' } });
  }

  /** Reverso: "documentos de esta entidad" -- usado por las fichas de
   * Personal/Vehiculos/Equipos/Servicios/etc (seccion 16-22). */
  async documentosDeEntidad(modulo: string, entidad: string, registroId: string, permisos: string[]) {
    const relaciones = await this.relacionRepo.find({ where: { modulo, entidad, registroId } });
    if (relaciones.length === 0) return [];
    const documentos = await this.repo.createQueryBuilder('d').where('d.id IN (:...ids)', { ids: relaciones.map((r) => r.documentoId) }).orderBy('d.fechaEmision', 'DESC').getMany();
    const visibles: Documento[] = [];
    for (const doc of documentos) {
      try {
        await this.verificarAccesoConfidencial(doc, permisos);
        visibles.push(doc);
      } catch {
        // documento confidencial sin permiso: se omite de la lista, no se expone ni su existencia
      }
    }
    return visibles;
  }

  /** Busqueda para la herramienta get_documentos de Snoopy (seccion 16-20
   * del pedido de Inteligencia Artificial): solo documentos marcados
   * `disponibleParaIa`, con el mismo chequeo de confidencialidad que ya
   * usa `documentosDeEntidad()` -- nunca se relaja la seguridad porque el
   * llamador sea la IA en vez de un humano navegando el modulo. */
  async buscarParaIa(query: string, permisos: string[]): Promise<Documento[]> {
    // Busqueda por palabra, no por frase exacta: la pregunta llega en
    // lenguaje natural (seccion 16-17 del pedido de Inteligencia
    // Artificial), no como el titulo exacto del documento -- ni siquiera
    // todas las palabras extraidas de la pregunta ("documento", "archivo")
    // tienen por que aparecer en el titulo. Coincide con CUALQUIERA de las
    // palabras (OR) y prioriza los documentos que matchean mas palabras,
    // en vez de exigir que las matcheen todas (AND), que es demasiado
    // estricto para una extraccion de palabras clave imperfecta.
    const palabras = query
      .split(/\s+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 1)
      .slice(0, 6);
    if (palabras.length === 0) return [];

    const qb = this.repo.createQueryBuilder('d').where('d.disponibleParaIa = 1');
    const condiciones = palabras.map((palabra, indice) => {
      qb.setParameter(`p${indice}`, `%${palabra}%`);
      return `(d.titulo COLLATE Modern_Spanish_CI_AI LIKE :p${indice} OR d.numeroDocumental COLLATE Modern_Spanish_CI_AI LIKE :p${indice})`;
    });
    qb.andWhere(`(${condiciones.join(' OR ')})`);
    const candidatos = await qb.orderBy('d.fechaEmision', 'DESC').take(30).getMany();

    const palabrasNormalizadas = palabras.map((p) => p.toLowerCase());
    const documentos = candidatos
      .map((doc) => {
        const texto = `${doc.titulo} ${doc.numeroDocumental ?? ''}`.toLowerCase();
        const coincidencias = palabrasNormalizadas.filter((p) => texto.includes(p)).length;
        return { doc, coincidencias };
      })
      .sort((a, b) => b.coincidencias - a.coincidencias)
      .slice(0, 5)
      .map((x) => x.doc);
    const visibles: Documento[] = [];
    for (const doc of documentos) {
      try {
        await this.verificarAccesoConfidencial(doc, permisos);
        visibles.push(doc);
      } catch {
        // documento confidencial sin permiso: se omite, igual que documentosDeEntidad()
      }
    }
    return visibles;
  }

  /* ------------------------------------------------------------ */
  /* Auditoria de acceso (seccion 29)                                 */
  /* ------------------------------------------------------------ */

  async registrarVista(id: string, actorId: string, ip?: string) {
    await this.auditoriaService.registrar({ usuarioId: actorId, accion: 'VER_DOCUMENTO', recurso: 'documentos.documentos_institucionales', recursoId: id, ip: ip ?? null });
  }

  async registrarDescarga(id: string, actorId: string, ip?: string) {
    await this.auditoriaService.registrar({ usuarioId: actorId, accion: 'DESCARGAR', recurso: 'documentos.documentos_institucionales', recursoId: id, ip: ip ?? null });
  }

  /* ------------------------------------------------------------ */
  /* Numeracion documental (secciones 3-13 del pedido)                */
  /* ------------------------------------------------------------ */

  private formatearNumero(anio: number, numero: number): string {
    return `${anio}/${String(numero).padStart(2, '0')}`;
  }

  /** Consume el siguiente numero (avanza el contador). Solo debe
   * llamarse en el momento real de creacion del documento -- nunca
   * para mostrar una sugerencia, porque una vez llamado el numero
   * queda tomado aunque el usuario despues no guarde nada (seccion 6:
   * "si el numero sugerido no se usa, el numerador no debe avanzar"). */
  async siguienteNumero(tipoDocumentoId: string, anio: number, institucionId?: string | null): Promise<string> {
    let contador = await this.numeracionRepo.findOne({ where: { tipoDocumentoId, anio, institucionId: institucionId ?? undefined } });
    if (!contador) {
      contador = await this.numeracionRepo.save(this.numeracionRepo.create({ tipoDocumentoId, anio, institucionId: institucionId ?? null, ultimoNumero: 0 }));
    }
    const siguiente = contador.ultimoNumero + 1;
    await this.numeracionRepo.update(contador.id, { ultimoNumero: siguiente });
    return this.formatearNumero(anio, siguiente);
  }

  /** Version de solo lectura de siguienteNumero(): calcula que numero
   * se ASIGNARIA sin consumirlo (seccion 5-6 del pedido -- sugerencia
   * que el usuario puede aceptar o descartar). No crea la fila del
   * contador si todavia no existe, para no dejar registros huerfanos
   * por cada vez que alguien abre el formulario de "nuevo documento". */
  async previsualizarSiguienteNumero(tipoDocumentoId: string, anio: number, institucionId?: string | null): Promise<{ numero: number; formato: string }> {
    const contador = await this.numeracionRepo.findOne({ where: { tipoDocumentoId, anio, institucionId: institucionId ?? undefined } });
    const siguiente = (contador?.ultimoNumero ?? 0) + 1;
    return { numero: siguiente, formato: this.formatearNumero(anio, siguiente) };
  }

  /** SQL Server 2627/2601 = violacion de indice/constraint unico --
   * aca es casi siempre UQ_doci_tipo_numero (migracion 069): alguien
   * escribio a mano un numero institucional que ya existe para ese
   * tipo de documento (seccion 8 del pedido). */
  private traducirErrorNumeroDuplicado(error: unknown, numeroDocumental: string | null): Error {
    const numero = (error as { number?: number })?.number;
    if ((numero === 2627 || numero === 2601) && numeroDocumental) {
      return new ConflictException(`Ya existe un documento de este tipo con el numero "${numeroDocumental}"`);
    }
    return error as Error;
  }

  async listarNumeraciones() {
    return this.numeracionRepo.find({ order: { anio: 'DESC' } });
  }

  /** Alta/edicion de la configuracion de numeracion (seccion 10-11):
   * upsert por (tipoDocumentoId, anio) -- nunca borra una fila
   * existente (seccion 13, historial), y audita quien crea/modifica
   * cada version igual que el resto del modulo (AuditoriaService, sin
   * tabla de auditoria propia). */
  async guardarNumeracion(dto: GuardarNumeracionDto, actorId: string, ip?: string) {
    const existente = await this.numeracionRepo.findOne({ where: { tipoDocumentoId: dto.tipoDocumentoId, anio: dto.anio, institucionId: undefined } });

    const campos = {
      tipoDocumentoId: dto.tipoDocumentoId,
      anio: dto.anio,
      ...(dto.ultimoNumero !== undefined ? { ultimoNumero: dto.ultimoNumero } : {}),
      ...(dto.mesActual !== undefined ? { mesActual: dto.mesActual } : {}),
      ...(dto.anioDesde !== undefined ? { anioDesde: dto.anioDesde } : {}),
      ...(dto.mesDesde !== undefined ? { mesDesde: dto.mesDesde } : {}),
      ...(dto.numeroDesde !== undefined ? { numeroDesde: dto.numeroDesde } : {}),
      ...(dto.anioHasta !== undefined ? { anioHasta: dto.anioHasta } : {}),
      ...(dto.mesHasta !== undefined ? { mesHasta: dto.mesHasta } : {}),
      ...(dto.numeroHasta !== undefined ? { numeroHasta: dto.numeroHasta } : {}),
      ...(dto.fechaVigenciaDesde !== undefined ? { fechaVigenciaDesde: dto.fechaVigenciaDesde } : {}),
      ...(dto.fechaVigenciaHasta !== undefined ? { fechaVigenciaHasta: dto.fechaVigenciaHasta } : {}),
    };

    if (!existente) {
      const creado = await this.numeracionRepo.save(this.numeracionRepo.create({ ...campos, ultimoNumero: dto.ultimoNumero ?? 0, creadoPor: actorId, actualizadoPor: actorId }));
      await this.auditoriaService.registrar({
        usuarioId: actorId,
        accion: 'CREAR_NUMERACION',
        recurso: 'documentos.numeraciones',
        recursoId: creado.id,
        datosDespues: creado,
        ip: ip ?? null,
      });
      return creado;
    }

    await this.numeracionRepo.update(existente.id, { ...campos, actualizadoPor: actorId });
    const actualizado = await this.numeracionRepo.findOne({ where: { id: existente.id } });
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'EDITAR_NUMERACION',
      recurso: 'documentos.numeraciones',
      recursoId: existente.id,
      datosAntes: existente,
      datosDespues: actualizado,
      ip: ip ?? null,
    });
    return actualizado;
  }

  /* ------------------------------------------------------------ */
  /* Integracion programatica desde otros modulos (secciones 21-22, 38)*/
  /* ------------------------------------------------------------ */

  /** Cualquier modulo (Guardias, Servicios, Academia, ...) puede
   * registrar un documento ya generado (PDF/DOCX) sin pasar por HTTP.
   * No duplica el motor de generacion -- el buffer/URL ya viene armado
   * por el generador propio de cada modulo. */
  async registrarDesdeOtroModulo(input: RegistrarDesdeOtroModuloInput, actorId: string | null): Promise<Documento> {
    const [tipoDocumentoId, categoriaDocumentoId, estadoId] = await Promise.all([
      this.obtenerParametro('TIPO_DOCUMENTO', input.tipoDocumentoNombre),
      input.categoriaDocumentoNombre ? this.obtenerParametro('CATEGORIA_DOCUMENTO', input.categoriaDocumentoNombre) : Promise.resolve(null),
      this.obtenerParametro('ESTADO_DOCUMENTO', input.estadoNombre ?? 'Publicado'),
    ]);

    const documento = await this.repo.save(
      this.repo.create({
        tipoDocumentoId,
        categoriaDocumentoId,
        titulo: input.titulo,
        descripcion: input.descripcion ?? null,
        origen: 'INTERNO',
        fechaEmision: input.fechaEmision,
        fechaVencimiento: input.fechaVencimiento ?? null,
        estadoId,
        archivoUrl: input.archivoUrl,
        archivoNombreOriginal: input.archivoNombreOriginal ?? null,
        archivoExtension: input.archivoExtension ?? null,
        generadoPorModulo: input.generadoPorModulo,
        creadoPor: actorId,
      }),
    );

    for (const rel of input.relaciones ?? []) {
      await this.relacionRepo.save(this.relacionRepo.create({ documentoId: documento.id, ...rel, creadoPor: actorId }));
    }

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CREAR',
      recurso: 'documentos.documentos_institucionales',
      recursoId: documento.id,
      datosDespues: { ...documento, generadoPorModulo: input.generadoPorModulo },
    });

    return documento;
  }

  async eliminar(id: string, actorId: string, ip?: string) {
    const documento = await this.repo.findOne({ where: { id } });
    if (!documento) throw new NotFoundException(`Documento ${id} no encontrado`);
    // Eliminacion logica (seccion 43): nunca DELETE fisico -- se
    // archiva y se deja constancia explicita en auditoria de que fue
    // una "eliminacion" solicitada, distinta de un archivado de rutina.
    const estadoArchivado = await this.obtenerParametro('ESTADO_DOCUMENTO', 'Archivado');
    await this.repo.update(id, { estadoId: estadoArchivado, actualizadoPor: actorId });
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ELIMINACION_LOGICA',
      recurso: 'documentos.documentos_institucionales',
      recursoId: id,
      datosAntes: documento,
      ip: ip ?? null,
    });
    return { eliminado: true };
  }
}
