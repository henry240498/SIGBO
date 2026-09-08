'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { Bombero, Catalogo, cargarCatalogo, campoTexto } from '../expediente';

export function TabInstitucional({
  bombero,
  puedeEditar,
  onGuardado,
}: {
  bombero: Bombero;
  puedeEditar: boolean;
  onGuardado: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [catalogos, setCatalogos] = useState<Record<string, Catalogo[]>>({});
  const [form, setForm] = useState({
    companiaId: bombero.companiaId ?? '',
    cuartelId: bombero.cuartelId ?? '',
    turnoId: bombero.turnoId ?? '',
    tipoGuardiaId: bombero.tipoGuardiaId ?? '',
    brigadaId: bombero.brigadaId ?? '',
    departamentoId: bombero.departamentoId ?? '',
    unidadId: bombero.unidadId ?? '',
    fechaIngreso: bombero.fechaIngreso,
    fechaIncorporacion: bombero.fechaIncorporacion ?? '',
    fechaJuramento: bombero.fechaJuramento ?? '',
    estado: bombero.estado,
    realizaGuardias: bombero.realizaGuardias,
    realizaGuardiasEspeciales: bombero.realizaGuardiasEspeciales,
    frecuenciaNormalMensual: bombero.frecuenciaNormalMensual != null ? String(bombero.frecuenciaNormalMensual) : '',
    frecuenciaEspecialMensual: bombero.frecuenciaEspecialMensual != null ? String(bombero.frecuenciaEspecialMensual) : '',
    diaPreferenteGuardia: bombero.diaPreferenteGuardia ?? 'NINGUNA',
  });
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    Promise.all([
      cargarCatalogo('/organizacion/companias'),
      cargarCatalogo('/organizacion/cuarteles'),
      cargarCatalogo('/organizacion/turnos'),
      cargarCatalogo('/organizacion/tipos-guardia'),
      cargarCatalogo('/organizacion/brigadas'),
      cargarCatalogo('/organizacion/departamentos'),
      cargarCatalogo('/organizacion/unidades'),
    ]).then(([companias, cuarteles, turnos, tiposGuardia, brigadas, departamentos, unidades]) =>
      setCatalogos({ companias, cuarteles, turnos, tiposGuardia, brigadas, departamentos, unidades }),
    );
  }, []);

  function nombreDe(lista: string, valorId: string | null) {
    if (!valorId) return '-';
    return catalogos[lista]?.find((c) => c.id === valorId)?.nombre ?? '(no encontrado)';
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const { realizaGuardias, realizaGuardiasEspeciales, frecuenciaNormalMensual, frecuenciaEspecialMensual, diaPreferenteGuardia, ...resto } = form;
      const payload: Record<string, unknown> = Object.fromEntries(Object.entries(resto).map(([k, v]) => [k, v || undefined]));
      payload.realizaGuardias = realizaGuardias;
      payload.realizaGuardiasEspeciales = realizaGuardiasEspeciales;
      payload.frecuenciaNormalMensual = frecuenciaNormalMensual ? parseInt(frecuenciaNormalMensual, 10) : undefined;
      payload.frecuenciaEspecialMensual = frecuenciaEspecialMensual ? parseInt(frecuenciaEspecialMensual, 10) : undefined;
      payload.diaPreferenteGuardia = diaPreferenteGuardia || 'NINGUNA';
      const res = await apiFetch(`/personal/bomberos/${bombero.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo guardar');
      }
      setEditando(false);
      onGuardado();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (!editando) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {puedeEditar && (
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-end' }} onClick={() => setEditando(true)}>
            Editar
          </button>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {campoTexto('Compania', nombreDe('companias', bombero.companiaId))}
          {campoTexto('Cuartel', nombreDe('cuarteles', bombero.cuartelId))}
          {campoTexto('Turno', nombreDe('turnos', bombero.turnoId))}
          {campoTexto('Tipo de guardia', nombreDe('tiposGuardia', bombero.tipoGuardiaId))}
          {campoTexto('Brigada', nombreDe('brigadas', bombero.brigadaId))}
          {campoTexto('Departamento', nombreDe('departamentos', bombero.departamentoId))}
          {campoTexto('Unidad', nombreDe('unidades', bombero.unidadId))}
          {campoTexto('Fecha de ingreso', bombero.fechaIngreso)}
          {campoTexto('Fecha de incorporacion', bombero.fechaIncorporacion)}
          {campoTexto('Fecha de juramento', bombero.fechaJuramento)}
          {campoTexto('Estado', bombero.estado)}
        </div>
        <div>
          <h4 style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>Disponibilidad para Guardias</h4>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>
            Distinto de participar en Servicios: un bombero puede participar de servicios aunque no realice guardias.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 16 }}>
            {campoTexto('Realiza guardias', bombero.realizaGuardias ? 'SI' : 'NO')}
            {campoTexto('Realiza guardias especiales', bombero.realizaGuardiasEspeciales ? 'SI' : 'NO')}
            {campoTexto('Frecuencia normal mensual', bombero.frecuenciaNormalMensual != null ? String(bombero.frecuenciaNormalMensual) : 'Sin definir')}
            {campoTexto('Frecuencia especial mensual', bombero.frecuenciaEspecialMensual != null ? String(bombero.frecuenciaEspecialMensual) : 'Sin definir')}
            {campoTexto('Dia preferente', bombero.diaPreferenteGuardia ?? 'NINGUNA')}
          </div>
        </div>
      </div>
    );
  }

  type CampoCatalogo = 'companiaId' | 'cuartelId' | 'turnoId' | 'tipoGuardiaId' | 'brigadaId' | 'departamentoId' | 'unidadId';

  function selectCatalogo(clave: string, campo: CampoCatalogo, label: string) {
    return (
      <div>
        <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>{label}</label>
        <select
          aria-label={label}
          className="input-field"
          value={form[campo]}
          onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
        >
          <option value="">Sin asignar</option>
          {(catalogos[clave] ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.codigo ? `${c.codigo} - ${c.nombre}` : c.nombre}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {error && <Aviso tipo="error" texto={error} />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {selectCatalogo('companias', 'companiaId', 'Compania')}
        {selectCatalogo('cuarteles', 'cuartelId', 'Cuartel')}
        {selectCatalogo('turnos', 'turnoId', 'Turno')}
        {selectCatalogo('tiposGuardia', 'tipoGuardiaId', 'Tipo de guardia')}
        {selectCatalogo('brigadas', 'brigadaId', 'Brigada')}
        {selectCatalogo('departamentos', 'departamentoId', 'Departamento')}
        {selectCatalogo('unidades', 'unidadId', 'Unidad')}
        <div>
          <label htmlFor="estado" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
          <select id="estado" className="input-field" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="fecha-de-ingreso" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de ingreso</label>
          <input id="fecha-de-ingreso"
            className="input-field"
            type="date"
            value={form.fechaIngreso}
            onChange={(e) => setForm({ ...form, fechaIngreso: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="fecha-de-incorporacion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de incorporacion</label>
          <input id="fecha-de-incorporacion"
            className="input-field"
            type="date"
            value={form.fechaIncorporacion}
            onChange={(e) => setForm({ ...form, fechaIncorporacion: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="fecha-de-juramento" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de juramento</label>
          <input id="fecha-de-juramento"
            className="input-field"
            type="date"
            value={form.fechaJuramento}
            onChange={(e) => setForm({ ...form, fechaJuramento: e.target.value })}
          />
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Disponibilidad para Guardias</h4>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>
          Distinto de participar en Servicios: un bombero puede participar de servicios aunque no realice guardias.
        </p>
        <div style={{ display: 'flex', gap: 20, marginBottom: 10 }}>
          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="checkbox"
              checked={form.realizaGuardias}
              onChange={(e) => setForm({ ...form, realizaGuardias: e.target.checked })}
            />
            Realiza guardias
          </label>
          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="checkbox"
              checked={form.realizaGuardiasEspeciales}
              onChange={(e) => setForm({ ...form, realizaGuardiasEspeciales: e.target.checked })}
            />
            Realiza guardias especiales
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div>
            <label htmlFor="frecuencia-normal-mensual" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Frecuencia normal mensual</label>
            <input id="frecuencia-normal-mensual"
              className="input-field"
              type="number"
              min={0}
              value={form.frecuenciaNormalMensual}
              onChange={(e) => setForm({ ...form, frecuenciaNormalMensual: e.target.value })}
              placeholder="Sin definir"
            />
          </div>
          <div>
            <label htmlFor="frecuencia-especial-mensual" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Frecuencia especial mensual</label>
            <input id="frecuencia-especial-mensual"
              className="input-field"
              type="number"
              min={0}
              value={form.frecuenciaEspecialMensual}
              onChange={(e) => setForm({ ...form, frecuenciaEspecialMensual: e.target.value })}
              placeholder="Sin definir"
            />
          </div>
          <div>
            <label htmlFor="dia-preferente" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Día preferente</label>
            <select id="dia-preferente"
              className="input-field"
              value={form.diaPreferenteGuardia}
              onChange={(e) => setForm({ ...form, diaPreferenteGuardia: e.target.value })}
            >
              {DIAS_SEMANA_PREFERENCIA.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
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

/* ------------------------------------------------------------------ */
/* Tipo de bombero                                                       */
/* ------------------------------------------------------------------ */



const ESTADOS = ['ASPIRANTE', 'ACTIVO', 'SUSPENDIDO', 'LICENCIA', 'RETIRADO', 'FALLECIDO', 'HONORARIO'];


const DIAS_SEMANA_PREFERENCIA = ['NINGUNA', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
