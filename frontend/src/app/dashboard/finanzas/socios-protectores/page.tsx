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

function colorEstado(nombre: string | undefined) {
  const n = (nombre ?? '').toLowerCase();
  if (n === 'activo') return { background: '#166534', color: '#4ade80' };
  if (n === 'suspendido') return { background: '#451a03', color: '#fbbf24' };
  if (n === 'baja') return { background: '#7f1d1d', color: '#f87171' };
  return { background: '#334155', color: '#94a3b8' };
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
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Buscar</label>
          <input className="input-field" placeholder="Codigo, nombre, CI, RUC..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Estado</label>
          <ComboBuscable opciones={opcionesEstado} value={filtroEstadoId} onChange={setFiltroEstadoId} maxWidth={180} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Tipo</label>
          <ComboBuscable
            opciones={[{ value: 'FISICA', label: 'Persona fisica' }, { value: 'JURIDICA', label: 'Persona juridica' }]}
            value={filtroTipo}
            onChange={setFiltroTipo}
            maxWidth={200}
          />
        </div>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {mostrarForm && (
        <form onSubmit={guardar} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Codigo {form.id ? '(cambiarlo queda auditado)' : '(vacio = autogenerado)'}</label>
              <input className="input-field" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="SC001" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo</label>
              <ComboBuscable
                opciones={[{ value: 'FISICA', label: 'Persona fisica' }, { value: 'JURIDICA', label: 'Persona juridica' }]}
                value={form.tipoPersona}
                onChange={(v) => setForm({ ...form, tipoPersona: v as 'FISICA' | 'JURIDICA' })}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
              <ComboBuscable opciones={opcionesEstado} value={form.estadoId} onChange={(v) => setForm({ ...form, estadoId: v })} />
            </div>
          </div>

          {form.id && form.codigo && (
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo del cambio de codigo (si lo modifico arriba)</label>
              <input className="input-field" value={form.motivoCambioCodigo} onChange={(e) => setForm({ ...form, motivoCambioCodigo: e.target.value })} />
            </div>
          )}

          {form.tipoPersona === 'FISICA' ? (
            <>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Vincular a un integrante de Personal existente (opcional -- evita duplicar sus datos)</label>
                <ComboBuscable opciones={opcionesBombero} value={form.bomberoId} onChange={(v) => setForm({ ...form, bomberoId: v })} placeholderBusqueda="Buscar..." ningunaLabel="-- no vincular --" />
              </div>
              {!form.bomberoId && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
                    <input className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required={form.tipoPersona === 'FISICA'} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Apellido</label>
                    <input className="input-field" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required={form.tipoPersona === 'FISICA'} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>CI</label>
                    <input className="input-field" value={form.ci} onChange={(e) => setForm({ ...form, ci: e.target.value })} required={form.tipoPersona === 'FISICA'} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de nacimiento</label>
                    <input className="input-field" type="date" value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Razon social</label>
                <input className="input-field" value={form.razonSocial} onChange={(e) => setForm({ ...form, razonSocial: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>RUC</label>
                <input className="input-field" value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre comercial</label>
                <input className="input-field" value={form.nombreComercial} onChange={(e) => setForm({ ...form, nombreComercial: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Representante / contacto</label>
                <input className="input-field" value={form.representanteNombre} onChange={(e) => setForm({ ...form, representanteNombre: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>CI del contacto</label>
                <input className="input-field" value={form.representanteCi} onChange={(e) => setForm({ ...form, representanteCi: e.target.value })} />
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Telefono</label>
              <input className="input-field" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Celular</label>
              <input className="input-field" value={form.celular} onChange={(e) => setForm({ ...form, celular: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Email</label>
              <input className="input-field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Direccion</label>
              <input className="input-field" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Pais</label>
              <ComboBuscable opciones={opcionesPais} value={form.paisId} onChange={(v) => setForm({ ...form, paisId: v, departamentoId: '', ciudadId: '', barrioId: '' })} ningunaLabel="-- --" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Departamento</label>
              <ComboBuscable opciones={opcionesDepartamento} value={form.departamentoId} onChange={(v) => setForm({ ...form, departamentoId: v, ciudadId: '', barrioId: '' })} disabled={!form.paisId} ningunaLabel="-- --" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Ciudad</label>
              <ComboBuscable opciones={opcionesCiudad} value={form.ciudadId} onChange={(v) => setForm({ ...form, ciudadId: v, barrioId: '' })} disabled={!form.departamentoId} ningunaLabel="-- --" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Barrio</label>
              <ComboBuscable opciones={opcionesBarrio} value={form.barrioId} onChange={(v) => setForm({ ...form, barrioId: v })} disabled={!form.ciudadId} ningunaLabel="-- --" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observaciones</label>
            <input className="input-field" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
          </div>

          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : form.id ? 'Guardar cambios' : 'Crear socio protector'}
          </button>
        </form>
      )}

      {socios && socios.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No hay socios protectores registrados.</p>}
      {socios && socios.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Codigo</th>
              <th style={{ padding: '6px 4px' }}>Nombre / Razon social</th>
              <th style={{ padding: '6px 4px' }}>Tipo</th>
              <th style={{ padding: '6px 4px' }}>Contacto</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {socios.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{s.codigo}</td>
                <td style={{ padding: '6px 4px' }}>
                  <Link href={`/dashboard/finanzas/socios-protectores/${s.id}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>
                    {s.tipoPersona === 'JURIDICA' ? s.razonSocial : `${s.nombre ?? ''} ${s.apellido ?? ''}`.trim()}
                  </Link>
                  {s.bomberoNumero && <span style={{ color: '#64748b', fontSize: 11 }}> ({s.bomberoNumero})</span>}
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
