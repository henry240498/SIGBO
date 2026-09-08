import { MODULE_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { GuardiasController } from './guardias.controller';
import { GuardiasModule } from './guardias.module';
import { OrdenesGuardiaController } from './ordenes-guardia.controller';

function rutasDe(controlador: Function): string[] {
  const prototipo = controlador.prototype as object;
  return Object.getOwnPropertyNames(prototipo)
    .filter((nombre) => nombre !== 'constructor')
    .map((nombre) => Object.getOwnPropertyDescriptor(prototipo, nombre)?.value)
    .filter((handler): handler is Function => typeof handler === 'function')
    .map((handler) => Reflect.getMetadata(PATH_METADATA, handler))
    .filter((ruta): ruta is string => typeof ruta === 'string');
}

describe('rutas de Guardias compatibles con Express 5', () => {
  it('no usa expresiones regulares embebidas en parámetros de ruta', () => {
    expect(rutasDe(GuardiasController)).not.toContainEqual(expect.stringMatching(/\(/));
    expect(rutasDe(OrdenesGuardiaController)).not.toContainEqual(expect.stringMatching(/\(/));
  });

  it('registra las subrutas antes del recurso dinámico raíz', () => {
    const controladores = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, GuardiasModule) as unknown[];

    expect(controladores.indexOf(OrdenesGuardiaController)).toBeLessThan(controladores.indexOf(GuardiasController));
  });
});
