'use client';

import { descargarArchivo } from '@/lib/exportar';

const REPORTES = [
  { nombre: 'Rangos', ruta: 'rangos' },
  { nombre: 'Cargos', ruta: 'cargos' },
  { nombre: 'Especialidades', ruta: 'especialidades' },
  { nombre: 'Companias', ruta: 'companias' },
  { nombre: 'Cuarteles', ruta: 'cuarteles' },
  { nombre: 'Brigadas', ruta: 'brigadas' },
  { nombre: 'Departamentos', ruta: 'departamentos' },
  { nombre: 'Unidades', ruta: 'unidades' },
  { nombre: 'Turnos', ruta: 'turnos' },
  { nombre: 'Tipos de guardia', ruta: 'tipos-guardia' },
  { nombre: 'Designaciones', ruta: 'designaciones' },
  { nombre: 'Ascensos', ruta: 'ascensos' },
];

export default function ReportesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 13, color: '#94a3b8' }}>
        Exportacion disponible en Excel (.xlsx) y PDF para los 12 catalogos de este modulo.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
        }}
      >
        {REPORTES.map((r) => (
          <div key={r.ruta} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontWeight: 600 }}>{r.nombre}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn-primary"
                style={{ flex: 1 }}
                onClick={() => descargarArchivo(`/organizacion/${r.ruta}/exportar/excel`, `${r.ruta}.xlsx`)}
              >
                Excel
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1 }}
                onClick={() => descargarArchivo(`/organizacion/${r.ruta}/exportar/pdf`, `${r.ruta}.pdf`)}
              >
                PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
