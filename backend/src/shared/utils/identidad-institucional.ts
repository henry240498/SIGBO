import { Repository } from 'typeorm';
import { IdentidadInstitucional } from '../entities';

export interface EncabezadoInstitucional {
  nombreInstitucion: string;
  lineasDestacadas: Array<{ texto: string; tipo: 'SUBTITULO' | 'DISTINCION' | 'OTRO' }>;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  sitioWeb: string | null;
  personeriaJuridica: string | null;
  fechaFundacion: string | null;
  logoIzquierdaUrl: string | null;
  logoDerechaUrl: string | null;
  alineacionTitulo: 'IZQUIERDA' | 'CENTRO' | 'DERECHA';
  piePaginaInstitucional: { texto: string | null; mostrarNumeroPagina: boolean; mostrarGeneradoSigbo: boolean };
}

/** Arma el bloque de membrete/identidad institucional que cualquier reporte
 * PDF/DOCX puede reutilizar -- misma fuente (organizacion.identidad_institucional,
 * fila unica) y mismo criterio que ya usa OrdenesGuardiaService: cada campo
 * es null si la institucion eligio no mostrarlo, no si falta el dato. */
export async function resolverEncabezadoInstitucional(
  identidadRepo: Repository<IdentidadInstitucional>,
): Promise<EncabezadoInstitucional> {
  const [identidad] = await identidadRepo.find({ take: 1 });
  const lineasDestacadas: Array<{ texto: string; tipo: 'SUBTITULO' | 'DISTINCION' | 'OTRO'; visible: boolean; orden: number }> =
    identidad?.lineasDestacadas ? JSON.parse(identidad.lineasDestacadas) : [];

  return {
    nombreInstitucion: identidad?.nombreInstitucion ?? '',
    lineasDestacadas: lineasDestacadas
      .filter((l) => l.visible)
      .sort((a, b) => a.orden - b.orden)
      .map((l) => ({ texto: l.texto, tipo: l.tipo })),
    direccion: identidad?.mostrarDireccion ? identidad.direccion : null,
    telefono: identidad?.mostrarTelefono ? identidad.telefono : null,
    email: identidad?.mostrarEmail ? identidad.email : null,
    sitioWeb: identidad?.mostrarSitioWeb ? identidad.sitioWeb : null,
    personeriaJuridica: identidad?.mostrarPersoneria ? identidad.personeriaJuridica : null,
    fechaFundacion: identidad?.mostrarFechaFundacion ? identidad.fechaFundacion : null,
    logoIzquierdaUrl: identidad?.mostrarLogoIzquierda ? identidad.logoIzquierdaUrl : null,
    logoDerechaUrl: identidad?.mostrarLogoDerecha ? identidad.logoDerechaUrl : null,
    alineacionTitulo: identidad?.alineacionTitulo ?? 'CENTRO',
    piePaginaInstitucional: {
      texto: identidad?.textoPiePagina ?? null,
      mostrarNumeroPagina: identidad?.mostrarNumeroPagina ?? false,
      mostrarGeneradoSigbo: identidad?.mostrarGeneradoSigbo ?? false,
    },
  };
}
