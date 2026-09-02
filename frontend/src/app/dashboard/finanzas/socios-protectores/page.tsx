'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { cargarBomberos, BomberoResumen } from '@/lib/personal';
import { cargarParametros, Parametro } from '@/lib/parametros';
import {
  SocioProtector,
  cargarSociosProtectores,
  crearSocioProtector,
  actualizarSocioProtector,
  cargarEstadosSocioProtector,
} from '@/lib/socios-protectores';
import { Aviso } from '@/app/components/Aviso';

function colorEstado(nombre: string | undefined) {
  const n = (nombre ?? '').toLowerCase();
  if (n === 'activo') return { background: 'var(--ok-fill)', color: 'var(--success)' };
  if (n === 'suspendido') return { background: 'var(--warn-fill)', color: 'var(--warning)' };
  if (n === 'baja') return { background: 'var(--bad-fill)', color: 'var(--danger)' };
  return { background: 'var(--neutral-fill)', color: 'var(--muted)' };
}

interface FormState {
  id?: string;
  codigo: string;
  tipoPersona: 'FISICA' | 'JURIDICA';
  bomberoId: string;
  nombre: string;
  apellido: string;
  ci: string;
  fechaNacimiento: string;
  razonSocial: string;
  ruc: string;
  nombreComercial: string;
  representanteNombre: string;
  representanteCi: string;
  telefono: string;
  celular: string;
  email: string;
  direccion: string;
  paisId: string;
  departamentoId: string;
  ciudadId: string;
  barrioId: string;
  estadoId: string;
  observaciones: string;
  motivoCambioCodigo: string;
}

const FORM_VACIO: FormState = {
  codigo: '',
  tipoPersona: 'FISICA',
  bomberoId: '',
  nombre: '',
  apellido: '',
  ci: '',
  fechaNacimiento: '',
  razonSocial: '',
  ruc: '',
  nombreComercial: '',
  representanteNombre: '',
  representanteCi: '',
  telefono: '',
  celular: '',
  email: '',
  direccion: '',
  paisId: '',
  departamentoId: '',
  ciudadId: '',
  barrioId: '',
  estadoId: '',
  observaciones: '',
  motivoCambioCodigo: '',
};

export default function SociosProtectoresPage() {
  const [socios, setSocios] = useState<SocioProtector[] | null>(null);
  const [estados, setEstados] = useState<Parametro[]>([]);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [paises, setPaises] = useState<Parametro[]>([]);
  const [departamentos, setDepartamentos] = useState<Parametro[]>([]);
  const [ciudades, setCiudades] = useState<Parametro[]>([]);
  const [barrios, setBarrios] = useState<Parametro[]>([]);

  const [q, setQ] = useState('');
  const [filtroEstadoId, setFiltroEstadoId] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCrear = permisos.includes('finanzas:socios_crear');
  const puedeEditar = permisos.includes('finanzas:socios_editar');

  const estadoPorId = useMemo(() => new Map(estados.map((e) => [e.id, e.nombre])), [estados]);
  const opcionesEstado = useMemo(() => estados.map((e) => ({ value: e.id, label: e.nombre })), [estados]);
  const opcionesBombero = useMemo(() => bomberos.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` })), [bomberos]);
  const opcionesPais = useMemo(() => paises.map((p) => ({ value: p.id, label: p.nombre })), [paises]);
  const opcionesDepartamento = useMemo(() => departamentos.map((p) => ({ value: p.id, label: p.nombre })), [departamentos]);
  const opcionesCiudad = useMemo(() => ciudades.map((p) => ({ value: p.id, label: p.nombre })), [ciudades]);
  const opcionesBarrio = useMemo(() => barrios.map((p) => ({ value: p.id, label: p.nombre })), [barrios]);

  async function cargar() {
    try {
      setSocios(await cargarSociosProtectores({ estadoId: filtroEstadoId || undefined, tipoPersona: filtroTipo || undefined, q: q || undefined }));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarEstadosSocioProtector().then(setEstados);
    cargarBomberos().then(setBomberos).catch(() => undefined);
    cargarParametros('PAIS').then(setPaises);
  }, []);

  useEffect(() => {
    const t = setTimeout(cargar, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filtroEstadoId, filtroTipo]);

  useEffect(() => {
    if (form.paisId) cargarParametros('DEPARTAMENTO', form.paisId).then(setDepartamentos);
    else setDepartamentos([]);
  }, [form.paisId]);
  useEffect(() => {
    if (form.departamentoId) cargarParametros('CIUDAD', form.departamentoId).then(setCiudades);
    else setCiudades([]);
  }, [form.departamentoId]);
  useEffect(() => {
    if (form.ciudadId) cargarParametros('BARRIO', form.ciudadId).then(setBarrios);
    else setBarrios([]);
  }, [form.ciudadId]);

  function nuevo() {
    setForm({ ...FORM_VACIO, estadoId: estados.find((e) => e.nombre.toLowerCase() === 'activo')?.id ?? '' });
    setMostrarForm(true);
  }

  function editar(s: SocioProtector) {
    setForm({
      id: s.id,
      codigo: s.codigo,
      tipoPersona: s.tipoPersona,
      bomberoId: s.bomberoId ?? '',
      nombre: s.nombre ?? '',
      apellido: s.apellido ?? '',
      ci: s.ci ?? '',
      fechaNacimiento: s.fechaNacimiento ?? '',
      razonSocial: s.razonSocial ?? '',
      ruc: s.ruc ?? '',
      nombreComercial: s.nombreComercial ?? '',
      representanteNombre: s.representanteNombre ?? '',
      representanteCi: s.representanteCi ?? '',
      telefono: s.telefono ?? '',
      celular: s.celular ?? '',
      email: s.email ?? '',
      direccion: s.direccion ?? '',
      paisId: s.paisId ?? '',
      departamentoId: s.departamentoId ?? '',
      ciudadId: s.ciudadId ?? '',
      barrioId: s.barrioId ?? '',
      estadoId: s.estadoId,
      observaciones: s.observaciones ?? '',
      motivoCambioCodigo: '',
    });
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      const payload: Record<string, unknown> = {
        codigo: form.codigo || undefined,
        tipoPersona: form.tipoPersona,
        bomberoId: form.bomberoId || undefined,
        nombre: form.nombre || undefined,
        apellido: form.apellido || undefined,
        ci: form.ci || undefined,
        fechaNacimiento: form.fechaNacimiento || undefined,
        razonSocial: form.razonSocial || undefined,
        ruc: form.ruc || undefined,
        nombreComercial: form.nombreComercial || undefined,
        representanteNombre: form.representanteNombre || undefined,
        representanteCi: form.representanteCi || undefined,
        telefono: form.telefono || undefined,
        celular: form.celular || undefined,
        email: form.email || undefined,
        direccion: form.direccion || undefined,
        paisId: form.paisId || undefined,
        departamentoId: form.departamentoId || undefined,
        ciudadId: form.ciudadId || undefined,
        barrioId: form.barrioId || undefined,
        estadoId: form.estadoId,
        observaciones: form.observaciones || undefined,
      };
      if (form.id) {
        await actualizarSocioProtector(form.id, { ...payload, motivoCambioCodigo: form.motivoCambioCodigo || undefined });
        setMensaje('Socio protector actualizado.');
      } else {
        await crearSocioProtector(payload);
        setMensaje('Socio protector creado.');
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Socios Protectores ({socios?.length ?? 0})</h2>
        {puedeCrear && (
          <button type="button" className="btn-primary" onClick={() => (mostrarForm ? setMostrarForm(false) : nuevo())}>
            {mostrarForm ? 'Cancelar' : '+ Nuevo socio'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 220 }}>
          <label htmlFor="buscar" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Buscar</label>
          <input id="buscar" className="input-field" placeholder="Código, nombre, CI, RUC..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Estado</label>
          <ComboBuscable ariaLabel="Estado" opciones={opcionesEstado} value={filtroEstadoId} onChange={setFiltroEstadoId} maxWidth={180} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Tipo</label>
          <ComboBuscable ariaLabel="Tipo"
            opciones={[{ value: 'FISICA', label: 'Persona fisica' }, { value: 'JURIDICA', label: 'Persona juridica' }]}
            value={filtroTipo}
            onChange={setFiltroTipo}
            maxWidth={200}
          />
        </div>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form onSubmit={guardar} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="codigo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Código {form.id ? '(cambiarlo queda auditado)' : '(vacio = autogenerado)'}</label>
              <input id="codigo" className="input-field" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="SC001" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo</label>
              <ComboBuscable ariaLabel="Tipo"
                opciones={[{ value: 'FISICA', label: 'Persona fisica' }, { value: 'JURIDICA', label: 'Persona juridica' }]}
                value={form.tipoPersona}
                onChange={(v) => setForm({ ...form, tipoPersona: v as 'FISICA' | 'JURIDICA' })}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
              <ComboBuscable ariaLabel="Estado" opciones={opcionesEstado} value={form.estadoId} onChange={(v) => setForm({ ...form, estadoId: v })} />
            </div>
          </div>

          {form.id && form.codigo && (
            <div>
              <label htmlFor="motivo-del-cambio-de-codigo-si-lo-modifi" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo del cambio de código (si lo modifico arriba)</label>
              <input id="motivo-del-cambio-de-codigo-si-lo-modifi" className="input-field" value={form.motivoCambioCodigo} onChange={(e) => setForm({ ...form, motivoCambioCodigo: e.target.value })} />
            </div>
          )}

          {form.tipoPersona === 'FISICA' ? (
            <>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Vincular a un integrante de Personal existente (opcional -- evita duplicar sus datos)</label>
                <ComboBuscable ariaLabel="Vincular a un integrante de Personal existente (opcional -- evita duplicar sus datos)" opciones={opcionesBombero} value={form.bomberoId} onChange={(v) => setForm({ ...form, bomberoId: v })} placeholderBusqueda="Buscar..." ningunaLabel="-- no vincular --" />
              </div>
              {!form.bomberoId && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
                  <div>
                    <label htmlFor="nombre" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
                    <input id="nombre" className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required={form.tipoPersona === 'FISICA'} />
                  </div>
                  <div>
                    <label htmlFor="apellido" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Apellido</label>
                    <input id="apellido" className="input-field" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required={form.tipoPersona === 'FISICA'} />
                  </div>
                  <div>
                    <label htmlFor="ci" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>CI</label>
                    <input id="ci" className="input-field" value={form.ci} onChange={(e) => setForm({ ...form, ci: e.target.value })} required={form.tipoPersona === 'FISICA'} />
                  </div>
                  <div>
                    <label htmlFor="fecha-de-nacimiento" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de nacimiento</label>
                    <input id="fecha-de-nacimiento" className="input-field" type="date" value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div>
                <label htmlFor="razon-social" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Razon social</label>
                <input id="razon-social" className="input-field" value={form.razonSocial} onChange={(e) => setForm({ ...form, razonSocial: e.target.value })} required />
              </div>
              <div>
                <label htmlFor="ruc" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>RUC</label>
                <input id="ruc" className="input-field" value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} required />
              </div>
              <div>
                <label htmlFor="nombre-comercial" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre comercial</label>
                <input id="nombre-comercial" className="input-field" value={form.nombreComercial} onChange={(e) => setForm({ ...form, nombreComercial: e.target.value })} />
              </div>
              <div>
                <label htmlFor="representante-contacto" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Representante / contacto</label>
                <input id="representante-contacto" className="input-field" value={form.representanteNombre} onChange={(e) => setForm({ ...form, representanteNombre: e.target.value })} />
              </div>
              <div>
                <label htmlFor="ci-del-contacto" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>CI del contacto</label>
                <input id="ci-del-contacto" className="input-field" value={form.representanteCi} onChange={(e) => setForm({ ...form, representanteCi: e.target.value })} />
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="telefono" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Teléfono</label>
              <input id="telefono" className="input-field" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div>
              <label htmlFor="celular" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Celular</label>
              <input id="celular" className="input-field" value={form.celular} onChange={(e) => setForm({ ...form, celular: e.target.value })} />
            </div>
            <div>
              <label htmlFor="email" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Email</label>
              <input id="email" className="input-field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label htmlFor="direccion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Dirección</label>
              <input id="direccion" className="input-field" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Pais</label>
              <ComboBuscable ariaLabel="Pais" opciones={opcionesPais} value={form.paisId} onChange={(v) => setForm({ ...form, paisId: v, departamentoId: '', ciudadId: '', barrioId: '' })} ningunaLabel="-- --" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Departamento</label>
              <ComboBuscable ariaLabel="Departamento" opciones={opcionesDepartamento} value={form.departamentoId} onChange={(v) => setForm({ ...form, departamentoId: v, ciudadId: '', barrioId: '' })} disabled={!form.paisId} ningunaLabel="-- --" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Ciudad</label>
              <ComboBuscable ariaLabel="Ciudad" opciones={opcionesCiudad} value={form.ciudadId} onChange={(v) => setForm({ ...form, ciudadId: v, barrioId: '' })} disabled={!form.departamentoId} ningunaLabel="-- --" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Barrio</label>
              <ComboBuscable ariaLabel="Barrio" opciones={opcionesBarrio} value={form.barrioId} onChange={(v) => setForm({ ...form, barrioId: v })} disabled={!form.ciudadId} ningunaLabel="-- --" />
            </div>
          </div>

          <div>
            <label htmlFor="observaciones" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observaciones</label>
            <input id="observaciones" className="input-field" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
          </div>

          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : form.id ? 'Guardar cambios' : 'Crear socio protector'}
          </button>
        </form>
      )}

      {socios && socios.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay socios protectores registrados.</p>}
      {socios && socios.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Código</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Nombre / Razon social</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Tipo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Contacto</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {socios.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{s.codigo}</td>
                <td style={{ padding: '6px 4px' }}>
                  <Link href={`/dashboard/finanzas/socios-protectores/${s.id}`} style={{ color: 'var(--signal)', textDecoration: 'none' }}>
                    {s.tipoPersona === 'JURIDICA' ? s.razonSocial : `${s.nombre ?? ''} ${s.apellido ?? ''}`.trim()}
                  </Link>
                  {s.bomberoNumero && <span style={{ color: 'var(--muted)', fontSize: 11 }}> ({s.bomberoNumero})</span>}
                </td>
                <td style={{ padding: '6px 4px' }}>{s.tipoPersona === 'JURIDICA' ? 'Juridica' : 'Fisica'}</td>
                <td style={{ padding: '6px 4px' }}>{s.email || s.celular || s.telefono || '-'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={colorEstado(estadoPorId.get(s.estadoId))}>{estadoPorId.get(s.estadoId) ?? '-'}</span>
                </td>
                <td style={{ padding: '6px 4px', display: 'flex', gap: 6 }}>
                  <Link href={`/dashboard/finanzas/socios-protectores/${s.id}`} className="btn-primary" style={{ padding: '4px 8px', fontSize: 12, background: '#475569', textDecoration: 'none' }}>
                    Ver
                  </Link>
                  {puedeEditar && (
                    <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(s)}>
                      Editar
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
