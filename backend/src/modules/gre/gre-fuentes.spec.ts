import { createHash, randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { GreFuentesService } from './gre-fuentes.service';

describe('Fuentes privadas GRE con documento real, sin DB', () => {
  let raiz: string;
  let fuente: Buffer;
  let documento: { sha256: string; referenciaPrivada: string; tamanoBytes: number };
  let servicio: GreFuentesService;

  beforeAll(async () => {
    raiz = await fs.mkdtemp(join(tmpdir(), 'sigbo-gre-3a-'));
    servicio = new GreFuentesService(raiz);
    fuente = await fs.readFile(resolve(__dirname, '../../../../docs/Manuales/GRE2024-Spa-Web-a.pdf'));
    const sha256 = createHash('sha256').update(fuente).digest('hex');
    documento = { sha256, referenciaPrivada: `privado:gre:${sha256}.pdf`, tamanoBytes: fuente.length };
  });
  afterAll(async () => {
    for (const nombre of await fs.readdir(raiz)) await fs.unlink(join(raiz, nombre));
    await fs.rmdir(raiz);
  });
  beforeEach(async () => { await fs.writeFile(join(raiz, `${documento.sha256}.pdf`), fuente); });

  it('lee la copia íntegra por identidad y referencia privada', async () => {
    expect((await servicio.leerDocumento(documento)).equals(fuente)).toBe(true);
  });
  it('rechaza una ruta o referencia de otra carpeta', async () => {
    await expect(servicio.leerDocumento({ ...documento, referenciaPrivada: '/uploads/gre/manual.pdf' }))
      .rejects.toThrow('identidad');
    await expect(servicio.leerDocumento({ ...documento, sha256: '../manual' })).rejects.toThrow('identidad');
  });
  it('detecta corrupción aunque se mantenga el tamaño', async () => {
    const alterada = Buffer.from(fuente);
    alterada[alterada.length - 10] ^= 1;
    await fs.writeFile(join(raiz, `${documento.sha256}.pdf`), alterada);
    await expect(servicio.leerDocumento(documento)).rejects.toThrow('integridad');
  });
  it('distingue archivo ausente y tamaño incoherente', async () => {
    await expect(servicio.leerDocumento({ ...documento, tamanoBytes: 0 })).rejects.toThrow('identidad');
    await expect(servicio.leerDocumento({ ...documento, tamanoBytes: fuente.length - 1 })).rejects.toThrow('almacenamiento');
    await fs.unlink(join(raiz, `${documento.sha256}.pdf`));
    await expect(servicio.leerDocumento(documento)).rejects.toThrow('no está disponible');
  });

  const versionId = randomUUID();
  const pagina = { versionId, paginaPdf: 1, anchoPt: 612, altoPt: 792, rotacion: 0 };
  const referencia = { versionId, paginaPdf: 1, cajaPtJson: '[0,0,100,100]',
    sistemaCoordenadas: 'PYMUPDF_SIN_ROTAR_PT', orientacion: 0, confianza: null };
  it('admite referencia sin caja o confianza inventadas', () => {
    expect(() => servicio.validarReferencia(referencia, pagina)).not.toThrow();
    expect(() => servicio.validarReferencia({ ...referencia, cajaPtJson: null, orientacion: null }, pagina)).not.toThrow();
  });
  it('rechaza referencias de otra edición/página y confianza fuera de rango', () => {
    expect(() => servicio.validarReferencia({ ...referencia, versionId: randomUUID() }, pagina)).toThrow();
    expect(() => servicio.validarReferencia({ ...referencia, paginaPdf: 2 }, pagina)).toThrow();
    expect(() => servicio.validarReferencia({ ...referencia, confianza: 1.1 }, pagina)).toThrow();
    expect(() => servicio.validarReferencia({ ...referencia, orientacion: 90 }, pagina)).toThrow();
  });
  it.each(['[]', '{}', '[0,0,1000,100]', '[100,0,0,100]', '[0,0,"100",100]', 'no-json', '[0,-1,100,100]'])
    ('rechaza caja inválida %s', cajaPtJson => {
      expect(() => servicio.validarReferencia({ ...referencia, cajaPtJson }, pagina)).toThrow();
    });
});
