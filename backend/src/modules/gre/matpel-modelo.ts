import type {
  GreBloque, GreCampoFuente, GreCelda, GreDocumento, GreEntrada, GreFila, GreGuia,
  GrePagina, GreReferencia, GreRegla, GreSeccion, GreTabla,
} from '../../shared/entities';

export type CertezaMatpel = 'DESCONOCIDO' | 'NO_CONFIRMADO' | 'ESTIMADO' | 'CONFIRMADO';
export interface DatoMatpel<T> {
  valor: T | null;
  certeza: CertezaMatpel;
  origen: 'OPERADOR' | 'SIGBO' | 'METEOROLOGIA' | 'OCR';
  observadoEn: string | null;
  evidenciaId: string | null;
  fuenteDatoId: string | null;
}
export interface ParametrosMatpel {
  eventos: DatoMatpel<Array<'DERRAME' | 'FUGA' | 'INCENDIO' | 'EXPLOSION' | 'OTRO'>>;
  incendio: DatoMatpel<boolean>;
  cantidad: DatoMatpel<{ valorDecimal: string; unidad: 'L' | 'm3' | 'kg' | 't' }>;
  contactoAgua: DatoMatpel<'TIERRA' | 'AGUA' | 'AMBOS'>;
  periodo: DatoMatpel<'DIA' | 'NOCHE'>;
  contenedor: DatoMatpel<string>;
  cantidadContenedor?: DatoMatpel<{ valorDecimal: string; unidad: 'L' | 'm3' | 'kg' | 't' }>;
  numeroContenedores?: DatoMatpel<number>;
  viento: DatoMatpel<{ velocidadDecimal: string | null; unidad: 'km/h' | 'mph' | 'm/s' | null;
    direccionDesdeGrados: number | null; proveedorId: string | null }>;
  ubicacion: DatoMatpel<{ latitud: number; longitud: number; precisionM: number | null }>;
}
/** Lectura inmutable de UNA versión validada. Nunca proviene del body HTTP. */
export interface CatalogoMatpel {
  versionGreId: string;
  sha256Contenido?: string;
  documento: GreDocumento;
  entradas: GreEntrada[];
  guias: GreGuia[];
  bloques: GreBloque[];
  tablas: GreTabla[];
  filas: GreFila[];
  celdas: GreCelda[];
  reglas: GreRegla[];
  camposFuente: GreCampoFuente[];
  referencias: GreReferencia[];
  paginas: GrePagina[];
  secciones: GreSeccion[];
}
export interface IdentificacionConsultaMatpel {
  entradaId: string;
  observacionOriginal: string | null;
  certeza: CertezaMatpel;
  metodo: 'MANUAL' | 'PLACA' | 'OCR' | 'DESCONOCIDO';
  observadoEn: string | null;
  evidenciaId: string | null;
}
export interface ContextoConsultaMatpel {
  identificaciones?: IdentificacionConsultaMatpel[];
  ambito?: 'TRANSPORTE_TERRESTRE' | 'INSTALACION_FIJA' | 'AEREO_MARITIMO' | 'DESCONOCIDO';
}
export type EstadoApartadoMatpel = 'APLICABLE' | 'NO_APLICABLE' | 'INDETERMINADO' | 'DATOS_NO_DISPONIBLES';

export const normalizarMatpel = (texto: string) => texto.replace(/(\S)-\n/g, '$1-')
  .normalize('NFD').replace(/\p{M}/gu, '').toUpperCase().replace(/\s+/g, ' ').trim();

/** Comparación decimal exacta, sin truncamiento ni conversión de masa a volumen. */
export function compararDecimal(a: string, b: string, factorA = 1n, factorB = 1n): number {
  const partes = (v: string) => {
    if (v.length > 120 || !/^\d+(\.\d+)?$/.test(v)) throw new Error('Decimal GRE inválido.');
    const [entero, fraccion = ''] = v.split('.');
    return { entero: BigInt(entero + fraccion), escala: 10n ** BigInt(fraccion.length) };
  };
  const x = partes(a); const y = partes(b);
  const d = x.entero * factorA * y.escala - y.entero * factorB * x.escala;
  return d < 0n ? -1 : d > 0n ? 1 : 0;
}
