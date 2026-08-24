import 'dotenv/config';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as entities from '../../shared/entities';

function booleanoConfiguracion(
  entorno: Record<string, string | undefined>,
  nombre: string,
  predeterminado: boolean,
): boolean {
  const valor = entorno[nombre]?.toLowerCase();
  if (valor === undefined || valor === '') return predeterminado;
  if (valor === 'true') return true;
  if (valor === 'false') return false;
  throw new Error(nombre + ' debe ser true o false.');
}

/**
 * SQL Server local puede usar certificado autofirmado, pero un despliegue de
 * produccion debe declarar cifrado y validacion de certificado de forma
 * explicita. Fallar al iniciar evita una degradacion silenciosa de TLS.
 */
export function obtenerSeguridadMssql(
  entorno: Record<string, string | undefined> = process.env,
): { encrypt: boolean; trustServerCertificate: boolean } {
  const encrypt = booleanoConfiguracion(entorno, 'DB_ENCRYPT', false);
  const trustServerCertificate = booleanoConfiguracion(
    entorno,
    'DB_TRUST_SERVER_CERTIFICATE',
    true,
  );
  if (
    entorno.NODE_ENV === 'production' &&
    (!encrypt || trustServerCertificate)
  ) {
    throw new Error(
      'En produccion DB_ENCRYPT=true y DB_TRUST_SERVER_CERTIFICATE=false son obligatorios.',
    );
  }
  return { encrypt, trustServerCertificate };
}

const seguridadMssql = obtenerSeguridadMssql();

export const dataSourceOptions: DataSourceOptions = {
  type: 'mssql',
  host: process.env.DB_HOST ?? 'localhost',
  ...(process.env.DB_INSTANCE ? {} : { port: Number(process.env.DB_PORT ?? 1433) }),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? 'sigbo_cbvc',
  options: {
    ...(process.env.DB_INSTANCE ? { instanceName: process.env.DB_INSTANCE } : {}),
    ...seguridadMssql,
    connectTimeout: 15000,
  },
  requestTimeout: 15000,
  // Sin esto, una conexion del pool que queda "colgada" (ej. tras un corte de
  // red breve con SQLEXPRESS local) puede quedar atascada y ser reutilizada
  // indefinidamente en vez de descartarse, causando timeouts de 15s en cada
  // request hasta reiniciar el backend. idleTimeoutMillis bajo fuerza a
  // reciclar conexiones inactivas con mas frecuencia; max/min acotan el pool.
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 15000,
  },
  entities: Object.values(entities),
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
};
