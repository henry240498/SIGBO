import { Repository } from 'typeorm';
import { Bombero, Cargo, Designacion, Rango } from '../entities';

export interface FirmanteResuelto {
  cargoId: string;
  etiquetaCargo: string;
  bomberoId: string | null;
  nombreCompleto: string | null;
  rango: string | null;
  /** Solo presente si el bombero tiene una imagen de firma cargada Y esta
   * autorizado a que SIGBO la use automaticamente -- nunca uno sin el otro. */
  firmaDigitalUrl: string | null;
  /** "Autorizado pero sin firma registrada" cuando aplica; util para que la
   * UI de vista previa (antes de publicar) lo muestre como advertencia. */
  advertencia: string | null;
}

/** Resuelve quien ocupa hoy un Cargo (via organizacion.designaciones,
 * estado ACTIVA) y si corresponde insertar su firma digital automaticamente
 * -- nunca oculta los datos del firmante por no tener firma habilitada, solo
 * determina si se puede estampar la imagen o debe quedar el renglon en
 * blanco para firma manuscrita. Funcion compartida (no un servicio Nest)
 * para que cualquier modulo que genere documentos la reutilice sin
 * necesidad de importar otro modulo -- mismo criterio que ya usa
 * GuardiasModule registrando Cargo/Designacion/Bombero/Rango directamente
 * en su propio TypeOrmModule.forFeature. */
export async function resolverFirmante(
  repos: {
    cargoRepo: Repository<Cargo>;
    designacionRepo: Repository<Designacion>;
    bomberoRepo: Repository<Bombero>;
    rangoRepo: Repository<Rango>;
  },
  cargoId: string,
  etiqueta: string | null,
): Promise<FirmanteResuelto> {
  const cargo = await repos.cargoRepo.findOne({ where: { id: cargoId } });
  const designacion = await repos.designacionRepo.findOne({ where: { cargoId, estado: 'ACTIVA' } });
  const bombero = designacion ? await repos.bomberoRepo.findOne({ where: { id: designacion.bomberoId } }) : null;
  const rango = bombero?.rangoId ? await repos.rangoRepo.findOne({ where: { id: bombero.rangoId } }) : null;

  const autorizado = bombero?.autorizadoFirmaDigital ?? false;
  const tieneFirma = !!bombero?.firmaDigitalUrl;

  return {
    cargoId,
    etiquetaCargo: etiqueta || cargo?.nombre || '',
    bomberoId: bombero?.id ?? null,
    nombreCompleto: bombero ? `${bombero.nombre} ${bombero.apellido}` : null,
    rango: rango?.nombre ?? bombero?.rango ?? null,
    firmaDigitalUrl: autorizado && tieneFirma ? bombero!.firmaDigitalUrl : null,
    advertencia: autorizado && !tieneFirma ? 'Persona autorizada para firma digital, pero no posee una firma registrada.' : null,
  };
}
