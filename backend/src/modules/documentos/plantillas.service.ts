import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Bombero,
  Cargo,
  Designacion,
  Documento,
  DocumentoRelacion,
  FirmaDocumento,
  IdentidadInstitucional,
  Parametro,
  PlantillaDocumento,
  Rango,
} from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { resolverEncabezadoInstitucional } from '../../shared/utils/identidad-institucional';
import { resolverFirmante } from '../../shared/utils/firmantes-institucionales';
import { generarDocumentoPlantillaPdf } from '../../shared/utils/reporte-documento-plantilla-pdf';
import { guardarBuffer } from '../../shared/utils/almacenamiento';
import { DocumentosService } from './documentos.service';
import { CreatePlantillaDto, GenerarDesdePlantillaDto, UpdatePlantillaDto } from './dto/plantilla.dto';

const CARPETA_DOCUMENTOS_GENERADOS = 'documentos-generados';

/** Plantillas documentales con placeholders {{CAMPO}} (seccion 40). El
 * firmante se resuelve por Cargo (nunca un nombre fijo -- seccion 41),
 * reutilizando resolverFirmante() tal cual lo usan Academia/Guardias. */
@Injectable()
export class PlantillasService {
  constructor(
    @InjectRepository(PlantillaDocumento) private readonly repo: Repository<PlantillaDocumento>,
    @InjectRepository(Documento) private readonly documentoRepo: Repository<Documento>,
    @InjectRepository(DocumentoRelacion) private readonly relacionRepo: Repository<DocumentoRelacion>,
    @InjectRepository(FirmaDocumento) private readonly firmaRepo: Repository<FirmaDocumento>,
    @InjectRepository(Parametro) private readonly parametroRepo: Repository<Parametro>,
    @InjectRepository(IdentidadInstitucional) private readonly identidadRepo: Repository<IdentidadInstitucional>,
    @InjectRepository(Cargo) private readonly cargoRepo: Repository<Cargo>,
    @InjectRepository(Designacion) private readonly designacionRepo: Repository<Designacion>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(Rango) private readonly rangoRepo: Repository<Rango>,
    private readonly documentosService: DocumentosService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  findAll(activa?: string) {
    const qb = this.repo.createQueryBuilder('p').orderBy('p.nombre', 'ASC');
    if (activa !== undefined) qb.andWhere('p.activa = :activa', { activa: activa === 'true' });
    return qb.getMany();
  }

  async findOne(id: string) {
    const plantilla = await this.repo.findOne({ where: { id } });
    if (!plantilla) throw new NotFoundException(`Plantilla ${id} no encontrada`);
    return plantilla;
  }

  async create(dto: CreatePlantillaDto, actorId: string, ip?: string) {
    const plantilla = await this.repo.save(
      this.repo.create({ nombre: dto.nombre, tipoDocumentoId: dto.tipoDocumentoId ?? null, contenido: dto.contenido, cargoFirmanteId: dto.cargoFirmanteId ?? null, creadoPor: actorId }),
    );
    await this.auditoriaService.registrar({ usuarioId: actorId, accion: 'CREAR', recurso: 'documentos.plantillas', recursoId: plantilla.id, datosDespues: plantilla, ip: ip ?? null });
    return plantilla;
  }

  async update(id: string, dto: UpdatePlantillaDto, actorId: string, ip?: string) {
    const antes = await this.findOne(id);
    await this.repo.update(id, {
      ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
      ...(dto.contenido !== undefined ? { contenido: dto.contenido } : {}),
      ...(dto.cargoFirmanteId !== undefined ? { cargoFirmanteId: dto.cargoFirmanteId } : {}),
      ...(dto.activa !== undefined ? { activa: dto.activa } : {}),
      actualizadoPor: actorId,
    });
    const despues = await this.findOne(id);
    await this.auditoriaService.registrar({ usuarioId: actorId, accion: 'EDITAR', recurso: 'documentos.plantillas', recursoId: id, datosAntes: antes, datosDespues: despues, ip: ip ?? null });
    return despues;
  }

  /** Rellena {{CAMPO}} -> valor. Campos sin valor provisto quedan
   * visibles tal cual (nunca se ocultan silenciosamente un dato
   * faltante). */
  private rellenar(contenido: string, campos: Record<string, string>): string {
    return contenido.replace(/\{\{\s*([A-Z_0-9]+)\s*\}\}/g, (match, clave) => (campos[clave] !== undefined ? campos[clave] : match));
  }

  async generar(plantillaId: string, dto: GenerarDesdePlantillaDto, actorId: string, ip?: string): Promise<Documento> {
    const plantilla = await this.findOne(plantillaId);
    const contenidoFinal = this.rellenar(plantilla.contenido, dto.campos);
    const cargoFirmanteId = dto.cargoFirmanteId ?? plantilla.cargoFirmanteId;

    const [institucional, firmante] = await Promise.all([
      resolverEncabezadoInstitucional(this.identidadRepo),
      cargoFirmanteId
        ? resolverFirmante({ cargoRepo: this.cargoRepo, designacionRepo: this.designacionRepo, bomberoRepo: this.bomberoRepo, rangoRepo: this.rangoRepo }, cargoFirmanteId, null)
        : Promise.resolve(null),
    ]);

    let numeroDocumental: string | null = null;
    if (dto.autoNumerar && plantilla.tipoDocumentoId) {
      numeroDocumental = await this.documentosService.siguienteNumero(plantilla.tipoDocumentoId, new Date(dto.fechaEmision).getFullYear());
    }

    const buffer = await generarDocumentoPlantillaPdf({
      generadoEn: new Date().toISOString(),
      institucional,
      titulo: dto.titulo,
      numeroDocumental,
      fecha: dto.fechaEmision,
      contenido: contenidoFinal,
      firmante,
    });
    const archivoUrl = await guardarBuffer(buffer, '.pdf', CARPETA_DOCUMENTOS_GENERADOS);

    const estadoId = await this.documentosService.obtenerParametro('ESTADO_DOCUMENTO', firmante ? 'Firmado' : 'Publicado');
    const documento = await this.documentoRepo.save(
      this.documentoRepo.create({
        numeroDocumental,
        tipoDocumentoId: plantilla.tipoDocumentoId ?? (await this.documentosService.obtenerParametro('TIPO_DOCUMENTO', 'Otro')),
        categoriaDocumentoId: dto.categoriaDocumentoId ?? null,
        titulo: dto.titulo,
        descripcion: `Generado desde plantilla "${plantilla.nombre}"`,
        origen: 'INTERNO',
        fechaEmision: dto.fechaEmision,
        estadoId,
        archivoUrl,
        archivoNombreOriginal: `${dto.titulo}.pdf`,
        archivoExtension: 'pdf',
        plantillaId: plantilla.id,
        generadoPorModulo: 'documentos',
        creadoPor: actorId,
      }),
    );

    for (const rel of dto.relaciones ?? []) {
      await this.relacionRepo.save(this.relacionRepo.create({ documentoId: documento.id, ...rel, creadoPor: actorId }));
    }

    if (cargoFirmanteId) {
      await this.firmaRepo.save(
        this.firmaRepo.create({
          documentoId: documento.id,
          cargoFirmanteId,
          etiquetaRol: firmante?.etiquetaCargo ?? null,
          firmado: !!firmante?.firmaDigitalUrl,
          firmaUrl: firmante?.firmaDigitalUrl ?? null,
          fechaFirma: firmante?.firmaDigitalUrl ? new Date() : null,
          firmadoPor: firmante?.firmaDigitalUrl ? actorId : null,
        }),
      );
    }

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'GENERAR_DESDE_PLANTILLA',
      recurso: 'documentos.documentos_institucionales',
      recursoId: documento.id,
      datosDespues: { plantillaId, archivoUrl },
      ip: ip ?? null,
    });

    return documento;
  }
}
