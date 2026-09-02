'use client';

import { useEffect, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { apiFetch, obtenerSesion } from '@/lib/api';
import { cargarParametros, obtenerParametro, resolverNombres, Parametro } from '@/lib/parametros';
import { Aviso } from '@/app/components/Aviso';
import { Bombero, campoTexto } from '../expediente';

export function TabSalud({ bombero, puedeEditar, onGuardado }: { bombero: Bombero; puedeEditar: boolean; onGuardado: () => void }) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    grupoSanguineoId: bombero.grupoSanguineoId ?? '',
    factorRhId: bombero.factorRhId ?? '',
    alergias: bombero.alergias ?? '',
    condicionesMedicas: bombero.condicionesMedicas ?? '',
    medicamentos: bombero.medicamentos ?? '',
  });
  const [gruposCatalogo, setGruposCatalogo] = useState<Parametro[]>([]);
  const [factoresCatalogo, setFactoresCatalogo] = useState<Parametro[]>([]);
  const [grupoActual, setGrupoActual] = useState<Parametro | null>(null);
  const [factorActual, setFactorActual] = useState<Parametro | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (bombero.grupoSanguineoId) obtenerParametro(bombero.grupoSanguineoId).then(setGrupoActual);
    else setGrupoActual(null);
    if (bombero.factorRhId) obtenerParametro(bombero.factorRhId).then(setFactorActual);
    else setFactorActual(null);
  }, [bombero.grupoSanguineoId, bombero.factorRhId]);

  function iniciarEdicion() {
    Promise.all([cargarParametros('GRUPO_SANGUINEO'), cargarParametros('FACTOR_RH')]).then(([grupos, factores]) => {
      setGruposCatalogo(grupos);
      setFactoresCatalogo(factores);
    });
    setForm({
      grupoSanguineoId: bombero.grupoSanguineoId ?? '',
      factorRhId: bombero.factorRhId ?? '',
      alergias: bombero.alergias ?? '',
      condicionesMedicas: bombero.condicionesMedicas ?? '',
      medicamentos: bombero.medicamentos ?? '',
    });
    setEditando(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const res = await apiFetch(`/personal/bomberos/${bombero.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          grupoSanguineoId: form.grupoSanguineoId || null,
          factorRhId: form.factorRhId || null,
          alergias: form.alergias || null,
          condicionesMedicas: form.condicionesMedicas || null,
          medicamentos: form.medicamentos || null,
        }),
      });
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

  const tipoCompleto = grupoActual && factorActual ? `${grupoActual.nombre}${factorActual.codigo ?? ''}` : null;
  const compatibles =
    tipoCompleto && COMPATIBILIDAD_SANGUINEA[tipoCompleto]
      ? TIPOS_SANGUINEOS.filter((t) => COMPATIBILIDAD_SANGUINEA[tipoCompleto][t])
      : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!editando ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {puedeEditar && (
            <button type="button" className="btn-primary" style={{ alignSelf: 'flex-end' }} onClick={iniciarEdicion}>
              Editar
            </button>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {campoTexto('Grupo sanguineo', grupoActual?.nombre)}
            {campoTexto('Factor Rh', factorActual?.nombre)}
            {campoTexto('Tipo completo', tipoCompleto)}
            {campoTexto('Alergias', bombero.alergias)}
            {campoTexto('Condiciones medicas', bombero.condicionesMedicas)}
            {campoTexto('Medicamentos', bombero.medicamentos)}
          </div>

          {tipoCompleto && compatibles && (
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                Puede recibir sangre de: <span style={{ fontWeight: 400 }}>{compatibles.join(', ')}</span>
              </p>
              <p style={{ fontSize: 11, color: 'var(--muted)' }}>
                Informacion orientativa para transfusion de globulos rojos. No sustituye protocolos medicos ni la
                verificacion de compatibilidad realizada por personal sanitario.
              </p>
            </div>
          )}
        </div>
      ) : (
        <form className="card" onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {error && <Aviso tipo="error" texto={error} />}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="grupo-sanguineo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Grupo sanguineo</label>
              <select id="grupo-sanguineo"
                className="input-field"
                value={form.grupoSanguineoId}
                onChange={(e) => setForm({ ...form, grupoSanguineoId: e.target.value })}
              >
                <option value="">NINGUNA</option>
                {gruposCatalogo.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="factor-rh" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Factor Rh</label>
              <select id="factor-rh"
                className="input-field"
                value={form.factorRhId}
                onChange={(e) => setForm({ ...form, factorRhId: e.target.value })}
              >
                <option value="">NINGUNA</option>
                {factoresCatalogo.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="alergias" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Alergias</label>
            <input id="alergias" className="input-field" value={form.alergias} onChange={(e) => setForm({ ...form, alergias: e.target.value })} />
          </div>
          <div>
            <label htmlFor="condiciones-medicas" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Condiciones medicas</label>
            <input id="condiciones-medicas"
              className="input-field"
              value={form.condicionesMedicas}
              onChange={(e) => setForm({ ...form, condicionesMedicas: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="medicamentos" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Medicamentos</label>
            <input id="medicamentos" className="input-field" value={form.medicamentos} onChange={(e) => setForm({ ...form, medicamentos: e.target.value })} />
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
      )}

      <SeccionSeguros bomberoId={bombero.id} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Firma digital -- distinto de "tiene firma cargada": autorizadoFirma-  */
/* Digital determina si SIGBO puede insertarla automaticamente en        */
/* documentos oficiales. Endpoints dedicados, permiso propio.            */
/* ------------------------------------------------------------------ */



const TIPOS_SANGUINEOS = ['O-', 'O+', 'B-', 'B+', 'A-', 'A+', 'AB-', 'AB+'];


const COMPATIBILIDAD_SANGUINEA: Record<string, Record<string, boolean>> = {
  'AB+': { 'O-': true, 'O+': true, 'B-': true, 'B+': true, 'A-': true, 'A+': true, 'AB-': true, 'AB+': true },
  'AB-': { 'O-': true, 'O+': false, 'B-': true, 'B+': false, 'A-': true, 'A+': false, 'AB-': true, 'AB+': false },
  'A+': { 'O-': true, 'O+': true, 'B-': false, 'B+': false, 'A-': true, 'A+': true, 'AB-': false, 'AB+': false },
  'A-': { 'O-': true, 'O+': false, 'B-': false, 'B+': false, 'A-': true, 'A+': false, 'AB-': false, 'AB+': false },
  'B+': { 'O-': true, 'O+': true, 'B-': true, 'B+': true, 'A-': false, 'A+': false, 'AB-': false, 'AB+': false },
  'B-': { 'O-': true, 'O+': false, 'B-': true, 'B+': false, 'A-': false, 'A+': false, 'AB-': false, 'AB+': false },
  'O+': { 'O-': true, 'O+': true, 'B-': false, 'B+': false, 'A-': false, 'A+': false, 'AB-': false, 'AB+': false },
  'O-': { 'O-': true, 'O+': false, 'B-': false, 'B+': false, 'A-': false, 'A+': false, 'AB-': false, 'AB+': false },
};



interface SeguroBombero {
  id: string;
  aseguradoraId: string | null;
  tipoSeguroId: string | null;
  descripcion: string | null;
  numeroPoliza: string | null;
  fechaInicio: string | null;
  fechaVencimiento: string | null;
  estado: string;
  observaciones: string | null;
}



function SeccionSeguros({ bomberoId }: { bomberoId: string }) {
  const confirmar = useConfirmacion();
  const [items, setItems] = useState<SeguroBombero[] | null>(null);
  const [nombres, setNombres] = useState<Map<string, string>>(new Map());
  const [aseguradoras, setAseguradoras] = useState<Parametro[]>([]);
  const [tiposSeguro, setTiposSeguro] = useState<Parametro[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    aseguradoraId: '',
    tipoSeguroId: '',
    descripcion: '',
    numeroPoliza: '',
    fechaInicio: '',
    fechaVencimiento: '',
    estado: 'ACTIVO',
    observaciones: '',
  });

  const puedeVer = !!obtenerSesion()?.usuario.permisos.includes('personal:seguros_ver');
  const puedeCrear = !!obtenerSesion()?.usuario.permisos.includes('personal:seguros_crear');
  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('personal:seguros_editar');
  const puedeEliminar = !!obtenerSesion()?.usuario.permisos.includes('personal:seguros_eliminar');

  async function cargar() {
    const res = await apiFetch(`/personal/bomberos/${bomberoId}/seguros`);
    if (res.ok) {
      const data: SeguroBombero[] = await res.json();
      setItems(data);
      resolverNombres(data.flatMap((s) => [s.aseguradoraId, s.tipoSeguroId])).then(setNombres);
    }
  }

  useEffect(() => {
    if (puedeVer) cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomberoId]);

  function limpiarForm() {
    setForm({
      aseguradoraId: '',
      tipoSeguroId: '',
      descripcion: '',
      numeroPoliza: '',
      fechaInicio: '',
      fechaVencimiento: '',
      estado: 'ACTIVO',
      observaciones: '',
    });
    setEditandoId(null);
  }

  function abrirNuevo() {
    limpiarForm();
    Promise.all([cargarParametros('ASEGURADORA'), cargarParametros('TIPO_SEGURO')]).then(([a, t]) => {
      setAseguradoras(a);
      setTiposSeguro(t);
    });
    setMostrarForm(true);
  }

  function editar(s: SeguroBombero) {
    setEditandoId(s.id);
    setForm({
      aseguradoraId: s.aseguradoraId ?? '',
      tipoSeguroId: s.tipoSeguroId ?? '',
      descripcion: s.descripcion ?? '',
      numeroPoliza: s.numeroPoliza ?? '',
      fechaInicio: s.fechaInicio ?? '',
      fechaVencimiento: s.fechaVencimiento ?? '',
      estado: s.estado,
      observaciones: s.observaciones ?? '',
    });
    Promise.all([cargarParametros('ASEGURADORA'), cargarParametros('TIPO_SEGURO')]).then(([a, t]) => {
      setAseguradoras(a);
      setTiposSeguro(t);
    });
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const payload = {
        aseguradoraId: form.aseguradoraId || undefined,
        tipoSeguroId: form.tipoSeguroId || undefined,
        descripcion: form.descripcion || undefined,
        numeroPoliza: form.numeroPoliza || undefined,
        fechaInicio: form.fechaInicio || undefined,
        fechaVencimiento: form.fechaVencimiento || undefined,
        estado: form.estado,
        observaciones: form.observaciones || undefined,
      };
      const res = editandoId
        ? await apiFetch(`/personal/bomberos/${bomberoId}/seguros/${editandoId}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : await apiFetch(`/personal/bomberos/${bomberoId}/seguros`, { method: 'POST', body: JSON.stringify(payload) });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo guardar');
      }
      setMostrarForm(false);
      limpiarForm();
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function darBaja(id: string) {
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: 'Dar de baja este seguro?', confirmar: 'Continuar', peligro: true })) return;
    const res = await apiFetch(`/personal/bomberos/${bomberoId}/seguros/${id}/baja`, { method: 'PATCH' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo dar de baja el seguro');
      return;
    }
    await cargar();
  }

  if (!puedeVer) return null;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 14 }}>Seguros ({items?.length ?? 0})</h3>
        {puedeCrear && (
          <button type="button" className="btn-primary" onClick={mostrarForm ? () => setMostrarForm(false) : abrirNuevo}>
            {mostrarForm ? 'Cancelar' : '+ Agregar seguro'}
          </button>
        )}
      </div>

      {error && <Aviso tipo="error" texto={error} />}

      {mostrarForm && (
        <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="aseguradora" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Aseguradora</label>
              <select id="aseguradora" className="input-field" value={form.aseguradoraId} onChange={(e) => setForm({ ...form, aseguradoraId: e.target.value })}>
                <option value="">NINGUNA</option>
                {aseguradoras.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tipo-de-seguro" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de seguro</label>
              <select id="tipo-de-seguro" className="input-field" value={form.tipoSeguroId} onChange={(e) => setForm({ ...form, tipoSeguroId: e.target.value })}>
                <option value="">NINGUNA</option>
                {tiposSeguro.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="numero-de-poliza" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Número de poliza</label>
              <input id="numero-de-poliza" className="input-field" value={form.numeroPoliza} onChange={(e) => setForm({ ...form, numeroPoliza: e.target.value })} />
            </div>
            <div>
              <label htmlFor="estado-2" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
              <select id="estado-2" className="input-field" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </div>
            <div>
              <label htmlFor="fecha-de-inicio" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de inicio</label>
              <input id="fecha-de-inicio" className="input-field" type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} />
            </div>
            <div>
              <label htmlFor="fecha-de-vencimiento" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de vencimiento</label>
              <input id="fecha-de-vencimiento"
                className="input-field"
                type="date"
                value={form.fechaVencimiento}
                onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label htmlFor="descripcion-detalle-particular-de-esta-p" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              Descripcion (detalle particular de esta poliza)
            </label>
            <input id="descripcion-detalle-particular-de-esta-p" className="input-field" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div>
            <label htmlFor="observaciones-2" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observaciones</label>
            <input id="observaciones-2" className="input-field" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear seguro'}
          </button>
        </form>
      )}

      {items && items.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin seguros registrados.</p>}
      {items && items.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Aseguradora</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Tipo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Poliza</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Vigencia</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{s.aseguradoraId ? nombres.get(s.aseguradoraId) ?? '...' : '-'}</td>
                <td style={{ padding: '6px 4px' }}>{s.tipoSeguroId ? nombres.get(s.tipoSeguroId) ?? '...' : '-'}</td>
                <td style={{ padding: '6px 4px' }}>{s.numeroPoliza ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>
                  {s.fechaInicio ?? '?'} - {s.fechaVencimiento ?? '?'}
                </td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: s.estado === 'ACTIVO' ? 'var(--ok-fill)' : 'var(--bad-fill)' }}>
                    {s.estado}
                  </span>
                </td>
                <td style={{ padding: '6px 4px', display: 'flex', gap: 6 }}>
                  {puedeEditar && (
                    <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(s)}>
                      Editar
                    </button>
                  )}
                  {puedeEliminar && s.estado === 'ACTIVO' && (
                    <button type="button"
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }}
                      onClick={() => darBaja(s.id)}
                    >
                      Dar de baja
                    </button>
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

/* ------------------------------------------------------------------ */
/* Documentos (placeholder - fuera de alcance)                          */
/* ------------------------------------------------------------------ */
