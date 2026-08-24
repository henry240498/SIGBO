'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, API_ORIGIN, descargarArchivo, obtenerSesion } from '@/lib/api';
import { formatearJsonSeguro } from '@/lib/json-seguro';
import { cargarParametros, obtenerParametro, resolverNombres, Parametro, TipoParametro } from '@/lib/parametros';
import { HistorialAsignacion, cargarHistorialGuardiasPersonal } from '@/lib/guardias';
import { subirFirmaDigital, eliminarFirmaDigital, cambiarAutorizacionFirma } from '@/lib/personal';
import {
  Certificacion,
  TipoCertificacion,
  cargarCertificacionesDeBombero,
  crearCertificacion,
  eliminarCertificacion,
} from '@/lib/academia';
import { EquipamientoDeBomberoItem, cargarEquipamientoDeBombero } from '@/lib/deposito';
import { DocumentosDeEntidad } from '@/components/DocumentosDeEntidad';

/* ------------------------------------------------------------------ */
/* Tipos                                                                */
/* ------------------------------------------------------------------ */

interface Bombero {
  id: string;
  cedula: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  sexo: 'M' | 'F' | null;
  nacionalidad: string;
  estadoCivil: string | null;
  lugarNacimiento: string | null;
  telefonoPrincipal: string;
  telefonoSecundario: string | null;
  email: string | null;
  direccion: string | null;
  codigoPostal: string | null;
  numeroBombero: string;
  rango: string;
  cargo: string | null;
  estado: string;
  fechaIngreso: string;
  grupoSanguineoId: string | null;
  factorRhId: string | null;
  alergias: string | null;
  condicionesMedicas: string | null;
  medicamentos: string | null;
  fotoUrl: string | null;
  condicionInstitucional: string | null;
  tipoBomberoId: string | null;
  rangoId: string | null;
  cargoPrincipalId: string | null;
  companiaId: string | null;
  cuartelId: string | null;
  turnoId: string | null;
  tipoGuardiaId: string | null;
  brigadaId: string | null;
  departamentoId: string | null;
  unidadId: string | null;
  paisId: string | null;
  departamentoResidenciaId: string | null;
  ciudadId: string | null;
  barrioId: string | null;
  pasaporte: string | null;
  fechaIncorporacion: string | null;
  fechaJuramento: string | null;
  realizaGuardias: boolean;
  realizaGuardiasEspeciales: boolean;
  frecuenciaNormalMensual: number | null;
  frecuenciaEspecialMensual: number | null;
  diaPreferenteGuardia: string | null;
  firmaDigitalUrl: string | null;
  autorizadoFirmaDigital: boolean;
}

interface Catalogo {
  id: string;
  nombre: string;
  codigo?: string;
  prefijo?: string;
}

const ESTADOS = ['ASPIRANTE', 'ACTIVO', 'SUSPENDIDO', 'LICENCIA', 'RETIRADO', 'FALLECIDO', 'HONORARIO'];
const CONDICIONES = ['INCORPORADO', 'COMBATIENTE', 'APOYO_ECONOMICO', 'HONORARIO'];
const DIAS_SEMANA_PREFERENCIA = ['NINGUNA', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

const TABS: Array<{ id: string; label: string }> = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'personales', label: 'Datos personales' },
  { id: 'institucional', label: 'Institucional' },
  { id: 'tipo', label: 'Tipo de bombero' },
  { id: 'rango-cargo', label: 'Rango / Cargo' },
  { id: 'historial', label: 'Trayectoria' },
  { id: 'especialidades', label: 'Especialidades' },
  { id: 'condicion', label: 'Condicion' },
  { id: 'formacion', label: 'Formacion' },
  { id: 'actividad', label: 'Actividad profesional' },
  { id: 'idiomas', label: 'Idiomas' },
  { id: 'servicios', label: 'Servicios / Guardias' },
  { id: 'equipamiento', label: 'Equipamiento' },
  { id: 'vehiculos', label: 'Vehiculos autorizados' },
  { id: 'salud', label: 'Salud' },
  { id: 'firma-digital', label: 'Firma Digital' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'foja', label: 'Foja de Servicio' },
  { id: 'timeline', label: 'Linea de tiempo' },
  { id: 'auditoria', label: 'Auditoria' },
];

async function cargarCatalogo(path: string): Promise<Catalogo[]> {
  const res = await apiFetch(`${path}?estado=ACTIVO`);
  if (!res.ok) return [];
  return res.json();
}

function campoTexto(label: string, valor: string | null | undefined) {
  return (
    <div>
      <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>{label}</span>
      <span style={{ fontSize: 13 }}>{valor || '-'}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagina principal                                                     */
/* ------------------------------------------------------------------ */

export default function ExpedienteBomberoPage() {
  const confirmar = useConfirmacion();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [bombero, setBombero] = useState<Bombero | null>(null);
  const [tipos, setTipos] = useState<Catalogo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [seccion, setSeccion] = useState('resumen');

  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('personal:editar');
  const puedeEliminarFisico = !!obtenerSesion()?.usuario.permisos.includes('personal:eliminar_fisico');

  async function cargarBombero() {
    const res = await apiFetch(`/personal/bomberos/${id}`);
    if (!res.ok) {
      setError('No se pudo cargar el expediente del bombero');
      return;
    }
    setBombero(await res.json());
  }

  useEffect(() => {
    cargarBombero();
    cargarCatalogo('/personal/tipos-bombero').then(setTipos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const tipoActual = useMemo(() => tipos.find((t) => t.id === bombero?.tipoBomberoId), [tipos, bombero]);

  async function eliminarFisico() {
    if (!bombero) return;
    if (!await confirmar({
      titulo: 'Eliminar expediente',
      mensaje: `ELIMINAR PERMANENTEMENTE a ${bombero.nombre} ${bombero.apellido}? Esta accion no se puede deshacer. Solo es posible si no tiene datos relacionados en el resto del sistema.`,
      confirmar: 'Eliminar permanentemente',
      peligro: true,
    })) return;
    const res = await apiFetch(`/personal/bomberos/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo eliminar fisicamente al bombero');
      return;
    }
    router.push('/dashboard/personal');
  }

  if (error && !bombero) {
    return <p style={{ color: '#f87171' }}>{error}</p>;
  }

  if (!bombero) {
    return <p style={{ color: '#94a3b8' }}>Cargando expediente...</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {bombero.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${API_ORIGIN}${bombero.fotoUrl}`}
              alt="Foto"
              style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 8,
                background: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              {bombero.nombre[0]}
              {bombero.apellido[0]}
            </div>
          )}
          <div>
            <h2 style={{ fontSize: 18 }}>
              {bombero.nombre} {bombero.apellido}
            </h2>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <span className="badge">{bombero.numeroBombero}</span>
              <span className="badge" style={{ background: bombero.estado === 'ACTIVO' ? '#166534' : '#7f1d1d' }}>
                {bombero.estado}
              </span>
              {tipoActual && <span className="badge">{tipoActual.prefijo}</span>}
              <span className="badge" style={{ background: '#334155' }}>
                {bombero.rango}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={() => router.push('/dashboard/personal')}>
            Volver al listado
          </button>
          {puedeEliminarFisico && (
            <button type="button" className="btn-primary" style={{ background: '#7f1d1d' }} onClick={eliminarFisico}>
              Eliminar fisicamente
            </button>
          )}
        </div>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <nav style={{ display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '1px solid #334155', paddingBottom: 0 }}>
        {TABS.map((tab) => (
          <button type="button"
            key={tab.id}
            onClick={() => setSeccion(tab.id)}
            style={{
              padding: '8px 12px',
              fontSize: 13,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: seccion === tab.id ? '#e2e8f0' : '#94a3b8',
              fontWeight: seccion === tab.id ? 600 : 400,
              borderBottom: seccion === tab.id ? '2px solid #2563eb' : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div>
        {seccion === 'resumen' && <TabResumen bombero={bombero} tipo={tipoActual} />}
        {seccion === 'personales' && (
          <TabDatosPersonales bombero={bombero} puedeEditar={puedeEditar} onGuardado={cargarBombero} />
        )}
        {seccion === 'institucional' && (
          <TabInstitucional bombero={bombero} puedeEditar={puedeEditar} onGuardado={cargarBombero} />
        )}
        {seccion === 'tipo' && (
          <TabTipoBombero bombero={bombero} tipos={tipos} puedeEditar={puedeEditar} onGuardado={cargarBombero} />
        )}
        {seccion === 'rango-cargo' && <TabRangoCargo bombero={bombero} />}
        {seccion === 'historial' && <TabHistorial bomberoId={id} puedeEditar={puedeEditar} />}
        {seccion === 'especialidades' && <TabEspecialidades bomberoId={id} puedeEditar={puedeEditar} />}
        {seccion === 'condicion' && <TabCondicion bomberoId={id} puedeEditar={puedeEditar} onGuardado={cargarBombero} />}
        {seccion === 'formacion' && <TabFormacion bomberoId={id} />}
        {seccion === 'actividad' && <TabActividadProfesional bomberoId={id} puedeEditar={puedeEditar} />}
        {seccion === 'idiomas' && <TabIdiomas bomberoId={id} puedeEditar={puedeEditar} />}
        {seccion === 'servicios' && <TabServicios bomberoId={id} />}
        {seccion === 'equipamiento' && <TabEquipamiento bomberoId={id} puedeEditar={puedeEditar} />}
        {seccion === 'vehiculos' && <TabVehiculos bomberoId={id} puedeEditar={puedeEditar} />}
        {seccion === 'salud' && <TabSalud bombero={bombero} puedeEditar={puedeEditar} onGuardado={cargarBombero} />}
        {seccion === 'firma-digital' && <TabFirmaDigital bombero={bombero} onGuardado={cargarBombero} />}
        {seccion === 'documentos' && <TabDocumentos bomberoId={id} />}
        {seccion === 'foja' && <TabFoja bomberoId={id} puedeEditar={puedeEditar} />}
        {seccion === 'timeline' && <TabTimeline bomberoId={id} />}
        {seccion === 'auditoria' && <TabAuditoria bomberoId={id} />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Resumen                                                              */
/* ------------------------------------------------------------------ */

function TabResumen({ bombero, tipo }: { bombero: Bombero; tipo?: Catalogo }) {
  const [ciudad, setCiudad] = useState<string | null>(null);

  useEffect(() => {
    if (bombero.ciudadId) {
      obtenerParametro(bombero.ciudadId).then((p) => setCiudad(p?.nombre ?? null));
    } else {
      setCiudad(null);
    }
  }, [bombero.ciudadId]);

  return (
    <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
      {campoTexto('Cedula', bombero.cedula)}
      {campoTexto('Codigo bomberil', bombero.numeroBombero)}
      {campoTexto('Tipo de bombero', tipo ? `${tipo.prefijo} - ${tipo.nombre}` : '-')}
      {campoTexto('Rango', bombero.rango)}
      {campoTexto('Cargo', bombero.cargo)}
      {campoTexto('Estado', bombero.estado)}
      {campoTexto('Condicion institucional', bombero.condicionInstitucional)}
      {campoTexto('Fecha de ingreso', bombero.fechaIngreso)}
      {campoTexto('Telefono', bombero.telefonoPrincipal)}
      {campoTexto('Email', bombero.email)}
      {campoTexto('Ciudad', ciudad)}
      {campoTexto('Nacionalidad', bombero.nacionalidad)}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Datos personales                                                     */
/* ------------------------------------------------------------------ */

function TabDatosPersonales({
  bombero,
  puedeEditar,
  onGuardado,
}: {
  bombero: Bombero;
  puedeEditar: boolean;
  onGuardado: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nombre: bombero.nombre,
    apellido: bombero.apellido,
    cedula: bombero.cedula,
    fechaNacimiento: bombero.fechaNacimiento,
    sexo: bombero.sexo ?? '',
    estadoCivil: bombero.estadoCivil ?? '',
    lugarNacimiento: bombero.lugarNacimiento ?? '',
    telefonoPrincipal: bombero.telefonoPrincipal,
    telefonoSecundario: bombero.telefonoSecundario ?? '',
    email: bombero.email ?? '',
    direccion: bombero.direccion ?? '',
    codigoPostal: bombero.codigoPostal ?? '',
    pasaporte: bombero.pasaporte ?? '',
    paisId: bombero.paisId ?? '',
    departamentoResidenciaId: bombero.departamentoResidenciaId ?? '',
    ciudadId: bombero.ciudadId ?? '',
    barrioId: bombero.barrioId ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [nombresUbicacion, setNombresUbicacion] = useState<Map<string, string>>(new Map());
  const [paises, setPaises] = useState<Parametro[]>([]);
  const [departamentos, setDepartamentos] = useState<Parametro[]>([]);
  const [ciudades, setCiudades] = useState<Parametro[]>([]);
  const [barrios, setBarrios] = useState<Parametro[]>([]);

  useEffect(() => {
    resolverNombres([bombero.ciudadId, bombero.departamentoResidenciaId, bombero.paisId, bombero.barrioId]).then(
      setNombresUbicacion,
    );
  }, [bombero.ciudadId, bombero.departamentoResidenciaId, bombero.paisId, bombero.barrioId]);

  useEffect(() => {
    if (!editando) return;
    cargarParametros('PAIS').then(setPaises);
    if (form.paisId) cargarParametros('DEPARTAMENTO', form.paisId).then(setDepartamentos);
    if (form.departamentoResidenciaId) cargarParametros('CIUDAD', form.departamentoResidenciaId).then(setCiudades);
    if (form.ciudadId) cargarParametros('BARRIO', form.ciudadId).then(setBarrios);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editando]);

  function cambiarPais(paisId: string) {
    setForm({ ...form, paisId, departamentoResidenciaId: '', ciudadId: '', barrioId: '' });
    setDepartamentos([]);
    setCiudades([]);
    setBarrios([]);
    if (paisId) cargarParametros('DEPARTAMENTO', paisId).then(setDepartamentos);
  }

  function cambiarDepartamento(departamentoResidenciaId: string) {
    setForm({ ...form, departamentoResidenciaId, ciudadId: '', barrioId: '' });
    setCiudades([]);
    setBarrios([]);
    if (departamentoResidenciaId) cargarParametros('CIUDAD', departamentoResidenciaId).then(setCiudades);
  }

  function cambiarCiudad(ciudadId: string) {
    setForm({ ...form, ciudadId, barrioId: '' });
    setBarrios([]);
    if (ciudadId) cargarParametros('BARRIO', ciudadId).then(setBarrios);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        cedula: form.cedula,
        fechaNacimiento: form.fechaNacimiento,
        sexo: form.sexo === '' ? null : form.sexo,
        estadoCivil: form.estadoCivil || null,
        lugarNacimiento: form.lugarNacimiento || null,
        telefonoPrincipal: form.telefonoPrincipal,
        telefonoSecundario: form.telefonoSecundario || null,
        email: form.email || null,
        direccion: form.direccion || null,
        codigoPostal: form.codigoPostal || null,
        pasaporte: form.pasaporte || null,
        paisId: form.paisId || null,
        departamentoResidenciaId: form.departamentoResidenciaId || null,
        ciudadId: form.ciudadId || null,
        barrioId: form.barrioId || null,
      };
      const res = await apiFetch(`/personal/bomberos/${bombero.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
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

  const SEXO_LABEL: Record<string, string> = { M: 'Masculino', F: 'Femenino' };

  if (!editando) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {puedeEditar && (
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-end' }} onClick={() => setEditando(true)}>
            Editar
          </button>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {campoTexto('Nombre', bombero.nombre)}
          {campoTexto('Apellido', bombero.apellido)}
          {campoTexto('Cedula', bombero.cedula)}
          {campoTexto('Fecha de nacimiento', bombero.fechaNacimiento)}
          {campoTexto('Sexo', bombero.sexo ? SEXO_LABEL[bombero.sexo] : null)}
          {campoTexto('Estado civil', bombero.estadoCivil)}
          {campoTexto('Lugar de nacimiento', bombero.lugarNacimiento)}
          {campoTexto('Telefono principal', bombero.telefonoPrincipal)}
          {campoTexto('Telefono secundario', bombero.telefonoSecundario)}
          {campoTexto('Email', bombero.email)}
          {campoTexto('Direccion', bombero.direccion)}
          {campoTexto('Codigo postal', bombero.codigoPostal)}
          {campoTexto('Pais', bombero.paisId ? nombresUbicacion.get(bombero.paisId) ?? '...' : null)}
          {campoTexto(
            'Departamento',
            bombero.departamentoResidenciaId ? nombresUbicacion.get(bombero.departamentoResidenciaId) ?? '...' : null,
          )}
          {campoTexto('Ciudad', bombero.ciudadId ? nombresUbicacion.get(bombero.ciudadId) ?? '...' : null)}
          {campoTexto('Barrio', bombero.barrioId ? nombresUbicacion.get(bombero.barrioId) ?? '...' : null)}
          {campoTexto('Pasaporte', bombero.pasaporte)}
        </div>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {(
          [
            ['nombre', 'Nombre'],
            ['apellido', 'Apellido'],
            ['cedula', 'Cedula'],
            ['estadoCivil', 'Estado civil'],
            ['lugarNacimiento', 'Lugar de nacimiento'],
            ['telefonoPrincipal', 'Telefono principal'],
            ['telefonoSecundario', 'Telefono secundario'],
            ['email', 'Email'],
            ['direccion', 'Direccion'],
            ['codigoPostal', 'Codigo postal'],
            ['pasaporte', 'Pasaporte'],
          ] as Array<[keyof typeof form, string]>
        ).map(([campo, label]) => (
          <div key={campo}>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>{label}</label>
            <input
              className="input-field"
              value={form[campo]}
              onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
            />
          </div>
        ))}
        <div>
          <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de nacimiento</label>
          <input
            className="input-field"
            type="date"
            value={form.fechaNacimiento}
            onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Sexo</label>
          <select className="input-field" value={form.sexo} onChange={(e) => setForm({ ...form, sexo: e.target.value })}>
            <option value="">NINGUNA</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </div>
      </div>

      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Ubicacion</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
        <div>
          <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Pais</label>
          <select className="input-field" value={form.paisId} onChange={(e) => cambiarPais(e.target.value)}>
            <option value="">NINGUNA</option>
            {paises.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Departamento</label>
          <select
            className="input-field"
            value={form.departamentoResidenciaId}
            onChange={(e) => cambiarDepartamento(e.target.value)}
            disabled={!form.paisId}
          >
            <option value="">NINGUNA</option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Ciudad</label>
          <select
            className="input-field"
            value={form.ciudadId}
            onChange={(e) => cambiarCiudad(e.target.value)}
            disabled={!form.departamentoResidenciaId}
          >
            <option value="">NINGUNA</option>
            {ciudades.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Barrio</label>
          <select
            className="input-field"
            value={form.barrioId}
            onChange={(e) => setForm({ ...form, barrioId: e.target.value })}
            disabled={!form.ciudadId}
          >
            <option value="">NINGUNA</option>
            {barrios.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p style={{ fontSize: 12, color: '#94a3b8' }}>
        Si falta un pais/departamento/ciudad/barrio en las listas, se puede cargar desde Organizacion
        Institucional → Parámetros.
      </p>

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
/* Informacion institucional                                            */
/* ------------------------------------------------------------------ */

function TabInstitucional({
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
          <h4 style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10 }}>Disponibilidad para Guardias</h4>
          <p style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>
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
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {selectCatalogo('companias', 'companiaId', 'Compania')}
        {selectCatalogo('cuarteles', 'cuartelId', 'Cuartel')}
        {selectCatalogo('turnos', 'turnoId', 'Turno')}
        {selectCatalogo('tiposGuardia', 'tipoGuardiaId', 'Tipo de guardia')}
        {selectCatalogo('brigadas', 'brigadaId', 'Brigada')}
        {selectCatalogo('departamentos', 'departamentoId', 'Departamento')}
        {selectCatalogo('unidades', 'unidadId', 'Unidad')}
        <div>
          <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
          <select className="input-field" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de ingreso</label>
          <input
            className="input-field"
            type="date"
            value={form.fechaIngreso}
            onChange={(e) => setForm({ ...form, fechaIngreso: e.target.value })}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de incorporacion</label>
          <input
            className="input-field"
            type="date"
            value={form.fechaIncorporacion}
            onChange={(e) => setForm({ ...form, fechaIncorporacion: e.target.value })}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de juramento</label>
          <input
            className="input-field"
            type="date"
            value={form.fechaJuramento}
            onChange={(e) => setForm({ ...form, fechaJuramento: e.target.value })}
          />
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Disponibilidad para Guardias</h4>
        <p style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>
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
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Frecuencia normal mensual</label>
            <input
              className="input-field"
              type="number"
              min={0}
              value={form.frecuenciaNormalMensual}
              onChange={(e) => setForm({ ...form, frecuenciaNormalMensual: e.target.value })}
              placeholder="Sin definir"
            />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Frecuencia especial mensual</label>
            <input
              className="input-field"
              type="number"
              min={0}
              value={form.frecuenciaEspecialMensual}
              onChange={(e) => setForm({ ...form, frecuenciaEspecialMensual: e.target.value })}
              placeholder="Sin definir"
            />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Dia preferente</label>
            <select
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

function TabTipoBombero({
  bombero,
  tipos,
  puedeEditar,
  onGuardado,
}: {
  bombero: Bombero;
  tipos: Catalogo[];
  puedeEditar: boolean;
  onGuardado: () => void;
}) {
  const [tipoBomberoId, setTipoBomberoId] = useState(bombero.tipoBomberoId ?? '');
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [codigo, setCodigo] = useState(bombero.numeroBombero);
  const [errorCodigo, setErrorCodigo] = useState<string | null>(null);
  const [mensajeCodigo, setMensajeCodigo] = useState<string | null>(null);
  const [guardandoCodigo, setGuardandoCodigo] = useState(false);

  const tipoActual = tipos.find((t) => t.id === bombero.tipoBomberoId);

  async function guardar() {
    setGuardando(true);
    setError(null);
    setMensaje(null);
    try {
      const res = await apiFetch(`/personal/bomberos/${bombero.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ tipoBomberoId: tipoBomberoId || null }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo guardar');
      }
      setMensaje('Tipo de bombero actualizado');
      onGuardado();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function guardarCodigo() {
    setGuardandoCodigo(true);
    setErrorCodigo(null);
    setMensajeCodigo(null);
    try {
      const nuevoCodigo = codigo.trim();
      if (!nuevoCodigo) throw new Error('El codigo no puede quedar vacio');
      const res = await apiFetch(`/personal/bomberos/${bombero.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ numeroBombero: nuevoCodigo }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo guardar');
      }
      setMensajeCodigo('Codigo bomberil actualizado');
      onGuardado();
    } catch (err: any) {
      setErrorCodigo(err.message);
    } finally {
      setGuardandoCodigo(false);
    }
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 500 }}>
      {campoTexto('Tipo de bombero actual', tipoActual ? `${tipoActual.prefijo} - ${tipoActual.nombre}` : 'Sin asignar')}

      {puedeEditar && (
        <>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nuevo tipo de bombero</label>
            <select className="input-field" value={tipoBomberoId} onChange={(e) => setTipoBomberoId(e.target.value)}>
              <option value="">Sin asignar</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.prefijo} - {t.nombre}
                </option>
              ))}
            </select>
          </div>
          {error && <p style={{ color: '#f87171' }}>{error}</p>}
          {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando} onClick={guardar}>
            {guardando ? 'Guardando...' : 'Guardar tipo'}
          </button>
        </>
      )}

      <div style={{ borderTop: '1px solid #334155', paddingTop: 12 }}>
        {campoTexto('Codigo bomberil actual', bombero.numeroBombero)}
        {puedeEditar && (
          <>
            <label style={{ fontSize: 12, display: 'block', margin: '8px 0 4px' }}>
              Nuevo codigo (se puede tipear libremente, no depende del tipo seleccionado)
            </label>
            <input
              className="input-field"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="BVCF-01"
            />
            {errorCodigo && <p style={{ color: '#f87171', marginTop: 6 }}>{errorCodigo}</p>}
            {mensajeCodigo && <p style={{ color: '#4ade80', fontSize: 13, marginTop: 6 }}>{mensajeCodigo}</p>}
            <button type="button"
              className="btn-primary"
              style={{ alignSelf: 'flex-start', marginTop: 8 }}
              disabled={guardandoCodigo || codigo.trim() === bombero.numeroBombero}
              onClick={guardarCodigo}
            >
              {guardandoCodigo ? 'Guardando...' : 'Guardar codigo'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Rango / Cargo                                                        */
/* ------------------------------------------------------------------ */

function TabRangoCargo({ bombero }: { bombero: Bombero }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {campoTexto('Rango actual', bombero.rango)}
        {campoTexto('Cargo actual', bombero.cargo)}
      </div>
      <p style={{ fontSize: 13, color: '#94a3b8' }}>
        Los ascensos y designaciones formales se gestionan desde los modulos de Organizacion Institucional.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Link href={`/dashboard/organizacion/ascensos?bomberoId=${bombero.id}`} className="btn-primary" style={{ textDecoration: 'none' }}>
          Ver ascensos
        </Link>
        <Link
          href={`/dashboard/organizacion/designaciones?bomberoId=${bombero.id}`}
          className="btn-primary"
          style={{ textDecoration: 'none' }}
        >
          Ver designaciones
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Trayectoria / historial institucional                               */
/* ------------------------------------------------------------------ */

interface MovimientoHistorial {
  id: string;
  tipoMovimiento: string;
  fecha: string;
  motivo: string | null;
  observacion: string | null;
}

function TabHistorial({ bomberoId, puedeEditar }: { bomberoId: string; puedeEditar: boolean }) {
  const [items, setItems] = useState<MovimientoHistorial[] | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipoMovimiento, setTipoMovimiento] = useState<'RECONOCIMIENTO' | 'SANCION'>('RECONOCIMIENTO');
  const [fecha, setFecha] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const res = await apiFetch(`/personal/bomberos/${bomberoId}/historial`);
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomberoId]);

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      const res = await apiFetch(`/personal/bomberos/${bomberoId}/historial`, {
        method: 'POST',
        body: JSON.stringify({ tipoMovimiento, fecha, motivo: motivo || undefined, observacion: observacion || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo registrar');
      }
      setMostrarForm(false);
      setFecha('');
      setMotivo('');
      setObservacion('');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {puedeEditar && (
        <button type="button" className="btn-primary" style={{ alignSelf: 'flex-end' }} onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : 'Registrar reconocimiento / sancion'}
        </button>
      )}
      {mostrarForm && (
        <form className="card" onSubmit={registrar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {error && <p style={{ color: '#f87171' }}>{error}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo</label>
              <select
                className="input-field"
                value={tipoMovimiento}
                onChange={(e) => setTipoMovimiento(e.target.value as 'RECONOCIMIENTO' | 'SANCION')}
              >
                <option value="RECONOCIMIENTO">RECONOCIMIENTO</option>
                <option value="SANCION">SANCION</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha</label>
              <input className="input-field" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo</label>
            <input className="input-field" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observacion</label>
            <input className="input-field" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Registrar'}
          </button>
        </form>
      )}

      {items && items.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin movimientos registrados.</p>}
      {items && items.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Fecha</th>
              <th style={{ padding: '6px 4px' }}>Tipo</th>
              <th style={{ padding: '6px 4px' }}>Motivo</th>
              <th style={{ padding: '6px 4px' }}>Observacion</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{m.fecha}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge">{m.tipoMovimiento}</span>
                </td>
                <td style={{ padding: '6px 4px' }}>{m.motivo ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>{m.observacion ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Especialidades                                                       */
/* ------------------------------------------------------------------ */

interface EspecialidadAsignada {
  especialidadId: string;
  nombre: string;
  fechaObtencion: string | null;
  nivel: string | null;
  institucionCertificadora: string | null;
  vigencia: string | null;
}

function TabEspecialidades({ bomberoId, puedeEditar }: { bomberoId: string; puedeEditar: boolean }) {
  const [items, setItems] = useState<EspecialidadAsignada[] | null>(null);
  const [catalogo, setCatalogo] = useState<Catalogo[]>([]);
  const [editando, setEditando] = useState<EspecialidadAsignada[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const res = await apiFetch(`/personal/bomberos/${bomberoId}/especialidades`);
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    cargar();
    cargarCatalogo('/organizacion/especialidades').then(setCatalogo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomberoId]);

  function iniciarEdicion() {
    setEditando(items ?? []);
  }

  function agregarFila() {
    if (!editando || catalogo.length === 0) return;
    setEditando([...editando, { especialidadId: catalogo[0].id, nombre: catalogo[0].nombre, fechaObtencion: null, nivel: null, institucionCertificadora: null, vigencia: null }]);
  }

  function quitarFila(idx: number) {
    if (!editando) return;
    setEditando(editando.filter((_, i) => i !== idx));
  }

  async function guardar() {
    if (!editando) return;
    setGuardando(true);
    setError(null);
    try {
      const res = await apiFetch(`/personal/bomberos/${bomberoId}/especialidades`, {
        method: 'PUT',
        body: JSON.stringify({
          especialidades: editando.map((e) => ({
            especialidadId: e.especialidadId,
            fechaObtencion: e.fechaObtencion || undefined,
            nivel: e.nivel || undefined,
            institucionCertificadora: e.institucionCertificadora || undefined,
            vigencia: e.vigencia || undefined,
          })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo guardar');
      }
      setEditando(null);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (editando) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {error && <p style={{ color: '#f87171' }}>{error}</p>}
        {editando.map((esp, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Especialidad</label>
              <select
                className="input-field"
                value={esp.especialidadId}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], especialidadId: e.target.value };
                  setEditando(copia);
                }}
              >
                {catalogo.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Fecha obtencion</label>
              <input
                className="input-field"
                type="date"
                value={esp.fechaObtencion ?? ''}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], fechaObtencion: e.target.value };
                  setEditando(copia);
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Nivel</label>
              <input
                className="input-field"
                value={esp.nivel ?? ''}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], nivel: e.target.value };
                  setEditando(copia);
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Institucion</label>
              <input
                className="input-field"
                value={esp.institucionCertificadora ?? ''}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], institucionCertificadora: e.target.value };
                  setEditando(copia);
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Vigencia</label>
              <input
                className="input-field"
                type="date"
                value={esp.vigencia ?? ''}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], vigencia: e.target.value };
                  setEditando(copia);
                }}
              />
            </div>
            <button type="button" className="btn-primary" style={{ background: '#7f1d1d' }} onClick={() => quitarFila(idx)}>
              Quitar
            </button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={agregarFila}>
            + Agregar especialidad
          </button>
          <button type="button" className="btn-primary" disabled={guardando} onClick={guardar}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={() => setEditando(null)}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {puedeEditar && (
        <button type="button" className="btn-primary" style={{ alignSelf: 'flex-end' }} onClick={iniciarEdicion}>
          Editar especialidades
        </button>
      )}
      {items && items.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin especialidades asignadas.</p>}
      {items && items.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Especialidad</th>
              <th style={{ padding: '6px 4px' }}>Nivel</th>
              <th style={{ padding: '6px 4px' }}>Institucion</th>
              <th style={{ padding: '6px 4px' }}>Obtencion</th>
              <th style={{ padding: '6px 4px' }}>Vigencia</th>
            </tr>
          </thead>
          <tbody>
            {items.map((esp) => (
              <tr key={esp.especialidadId} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{esp.nombre}</td>
                <td style={{ padding: '6px 4px' }}>{esp.nivel ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>{esp.institucionCertificadora ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>{esp.fechaObtencion ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>{esp.vigencia ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Condicion institucional                                               */
/* ------------------------------------------------------------------ */

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

function TabCondicion({ bomberoId, puedeEditar, onGuardado }: { bomberoId: string; puedeEditar: boolean; onGuardado: () => void }) {
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
        {error && <p style={{ color: '#f87171' }}>{error}</p>}
        <div>
          <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Condicion institucional</label>
          <select className="input-field" value={formCondicion} onChange={(e) => { setFormCondicion(e.target.value); setFormDetalle({}); }}>
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
      {!condicion && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin condicion institucional definida.</p>}
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

interface FormacionAcademica {
  inscripcionId: string;
  actividadId: string;
  nombreActividad: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  estado: string;
  resultadoFinal: string | null;
}

const TIPOS_CERTIFICACION: TipoCertificacion[] = ['BASICO', 'INTERMEDIO', 'AVANZADO', 'ESPECIALIDAD', 'CURSO', 'SEMINARIO', 'TALLER', 'ENTRENAMIENTO'];

const CERT_VACIO = {
  tipo: 'CURSO' as TipoCertificacion,
  nombre: '',
  institucion: '',
  fechaObtencion: '',
  fechaVencimiento: '',
  numeroCertificado: '',
  duracionHoras: '',
  instructor: '',
};

function TabFormacion({ bomberoId }: { bomberoId: string }) {
  const confirmar = useConfirmacion();
  const [actividades, setActividades] = useState<FormacionAcademica[] | null>(null);
  const [certificaciones, setCertificaciones] = useState<Certificacion[] | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(CERT_VACIO);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    try {
      const [resAct, certs] = await Promise.all([
        apiFetch(`/personal/bomberos/${bomberoId}/formacion-academia`),
        cargarCertificacionesDeBombero(bomberoId),
      ]);
      setActividades(resAct.ok ? await resAct.json() : []);
      setCertificaciones(certs);
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomberoId]);

  async function agregarCertificacion(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await crearCertificacion(
        {
          bomberoId,
          tipo: form.tipo,
          nombre: form.nombre,
          institucion: form.institucion || undefined,
          fechaObtencion: form.fechaObtencion,
          fechaVencimiento: form.fechaVencimiento || undefined,
          numeroCertificado: form.numeroCertificado || undefined,
          duracionHoras: form.duracionHoras ? Number(form.duracionHoras) : undefined,
          instructor: form.instructor || undefined,
        },
        archivo ?? undefined,
      );
      setForm(CERT_VACIO);
      setArchivo(null);
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function quitarCertificacion(id: string) {
    if (!await confirmar({ titulo: 'Eliminar certificación', mensaje: '¿Eliminar esta certificación?', confirmar: 'Eliminar', peligro: true })) return;
    setError(null);
    try {
      await eliminarCertificacion(id);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 10 }}>Actividades académicas ({actividades?.length ?? 0})</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>
          Inscripciones a cursos, capacitaciones y otras actividades del módulo Academia.
        </p>
        {actividades && actividades.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin actividades académicas registradas.</p>}
        {actividades && actividades.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '6px 4px' }}>Actividad</th>
                <th style={{ padding: '6px 4px' }}>Periodo</th>
                <th style={{ padding: '6px 4px' }}>Estado</th>
                <th style={{ padding: '6px 4px' }}>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {actividades.map((a) => (
                <tr key={a.inscripcionId} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>
                    <Link href={`/dashboard/academia/${a.actividadId}`} style={{ color: '#60a5fa' }}>
                      {a.nombreActividad ?? '(actividad eliminada)'}
                    </Link>
                  </td>
                  <td style={{ padding: '6px 4px', color: '#94a3b8' }}>
                    {a.fechaInicio} - {a.fechaFin}
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge">{a.estado}</span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>{a.resultadoFinal ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ fontSize: 14 }}>Certificaciones ({certificaciones?.length ?? 0})</h3>
          <button type="button" className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : '+ Cargar certificado'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>
          SIGBO no certifica automáticamente por participar en una actividad: el bombero (o quien tenga el permiso
          correspondiente) es responsable de registrar y adjuntar su certificado.
        </p>

        {mostrarForm && (
          <form onSubmit={agregarCertificacion} style={{ display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '1px solid #334155', paddingBottom: 14, marginBottom: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo</label>
                <select className="input-field" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoCertificacion })}>
                  {TIPOS_CERTIFICACION.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
                <input className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Institución</label>
                <input className="input-field" value={form.institucion} onChange={(e) => setForm({ ...form, institucion: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha obtención</label>
                <input className="input-field" type="date" value={form.fechaObtencion} onChange={(e) => setForm({ ...form, fechaObtencion: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Vencimiento</label>
                <input className="input-field" type="date" value={form.fechaVencimiento} onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>N° certificado</label>
                <input className="input-field" value={form.numeroCertificado} onChange={(e) => setForm({ ...form, numeroCertificado: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Carga horaria</label>
                <input className="input-field" type="number" value={form.duracionHoras} onChange={(e) => setForm({ ...form, duracionHoras: e.target.value })} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Archivo del certificado (imagen o PDF)</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              />
            </div>
            <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar certificación'}
            </button>
          </form>
        )}

        {certificaciones && certificaciones.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin certificaciones registradas.</p>}
        {certificaciones && certificaciones.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '6px 4px' }}>Nombre</th>
                <th style={{ padding: '6px 4px' }}>Tipo</th>
                <th style={{ padding: '6px 4px' }}>Institución</th>
                <th style={{ padding: '6px 4px' }}>Obtención</th>
                <th style={{ padding: '6px 4px' }}>Estado</th>
                <th style={{ padding: '6px 4px' }}>Archivo</th>
                <th style={{ padding: '6px 4px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {certificaciones.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>{c.nombre}</td>
                  <td style={{ padding: '6px 4px' }}>{c.tipo}</td>
                  <td style={{ padding: '6px 4px', color: '#94a3b8' }}>{c.institucion ?? '-'}</td>
                  <td style={{ padding: '6px 4px', color: '#94a3b8' }}>{c.fechaObtencion}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={{ background: c.estado === 'VENCIDO' ? '#7f1d1d' : undefined }}>
                      {c.estado}
                    </span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    {c.archivoUrl ? (
                      <a href={`${API_ORIGIN}${c.archivoUrl}`} target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>
                        Ver
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    <button type="button"
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 11, background: '#7f1d1d' }}
                      onClick={() => quitarCertificacion(c.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Actividad profesional                                                */
/* ------------------------------------------------------------------ */

function TabActividadProfesional({ bomberoId, puedeEditar }: { bomberoId: string; puedeEditar: boolean }) {
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
        {error && <p style={{ color: '#f87171' }}>{error}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Profesion</label>
            <select
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
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              Si falta una profesion, se puede cargar desde Organizacion Institucional → Parámetros.
            </p>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Empresa</label>
            <input className="input-field" value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cargo laboral</label>
            <input className="input-field" value={form.cargoLaboral} onChange={(e) => setForm({ ...form, cargoLaboral: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Experiencia</label>
            <input className="input-field" value={form.experiencia} onChange={(e) => setForm({ ...form, experiencia: e.target.value })} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Actividades relacionadas</label>
          <input
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

interface Idioma {
  idiomaId: string;
  idioma: string;
  nivelIdiomaId: string | null;
  nivel: string | null;
  certificacion: string | null;
}

interface IdiomaEdicion {
  idiomaId: string;
  nivelIdiomaId: string;
  certificacion: string;
}

function TabIdiomas({ bomberoId, puedeEditar }: { bomberoId: string; puedeEditar: boolean }) {
  const [items, setItems] = useState<Idioma[] | null>(null);
  const [editando, setEditando] = useState<IdiomaEdicion[] | null>(null);
  const [idiomasCatalogo, setIdiomasCatalogo] = useState<Parametro[]>([]);
  const [nivelesCatalogo, setNivelesCatalogo] = useState<Parametro[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const res = await apiFetch(`/personal/bomberos/${bomberoId}/idiomas`);
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomberoId]);

  function iniciarEdicion() {
    Promise.all([cargarParametros('IDIOMA'), cargarParametros('NIVEL_IDIOMA')]).then(([idiomas, niveles]) => {
      setIdiomasCatalogo(idiomas);
      setNivelesCatalogo(niveles);
    });
    setEditando(
      (items ?? []).map((i) => ({
        idiomaId: i.idiomaId,
        nivelIdiomaId: i.nivelIdiomaId ?? '',
        certificacion: i.certificacion ?? '',
      })),
    );
  }

  async function guardar() {
    if (!editando) return;
    const idiomaIds = editando.map((i) => i.idiomaId).filter(Boolean);
    if (new Set(idiomaIds).size !== idiomaIds.length) {
      setError('No se puede asignar el mismo idioma dos veces.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const res = await apiFetch(`/personal/bomberos/${bomberoId}/idiomas`, {
        method: 'PUT',
        body: JSON.stringify({
          idiomas: editando
            .filter((i) => i.idiomaId)
            .map((i) => ({
              idiomaId: i.idiomaId,
              nivelIdiomaId: i.nivelIdiomaId || undefined,
              certificacion: i.certificacion || undefined,
            })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo guardar');
      }
      setEditando(null);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (editando) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {error && <p style={{ color: '#f87171' }}>{error}</p>}
        {editando.map((idi, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Idioma</label>
              <select
                className="input-field"
                value={idi.idiomaId}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], idiomaId: e.target.value };
                  setEditando(copia);
                }}
              >
                <option value="">Seleccionar...</option>
                {idiomasCatalogo.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Nivel</label>
              <select
                className="input-field"
                value={idi.nivelIdiomaId}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], nivelIdiomaId: e.target.value };
                  setEditando(copia);
                }}
              >
                <option value="">NINGUNA</option>
                {nivelesCatalogo.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Certificacion</label>
              <input
                className="input-field"
                value={idi.certificacion}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], certificacion: e.target.value };
                  setEditando(copia);
                }}
              />
            </div>
            <button
              type="button"
              className="btn-primary"
              style={{ background: '#7f1d1d' }}
              onClick={() => setEditando(editando.filter((_, i) => i !== idx))}
            >
              Quitar
            </button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn-primary"
            style={{ background: '#475569' }}
            onClick={() => setEditando([...editando, { idiomaId: '', nivelIdiomaId: '', certificacion: '' }])}
          >
            + Agregar idioma
          </button>
          <button type="button" className="btn-primary" disabled={guardando} onClick={guardar}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={() => setEditando(null)}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {puedeEditar && (
        <button type="button" className="btn-primary" style={{ alignSelf: 'flex-end' }} onClick={iniciarEdicion}>
          Editar idiomas
        </button>
      )}
      {items && items.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin idiomas registrados.</p>}
      {items && items.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Idioma</th>
              <th style={{ padding: '6px 4px' }}>Nivel</th>
              <th style={{ padding: '6px 4px' }}>Certificacion</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{i.idioma}</td>
                <td style={{ padding: '6px 4px' }}>{i.nivel ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>{i.certificacion ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Servicios / Guardias (solo lectura - Operaciones/Servicios sin modulo) */
/* ------------------------------------------------------------------ */

function TabServicios({ bomberoId }: { bomberoId: string }) {
  const [guardias, setGuardias] = useState<HistorialAsignacion[] | null>(null);
  const [servicios, setServicios] = useState<any[] | null>(null);

  useEffect(() => {
    cargarHistorialGuardiasPersonal(bomberoId).then(setGuardias).catch(() => setGuardias([]));
    apiFetch(`/personal/bomberos/${bomberoId}/servicios`)
      .then(async (res) => (res.ok ? setServicios(await res.json()) : setServicios([])))
      .catch(() => setServicios([]));
  }, [bomberoId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 8 }}>Guardias ({guardias?.length ?? 0})</h3>
        {guardias && guardias.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin guardias registradas.</p>}
        {guardias && guardias.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '6px 4px' }}>Fecha</th>
                <th style={{ padding: '6px 4px' }}>Turno</th>
                <th style={{ padding: '6px 4px' }}>Tipo</th>
                <th style={{ padding: '6px 4px' }}>Rol</th>
                <th style={{ padding: '6px 4px' }}>Participacion</th>
                <th style={{ padding: '6px 4px' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {guardias.map((g) => (
                <tr key={g.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>
                    <Link href={`/dashboard/guardias/${g.guardia.id}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>
                      {g.guardia.fecha}
                    </Link>
                  </td>
                  <td style={{ padding: '6px 4px' }}>{g.guardia.turno}</td>
                  <td style={{ padding: '6px 4px' }}>{g.guardia.tipo}</td>
                  <td style={{ padding: '6px 4px' }}>{g.rol ?? '—'}</td>
                  <td style={{ padding: '6px 4px' }}>{g.tipoParticipacion}</td>
                  <td style={{ padding: '6px 4px' }}><span className="badge">{g.guardia.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 8 }}>Servicios</h3>
        {servicios && servicios.length === 0 && (
          <p style={{ color: '#94a3b8', fontSize: 13 }}>
            Sin servicios registrados. El modulo de Servicios todavia no esta implementado.
          </p>
        )}
        {servicios && servicios.length > 0 && <pre style={{ fontSize: 12 }}>{JSON.stringify(servicios, null, 2)}</pre>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Equipamiento                                                         */
/* ------------------------------------------------------------------ */

interface Prestamo {
  id: string;
  equipoId: string;
  equipoNombre: string | null;
  equipoCodigoInterno: string | null;
  fechaPrestamo: string;
  fechaDevolucionComprometida: string | null;
  fechaDevolucion: string | null;
  estado: string;
  observaciones: string | null;
}

function formatearFechaHora(valor: string | null): string {
  if (!valor) return '';
  return new Date(valor).toLocaleString();
}

function TabEquipamiento({ bomberoId, puedeEditar }: { bomberoId: string; puedeEditar: boolean }) {
  const confirmar = useConfirmacion();
  const [items, setItems] = useState<Prestamo[] | null>(null);
  const [equipos, setEquipos] = useState<Catalogo[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [equipoId, setEquipoId] = useState('');
  const [fechaDevolucionComprometida, setFechaDevolucionComprometida] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const puedePrestar = !!obtenerSesion()?.usuario.permisos.includes('equipos:prestar');

  async function cargar() {
    const res = await apiFetch(`/personal/bomberos/${bomberoId}/equipamiento`);
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    cargar();
    apiFetch('/equipos/equipos?estado=OPERATIVO')
      .then(async (res) => (res.ok ? setEquipos(await res.json()) : []))
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomberoId]);

  async function prestar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      const res = await apiFetch(`/personal/bomberos/${bomberoId}/equipamiento`, {
        method: 'POST',
        body: JSON.stringify({
          equipoId,
          fechaDevolucionComprometida: fechaDevolucionComprometida
            ? new Date(fechaDevolucionComprometida).toISOString()
            : undefined,
          observaciones: observaciones || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo registrar el prestamo');
      }
      setMostrarForm(false);
      setEquipoId('');
      setFechaDevolucionComprometida('');
      setObservaciones('');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function devolver(prestamoId: string) {
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: 'Registrar devolucion de este equipo?', confirmar: 'Continuar', peligro: true })) return;
    const res = await apiFetch(`/personal/bomberos/equipamiento/${prestamoId}/devolucion`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo registrar la devolucion');
      return;
    }
    await cargar();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {puedeEditar && puedePrestar && (
        <button type="button" className="btn-primary" style={{ alignSelf: 'flex-end' }} onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : 'Registrar prestamo'}
        </button>
      )}
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mostrarForm && (
        <form className="card" onSubmit={prestar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Equipo</label>
            <select className="input-field" value={equipoId} onChange={(e) => setEquipoId(e.target.value)} required>
              <option value="">Seleccionar...</option>
              {equipos.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.codigo ? `${eq.codigo} - ${eq.nombre}` : eq.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Devolucion comprometida</label>
            <input
              className="input-field"
              type="datetime-local"
              value={fechaDevolucionComprometida}
              onChange={(e) => setFechaDevolucionComprometida(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observaciones</label>
            <input className="input-field" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Registrar prestamo'}
          </button>
        </form>
      )}

      <div className="card">
        {items && items.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin prestamos de equipos registrados.</p>}
        {items && items.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '6px 4px' }}>Equipo</th>
                <th style={{ padding: '6px 4px' }}>Prestamo</th>
                <th style={{ padding: '6px 4px' }}>Devolucion comprometida</th>
                <th style={{ padding: '6px 4px' }}>Devolucion real</th>
                <th style={{ padding: '6px 4px' }}>Estado</th>
                <th style={{ padding: '6px 4px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '6px 4px' }}>{p.equipoCodigoInterno ? `${p.equipoCodigoInterno} - ${p.equipoNombre}` : p.equipoNombre}</td>
                  <td style={{ padding: '6px 4px' }}>{formatearFechaHora(p.fechaPrestamo)}</td>
                  <td style={{ padding: '6px 4px' }}>{formatearFechaHora(p.fechaDevolucionComprometida)}</td>
                  <td style={{ padding: '6px 4px' }}>{formatearFechaHora(p.fechaDevolucion)}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge">{p.estado}</span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    {puedeEditar && puedePrestar && p.estado === 'PRESTADO' && (
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => devolver(p.id)}>
                        Registrar devolucion
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <TabEquipamientoDeposito bomberoId={bomberoId} />
    </div>
  );
}

/** Historico de tenencias del modulo Deposito (seccion 8 del pedido de
 * Deposito) -- convive con el prestamo de Equipos de arriba sin
 * reemplazarlo: lo de arriba es "que tiene en uso ahora" via el sistema
 * viejo de Equipos; esto es de solo lectura y refleja el historico de
 * movimientos/tenencias de Deposito (incluye confiscaciones, donde el
 * elemento pasa a "En deposito" pero conserva quien lo tuvo antes). */
function TabEquipamientoDeposito({ bomberoId }: { bomberoId: string }) {
  const [items, setItems] = useState<EquipamientoDeBomberoItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarEquipamientoDeBombero(bomberoId)
      .then(setItems)
      .catch((err) => setError(err.message));
  }, [bomberoId]);

  return (
    <div className="card">
      <h2 style={{ fontSize: 14, marginBottom: 10 }}>
        Deposito — <Link href="/dashboard/deposito/movimientos" style={{ color: '#60a5fa', fontSize: 12 }}>ver movimientos ↗</Link>
      </h2>
      {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
      {items && items.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin elementos del modulo Deposito a su nombre.</p>}
      {items && items.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Elemento</th>
              <th style={{ padding: '6px 4px' }}>Cantidad</th>
              <th style={{ padding: '6px 4px' }}>Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>
                  {it.codigo ? `${it.codigo} - ${it.nombre}` : it.nombre}
                  <span className="badge" style={{ marginLeft: 6, background: '#475569' }}>{it.tipoElemento}</span>
                </td>
                <td style={{ padding: '6px 4px' }}>{it.cantidad ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>{formatearFechaHora(it.actualizadoEn)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vehiculos autorizados                                                */
/* ------------------------------------------------------------------ */

interface VehiculoAutorizado {
  id: string;
  vehiculoId: string;
  numeroInterno: string | null;
  patente: string | null;
  categoria: string | null;
  fechaAutorizacion: string | null;
  vigencia: string | null;
  capacitaciones: string | null;
}

function TabVehiculos({ bomberoId, puedeEditar }: { bomberoId: string; puedeEditar: boolean }) {
  const [items, setItems] = useState<VehiculoAutorizado[] | null>(null);
  const [vehiculos, setVehiculos] = useState<Catalogo[]>([]);
  const [editando, setEditando] = useState<Array<{ vehiculoId: string; categoria: string; fechaAutorizacion: string; vigencia: string; capacitaciones: string }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const res = await apiFetch(`/personal/bomberos/${bomberoId}/vehiculos-autorizados`);
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    cargar();
    apiFetch('/vehiculos/vehiculos?estado=OPERATIVO')
      .then(async (res) => (res.ok ? setVehiculos((await res.json()).map((v: any) => ({ id: v.id, nombre: `${v.numeroInterno} - ${v.tipo}` }))) : undefined))
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomberoId]);

  function iniciarEdicion() {
    setEditando(
      (items ?? []).map((i) => ({
        vehiculoId: i.vehiculoId,
        categoria: i.categoria ?? '',
        fechaAutorizacion: i.fechaAutorizacion ?? '',
        vigencia: i.vigencia ?? '',
        capacitaciones: i.capacitaciones ?? '',
      })),
    );
  }

  async function guardar() {
    if (!editando) return;
    setGuardando(true);
    setError(null);
    try {
      const res = await apiFetch(`/personal/bomberos/${bomberoId}/vehiculos-autorizados`, {
        method: 'PUT',
        body: JSON.stringify({
          vehiculos: editando
            .filter((v) => v.vehiculoId)
            .map((v) => ({
              vehiculoId: v.vehiculoId,
              categoria: v.categoria || undefined,
              fechaAutorizacion: v.fechaAutorizacion || undefined,
              vigencia: v.vigencia || undefined,
              capacitaciones: v.capacitaciones || undefined,
            })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo guardar');
      }
      setEditando(null);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (editando) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {error && <p style={{ color: '#f87171' }}>{error}</p>}
        {editando.map((v, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Vehiculo</label>
              <select
                className="input-field"
                value={v.vehiculoId}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], vehiculoId: e.target.value };
                  setEditando(copia);
                }}
              >
                <option value="">Seleccionar...</option>
                {vehiculos.map((veh) => (
                  <option key={veh.id} value={veh.id}>
                    {veh.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Categoria</label>
              <input
                className="input-field"
                value={v.categoria}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], categoria: e.target.value };
                  setEditando(copia);
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Fecha autorizacion</label>
              <input
                className="input-field"
                type="date"
                value={v.fechaAutorizacion}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], fechaAutorizacion: e.target.value };
                  setEditando(copia);
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, display: 'block' }}>Vigencia</label>
              <input
                className="input-field"
                type="date"
                value={v.vigencia}
                onChange={(e) => {
                  const copia = [...editando];
                  copia[idx] = { ...copia[idx], vigencia: e.target.value };
                  setEditando(copia);
                }}
              />
            </div>
            <button
              type="button"
              className="btn-primary"
              style={{ background: '#7f1d1d' }}
              onClick={() => setEditando(editando.filter((_, i) => i !== idx))}
            >
              Quitar
            </button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn-primary"
            style={{ background: '#475569' }}
            onClick={() => setEditando([...editando, { vehiculoId: '', categoria: '', fechaAutorizacion: '', vigencia: '', capacitaciones: '' }])}
          >
            + Agregar vehiculo
          </button>
          <button type="button" className="btn-primary" disabled={guardando} onClick={guardar}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={() => setEditando(null)}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {puedeEditar && (
        <button type="button" className="btn-primary" style={{ alignSelf: 'flex-end' }} onClick={iniciarEdicion}>
          Editar vehiculos autorizados
        </button>
      )}
      {items && items.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin vehiculos autorizados.</p>}
      {items && items.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Vehiculo</th>
              <th style={{ padding: '6px 4px' }}>Categoria</th>
              <th style={{ padding: '6px 4px' }}>Autorizacion</th>
              <th style={{ padding: '6px 4px' }}>Vigencia</th>
            </tr>
          </thead>
          <tbody>
            {items.map((v) => (
              <tr key={v.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{v.numeroInterno ? `${v.numeroInterno} (${v.patente ?? '-'})` : v.vehiculoId}</td>
                <td style={{ padding: '6px 4px' }}>{v.categoria ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>{v.fechaAutorizacion ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>{v.vigencia ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Salud                                                                 */
/* ------------------------------------------------------------------ */

/* Matriz de compatibilidad de globulos rojos (informativa, no reemplaza
 * protocolos medicos). Filas = receptor, columnas = donante. */
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

function TabSalud({ bombero, puedeEditar, onGuardado }: { bombero: Bombero; puedeEditar: boolean; onGuardado: () => void }) {
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
            <div style={{ borderTop: '1px solid #334155', paddingTop: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                Puede recibir sangre de: <span style={{ fontWeight: 400 }}>{compatibles.join(', ')}</span>
              </p>
              <p style={{ fontSize: 11, color: '#94a3b8' }}>
                Informacion orientativa para transfusion de globulos rojos. No sustituye protocolos medicos ni la
                verificacion de compatibilidad realizada por personal sanitario.
              </p>
            </div>
          )}
        </div>
      ) : (
        <form className="card" onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {error && <p style={{ color: '#f87171' }}>{error}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Grupo sanguineo</label>
              <select
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
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Factor Rh</label>
              <select
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
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Alergias</label>
            <input className="input-field" value={form.alergias} onChange={(e) => setForm({ ...form, alergias: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Condiciones medicas</label>
            <input
              className="input-field"
              value={form.condicionesMedicas}
              onChange={(e) => setForm({ ...form, condicionesMedicas: e.target.value })}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Medicamentos</label>
            <input className="input-field" value={form.medicamentos} onChange={(e) => setForm({ ...form, medicamentos: e.target.value })} />
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

function TabFirmaDigital({ bombero, onGuardado }: { bombero: Bombero; onGuardado: () => void }) {
  const puedeGestionar = !!obtenerSesion()?.usuario.permisos.includes('personal:gestionar_firma_digital');
  const [subiendo, setSubiendo] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [cambiandoAutorizacion, setCambiandoAutorizacion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function subirArchivo(archivo: File) {
    setError(null);
    setMensaje(null);
    setSubiendo(true);
    try {
      await subirFirmaDigital(bombero.id, archivo);
      setMensaje('Firma digital actualizada');
      onGuardado();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubiendo(false);
    }
  }

  async function eliminar() {
    setError(null);
    setMensaje(null);
    setEliminando(true);
    try {
      await eliminarFirmaDigital(bombero.id);
      setMensaje('Firma digital eliminada');
      onGuardado();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEliminando(false);
    }
  }

  async function cambiarAutorizacion(autorizado: boolean) {
    setError(null);
    setMensaje(null);
    setCambiandoAutorizacion(true);
    try {
      await cambiarAutorizacionFirma(bombero.id, autorizado);
      setMensaje(autorizado ? 'Autorizado para uso de firma digital' : 'Autorizacion de firma digital revocada');
      onGuardado();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCambiandoAutorizacion(false);
    }
  }

  if (!puedeGestionar) {
    return (
      <p style={{ color: '#94a3b8', fontSize: 13 }}>
        Solo un usuario con el permiso <code>personal:gestionar_firma_digital</code> puede cargar, reemplazar,
        eliminar o autorizar el uso de la firma digital de este bombero.
      </p>
    );
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
      <div>
        <h3 style={{ fontSize: 14, marginBottom: 4 }}>Firma digital registrada</h3>
        <p style={{ fontSize: 12, color: '#94a3b8' }}>
          La imagen de la firma es independiente de la autorizacion de uso. Cargar una firma no la habilita
          automaticamente para insertarse en documentos.
        </p>
      </div>

      {error && <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {bombero.firmaDigitalUrl ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <img
            src={`${API_ORIGIN}/api/v1/personal/bomberos/${bombero.id}/firma-digital`}
            alt="Firma digital"
            style={{ maxWidth: 260, maxHeight: 120, background: '#fff', borderRadius: 6, padding: 8 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <label className="btn-primary" style={{ background: '#475569', cursor: 'pointer' }}>
              {subiendo ? 'Subiendo...' : 'Reemplazar'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                style={{ display: 'none' }}
                disabled={subiendo}
                onChange={(e) => e.target.files?.[0] && subirArchivo(e.target.files[0])}
              />
            </label>
            <button type="button" className="btn-primary" style={{ background: '#7f1d1d' }} onClick={eliminar} disabled={eliminando}>
              {eliminando ? 'Eliminando...' : 'Eliminar firma'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <label className="btn-primary" style={{ display: 'inline-block', cursor: 'pointer' }}>
            {subiendo ? 'Subiendo...' : 'Cargar firma digital'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              style={{ display: 'none' }}
              disabled={subiendo}
              onChange={(e) => e.target.files?.[0] && subirArchivo(e.target.files[0])}
            />
          </label>
          <p style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>Formatos: png, jpg, webp o gif (no svg).</p>
        </div>
      )}

      <div style={{ borderTop: '1px solid #334155', paddingTop: 14 }}>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={bombero.autorizadoFirmaDigital}
            disabled={cambiandoAutorizacion}
            onChange={(e) => cambiarAutorizacion(e.target.checked)}
          />
          ¿Autorizado para uso de firma digital?
        </label>
        <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
          Si esta activo Y hay una firma cargada, SIGBO la insertara automaticamente en los documentos que lo
          requieran. Si esta activo pero no hay firma cargada, el documento se genera igual con una advertencia y el
          espacio en blanco para firmar a mano.
        </p>
        {bombero.autorizadoFirmaDigital && !bombero.firmaDigitalUrl && (
          <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 8 }}>
            ⚠ Autorizado para uso de firma digital, pero todavia no tiene una firma cargada.
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Seguros (relacion 1:N)                                               */
/* ------------------------------------------------------------------ */

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

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {mostrarForm && (
        <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid #334155', paddingTop: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Aseguradora</label>
              <select className="input-field" value={form.aseguradoraId} onChange={(e) => setForm({ ...form, aseguradoraId: e.target.value })}>
                <option value="">NINGUNA</option>
                {aseguradoras.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de seguro</label>
              <select className="input-field" value={form.tipoSeguroId} onChange={(e) => setForm({ ...form, tipoSeguroId: e.target.value })}>
                <option value="">NINGUNA</option>
                {tiposSeguro.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Numero de poliza</label>
              <input className="input-field" value={form.numeroPoliza} onChange={(e) => setForm({ ...form, numeroPoliza: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
              <select className="input-field" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de inicio</label>
              <input className="input-field" type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de vencimiento</label>
              <input
                className="input-field"
                type="date"
                value={form.fechaVencimiento}
                onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              Descripcion (detalle particular de esta poliza)
            </label>
            <input className="input-field" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observaciones</label>
            <input className="input-field" value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear seguro'}
          </button>
        </form>
      )}

      {items && items.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin seguros registrados.</p>}
      {items && items.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Aseguradora</th>
              <th style={{ padding: '6px 4px' }}>Tipo</th>
              <th style={{ padding: '6px 4px' }}>Poliza</th>
              <th style={{ padding: '6px 4px' }}>Vigencia</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{s.aseguradoraId ? nombres.get(s.aseguradoraId) ?? '...' : '-'}</td>
                <td style={{ padding: '6px 4px' }}>{s.tipoSeguroId ? nombres.get(s.tipoSeguroId) ?? '...' : '-'}</td>
                <td style={{ padding: '6px 4px' }}>{s.numeroPoliza ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>
                  {s.fechaInicio ?? '?'} - {s.fechaVencimiento ?? '?'}
                </td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: s.estado === 'ACTIVO' ? '#166534' : '#7f1d1d' }}>
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

function TabDocumentos({ bomberoId }: { bomberoId: string }) {
  return <DocumentosDeEntidad modulo="personal" entidad="bombero" registroId={bomberoId} titulo="Documentos de la persona" />;
}

/* ------------------------------------------------------------------ */
/* Foja de servicio                                                     */
/* ------------------------------------------------------------------ */

function TabFoja({ bomberoId, puedeEditar }: { bomberoId: string; puedeEditar: boolean }) {
  const [anios, setAnios] = useState<number[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);

  const puedeGenerar = !!obtenerSesion()?.usuario.permisos.includes('personal:generar_foja');

  async function cargar() {
    const res = await apiFetch(`/personal/bomberos/${bomberoId}/foja-servicio`);
    if (res.ok) setAnios(await res.json());
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomberoId]);

  async function generar() {
    setGenerando(true);
    setError(null);
    try {
      const res = await apiFetch(`/personal/bomberos/${bomberoId}/foja-servicio`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo generar la foja');
      }
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {puedeEditar && puedeGenerar && (
        <button type="button" className="btn-primary" style={{ alignSelf: 'flex-end' }} disabled={generando} onClick={generar}>
          {generando ? 'Generando...' : `Generar foja de servicio ${new Date().getFullYear()}`}
        </button>
      )}
      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <div className="card">
        {anios && anios.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Todavia no se genero ninguna foja de servicio.</p>}
        {anios && anios.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '6px 4px' }}>Ano</th>
                <th style={{ padding: '6px 4px' }}>Descargas</th>
              </tr>
            </thead>
            <tbody>
              {anios.map((anio) => (
                <FilaFoja key={anio} bomberoId={bomberoId} anio={anio} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function FilaFoja({ bomberoId, anio }: { bomberoId: string; anio: number }) {
  const [foja, setFoja] = useState<{ archivoPdfUrl: string | null; archivoDocxUrl: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`/personal/bomberos/${bomberoId}/foja-servicio/${anio}`)
      .then(async (res) => (res.ok ? setFoja(await res.json()) : undefined))
      .catch(() => undefined);
  }, [bomberoId, anio]);

  async function descargar(formato: 'pdf' | 'docx') {
    try {
      setError(null);
      await descargarArchivo(`/api/v1/personal/bomberos/${bomberoId}/foja-servicio/${anio}/archivos/${formato}`, `foja-servicio-${anio}.${formato}`);
    } catch (err: any) {
      setError(err.message ?? 'No se pudo descargar el archivo');
    }
  }

  return (
    <tr style={{ borderBottom: '1px solid #1f2937' }}>
      <td style={{ padding: '6px 4px' }}>{anio}</td>
      <td style={{ padding: '6px 4px', display: 'flex', gap: 10 }}>
        {foja?.archivoPdfUrl && <button type="button" className="link-button" onClick={() => descargar('pdf')}>PDF</button>}
        {foja?.archivoDocxUrl && <button type="button" className="link-button" onClick={() => descargar('docx')}>Word</button>}
        {error && <span role="alert" style={{ color: '#f87171' }}>{error}</span>}
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/* Linea de tiempo                                                       */
/* ------------------------------------------------------------------ */

function TabTimeline({ bomberoId }: { bomberoId: string }) {
  const [items, setItems] = useState<MovimientoHistorial[] | null>(null);

  useEffect(() => {
    apiFetch(`/personal/bomberos/${bomberoId}/historial`)
      .then(async (res) => (res.ok ? setItems(await res.json()) : setItems([])))
      .catch(() => setItems([]));
  }, [bomberoId]);

  if (!items) return <p style={{ color: '#94a3b8' }}>Cargando...</p>;
  if (items.length === 0) return <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin movimientos registrados.</p>;

  const ordenados = [...items].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {ordenados.map((m, idx) => (
        <div key={m.id} style={{ display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563eb', marginTop: 4 }} />
            {idx < ordenados.length - 1 && <div style={{ flex: 1, width: 2, background: '#334155' }} />}
          </div>
          <div style={{ paddingBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{m.fecha}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{m.tipoMovimiento}</div>
            {m.motivo && <div style={{ fontSize: 13 }}>{m.motivo}</div>}
            {m.observacion && <div style={{ fontSize: 12, color: '#94a3b8' }}>{m.observacion}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Auditoria                                                             */
/* ------------------------------------------------------------------ */

interface LogAuditoria {
  id: string;
  accion: string;
  fecha: string;
  usuarioId: string | null;
  ip: string | null;
  datosAntes: string | null;
  datosDespues: string | null;
}

function TabAuditoria({ bomberoId }: { bomberoId: string }) {
  const [items, setItems] = useState<LogAuditoria[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`/seguridad/auditoria?recurso=personal.bomberos&recursoId=${bomberoId}&pageSize=100`)
      .then(async (res) => {
        if (!res.ok) {
          setError('No tienes permiso para ver la auditoria de este registro.');
          return;
        }
        const body = await res.json();
        setItems(body.items);
      })
      .catch(() => setError('No se pudo cargar la auditoria'));
  }, [bomberoId]);

  if (error) return <p style={{ color: '#94a3b8', fontSize: 13 }}>{error}</p>;
  if (!items) return <p style={{ color: '#94a3b8' }}>Cargando...</p>;
  if (items.length === 0) return <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin registros de auditoria.</p>;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
            <th style={{ padding: '6px 4px' }}>Fecha</th>
            <th style={{ padding: '6px 4px' }}>Accion</th>
            <th style={{ padding: '6px 4px' }}>IP</th>
            <th style={{ padding: '6px 4px' }}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((log) => (
            <Fragment key={log.id}>
              <tr style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{new Date(log.fecha).toLocaleString()}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge">{log.accion}</span>
                </td>
                <td style={{ padding: '6px 4px' }}>{log.ip ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>
                  <button type="button"
                    className="btn-primary"
                    style={{ padding: '4px 8px', fontSize: 12 }}
                    onClick={() => setExpandido(expandido === log.id ? null : log.id)}
                  >
                    {expandido === log.id ? 'Ocultar' : 'Ver detalle'}
                  </button>
                </td>
              </tr>
              {expandido === log.id && (
                <tr>
                  <td colSpan={4} style={{ padding: '6px 4px', background: '#0f172a' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 11 }}>
                      <pre style={{ whiteSpace: 'pre-wrap' }}>
                        Antes: {formatearJsonSeguro(log.datosAntes)}
                      </pre>
                      <pre style={{ whiteSpace: 'pre-wrap' }}>
                        Despues: {formatearJsonSeguro(log.datosDespues)}
                      </pre>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
