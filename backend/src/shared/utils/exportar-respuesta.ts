import { Response } from 'express';
import { generarExcel } from './excel';
import { generarPdf } from './pdf';

export type FormatoExportacion = 'excel' | 'pdf';

/** Genera el archivo (Excel o PDF) y lo envia como descarga adjunta. */
export async function enviarExportacion(
  res: Response,
  formato: FormatoExportacion,
  filas: Record<string, unknown>[],
  nombreArchivo: string,
  titulo: string,
): Promise<void> {
  if (formato === 'excel') {
    const buffer = await generarExcel(filas, titulo);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${nombreArchivo}.xlsx"`,
    });
    res.send(buffer);
    return;
  }

  const buffer = await generarPdf(filas, titulo);
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${nombreArchivo}.pdf"`,
  });
  res.send(buffer);
}
