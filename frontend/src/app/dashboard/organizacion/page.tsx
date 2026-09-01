'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Cargando } from '@/app/components/Cargando';

interface DashboardData {
  rangos: number;
  cargos: number;
  especialidades: number;
  companias: number;
  cuarteles: number;
  brigadas: number;
  departamentos: number;
  unidades: number;
  turnos: number;
  tiposGuardia: number;
  designacionesActivas: number;
  ascensosRegistrados: number;
}

function Tarjeta({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className="card">
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{titulo}</div>
      <div style={{ fontSize: 26, fontWeight: 700 }}>{valor}</div>
    </div>
  );
}

export default function OrganizacionDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/organizacion/dashboard')
      .then(async (res) => {
        if (!res.ok) throw new Error('No se pudo cargar el dashboard de organizacion');
        setData(await res.json());
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ color: 'var(--danger)' }}>{error}</p>;
  if (!data) return <Cargando texto="Cargando…" />;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 12,
      }}
    >
      <Tarjeta titulo="Rangos" valor={data.rangos} />
      <Tarjeta titulo="Cargos" valor={data.cargos} />
      <Tarjeta titulo="Especialidades" valor={data.especialidades} />
      <Tarjeta titulo="Companias" valor={data.companias} />
      <Tarjeta titulo="Cuarteles" valor={data.cuarteles} />
      <Tarjeta titulo="Brigadas" valor={data.brigadas} />
      <Tarjeta titulo="Departamentos" valor={data.departamentos} />
      <Tarjeta titulo="Unidades" valor={data.unidades} />
      <Tarjeta titulo="Turnos" valor={data.turnos} />
      <Tarjeta titulo="Tipos de guardia" valor={data.tiposGuardia} />
      <Tarjeta titulo="Designaciones activas" valor={data.designacionesActivas} />
      <Tarjeta titulo="Ascensos registrados" valor={data.ascensosRegistrados} />
    </div>
  );
}
