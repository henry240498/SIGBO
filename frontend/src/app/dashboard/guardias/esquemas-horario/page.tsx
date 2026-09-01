'use client';

import { useEffect, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { obtenerSesion } from '@/lib/api';
import {
  DIAS_SEMANA_CSV,
  EsquemaHorarioGuardia,
  actualizarEsquemaHorario,
  cargarEsquemasHorario,
  crearEsquemaHorario,
  eliminarEsquemaHorario,
} from '@/lib/guardias';
import { Aviso } from '@/app/components/Aviso';

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
  const confirmar = useConfirmacion();
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
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: 'Eliminar este esquema de horario?', confirmar: 'Continuar', peligro: true })) return;
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
          <button type="button" className="btn-primary" onClick={() => (mostrarForm ? cancelar() : setMostrarForm(true))}>
            {mostrarForm ? 'Cancelar' : 'Nuevo esquema'}
          </button>
        )}
      </div>

      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
        Plantillas de horario reutilizables para la planificacion de guardias (personal rentado, grupos, feriados,
        fechas especiales). Ningun horario debe quedar fijo en el frontend: todo se define aqui.
      </p>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && puedeGestionar && (
        <form className="card" onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="nombre" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input id="nombre" className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="hora-inicio" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Hora inicio</label>
              <input id="hora-inicio" className="input-field" type="time" value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="hora-fin" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Hora fin</label>
              <input id="hora-fin" className="input-field" type="time" value={form.horaFin} onChange={(e) => setForm({ ...form, horaFin: e.target.value })} required />
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
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            &quot;Usa rotacion de grupo&quot; determina como resuelve el personal la generacion automatica (Guardias
            → Generar): si esta marcado, elige un grupo segun su ciclo de rotacion; si no, distribuye personal
            individual segun la frecuencia mensual configurada en su ficha.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="dias-de-duracion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Días de duración</label>
              <input id="dias-de-duracion" className="input-field" type="number" min={1} value={form.diasDuracion} onChange={(e) => setForm({ ...form, diasDuracion: parseInt(e.target.value, 10) || 1 })} />
            </div>
            <div>
              <label htmlFor="cant-minima" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cant. minima</label>
              <input id="cant-minima" className="input-field" type="number" min={0} value={form.cantidadMinima} onChange={(e) => setForm({ ...form, cantidadMinima: e.target.value })} />
            </div>
            <div>
              <label htmlFor="cant-maxima" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cant. maxima</label>
              <input id="cant-maxima" className="input-field" type="number" min={0} value={form.cantidadMaxima} onChange={(e) => setForm({ ...form, cantidadMaxima: e.target.value })} />
            </div>
            <div>
              <label htmlFor="cant-oficiales" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cant. oficiales</label>
              <input id="cant-oficiales" className="input-field" type="number" min={0} value={form.cantidadOficiales} onChange={(e) => setForm({ ...form, cantidadOficiales: parseInt(e.target.value, 10) || 0 })} />
            </div>
            <div>
              <label htmlFor="cant-choferes" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cant. choferes</label>
              <input id="cant-choferes" className="input-field" type="number" min={0} value={form.cantidadChoferes} onChange={(e) => setForm({ ...form, cantidadChoferes: parseInt(e.target.value, 10) || 0 })} />
            </div>
            <div>
              <label htmlFor="orden" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Orden</label>
              <input id="orden" className="input-field" type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: parseInt(e.target.value, 10) || 0 })} />
            </div>
          </div>

          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
            Activo
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn-primary" disabled={guardando}>{guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear esquema'}</button>
            <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={cancelar}>Cancelar</button>
          </div>
        </form>
      )}

      {esquemas && esquemas.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin esquemas configurados.</p>}
      {esquemas && esquemas.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Nombre</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Días</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Horario</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Especial</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Personal</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Oficial/Chofer</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Cant.</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              {puedeGestionar && <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {[...esquemas].sort((a, b) => a.orden - b.orden).map((e) => (
              <tr key={e.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{e.nombre}</td>
                <td style={{ padding: '6px 4px' }}>{e.diasSemanaCsv ?? '— (feriados/especial)'}</td>
                <td style={{ padding: '6px 4px' }}>{e.horaInicio.slice(0, 5)} - {e.horaFin.slice(0, 5)}{e.cruzaMedianoche ? ' (+1d)' : ''}</td>
                <td style={{ padding: '6px 4px' }}>{e.esEspecial ? 'SI' : 'NO'}</td>
                <td style={{ padding: '6px 4px' }}>{e.usaRotacionGrupo ? 'Grupo (rotacion)' : 'Individual (frecuencia)'}</td>
                <td style={{ padding: '6px 4px' }}>{e.requiereOficial ? 'Oficial' : ''}{e.requiereOficial && e.requiereChofer ? ' / ' : ''}{e.requiereChofer ? 'Chofer' : ''}</td>
                <td style={{ padding: '6px 4px' }}>{e.cantidadMinima ?? '?'}-{e.cantidadMaxima ?? '?'}</td>
                <td style={{ padding: '6px 4px' }}><span className="badge" style={{ background: e.activo ? 'var(--ok-fill)' : 'var(--bad-fill)' }}>{e.activo ? 'ACTIVO' : 'INACTIVO'}</span></td>
                {puedeGestionar && (
                  <td style={{ padding: '6px 4px', display: 'flex', gap: 6 }}>
                    <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(e)}>Editar</button>
                    <button type="button" style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: 6 }} onClick={() => eliminar(e.id)}>Eliminar</button>
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
