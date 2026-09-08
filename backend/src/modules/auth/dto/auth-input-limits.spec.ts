import { validate } from 'class-validator';
import { LoginDto } from './login.dto';
import { RefreshTokenDto } from './refresh-token.dto';

describe('límites de entrada de autenticación', () => {
  it('rechaza una contraseña que bcrypt truncaría al iniciar sesión', async () => {
    const dto = Object.assign(new LoginDto(), { usernameOrEmail: 'usuario', password: 'a'.repeat(73) });
    const errores = await validate(dto);
    expect(errores.some((error) => error.property === 'password')).toBe(true);
  });

  it('acota el refresh token a un tamaño razonable', async () => {
    const dto = Object.assign(new RefreshTokenDto(), { refreshToken: 'x'.repeat(2049) });
    const errores = await validate(dto);
    expect(errores.some((error) => error.property === 'refreshToken')).toBe(true);
  });
});
