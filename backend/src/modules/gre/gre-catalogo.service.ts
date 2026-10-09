import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GreDocumento, GrePagina, GreReferencia, GreVersion } from '../../shared/entities';
import { GreFuentesService } from './gre-fuentes.service';

/** Lectura interna por versión explícita. No activa candidatos ni cambia ediciones.
 * La autorización HTTP se incorpora con los controladores de las fases 3D/4. */
@Injectable()
export class GreCatalogoService {
  constructor(
    @InjectRepository(GreVersion) private readonly versiones: Repository<GreVersion>,
    @InjectRepository(GreDocumento) private readonly documentos: Repository<GreDocumento>,
    @InjectRepository(GreReferencia) private readonly referencias: Repository<GreReferencia>,
    @InjectRepository(GrePagina) private readonly paginas: Repository<GrePagina>,
    private readonly fuentes: GreFuentesService,
  ) {}

  async documentoDeVersionValidada(versionId: string): Promise<GreDocumento> {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(versionId)) {
      throw new NotFoundException('La versión GRE no está disponible.');
    }
    const version = await this.versiones.findOneBy({ id: versionId, estado: 'VALIDADA' });
    if (!version) throw new NotFoundException('La versión GRE no está validada o no existe.');
    const documento = await this.documentos.findOneBy({ id: version.documentoId });
    if (!documento) throw new ServiceUnavailableException('La versión GRE perdió su fuente documental.');
    return documento;
  }

  async fuenteDeVersionValidada(versionId: string, referenciaId: string): Promise<GreReferencia> {
    const documento = await this.documentoDeVersionValidada(versionId);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(referenciaId)) {
      throw new NotFoundException('La referencia GRE no está disponible.');
    }
    const referencia = await this.referencias.findOneBy({ id: referenciaId, versionId });
    if (!referencia) throw new NotFoundException('La referencia no pertenece a esta versión GRE.');
    const pagina = await this.paginas.findOneBy({ versionId, paginaPdf: referencia.paginaPdf });
    if (!pagina || pagina.paginaPdf > documento.paginas) {
      throw new ServiceUnavailableException('La página de la referencia GRE no está disponible.');
    }
    this.fuentes.validarReferencia(referencia, pagina);
    return referencia;
  }
}
