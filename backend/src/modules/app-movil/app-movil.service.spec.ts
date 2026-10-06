import { HttpException, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { AppMovilService } from './app-movil.service';

const APK = Buffer.from('contenido-de-prueba-del-apk');
const SHA = createHash('sha256').update(APK).digest('hex');

describe('AppMovilService', () => {
  let dir: string;
  let servicio: AppMovilService;

  const publicar = (cambios: Record<string, unknown> = {}, apk: Buffer = APK) => {
    writeFileSync(join(dir, 'sigbo-alertas.apk'), apk);
    writeFileSync(
      join(dir, 'version.json'),
      JSON.stringify({
        versionCodigo: 3,
        versionNombre: '1.2.0',
        obligatoria: false,
        notas: 'Mejoras',
        tamanioBytes: APK.length,
        sha256: SHA,
        firma: 'RklSTUE=',
        ...cambios,
      }),
    );
  };

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'app-movil-'));
    process.env.APP_MOVIL_DIR = dir;
    servicio = new AppMovilService();
  });

  afterEach(() => {
    delete process.env.APP_MOVIL_DIR;
    rmSync(dir, { recursive: true, force: true });
  });

  it('sin nada publicado responde disponible:false', () => {
    expect(servicio.obtenerVersion()).toEqual({ disponible: false });
  });

  it('anuncia la version publicada con su hash y su firma', () => {
    publicar();
    expect(servicio.obtenerVersion()).toMatchObject({
      disponible: true,
      versionCodigo: 3,
      versionNombre: '1.2.0',
      sha256: SHA,
      firma: 'RklSTUE=',
      tamanioBytes: APK.length,
    });
  });

  it.each([
    ['sin firma', { firma: undefined }],
    ['firma vacia', { firma: '' }],
    ['codigo invalido', { versionCodigo: 0 }],
    ['nombre de version invalido', { versionNombre: '1.2' }],
    ['hash con formato invalido', { sha256: 'xyz' }],
  ])('no anuncia una version %s', (_nombre, cambios) => {
    publicar(cambios);
    expect(servicio.obtenerVersion()).toEqual({ disponible: false });
  });

  it('no anuncia si el APK en disco fue reemplazado sin republicar', () => {
    publicar();
    writeFileSync(join(dir, 'sigbo-alertas.apk'), Buffer.from('contenido-DISTINTO-del-apk'));
    expect(servicio.obtenerVersion()).toEqual({ disponible: false });
  });

  it('tolera un version.json con BOM y rechaza uno corrupto', () => {
    publicar();
    const ruta = join(dir, 'version.json');
    writeFileSync(ruta, '﻿' + JSON.stringify({ versionCodigo: 3, versionNombre: '1.2.0', sha256: SHA, tamanioBytes: APK.length, firma: 'RklSTUE=' }));
    expect(servicio.obtenerVersion().disponible).toBe(true);
    writeFileSync(ruta, '{no es json');
    expect(servicio.obtenerVersion()).toEqual({ disponible: false });
  });

  it('no sirve el APK si no hay version valida publicada', () => {
    expect(() => servicio.abrirApk()).toThrow(NotFoundException);
  });

  it('limita las descargas simultaneas y libera el cupo al cerrar', async () => {
    publicar();
    const abiertas = Array.from({ length: 5 }, () => servicio.abrirApk());
    expect(() => servicio.abrirApk()).toThrow(HttpException);

    // al terminar una descarga se libera un cupo
    await new Promise<void>((resolver) => {
      abiertas[0].stream.on('close', () => resolver());
      abiertas[0].stream.resume();
    });
    expect(() => {
      const extra = servicio.abrirApk();
      extra.stream.destroy();
    }).not.toThrow();
    abiertas.slice(1).forEach((a) => a.stream.destroy());
  });
});
