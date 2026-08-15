import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bombero, Cargo, Designacion, FirmaDocumento, Rango } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { resolverFirmante } from '../../shared/utils/firmantes-institucionales';
import { DocumentosService } from './documentos.service';
import { ConfirmarFirmaManualDto, DefinirFirmantesDto } from './dto/firma-documento.dto';

/** Firmantes requeridos de un documento (secciones 9-10 del pedido).
 * Antes de estampar una firma digital automaticamente: verifica que
 * existe, que esta autorizada, y que corresponde al firmante
 * requerido -- nunca confia en que "tener firmaDigitalUrl cargada"
 * alcance. Si no esta autorizada, el documento deja esa fila
 * `firmado=false` (espacio para firma manuscrita) hasta que alguien
 * confirme la firma fisica via confirmarManual(). */
@Injectable()
export class FirmasDocumentoService {
  constructor(
    @InjectRepository(FirmaDocumento) private readonly repo: Repository<FirmaDocumento>,
    @InjectRepository(Cargo) private readonly cargoRepo: Repository<Cargo>,
    @InjectRepository(Designacion) private readonly designacionRepo: Repository<Designacion>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    @InjectRepository(Rango) private readonly rangoRepo: Repository<Rango>,
    private readonly documentosService: DocumentosService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  porDocumento(documentoId: string) {
    return this.repo.find({ where: { documentoId }, order: { orden: 'ASC' } });
  }

  async definirFirmantes(documentoId: string, dto: DefinirFirmantesDto, actorId: string, ip?: string) {
    await this.documentosService.findOne(documentoId, ['documentos:administrar']);

    const filas: FirmaDocumento[] = [];
    for (const [indice, f] of dto.firmantes.entries()) {
      if (!f.cargoFirmanteId && !f.bomberoFirmanteId) throw new BadRequestException('Cada firmante requiere cargoFirmanteId o bomberoFirmanteId');
      if (f.cargoFirmanteId && f.bomberoFirmanteId) throw new BadRequestException('Indique cargoFirmanteId o bomberoFirmanteId, no ambos');
      filas.push(
        this.repo.create({
          documentoId,
          cargoFirmanteId: f.cargoFirmanteId ?? null,
          bomberoFirmanteId: f.bomberoFirmanteId ?? null,
          etiquetaRol: f.etiquetaRol ?? null,
          orden: f.orden ?? indice + 1,
        }),
      );
    }
    const guardadas = await this.repo.save(filas);

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'DEFINIR_FIRMANTES',
      recurso: 'documentos.firmas_documento',
      recursoId: documentoId,
      datosDespues: guardadas,
      ip: ip ?? null,
    });
    return guardadas;
  }

  /** Intenta estampar la firma digital automaticamente (seccion 9).
   * Si el firmante correspondiente no esta autorizado, informa el
   * motivo en vez de fallar en silencio -- la fila queda pendiente
   * para firma manuscrita. */
  async firmarAutomatico(firmaId: string, actorId: string, ip?: string) {
    const firma = await this.repo.findOne({ where: { id: firmaId } });
    if (!firma) throw new NotFoundException(`Firma ${firmaId} no encontrada`);
    if (firma.firmado) throw new BadRequestException('Esta firma ya fue registrada');

    let firmaDigitalUrl: string | null = null;
    let nombreCompleto: string | null = null;
    let advertencia: string | null = null;

    if (firma.cargoFirmanteId) {
      const resuelto = await resolverFirmante(
        { cargoRepo: this.cargoRepo, designacionRepo: this.designacionRepo, bomberoRepo: this.bomberoRepo, rangoRepo: this.rangoRepo },
        firma.cargoFirmanteId,
        firma.etiquetaRol,
      );
      firmaDigitalUrl = resuelto.firmaDigitalUrl;
      nombreCompleto = resuelto.nombreCompleto;
      advertencia = resuelto.advertencia;
    } else if (firma.bomberoFirmanteId) {
      const bombero = await this.bomberoRepo.findOne({ where: { id: firma.bomberoFirmanteId } });
      if (!bombero) throw new NotFoundException('El bombero firmante no fue encontrado');
      const autorizado = bombero.autorizadoFirmaDigital ?? false;
      const tieneFirma = !!bombero.firmaDigitalUrl;
      firmaDigitalUrl = autorizado && tieneFirma ? bombero.firmaDigitalUrl : null;
      nombreCompleto = `${bombero.nombre} ${bombero.apellido}`;
      advertencia = autorizado && !tieneFirma ? 'Persona autorizada para firma digital, pero no posee una firma registrada.' : null;
    }

    if (!firmaDigitalUrl) {
      throw new BadRequestException(
        `${nombreCompleto ?? 'El firmante'} no esta autorizado para firma digital automatica${advertencia ? ` (${advertencia})` : ''} -- registre la firma manuscrita y use confirmarManual`,
      );
    }

    await this.repo.update(firmaId, { firmado: true, firmaUrl: firmaDigitalUrl, fechaFirma: new Date(), firmadoPor: actorId });
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'FIRMAR',
      recurso: 'documentos.firmas_documento',
      recursoId: firmaId,
      datosDespues: { firmado: true, automatica: true },
      ip: ip ?? null,
    });

    await this.avanzarSiCompleto(firma.documentoId, actorId, ip);
    return this.repo.findOne({ where: { id: firmaId } });
  }

  /** Registra que la firma se hizo en papel/manuscrita fuera del
   * sistema -- no adjunta imagen de firma, solo deja constancia. */
  async confirmarManual(firmaId: string, dto: ConfirmarFirmaManualDto, actorId: string, ip?: string) {
    const firma = await this.repo.findOne({ where: { id: firmaId } });
    if (!firma) throw new NotFoundException(`Firma ${firmaId} no encontrada`);
    if (firma.firmado) throw new BadRequestException('Esta firma ya fue registrada');

    await this.repo.update(firmaId, { firmado: true, fechaFirma: new Date(), firmadoPor: actorId, observacion: dto.observacion ?? null });
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'FIRMAR',
      recurso: 'documentos.firmas_documento',
      recursoId: firmaId,
      datosDespues: { firmado: true, automatica: false, observacion: dto.observacion ?? null },
      ip: ip ?? null,
    });

    await this.avanzarSiCompleto(firma.documentoId, actorId, ip);
    return this.repo.findOne({ where: { id: firmaId } });
  }

  private async avanzarSiCompleto(documentoId: string, actorId: string, ip?: string) {
    const firmas = await this.repo.find({ where: { documentoId } });
    if (firmas.length === 0 || firmas.some((f) => !f.firmado)) return;
    const estadoFirmadoId = await this.documentosService.obtenerParametro('ESTADO_DOCUMENTO', 'Firmado');
    await this.documentosService.cambiarEstado(documentoId, { estadoId: estadoFirmadoId, observacion: 'Todas las firmas requeridas fueron registradas' }, actorId, ip);
  }
}
