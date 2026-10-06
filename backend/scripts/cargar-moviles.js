/**
 * Carga los moviles reales del cuartel (datos de las tarjetas, entregados por
 * la institucion). Es idempotente: un movil ya cargado (mismo chasis o mismo
 * numero interno) se omite, nunca se duplica ni se pisa.
 *
 * Uso (base levantada, backend compilado):  node scripts/cargar-moviles.js
 *
 * Lo que NO figura en las tarjetas queda sin inventar:
 *  - tipo: solo se completa cuando el modelo lo dice sin ambiguedad
 *    (Ranger = camioneta, Hiace = furgoneta, Pumper = autobomba); el resto
 *    queda "Por definir" para que el cuartel lo clasifique en Vehiculos.
 *  - kilometraje: 0 hasta el primer control o el primer regreso de un servicio.
 *  - estado: OPERATIVO (necesario para poder despacharlos); ajustar si alguno
 *    esta en taller.
 */
require('dotenv').config();
require('reflect-metadata');
const { DataSource } = require('typeorm');
const { dataSourceOptions } = require('../dist/core/database/data-source-options');
const { Vehiculo } = require('../dist/shared/entities');

const MOVILES = [
  { numero: '1', patente: 'BHE352', marca: 'FORD', modelo: 'RANGER', anio: 2011, chasis: '8AFER13P8BJ399952', color: 'PLATA', tipo: 'Camioneta' },
  {
    numero: '2', patente: null, marca: 'SCANIA', modelo: 'P93ML4X2L', anio: 1991, chasis: 'YS2PM4X2Z01177793', color: 'ROJO', tipo: 'Por definir',
    nota: 'La tarjeta no muestra una chapa clara: lo escrito junto a "Chapa" es el modelo (P93ML4X2L). Cargar la chapa real.',
  },
  { numero: '3', patente: 'AAOH570', marca: 'TOYOTA', modelo: 'HIACE', anio: 2011, chasis: 'TRH2260009492', color: 'ROJO', tipo: 'Furgoneta' },
  { numero: '4', patente: 'AAMB150', marca: 'ISUZU', modelo: 'PUMPER', anio: 2000, chasis: 'NHS69E7411931', color: 'ROJO', tipo: 'Autobomba' },
  {
    numero: '5', patente: null, marca: 'HINO', modelo: 'SUPER DOLPHIN', anio: 2000, chasis: 'XZU3710001052', color: 'ROJO', tipo: 'Por definir',
    nota: 'La chapa no se ve en la tarjeta. Cargar la chapa real.',
  },
  { numero: '6', patente: 'ASR929', marca: 'MAGIRUS DEUTZ', modelo: 'F MERCUR 125 A', anio: 1962, chasis: '5400099725', color: 'ROJO', tipo: 'Por definir' },
  {
    numero: '7', patente: '158BCL', marca: 'LEOPARD', modelo: 'MD125', anio: 2008, chasis: '9PCDDEE568L012429', color: 'ROJO', tipo: 'Por definir',
    nota: 'El modelo figuraba cortado ("MD125..."). Completar el modelo exacto.',
  },
];

(async () => {
  const ds = new DataSource(dataSourceOptions);
  await ds.initialize();
  const repo = ds.getRepository(Vehiculo);
  let creados = 0;
  let omitidos = 0;
  try {
    for (const m of MOVILES) {
      const existente = (await repo.find({ where: [{ numeroChasis: m.chasis }, { numeroInterno: m.numero }] }))[0];
      if (existente) {
        omitidos++;
        console.log(`omitido  Movil ${m.numero} (ya existe: ${existente.numeroInterno} / ${existente.numeroChasis})`);
        continue;
      }
      await repo.save(
        repo.create({
          numeroInterno: m.numero,
          tipo: m.tipo,
          marca: m.marca,
          modelo: m.modelo,
          anio: m.anio,
          patente: m.patente,
          color: m.color,
          numeroChasis: m.chasis,
          estado: 'OPERATIVO',
          estadoOperativo: 'EN_CUARTEL',
          kilometrajeActual: 0,
          combustibleActual: 0,
          fotos: '[]',
          documentos: '[]',
          metadata: m.nota ? JSON.stringify({ pendiente: m.nota }) : null,
        }),
      );
      creados++;
      console.log(`creado   Movil ${m.numero}  ${m.marca} ${m.modelo} ${m.anio}  chapa ${m.patente ?? '(sin cargar)'}${m.nota ? '  [pendiente]' : ''}`);
    }
  } finally {
    await ds.destroy();
  }
  console.log(`\n${creados} creados, ${omitidos} ya estaban.`);
})().catch((e) => {
  console.error('ERROR:', (e.driverError && e.driverError.message) || e.message);
  process.exit(1);
});
