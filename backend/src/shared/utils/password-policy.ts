import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { HistorialContrasena } from '../entities';

/** Minimo 8 caracteres, una mayuscula, una minuscula, un numero y un caracter especial. */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

export const PASSWORD_REGEX_MENSAJE =
  'La contrasena debe tener al menos 8 caracteres, una mayuscula, una minuscula, un numero y un caracter especial';

export const PASSWORD_EXPIRA_DIAS = 90;
const HISTORIAL_CONSULTADO = 3;

export function calcularExpiracionPassword(): Date {
  return new Date(Date.now() + PASSWORD_EXPIRA_DIAS * 24 * 60 * 60 * 1000);
}

/** true si la contrasena en texto plano coincide con alguna de las ultimas N almacenadas. */
export async function passwordEnHistorial(
  historialRepo: Repository<HistorialContrasena>,
  usuarioId: string,
  passwordNueva: string,
): Promise<boolean> {
  const recientes = await historialRepo.find({
    where: { usuarioId },
    order: { creadoEn: 'DESC' },
    take: HISTORIAL_CONSULTADO,
  });

  for (const registro of recientes) {
    if (await bcrypt.compare(passwordNueva, registro.passwordHash)) {
      return true;
    }
  }
  return false;
}
