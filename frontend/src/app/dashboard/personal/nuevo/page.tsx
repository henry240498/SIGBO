'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { cargarParametros, Parametro } from '@/lib/parametros';

interface Catalogo {
  id: string;
  nombre: string;
  codigo?: string;
  prefijo?: string;
}

const ESTADOS = ['ASPIRANTE', 'ACTIVO', 'SUSPENDIDO', 'LICENCIA', 'RETIRADO', 'FALLECIDO', 'HONORARIO'];
const CONDICIONES = ['INCORPORADO', 'COMBATIENTE', 'APOYO_ECONOMICO', 'HONORARIO'];

async function cargarCatalogo(path: string): Promise<Catalogo[]> {
  const res = await apiFetch(`${path}?estado=ACTIVO`);
  if (!res.ok) return [];
  return res.json();
}

export default function NuevoBomberoPage() {
  const router = useRouter();

  const [tipos, setTipos] = useState<Catalogo[]>([]);
  const [rangos, setRangos] = useState<Catalogo[]>([]);
  const [cargos, setCargos] = useState<Catalogo[]>([]);
  const [companias, setCompanias] = useState<Catalogo[]>([]);
  const [cuarteles, setCuarteles] = useState<Catalogo[]>([]);
  const [turnos, setTurnos] = useState<Catalogo[]>([]);
  const [tiposGuardia, setTiposGuardia] = useState<Catalogo[]>([]);
  const [brigadas, setBrigadas] = useState<Catalogo[]>([]);
  const [departamentos, setDepartamentos] = useState<Catalogo[]>([]);
  const [unidades, setUnidades] = useState<Catalogo[]>([]);
  const [paises, setPaises] = useState<Parametro[]>([]);

  useEffect(() => {
    cargarCatalogo('/personal/tipos-bombero').then(setTipos);
    cargarCatalogo('/organizacion/rangos').then(setRangos);
    cargarCatalogo('/organizacion/cargos').then(setCargos);
    cargarCatalogo('/organizacion/companias').then(setCompanias);
    cargarCatalogo('/organizacion/cuarteles').then(setCuarteles);
    cargarCatalogo('/organizacion/turnos').then(setTurnos);
    cargarCatalogo('/organizacion/tipos-guardia').then(setTiposGuardia);
    cargarCatalogo('/organizacion/brigadas').then(setBrigadas);
    cargarCatalogo('/organizacion/departamentos').then(setDepartamentos);
    cargarCatalogo('/organizacion/unidades').then(setUnidades);
    cargarParametros('PAIS').then(setPaises);
  }, []);

  // Datos personales
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState<'M' | 'F' | ''>('');
  const [paisId, setPaisId] = useState('');
  const [pasaporte, setPasaporte] = useState('');

  // Contacto
  const [telefonoPrincipal, setTelefonoPrincipal] = useState('');
  const [email, setEmail] = useState('');

  // Institucional
  const [tipoBomberoId, setTipoBomberoId] = useState('');
  const [numeroManual, setNumeroManual] = useState('');
  const [rangoId, setRangoId] = useState('');
  const [cargoPrincipalId, setCargoPrincipalId] = useState('');
  const [companiaId, setCompaniaId] = useState('');
  const [cuartelId, setCuartelId] = useState('');
  const [turnoId, setTurnoId] = useState('');
  const [tipoGuardiaId, setTipoGuardiaId] = useState('');
  const [brigadaId, setBrigadaId] = useState('');
  const [departamentoId, setDepartamentoId] = useState('');
  const [unidadId, setUnidadId] = useState('');
  const [condicionInstitucional, setCondicionInstitucional] = useState('');
  const [estado, setEstado] = useState('ACTIVO');
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [fechaIncorporacion, setFechaIncorporacion] = useState('');
  const [fechaJuramento, setFechaJuramento] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tipoSeleccionado = tipos.find((t) => t.id === tipoBomberoId);
  const codigoPreview = tipoSeleccionado ? `${tipoSeleccionado.prefijo ?? ''}${numeroManual}` : numeroManual;

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!tipoBomberoId) {
      setError('Selecciona un Tipo de Bombero para generar el codigo.');
      return;
    }
    if (!numeroManual.trim()) {
      setError('Ingresa el numero de codigo bomberil (no se genera automaticamente).');
      return;
    }
    if (!rangoId) {
      setError('Selecciona un Rango.');
      return;
    }

    setGuardando(true);
    try {
      const rango = rangos.find((r) => r.id === rangoId);
      const cargo = cargos.find((c) => c.id === cargoPrincipalId);

      const payload: Record<string, unknown> = {
        cedula,
        nombre,
        apellido,
        fechaNacimiento,
        sexo: sexo || undefined,
        telefonoPrincipal,
        email: email || undefined,
        numeroBombero: codigoPreview,
        rango: rango?.nombre ?? '',
        cargo: cargo?.nombre,
        fechaIngreso,
        estado,
        condicionInstitucional: condicionInstitucional || undefined,
        tipoBomberoId,
        rangoId,
        cargoPrincipalId: cargoPrincipalId || undefined,
        companiaId: companiaId || undefined,
        cuartelId: cuartelId || undefined,
        turnoId: turnoId || undefined,
        tipoGuardiaId: tipoGuardiaId || undefined,
        brigadaId: brigadaId || undefined,
        departamentoId: departamentoId || undefined,
        unidadId: unidadId || undefined,
        paisId: paisId || undefined,
        pasaporte: pasaporte || undefined,
        fechaIncorporacion: fechaIncorporacion || undefined,
        fechaJuramento: fechaJuramento || undefined,
      };

      const res = await apiFetch('/personal/bomberos', { method: 'POST', body: JSON.stringify(payload) });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo crear el bombero',
        );
      }
      const creado = await res.json();
      router.push(`/dashboard/personal/${creado.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  function opciones(lista: Catalogo[]) {
    return lista.map((c) => (
      <option key={c.id} value={c.id}>
        {c.codigo ? `${c.codigo} - ${c.nombre}` : c.nombre}
      </option>
    ));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900 }}>
      <h2 style={{ fontSize: 16 }}>Agregar Bombero</h2>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Datos personales</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cedula *</label>
              <input className="input-field" value={cedula} onChange={(e) => setCedula(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre *</label>
              <input className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Apellido *</label>
              <input className="input-field" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de nacimiento *</label>
              <input
                className="input-field"
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Sexo</label>
              <select className="input-field" value={sexo} onChange={(e) => setSexo(e.target.value as 'M' | 'F' | '')}>
                <option value="">No especificado</option>
                <option value="M">M</option>
                <option value="F">F</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Pais</label>
              <select className="input-field" value={paisId} onChange={(e) => setPaisId(e.target.value)}>
                <option value="">NINGUNA</option>
                {paises.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Pasaporte</label>
              <input className="input-field" value={pasaporte} onChange={(e) => setPasaporte(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Contacto</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Telefono principal *</label>
              <input
                className="input-field"
                value={telefonoPrincipal}
                onChange={(e) => setTelefonoPrincipal(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Email</label>
              <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>
            El detalle de ubicacion (pais, departamento, ciudad, barrio) se completa luego desde la pestana
            &quot;Datos personales&quot; del expediente.
          </p>
        </section>

        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Codigo bomberil</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de Bombero *</label>
              <select
                className="input-field"
                value={tipoBomberoId}
                onChange={(e) => setTipoBomberoId(e.target.value)}
                required
              >
                <option value="">Seleccionar...</option>
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.prefijo} - {t.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                Numero (manual, sin el prefijo) *
              </label>
              <input
                className="input-field"
                value={numeroManual}
                onChange={(e) => setNumeroManual(e.target.value)}
                placeholder="045"
                required
              />
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>
            Codigo bomberil resultante: <strong style={{ color: '#e2e8f0' }}>{codigoPreview || '(incompleto)'}</strong>
          </p>
        </section>

        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Informacion institucional</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Rango *</label>
              <select className="input-field" value={rangoId} onChange={(e) => setRangoId(e.target.value)} required>
                <option value="">Seleccionar...</option>
                {opciones(rangos)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cargo</label>
              <select className="input-field" value={cargoPrincipalId} onChange={(e) => setCargoPrincipalId(e.target.value)}>
                <option value="">Sin cargo</option>
                {opciones(cargos)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Condicion institucional</label>
              <select
                className="input-field"
                value={condicionInstitucional}
                onChange={(e) => setCondicionInstitucional(e.target.value)}
              >
                <option value="">No especificada</option>
                {CONDICIONES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Compania</label>
              <select className="input-field" value={companiaId} onChange={(e) => setCompaniaId(e.target.value)}>
                <option value="">Sin asignar</option>
                {opciones(companias)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cuartel</label>
              <select className="input-field" value={cuartelId} onChange={(e) => setCuartelId(e.target.value)}>
                <option value="">Sin asignar</option>
                {opciones(cuarteles)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Turno</label>
              <select className="input-field" value={turnoId} onChange={(e) => setTurnoId(e.target.value)}>
                <option value="">Sin asignar</option>
                {opciones(turnos)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de guardia</label>
              <select className="input-field" value={tipoGuardiaId} onChange={(e) => setTipoGuardiaId(e.target.value)}>
                <option value="">Sin asignar</option>
                {opciones(tiposGuardia)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Brigada</label>
              <select className="input-field" value={brigadaId} onChange={(e) => setBrigadaId(e.target.value)}>
                <option value="">Sin asignar</option>
                {opciones(brigadas)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Departamento</label>
              <select className="input-field" value={departamentoId} onChange={(e) => setDepartamentoId(e.target.value)}>
                <option value="">Sin asignar</option>
                {opciones(departamentos)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Unidad</label>
              <select className="input-field" value={unidadId} onChange={(e) => setUnidadId(e.target.value)}>
                <option value="">Sin asignar</option>
                {opciones(unidades)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de ingreso *</label>
              <input
                className="input-field"
                type="date"
                value={fechaIngreso}
                onChange={(e) => setFechaIngreso(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de incorporacion</label>
              <input
                className="input-field"
                type="date"
                value={fechaIncorporacion}
                onChange={(e) => setFechaIncorporacion(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de juramento</label>
              <input
                className="input-field"
                type="date"
                value={fechaJuramento}
                onChange={(e) => setFechaJuramento(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
              <select className="input-field" value={estado} onChange={(e) => setEstado(e.target.value)}>
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Crear bombero'}
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ background: '#475569' }}
            onClick={() => router.push('/dashboard/personal')}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
