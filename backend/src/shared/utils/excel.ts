import ExcelJS from 'exceljs';

/** Genera un .xlsx con cabecera en negrita y ancho de columna segun contenido. */
export async function generarExcel(
  filas: Record<string, unknown>[],
  hoja: string,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(hoja.slice(0, 31));

  const columnas = filas.length > 0 ? Object.keys(filas[0]) : [];
  worksheet.columns = columnas.map((c) => ({
    header: c,
    key: c,
    width: Math.min(Math.max(c.length + 2, 12), 40),
  }));

  worksheet.getRow(1).font = { bold: true };

  for (const fila of filas) {
    const plano: Record<string, unknown> = {};
    for (const c of columnas) {
      const valor = fila[c];
      plano[c] = valor instanceof Date ? valor.toISOString() : valor ?? '';
    }
    worksheet.addRow(plano);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
