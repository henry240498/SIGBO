'use client';

/**
 * Piezas que comparten dos o mas secciones del expediente: los tipos del bombero, los
 * catalogos de estados y los ayudantes de render. Lo que usa una sola seccion vive en
 * el archivo de esa seccion.
 */
import { apiFetch } from '@/lib/api';

export interface Bombero {
  id: string;
  cedula: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  sexo: 'M' | 'F' | null;
  nacionalidad: string;
  estadoCivil: string | null;
  lugarNacimiento: string | null;
  telefonoPrincipal: string;
  telefonoSecundario: string | null;
  email: string | null;
  direccion: string | null;
  codigoPostal: string | null;
  numeroBombero: string;
  rango: string;
  cargo: string | null;
  estado: string;
  fechaIngreso: string;
  grupoSanguineoId: string | null;
  factorRhId: string | null;
  alergias: string | null;
  condicionesMedicas: string | null;
  medicamentos: string | null;
  fotoUrl: string | null;
  condicionInstitucional: string | null;
  tipoBomberoId: string | null;
  rangoId: string | null;
  cargoPrincipalId: string | null;
  companiaId: string | null;
  cuartelId: string | null;
  turnoId: string | null;
  tipoGuardiaId: string | null;
  brigadaId: string | null;
  departamentoId: string | null;
  unidadId: string | null;
  paisId: string | null;
  departamentoResidenciaId: string | null;
  ciudadId: string | null;
  barrioId: string | null;
  pasaporte: string | null;
  fechaIncorporacion: string | null;
  fechaJuramento: string | null;
  realizaGuardias: boolean;
  realizaGuardiasEspeciales: boolean;
  frecuenciaNormalMensual: number | null;
  frecuenciaEspecialMensual: number | null;
  diaPreferenteGuardia: string | null;
  firmaDigitalUrl: string | null;
  autorizadoFirmaDigital: boolean;
}



export interface Catalogo {
  id: string;
  nombre: string;
  codigo?: string;
  prefijo?: string;
}



export async function cargarCatalogo(path: string): Promise<Catalogo[]> {
  const res = await apiFetch(`${path}?estado=ACTIVO`);
  if (!res.ok) return [];
  return res.json();
}



export function campoTexto(label: string, valor: string | null | undefined) {
  return (
    <div>
      <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>{label}</span>
      <span style={{ fontSize: 13 }}>{valor || '-'}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagina principal                                                     */
/* ------------------------------------------------------------------ */



export interface MovimientoHistorial {
  id: string;
  tipoMovimiento: string;
  fecha: string;
  motivo: string | null;
  observacion: string | null;
}



export function formatearFechaHora(valor: string | null): string {
  if (!valor) return '';
  return new Date(valor).toLocaleString();
}


