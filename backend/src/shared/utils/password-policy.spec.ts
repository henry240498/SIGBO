import { contrasenaDentroDelLimiteBcrypt, MAXIMO_BYTES_CONTRASENA_BCRYPT } from './password-policy';

describe('límite de contraseñas para bcrypt', () => {
  it('acepta hasta 72 bytes UTF-8', () => {
    expect(contrasenaDentroDelLimiteBcrypt('a'.repeat(MAXIMO_BYTES_CONTRASENA_BCRYPT))).toBe(true);
  });

  it('rechaza valores que bcrypt truncaría, también con caracteres multibyte', () => {
    expect(contrasenaDentroDelLimiteBcrypt('a'.repeat(MAXIMO_BYTES_CONTRASENA_BCRYPT + 1))).toBe(false);
    expect(contrasenaDentroDelLimiteBcrypt('á'.repeat(37))).toBe(false);
  });
});
