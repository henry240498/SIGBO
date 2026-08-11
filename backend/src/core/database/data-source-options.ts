import 'dotenv/config';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as entities from '../../shared/entities';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mssql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 1433),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? 'sigbo_cbvc',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
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
