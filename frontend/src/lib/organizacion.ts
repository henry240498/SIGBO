import { apiFetch, API_ORIGIN, obtenerSesion } from './api';

async function mensajeError(res: Response, porDefecto: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return Array.isArray(body.message) ? body.message.join(', ') : body.message ?? porDefecto;
}

export interface LineaDestacada {
  texto: string;
  tipo: 'SUBTITULO' | 'DISTINCION' | 'OTRO';
  visible: boolean;
  orden: number;
}

export interface IdentidadInstitucional {
  id: string;
  nombreInstitucion: string;
  direccion: string | null;
  mostrarDireccion: boolean;
  telefono: string | null;
  mostrarTelefono: boolean;
  email: string | null;
  mostrarEmail: boolean;
  sitioWeb: string | null;
  mostrarSitioWeb: boolean;
  personeriaJuridica: string | null;
  mostrarPersoneria: boolean;
  fechaFundacion: string | null;
  mostrarFechaFundacion: boolean;
  logoIzquierdaUrl: string | null;
  mostrarLogoIzquierda: boolean;
  logoDerechaUrl: string | null;
  mostrarLogoDerecha: boolean;
  alineacionTitulo: 'IZQUIERDA' | 'CENTRO' | 'DERECHA';
  lineasDestacadas: string;
  textoPiePagina: string | null;
  mostrarNumeroPagina: boolean;
  mostrarGeneradoSigbo: boolean;
  actualizadoEn: string;
  actualizadoPor: string | null;
}

export async function cargarIdentidadInstitucional(): Promise<IdentidadInstitucional> {
  const res = await apiFetch('/organizacion/identidad-institucional');
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo cargar la identidad institucional'));
  return res.json();
}

export async function actualizarIdentidadInstitucional(payload: Record<string, unknown>): Promise<IdentidadInstitucional> {
  const res = await apiFetch('/organizacion/identidad-institucional', { method: 'PUT', body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo actualizar la identidad institucional'));
  return res.json();
}

/** Multipart: apiFetch fuerza Content-Type: application/json, incompatible
 * con el boundary de un form-data -- mismo patron manual que ya usa
 * seguridad/apariencia/page.tsx para sus subidas de imagen. */
export async function subirLogoInstitucional(lado: 'izquierda' | 'derecha', archivo: File): Promise<IdentidadInstitucional> {
  const formData = new FormData();
  formData.append('archivo', archivo);
  const sesion = obtenerSesion();
  const headers: HeadersInit = {};
  if (sesion) headers['Authorization'] = `Bearer ${sesion.accessToken}`;

  const res = await fetch(`${API_ORIGIN}/api/v1/organizacion/identidad-institucional/logo/${lado}`, {
    method: 'PUT',
    headers,
    body: formData,
  });
  if (!res.ok) throw new Error(await mensajeError(res, 'No se pudo subir el logo'));
  return res.json();
}
