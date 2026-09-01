'use client';

import { useEffect, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Parametro } from '@/lib/parametros';
import { cargarActividades, ActividadAcademica } from '@/lib/academia';
import {
  BeneficioSocio,
  cargarBeneficiosSocios,
  cargarTiposBeneficioSocio,
  crearBeneficioSocio,
  actualizarBeneficioSocio,
} from '@/lib/socios-protectores';
import { Aviso } from '@/app/components/Aviso';

const AMBITOS = [
  { value: 'ACADEMIA', label: 'Academia' },
  { value: 'SERVICIOS', label: 'Servicios' },
  { value: 'GENERAL', label: 'General' },
];

interface FormState {
  id?: string;
  nombre: string;
  tipoId: string;
  porcentajeDescuento: string;
  montoFijoDescuento: string;
  ambito: string;
  actividadAcademicaId: string;
  fechaInicio: string;
  fechaFin: string;
  condiciones: string;
  observaciones: string;
}

const FORM_VACIO: FormState = {
  nombre: '',
  tipoId: '',
  porcentajeDescuento: '',
  montoFijoDescuento: '',
  ambito: 'ACADEMIA',
  actividadAcademicaId: '',
  fechaInicio: '',
  fechaFin: '',
  condiciones: '',
  observaciones: '',
};

export default function BeneficiosPage() {
  const [beneficios, setBeneficios] = useState<BeneficioSocio[] | null>(null);
  const [tipos, setTipos] = useState<Parametro[]>([]);
  const [actividades, setActividades] = useState<ActividadAcademica[]>([]);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeAdministrar = permisos.includes('finanzas:beneficios_administrar');

  const opcionesTipo = useMemo(() => tipos.map((t) => ({ value: t.id, label: t.nombre })), [tipos]);
  const opcionesActividad = useMemo(() => actividades.map((a) => ({ value: a.id, label: a.nombre })), [actividades]);
  const tipoPorId = useMemo(() => new Map(tipos.map((t) => [t.id, t.nombre])), [tipos]);
  const actividadPorId = useMemo(() => new Map(actividades.map((a) => [a.id, a.nombre])), [actividades]);

  async function cargar() {
    try {
      setBeneficios(await cargarBeneficiosSocios());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    cargarTiposBeneficioSocio().then(setTipos);
    cargarActividades().then(setActividades).catch(() => undefined);
  }, []);

  function nuevo() {
    setForm(FORM_VACIO);
    setMostrarForm(true);
  }

  function editar(b: BeneficioSocio) {
    setForm({
      id: b.id,
      nombre: b.nombre,
      tipoId: b.tipoId,
      porcentajeDescuento: b.porcentajeDescuento != null ? String(b.porcentajeDescuento) : '',
      montoFijoDescuento: b.montoFijoDescuento != null ? String(b.montoFijoDescuento) : '',
      ambito: b.ambito,
      actividadAcademicaId: b.actividadAcademicaId ?? '',
      fechaInicio: b.fechaInicio,
      fechaFin: b.fechaFin ?? '',
      condiciones: b.condiciones ?? '',
      observaciones: b.observaciones ?? '',
    });
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      const payload = {
        nombre: form.nombre,
        tipoId: form.tipoId,
        porcentajeDescuento: form.porcentajeDescuento ? Number(form.porcentajeDescuento) : undefined,
        montoFijoDescuento: form.montoFijoDescuento ? Number(form.montoFijoDescuento) : undefined,
        ambito: form.ambito,
        actividadAcademicaId: form.ambito === 'ACADEMIA' ? form.actividadAcademicaId || undefined : undefined,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin || undefined,
        condiciones: form.condiciones || undefined,
        observaciones: form.observaciones || undefined,
      };
      if (form.id) {
        await actualizarBeneficioSocio(form.id, payload);
        setMensaje('Beneficio actualizado.');
      } else {
        await crearBeneficioSocio(payload);
        setMensaje('Beneficio creado.');
      }
      setMostrarForm(false);
      setForm(FORM_VACIO);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function alternarEstado(b: BeneficioSocio) {
    try {
      await actualizarBeneficioSocio(b.id, { estado: b.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO' });
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Beneficios de Socios Protectores ({beneficios?.length ?? 0})</h2>
        {puedeAdministrar && (
          <button type="button" className="btn-primary" onClick={() => (mostrarForm ? setMostrarForm(false) : nuevo())}>
            {mostrarForm ? 'Cancelar' : '+ Nuevo beneficio'}
          </button>
        )}
      </div>

      <p style={{ color: 'var(--muted)', fontSize: 12 }}>
        Un beneficio activo aplica automaticamente a cualquier Socio Protector con estado activo dentro de su ambito -- no hace falta asignarlo socio por socio.
      </p>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form onSubmit={guardar} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="nombre" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input id="nombre" className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo</label>
              <ComboBuscable ariaLabel="Tipo" opciones={opcionesTipo} value={form.tipoId} onChange={(v) => setForm({ ...form, tipoId: v })} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Ambito</label>
              <ComboBuscable ariaLabel="Ambito" opciones={AMBITOS} value={form.ambito} onChange={(v) => setForm({ ...form, ambito: v, actividadAcademicaId: '' })} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="de-descuento" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>% de descuento</label>
              <input id="de-descuento" className="input-field" type="number" min={0.01} max={100} step="0.01" value={form.porcentajeDescuento} onChange={(e) => setForm({ ...form, porcentajeDescuento: e.target.value })} />
            </div>
            <div>
              <label htmlFor="monto-fijo-alternativo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Monto fijo (alternativo)</label>
              <input id="monto-fijo-alternativo" className="input-field" type="number" min={0.01} step="1" value={form.montoFijoDescuento} onChange={(e) => setForm({ ...form, montoFijoDescuento: e.target.value })} />
            </div>
            <div>
              <label htmlFor="fecha-inicio" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha inicio</label>
              <input id="fecha-inicio" className="input-field" type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} required />
            </div>
            <div>
              <label htmlFor="fecha-fin-opcional" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha fin (opcional)</label>
              <input id="fecha-fin-opcional" className="input-field" type="date" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} />
            </div>
          </div>
          {form.ambito === 'ACADEMIA' && (
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Actividad especifica (vacio = cualquier actividad con costo)</label>
              <ComboBuscable ariaLabel="Actividad especifica (vacio = cualquier actividad con costo)" opciones={opcionesActividad} value={form.actividadAcademicaId} onChange={(v) => setForm({ ...form, actividadAcademicaId: v })} ningunaLabel="-- cualquiera --" />
            </div>
          )}
          <div>
            <label htmlFor="condiciones" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Condiciones</label>
            <input id="condiciones" className="input-field" value={form.condiciones} onChange={(e) => setForm({ ...form, condiciones: e.target.value })} />
          </div>
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : form.id ? 'Guardar cambios' : 'Crear beneficio'}
          </button>
        </form>
      )}

      {beneficios && beneficios.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay beneficios registrados.</p>}
      {beneficios && beneficios.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Nombre</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Tipo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Ambito</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Descuento</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Vigencia</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {beneficios.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{b.nombre}</td>
                <td style={{ padding: '6px 4px' }}>{tipoPorId.get(b.tipoId) ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>{b.ambito}{b.actividadAcademicaId ? ` (${actividadPorId.get(b.actividadAcademicaId) ?? '-'})` : ''}</td>
                <td style={{ padding: '6px 4px' }}>{b.porcentajeDescuento ? `${b.porcentajeDescuento}%` : b.montoFijoDescuento ? `Gs. ${b.montoFijoDescuento.toLocaleString('es-PY')}` : '-'}</td>
                <td style={{ padding: '6px 4px' }}>{b.fechaInicio} {b.fechaFin ? `→ ${b.fechaFin}` : '(sin fin)'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={b.estado === 'ACTIVO' ? { background: 'var(--ok-fill)', color: 'var(--success)' } : { background: 'var(--neutral-fill)', color: 'var(--muted)' }}>{b.estado}</span>
                </td>
                <td style={{ padding: '6px 4px', display: 'flex', gap: 6 }}>
                  {puedeAdministrar && (
                    <>
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => editar(b)}>Editar</button>
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 11, background: '#475569' }} onClick={() => alternarEstado(b)}>
                        {b.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
