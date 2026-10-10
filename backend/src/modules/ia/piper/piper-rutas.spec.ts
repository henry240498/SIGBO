import { join } from 'path';
import { carpetaPermitidaPiper, validarRutasPiper } from './piper-rutas';

const raiz = join('C:', 'Herramientas', 'piper');

describe('rutas de Piper', () => {
  it('acepta piper(.exe) y una voz .onnx dentro de la carpeta permitida', () => {
    expect(validarRutasPiper(join(raiz, 'piper.exe'), join(raiz, 'voces', 'es_ES-davefx-medium.onnx'), raiz)).toBeNull();
    expect(validarRutasPiper(join(raiz, 'piper'), null, raiz)).toBeNull();
  });

  it('rechaza cualquier otro ejecutable aunque esté en la carpeta', () => {
    expect(validarRutasPiper(join(raiz, 'cmd.exe'), null, raiz)).toMatch(/piper/);
    expect(validarRutasPiper(join(raiz, 'piper.exe.bat'), null, raiz)).toMatch(/piper/);
  });

  it('rechaza rutas fuera de la carpeta, incluso con ..', () => {
    expect(validarRutasPiper(join('C:', 'Windows', 'System32', 'piper.exe'), null, raiz)).toMatch(/carpeta/);
    expect(validarRutasPiper(join(raiz, '..', '..', 'Windows', 'piper.exe'), null, raiz)).toMatch(/carpeta/);
  });

  it('la voz debe ser .onnx y estar en la carpeta', () => {
    expect(validarRutasPiper(join(raiz, 'piper.exe'), join(raiz, 'voz.txt'), raiz)).toMatch(/onnx/);
    expect(validarRutasPiper(join(raiz, 'piper.exe'), join('D:', 'otra', 'voz.onnx'), raiz)).toMatch(/carpeta/);
  });

  it('sin carpeta permitida no se acepta ninguna ruta nueva', () => {
    expect(validarRutasPiper(join(raiz, 'piper.exe'), null, null)).toMatch(/IA_PIPER_DIR/);
  });

  it('la carpeta permitida sale de IA_PIPER_DIR o, si no está, de la ruta ya guardada', () => {
    const previo = process.env.IA_PIPER_DIR;
    process.env.IA_PIPER_DIR = raiz;
    expect(carpetaPermitidaPiper(null)).toBe(raiz);
    delete process.env.IA_PIPER_DIR;
    expect(carpetaPermitidaPiper(join(raiz, 'piper.exe'))).toBe(raiz);
    expect(carpetaPermitidaPiper(null)).toBeNull();
    if (previo !== undefined) process.env.IA_PIPER_DIR = previo;
  });
});
