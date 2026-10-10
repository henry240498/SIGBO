import { join, resolve, sep } from 'path';
import { carpetaPermitidaPiper, validarRutasPiper } from './piper-rutas';

// absoluta en cualquier sistema (en Windows, la unidad actual)
const raiz = resolve(sep, 'Herramientas', 'piper');

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
    expect(validarRutasPiper(resolve(sep, 'Windows', 'System32', 'piper.exe'), null, raiz)).toMatch(/carpeta/);
    expect(validarRutasPiper(join(raiz, '..', '..', 'Windows', 'piper.exe'), null, raiz)).toMatch(/carpeta/);
  });

  it('la voz debe ser .onnx y estar en la carpeta', () => {
    expect(validarRutasPiper(join(raiz, 'piper.exe'), join(raiz, 'voz.txt'), raiz)).toMatch(/onnx/);
    expect(validarRutasPiper(join(raiz, 'piper.exe'), resolve(sep, 'otra', 'voz.onnx'), raiz)).toMatch(/carpeta/);
  });

  it('exige rutas absolutas: un piper.exe suelto se buscaría en el PATH', () => {
    // aunque la carpeta permitida sea la de trabajo (donde resolve() la ubicaria), una ruta relativa no se acepta
    expect(validarRutasPiper('piper.exe', null, process.cwd())).toMatch(/absoluta/);
    expect(validarRutasPiper(join('piper', 'piper.exe'), null, raiz)).toMatch(/absoluta/);
    expect(validarRutasPiper(join(raiz, 'piper.exe'), 'voz.onnx', raiz)).toMatch(/absoluta/);
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
