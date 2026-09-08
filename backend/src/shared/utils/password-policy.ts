import * as bcrypt from 'bcryptjs';
import { registerDecorator, ValidationOptions } from 'class-validator';
import { Repository } from 'typeorm';
import { HistorialContrasena } from '../entities';

/** Minimo 8 caracteres, una mayuscula, una minuscula, un numero y un caracter especial. */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

export const PASSWORD_REGEX_MENSAJE =
  'La contrasena debe tener al menos 8 caracteres, una mayuscula, una minuscula, un numero y un caracter especial';

/** bcrypt solo considera los primeros 72 bytes UTF-8; superar este límite debilita la clave sin avisar. */
export const MAXIMO_BYTES_CONTRASENA_BCRYPT = 72;

export function contrasenaDentroDelLimiteBcrypt(valor: unknown): boolean {
  return typeof valor === 'string' && Buffer.byteLength(valor, 'utf8') <= MAXIMO_BYTES_CONTRASENA_BCRYPT;
}

export function MaxBytesBcrypt(opciones?: ValidationOptions) {
  return (objeto: object, propiedad: string) => registerDecorator({
    name: 'maxBytesBcrypt',
    target: objeto.constructor,
    propertyName: propiedad,
    options: opciones,
    validator: {
      validate: contrasenaDentroDelLimiteBcrypt,
      defaultMessage: () => `La contrasena no puede superar ${MAXIMO_BYTES_CONTRASENA_BCRYPT} bytes`,
    },
  });
}

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
