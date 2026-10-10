/** Estado de las migraciones: dbo.__sigbo_migrations contra database/migrations.sha256. */

export function parsearManifiesto(texto: string): Array<{ nombre: string; hash: string }> {
  const salida: Array<{ nombre: string; hash: string }> = [];
  for (const linea of texto.replace(/^﻿/, '').split(/\r?\n/)) {
    const t = linea.trim();
    if (!t || t.startsWith('#')) continue;
    const m = t.match(/^([A-Fa-f0-9]{64})\s{2,}(.+\.sql)$/);
    if (m) salida.push({ nombre: m[2], hash: m[1].toUpperCase() });
  }
  return salida;
}

export interface EstadoMigraciones {
  total: number;
  aplicadas: number;
  pendientes: string[];
  alteradas: string[];
  desconocidas: string[];
  ultimaAplicada: { nombre: string; aplicadaEn: string } | null;
}

const CREACION = '000_create_database.sql';

export function compararMigraciones(manifiesto: Array<{ nombre: string; hash: string }>, aplicadas: Array<{ nombre: string; hash: string; aplicadaEn: Date | string }>): EstadoMigraciones {
  const esperadas = manifiesto.filter((m) => m.nombre !== CREACION);
  const porNombre = new Map(aplicadas.map((a) => [a.nombre, a]));
  const pendientes = esperadas.filter((m) => !porNombre.has(m.nombre)).map((m) => m.nombre);
  const alteradas = esperadas
    .filter((m) => porNombre.has(m.nombre) && String(porNombre.get(m.nombre)!.hash ?? '').trim().toUpperCase() !== m.hash)
    .map((m) => m.nombre);
  const nombres = new Set(esperadas.map((m) => m.nombre));
  const desconocidas = aplicadas.filter((a) => a.nombre !== CREACION && !nombres.has(a.nombre)).map((a) => a.nombre);
  const enManifiesto = aplicadas.filter((a) => nombres.has(a.nombre)).sort((a, b) => a.nombre.localeCompare(b.nombre));
  const ultima = enManifiesto[enManifiesto.length - 1];
  return {
    total: esperadas.length,
    aplicadas: esperadas.length - pendientes.length,
    pendientes,
    alteradas,
    desconocidas,
    ultimaAplicada: ultima ? { nombre: ultima.nombre, aplicadaEn: new Date(ultima.aplicadaEn).toISOString() } : null,
  };
}
