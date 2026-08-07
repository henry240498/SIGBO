import { apiFetch } from './api';

/** Descarga el resultado binario de un endpoint de exportacion (Excel o PDF). */
export async function descargarArchivo(ruta: string, nombreArchivo: string): Promise<void> {
  const res = await apiFetch(ruta);
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(url);
}
