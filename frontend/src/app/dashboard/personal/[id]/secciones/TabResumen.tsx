'use client';

import { useEffect, useState } from 'react';
import { obtenerParametro } from '@/lib/parametros';
import { Bombero, Catalogo, campoTexto } from '../expediente';

export function TabResumen({ bombero, tipo }: { bombero: Bombero; tipo?: Catalogo }) {
  const [ciudad, setCiudad] = useState<string | null>(null);

  useEffect(() => {
    if (bombero.ciudadId) {
      obtenerParametro(bombero.ciudadId).then((p) => setCiudad(p?.nombre ?? null));
    } else {
      setCiudad(null);
    }
  }, [bombero.ciudadId]);

  return (
    <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
      {campoTexto('Cedula', bombero.cedula)}
      {campoTexto('Codigo bomberil', bombero.numeroBombero)}
      {campoTexto('Tipo de bombero', tipo ? `${tipo.prefijo} - ${tipo.nombre}` : '-')}
      {campoTexto('Rango', bombero.rango)}
      {campoTexto('Cargo', bombero.cargo)}
      {campoTexto('Estado', bombero.estado)}
      {campoTexto('Condicion institucional', bombero.condicionInstitucional)}
      {campoTexto('Fecha de ingreso', bombero.fechaIngreso)}
      {campoTexto('Telefono', bombero.telefonoPrincipal)}
      {campoTexto('Email', bombero.email)}
      {campoTexto('Ciudad', ciudad)}
      {campoTexto('Nacionalidad', bombero.nacionalidad)}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Datos personales                                                     */
/* ------------------------------------------------------------------ */
