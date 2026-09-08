'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { cargarParametros, obtenerParametro, Parametro } from '@/lib/parametros';
import { Aviso } from '@/app/components/Aviso';
import { campoTexto } from '../expediente';

export function TabActividadProfesional({ bomberoId, puedeEditar }: { bomberoId: string; puedeEditar: boolean }) {
  const [datos, setDatos] = useState<Record<string, string | null> | null>(null);
  const [nombreProfesion, setNombreProfesion] = useState<string | null>(null);
  const [profesiones, setProfesiones] = useState<Parametro[]>([]);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ profesionId: '', empresa: '', cargoLaboral: '', experiencia: '', actividadesRelacionadas: '' });
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const res = await apiFetch(`/personal/bomberos/${bomberoId}/actividad-profesional`);
    if (res.ok) setDatos(await res.json());
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomberoId]);

  useEffect(() => {
    if (datos?.profesionId) {
      obtenerParametro(datos.profesionId).then((p) => setNombreProfesion(p?.nombre ?? null));
    } else {
      setNombreProfesion(null);
    }
  }, [datos?.profesionId]);

  function iniciarEdicion() {
    setForm({
      profesionId: datos?.profesionId ?? '',
      empresa: datos?.empresa ?? '',
      cargoLaboral: datos?.cargoLaboral ?? '',
      experiencia: datos?.experiencia ?? '',
      actividadesRelacionadas: datos?.actividadesRelacionadas ?? '',
    });
    cargarParametros('PROFESION').then(setProfesiones);
    setEditando(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const res = await apiFetch(`/personal/bomberos/${bomberoId}/actividad-profesional`, {
        method: 'PUT',
        body: JSON.stringify({
          profesionId: form.profesionId || null,
          empresa: form.empresa || null,
          cargoLaboral: form.cargoLaboral || null,
          experiencia: form.experiencia || null,
          actividadesRelacionadas: form.actividadesRelacionadas || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo guardar');
      }
      setEditando(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (editando) {
    return (
      <form className="card" onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {error && <Aviso tipo="error" texto={error} />}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label htmlFor="profesion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Profesion</label>
            <select id="profesion"
              className="input-field"
              value={form.profesionId}
              onChange={(e) => setForm({ ...form, profesionId: e.target.value })}
            >
              <option value="">NINGUNA</option>
              {profesiones.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              Si falta una profesion, se puede cargar desde Organizacion Institucional → Parámetros.
            </p>
          </div>
          <div>
            <label htmlFor="empresa" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Empresa</label>
            <input id="empresa" className="input-field" value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
          </div>
          <div>
            <label htmlFor="cargo-laboral" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cargo laboral</label>
            <input id="cargo-laboral" className="input-field" value={form.cargoLaboral} onChange={(e) => setForm({ ...form, cargoLaboral: e.target.value })} />
          </div>
          <div>
            <label htmlFor="experiencia" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Experiencia</label>
            <input id="experiencia" className="input-field" value={form.experiencia} onChange={(e) => setForm({ ...form, experiencia: e.target.value })} />
          </div>
        </div>
        <div>
          <label htmlFor="actividades-relacionadas" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Actividades relacionadas</label>
          <input id="actividades-relacionadas"
            className="input-field"
            value={form.actividadesRelacionadas}
            onChange={(e) => setForm({ ...form, actividadesRelacionadas: e.target.value })}
          />
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
          Editar
        </button>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {campoTexto('Profesion', nombreProfesion)}
        {campoTexto('Empresa', datos?.empresa)}
        {campoTexto('Cargo laboral', datos?.cargoLaboral)}
        {campoTexto('Experiencia', datos?.experiencia)}
        {campoTexto('Actividades relacionadas', datos?.actividadesRelacionadas)}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Idiomas                                                               */
/* ------------------------------------------------------------------ */
