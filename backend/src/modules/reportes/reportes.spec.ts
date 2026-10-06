import { HttpException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { CrearReporteDto } from './dto/reporte.dto';
import { limpiarTexto, MAX_REPORTES_POR_HORA, ReportesService } from './reportes.service';

const ctx = { usuarioId: 'u1', username: 'admin' };
const base: CrearReporteDto = { tipo: 'ERROR', origen: 'APP_MOVIL', mensaje: 'El boton no responde' };

describe('ReportesService', () => {
  let dir: string;
  let audit: { registrar: jest.Mock };
  let servicio: ReportesService;
  const ahora = new Date('2026-10-06T12:00:00.000Z');

  beforeEach(async () => {
    dir = await fs.mkdtemp(join(tmpdir(), 'sigbo-reportes-'));
    process.env.REPORTES_DIR = dir;
    audit = { registrar: jest.fn(async () => undefined) };
    servicio = new ReportesService(audit as never);
  });
  afterEach(async () => {
    delete process.env.REPORTES_DIR;
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('guarda el reporte como texto plano con los datos de quien lo envia', async () => {
    const r = await servicio.crear({ ...base, titulo: 'Fallo', pantalla: 'Llamados', version: '1.5.3', dispositivo: 'Xiaomi' }, ctx, ahora);
    expect(r.duplicado).toBe(false);
    expect(r.archivo).toMatch(/^20261006_120000_ERROR_[0-9a-f-]{36}\.txt$/);
    const texto = await fs.readFile(join(dir, r.archivo), 'utf8');
    expect(texto).toContain('Tipo: ERROR');
    expect(texto).toContain('Origen: APP_MOVIL');
    expect(texto).toContain('Usuario: admin');
    expect(texto).toContain('Pantalla: Llamados');
    expect(texto).toContain('El boton no responde');
    expect(audit.registrar).toHaveBeenCalledWith(expect.objectContaining({ accion: 'REPORTAR', recursoId: r.id }));
  });

  it('un reenvio con el mismo id no duplica el archivo', async () => {
    const id = '11111111-2222-4333-8444-555555555555';
    const a = await servicio.crear({ ...base, id }, ctx, ahora);
    const b = await servicio.crear({ ...base, id }, ctx, new Date(ahora.getTime() + 60_000));
    expect(a.duplicado).toBe(false);
    expect(b).toMatchObject({ duplicado: true, archivo: a.archivo });
    expect(await fs.readdir(dir)).toHaveLength(1);
    expect(audit.registrar).toHaveBeenCalledTimes(1);
  });

  it('lo que escribe la persona nunca llega al nombre del archivo', async () => {
    const r = await servicio.crear({ ...base, titulo: '../../etc/passwd', usuario: '..' } as never, { ...ctx, username: '../x' }, ahora);
    expect(r.archivo).not.toMatch(/[\\/]/);
    expect((await fs.readdir(dir))).toEqual([r.archivo]);
  });

  it('una hora de escritura futura se acota a la del servidor', async () => {
    const r = await servicio.crear({ ...base, ocurridoEn: '2030-01-01T00:00:00.000Z' }, ctx, ahora);
    expect(r.archivo.startsWith('20261006_120000_')).toBe(true);
  });

  it(`limita a ${MAX_REPORTES_POR_HORA} reportes por hora y persona, y no a otra persona`, async () => {
    for (let i = 0; i < MAX_REPORTES_POR_HORA; i++) await servicio.crear(base, ctx, ahora);
    await expect(servicio.crear(base, ctx, ahora)).rejects.toBeInstanceOf(HttpException);
    await expect(servicio.crear(base, { ...ctx, usuarioId: 'u2' }, ahora)).resolves.toBeDefined();
    // pasada la hora, vuelve a poder
    await expect(servicio.crear(base, ctx, new Date(ahora.getTime() + 3_700_000))).resolves.toBeDefined();
  });
});

describe('limpiarTexto', () => {
  it('quita caracteres de control y normaliza saltos', () => {
    expect(limpiarTexto('a\u0000b\r\nc\u0007', 50, true)).toBe('ab\nc');
  });
  it('en una sola linea colapsa los saltos y recorta', () => {
    expect(limpiarTexto('uno\n dos\t tres', 50, false)).toBe('uno dos tres');
    expect(limpiarTexto('x'.repeat(300), 120, false)).toHaveLength(120);
  });
});
