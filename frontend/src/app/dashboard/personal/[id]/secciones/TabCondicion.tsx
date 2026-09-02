'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { campoTexto } from '../expediente';

export function TabCondicion({ bomberoId, puedeEditar, onGuardado }: { bomberoId: string; puedeEditar: boolean; onGuardado: () => void }) {
  const [condicion, setCondicion] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<Record<string, any>>({});
  const [editando, setEditando] = useState(false);
  const [formCondicion, setFormCondicion] = useState('');
  const [formDetalle, setFormDetalle] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const res = await apiFetch(`/personal/bomberos/${bomberoId}/condicion`);
    if (res.ok) {
      const body = await res.json();
      setCondicion(body.condicionInstitucional);
      setDetalle(body.detalle ?? {});
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomberoId]);

  function iniciarEdicion() {
    setFormCondicion(condicion ?? CONDICIONES[0]);
    setFormDetalle(detalle ?? {});
    setEditando(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const res = await apiFetch(`/personal/bomberos/${bomberoId}/condicion`, {
        method: 'PUT',
        body: JSON.stringify({ condicionInstitucional: formCondicion, detalle: formDetalle }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo guardar');
      }
      setEditando(false);
      await cargar();
      onGuardado();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (editando) {
    const campos = CAMPOS_DETALLE[formCondicion] ?? [];
    return (
      <form className="card" onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {error && <Aviso tipo="error" texto={error} />}
        <div>
          <label htmlFor="condicion-institucional" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Condición institucional</label>
          <select id="condicion-institucional" className="input-field" value={formCondicion} onChange={(e) => { setFormCondicion(e.target.value); setFormDetalle({}); }}>
            {CONDICIONES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {campos.map(([campo, label, tipo]) => (
            <div key={campo}>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>{label}</label>
              <input
                aria-label={label}
                className="input-field"
                type={tipo === 'date' ? 'date' : tipo === 'number' ? 'number' : 'text'}
                value={formDetalle[campo] ?? ''}
                onChange={(e) => setFormDetalle({ ...formDetalle, [campo]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn-primary" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={() => setEditando(false)}>
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {puedeEditar && (
        <button type="button" className="btn-primary" style={{ alignSelf: 'flex-end' }} onClick={iniciarEdicion}>
          {condicion ? 'Editar' : 'Definir condicion'}
        </button>
      )}
      {!condicion && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin condición institucional definida.</p>}
      {condicion && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {campoTexto('Condicion', condicion)}
          {(CAMPOS_DETALLE[condicion] ?? []).map(([campo, label]) => campoTexto(label, detalle?.[campo]))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Formacion / Historial Academico (modulo Academia)                    */
/* ------------------------------------------------------------------ */



const CONDICIONES = ['INCORPORADO', 'COMBATIENTE', 'APOYO_ECONOMICO', 'HONORARIO'];


const CAMPOS_DETALLE: Record<string, Array<[string, string, string]>> = {
  INCORPORADO: [
    ['fechaIncorporacion', 'Fecha de incorporacion', 'date'],
    ['formacionInicial', 'Formacion inicial', 'text'],
    ['cursosRealizados', 'Cursos realizados', 'text'],
    ['evaluaciones', 'Evaluaciones', 'text'],
    ['estadoPreparacion', 'Estado de preparacion', 'text'],
    ['fechaHabilitacion', 'Fecha de habilitacion', 'date'],
  ],
  COMBATIENTE: [
    ['nivelEntrenamiento', 'Nivel de entrenamiento', 'text'],
    ['horasOperativas', 'Horas operativas', 'number'],
  ],
  APOYO_ECONOMICO: [
    ['comision', 'Comision', 'text'],
    ['funcion', 'Funcion', 'text'],
    ['responsabilidades', 'Responsabilidades', 'text'],
    ['actividades', 'Actividades', 'text'],
    ['periodoInicio', 'Periodo inicio', 'date'],
    ['periodoFin', 'Periodo fin', 'date'],
  ],
  HONORARIO: [
    ['fechaNombramiento', 'Fecha de nombramiento', 'date'],
    ['motivo', 'Motivo', 'text'],
    ['resolucion', 'Resolucion', 'text'],
    ['documentoUrl', 'URL del documento', 'text'],
    ['observaciones', 'Observaciones', 'text'],
  ],
};
