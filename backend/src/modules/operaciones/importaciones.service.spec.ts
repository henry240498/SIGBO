import ExcelJS from 'exceljs';
import { extraerPunchesDeLogs } from './importaciones.service';

async function archivoLogs(): Promise<Buffer> {
  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet('Logs');
  hoja.addRow(['Reporte del marcador 2026/08/01 ~ 2026/08/31']);
  hoja.addRow([]);
  hoja.addRow([]);
  hoja.addRow([]);
  hoja.addRow([]);
  hoja.addRow(['No :', '', '001', 'Name :', '', 'BC-10', 'Dept :', '', 'Guardia']);
  hoja.addRow(['08:00\n17:30']);
  const contenido = await libro.xlsx.writeBuffer();
  return Buffer.from(contenido);
}

describe('extraerPunchesDeLogs', () => {
  it('lee la hoja Logs de un .xlsx y conserva todas las marcaciones de un día', async () => {
    const resultado = await extraerPunchesDeLogs(await archivoLogs());

    expect(resultado).toMatchObject({ anio: 2026, mes: 8, hojasEncontradas: 1 });
    expect(resultado.punches).toEqual([
      expect.objectContaining({ filaExcel: 6, dia: 1, indicePunch: 1, horaTexto: '08:00', codigoDetectado: 'BC-10' }),
      expect.objectContaining({ filaExcel: 6, dia: 1, indicePunch: 2, horaTexto: '17:30', codigoDetectado: 'BC-10' }),
    ]);
  });

  it('rechaza libros sin la hoja Logs', async () => {
    const libro = new ExcelJS.Workbook();
    libro.addWorksheet('Resumen');
    const contenido = Buffer.from(await libro.xlsx.writeBuffer());

    await expect(extraerPunchesDeLogs(contenido)).rejects.toThrow('hoja "Logs"');
  });
});
