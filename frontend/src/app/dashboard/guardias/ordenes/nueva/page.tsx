'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { crearOrdenGuardia } from '@/lib/guardias';
import { Aviso } from '@/app/components/Aviso';

const MESES = [
  { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setiembre' },
  { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' },
];

export default function NuevaOrdenGuardiaPage() {
  const router = useRouter();
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [fechaEmision, setFechaEmision] = useState(hoy.toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreando(true);
    try {
      const orden = await crearOrdenGuardia({ anio, mes, fechaEmision });
      router.push(`/dashboard/guardias/ordenes/${orden.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
      <h2 style={{ fontSize: 16 }}>Nueva Orden de Guardia</h2>
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
        SIGBO recupera automaticamente la planificacion (grupos, esquemas, guardias generadas) del periodo
        seleccionado y arma la vista previa. El numero de orden se asigna automaticamente en forma secuencial por
        año.
      </p>

      {error && <Aviso tipo="error" texto={error} />}

      <form className="card" onSubmit={crear} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label htmlFor="ano" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Año</label>
            <input id="ano" className="input-field" type="number" value={anio} onChange={(e) => setAnio(parseInt(e.target.value, 10))} required />
          </div>
          <div>
            <label htmlFor="mes" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Mes</label>
            <select id="mes" className="input-field" value={mes} onChange={(e) => setMes(parseInt(e.target.value, 10))}>
              {MESES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="fecha-de-emision" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de emision</label>
          <input id="fecha-de-emision" className="input-field" type="date" value={fechaEmision} onChange={(e) => setFechaEmision(e.target.value)} required />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn-primary" disabled={creando}>{creando ? 'Creando...' : 'Crear orden'}</button>
          <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={() => router.push('/dashboard/guardias/ordenes')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
