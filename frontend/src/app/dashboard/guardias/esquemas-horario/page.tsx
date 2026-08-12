'use client';

import { useEffect, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import {
  DIAS_SEMANA_CSV,
  EsquemaHorarioGuardia,
  actualizarEsquemaHorario,
  cargarEsquemasHorario,
  crearEsquemaHorario,
  eliminarEsquemaHorario,
} from '@/lib/guardias';

const VACIO = {
  nombre: '',
  diasSemanaCsv: [] as string[],
  horaInicio: '',
  horaFin: '',
  cruzaMedianoche: false,
  diasDuracion: 1,
  esEspecial: false,
  usaRotacionGrupo: false,
  requiereOficial: true,
  requiereChofer: true,
  cantidadMinima: '',
  cantidadMaxima: '',
  cantidadOficiales: 1,
  cantidadChoferes: 1,
  orden: 0,
  activo: true,
};

export default function EsquemasHorarioPage() {
  const [esquemas, setEsquemas] = useState<EsquemaHorarioGuardia[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);

  const puedeGestionar = !!obtenerSesion()?.usuario.permisos.includes('guardias:requisitos');

  async function cargar() {
    try {
      setEsquemas(await cargarEsquemasHorario());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function limpiar() {
    setEditandoId(null);
    setForm(VACIO);
  }

  function editar(e: EsquemaHorarioGuardia) {
    setEditandoId(e.id);
    setForm({
      nombre: e.nombre,
      diasSemanaCsv: e.diasSemanaCsv ? e.diasSemanaCsv.split(',') : [],
      horaInicio: e.horaInicio.slice(0, 5),
      horaFin: e.horaFin.slice(0, 5),
      cruzaMedianoche: e.cruzaMedianoche,
      diasDuracion: e.diasDuracion,
      esEspecial: e.esEspecial,
      usaRotacionGrupo: e.usaRotacionGrupo,
      requiereOficial: e.requiereOficial,
      requiereChofer: e.requiereChofer,
      cantidadMinima: e.cantidadMinima != null ? String(e.cantidadMinima) : '',
      cantidadMaxima: e.cantidadMaxima != null ? String(e.cantidadMaxima) : '',
      cantidadOficiales: e.cantidadOficiales,
      cantidadChoferes: e.cantidadChoferes,
      orden: e.orden,
      activo: e.activo,
    });
    setMostrarForm(true);
  }

  function cancelar() {
    limpiar();
    setMostrarForm(false);
  }

  function toggleDia(dia: string) {
    setForm((f) => ({
      ...f,
      diasSemanaCsv: f.diasSemanaCsv.includes(dia) ? f.diasSemanaCsv.filter((d) => d !== dia) : [...f.diasSemanaCsv, dia],
    }));
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      const payload = {
        nombre: form.nombre,
        diasSemanaCsv: form.diasSemanaCsv.length > 0 ? form.diasSemanaCsv.join(',') : undefined,
        horaInicio: form.horaInicio,
        horaFin: form.horaFin,
        cruzaMedianoche: form.cruzaMedianoche,
        diasDuracion: form.diasDuracion,
        esEspecial: form.esEspecial,
        usaRotacionGrupo: form.usaRotacionGrupo,
        requiereOficial: form.requiereOficial,
        requiereChofer: form.requiereChofer,
        cantidadMinima: form.cantidadMinima ? parseInt(form.cantidadMinima, 10) : undefined,
        cantidadMaxima: form.cantidadMaxima ? parseInt(form.cantidadMaxima, 10) : undefined,
        cantidadOficiales: form.cantidadOficiales,
        cantidadChoferes: form.cantidadChoferes,
        orden: form.orden,
        activo: form.activo,
      };
      if (editandoId) {
        await actualizarEsquemaHorario(editandoId, payload);
        setMensaje('Esquema actualizado');
      } else {
        await crearEsquemaHorario(payload);
        setMensaje('Esquema creado');
      }
      limpiar();
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id: string) {
    if (!window.confirm('Eliminar este esquema de horario?')) return;
    setError(null);
    try {
      await eliminarEsquemaHorario(id);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontSize: 16 }}>Esquemas de horario ({esquemas?.length ?? 0})</h2>
        {puedeGestionar && (
          <button className="btn-primary" onClick={() => (mostrarForm ? cancelar() : setMostrarForm(true))}>
            {mostrarForm ? 'Cancelar' : 'Nuevo esquema'}
          </button>
        )}
      </div>

      <p style={{ fontSize: 13, color: '#94a3b8' }}>
        Plantillas de horario reutilizables para la planificacion de guardias (personal rentado, grupos, feriados,
        fechas especiales). Ningun horario debe quedar fijo en el frontend: todo se define aqui.
      </p>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {mostrarForm && puedeGestionar && (
        <form className="card" onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Hora inicio</label>
              <input className="input-field" type="time" value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Hora fin</label>
              <input className="input-field" type="time" value={form.horaFin} onChange={(e) => setForm({ ...form, horaFin: e.target.value })} required />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              Dias de la semana (vacio = solo se usa para feriados / fechas especiales)
            </label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {DIAS_SEMANA_CSV.map((d) => (
                <label key={d} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="checkbox" checked={form.diasSemanaCsv.includes(d)} onChange={() => toggleDia(d)} />
                  {d}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={form.cruzaMedianoche} onChange={(e) => setForm({ ...form, cruzaMedianoche: e.target.checked })} />
              Cruza medianoche
            </label>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={form.esEspecial} onChange={(e) => setForm({ ...form, esEspecial: e.target.checked })} />
              Es especial
            </label>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={form.usaRotacionGrupo} onChange={(e) => setForm({ ...form, usaRotacionGrupo: e.target.checked })} />
              Usa rotacion de grupo
            </label>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={form.requiereOficial} onChange={(e) => setForm({ ...form, requiereOficial: e.target.checked })} />
              Requiere oficial
            </label>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={form.requiereChofer} onChange={(e) => setForm({ ...form, requiereChofer: e.target.checked })} />
              Requiere chofer
            </label>
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>
            &quot;Usa rotacion de grupo&quot; determina como resuelve el personal la generacion automatica (Guardias
            → Generar): si esta marcado, elige un grupo segun su ciclo de rotacion; si no, distribuye personal
            individual segun la frecuencia mensual configurada en su ficha.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Dias de duracion</label>
              <input className="input-field" type="number" min={1} value={form.diasDuracion} onChange={(e) => setForm({ ...form, diasDuracion: parseInt(e.target.value, 10) || 1 })} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cant. minima</label>
              <input className="input-field" type="number" min={0} value={form.cantidadMinima} onChange={(e) => setForm({ ...form, cantidadMinima: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cant. maxima</label>
              <input className="input-field" type="number" min={0} value={form.cantidadMaxima} onChange={(e) => setForm({ ...form, cantidadMaxima: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cant. oficiales</label>
              <input className="input-field" type="number" min={0} value={form.cantidadOficiales} onChange={(e) => setForm({ ...form, cantidadOficiales: parseInt(e.target.value, 10) || 0 })} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cant. choferes</label>
              <input className="input-field" type="number" min={0} value={form.cantidadChoferes} onChange={(e) => setForm({ ...form, cantidadChoferes: parseInt(e.target.value, 10) || 0 })} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Orden</label>
              <input className="input-field" type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: parseInt(e.target.value, 10) || 0 })} />
            </div>
          </div>

          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
            Activo
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" disabled={guardando}>{guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear esquema'}</button>
            <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={cancelar}>Cancelar</button>
          </div>
        </form>
      )}

      {esquemas && esquemas.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin esquemas configurados.</p>}
      {esquemas && esquemas.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Nombre</th>
              <th style={{ padding: '6px 4px' }}>Dias</th>
              <th style={{ padding: '6px 4px' }}>Horario</th>
              <th style={{ padding: '6px 4px' }}>Especial</th>
              <th style={{ padding: '6px 4px' }}>Personal</th>
              <th style={{ padding: '6px 4px' }}>Oficial/Chofer</th>
              <th style={{ padding: '6px 4px' }}>Cant.</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              {puedeGestionar && <th style={{ padding: '6px 4px' }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {[...esquemas].sort((a, b) => a.orden - b.orden).map((e) => (
              <tr key={e.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{e.nombre}</td>
                <td style={{ padding: '6px 4px' }}>{e.diasSemanaCsv ?? '— (feriados/especial)'}</td>
                <td style={{ padding: '6px 4px' }}>{e.horaInicio.slice(0, 5)} - {e.horaFin.slice(0, 5)}{e.cruzaMedianoche ? ' (+1d)' : ''}</td>
                <td style={{ padding: '6px 4px' }}>{e.esEspecial ? 'SI' : 'NO'}</td>
                <td style={{ padding: '6px 4px' }}>{e.usaRotacionGrupo ? 'Grupo (rotacion)' : 'Individual (frecuencia)'}</td>
                <td style={{ padding: '6px 4px' }}>{e.requiereOficial ? 'Oficial' : ''}{e.requiereOficial && e.requiereChofer ? ' / ' : ''}{e.requiereChofer ? 'Chofer' : ''}</td>
                <td style={{ padding: '6px 4px' }}>{e.cantidadMinima ?? '?'}-{e.cantidadMaxima ?? '?'}</td>
                <td style={{ padding: '6px 4px' }}><span className="badge" style={{ background: e.activo ? '#166534' : '#7f1d1d' }}>{e.activo ? 'ACTIVO' : 'INACTIVO'}</span></td>
                {puedeGestionar && (
                  <td style={{ padding: '6px 4px', display: 'flex', gap: 6 }}>
                    <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(e)}>Editar</button>
                    <button style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: 6 }} onClick={() => eliminar(e.id)}>Eliminar</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
