'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { cargarParametros, Parametro } from '@/lib/parametros';
import { Aviso } from '@/app/components/Aviso';

interface Catalogo {
  id: string;
  nombre: string;
  codigo?: string;
  prefijo?: string;
}

const ESTADOS = ['ASPIRANTE', 'ACTIVO', 'SUSPENDIDO', 'LICENCIA', 'RETIRADO', 'FALLECIDO', 'HONORARIO'];
const CONDICIONES = ['INCORPORADO', 'COMBATIENTE', 'APOYO_ECONOMICO', 'HONORARIO'];
const DIAS_SEMANA_PREFERENCIA = ['NINGUNA', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

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

  // Disponibilidad para guardias
  const [realizaGuardias, setRealizaGuardias] = useState(true);
  const [realizaGuardiasEspeciales, setRealizaGuardiasEspeciales] = useState(false);
  const [frecuenciaNormalMensual, setFrecuenciaNormalMensual] = useState('');
  const [frecuenciaEspecialMensual, setFrecuenciaEspecialMensual] = useState('');
  const [diaPreferenteGuardia, setDiaPreferenteGuardia] = useState('NINGUNA');

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
        realizaGuardias,
        realizaGuardiasEspeciales,
        frecuenciaNormalMensual: frecuenciaNormalMensual ? parseInt(frecuenciaNormalMensual, 10) : undefined,
        frecuenciaEspecialMensual: frecuenciaEspecialMensual ? parseInt(frecuenciaEspecialMensual, 10) : undefined,
        diaPreferenteGuardia,
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

      {error && <Aviso tipo="error" texto={error} />}

      <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Datos personales</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="cedula" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cedula *</label>
              <input id="cedula" className="input-field" value={cedula} onChange={(e) => setCedula(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="nombre" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre *</label>
              <input id="nombre" className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="apellido" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Apellido *</label>
              <input id="apellido" className="input-field" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="fecha-de-nacimiento" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de nacimiento *</label>
              <input id="fecha-de-nacimiento"
                className="input-field"
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="sexo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Sexo</label>
              <select id="sexo" className="input-field" value={sexo} onChange={(e) => setSexo(e.target.value as 'M' | 'F' | '')}>
                <option value="">No especificado</option>
                <option value="M">M</option>
                <option value="F">F</option>
              </select>
            </div>
            <div>
              <label htmlFor="pais" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Pais</label>
              <select id="pais" className="input-field" value={paisId} onChange={(e) => setPaisId(e.target.value)}>
                <option value="">NINGUNA</option>
                {paises.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pasaporte" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Pasaporte</label>
              <input id="pasaporte" className="input-field" value={pasaporte} onChange={(e) => setPasaporte(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Contacto</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="telefono-principal" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Telefono principal *</label>
              <input id="telefono-principal"
                className="input-field"
                value={telefonoPrincipal}
                onChange={(e) => setTelefonoPrincipal(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="email" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Email</label>
              <input id="email" className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            El detalle de ubicacion (pais, departamento, ciudad, barrio) se completa luego desde la pestana
            &quot;Datos personales&quot; del expediente.
          </p>
        </section>

        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Codigo bomberil</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="tipo-de-bombero" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de Bombero *</label>
              <select id="tipo-de-bombero"
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
              <label htmlFor="numero-manual-sin-el-prefijo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                Numero (manual, sin el prefijo) *
              </label>
              <input id="numero-manual-sin-el-prefijo"
                className="input-field"
                value={numeroManual}
                onChange={(e) => setNumeroManual(e.target.value)}
                placeholder="045"
                required
              />
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            Codigo bomberil resultante: <strong style={{ color: 'var(--ink)' }}>{codigoPreview || '(incompleto)'}</strong>
          </p>
        </section>

        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Informacion institucional</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="rango" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Rango *</label>
              <select id="rango" className="input-field" value={rangoId} onChange={(e) => setRangoId(e.target.value)} required>
                <option value="">Seleccionar...</option>
                {opciones(rangos)}
              </select>
            </div>
            <div>
              <label htmlFor="cargo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cargo</label>
              <select id="cargo" className="input-field" value={cargoPrincipalId} onChange={(e) => setCargoPrincipalId(e.target.value)}>
                <option value="">Sin cargo</option>
                {opciones(cargos)}
              </select>
            </div>
            <div>
              <label htmlFor="condicion-institucional" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Condicion institucional</label>
              <select id="condicion-institucional"
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
              <label htmlFor="compania" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Compania</label>
              <select id="compania" className="input-field" value={companiaId} onChange={(e) => setCompaniaId(e.target.value)}>
                <option value="">Sin asignar</option>
                {opciones(companias)}
              </select>
            </div>
            <div>
              <label htmlFor="cuartel" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cuartel</label>
              <select id="cuartel" className="input-field" value={cuartelId} onChange={(e) => setCuartelId(e.target.value)}>
                <option value="">Sin asignar</option>
                {opciones(cuarteles)}
              </select>
            </div>
            <div>
              <label htmlFor="turno" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Turno</label>
              <select id="turno" className="input-field" value={turnoId} onChange={(e) => setTurnoId(e.target.value)}>
                <option value="">Sin asignar</option>
                {opciones(turnos)}
              </select>
            </div>
            <div>
              <label htmlFor="tipo-de-guardia" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de guardia</label>
              <select id="tipo-de-guardia" className="input-field" value={tipoGuardiaId} onChange={(e) => setTipoGuardiaId(e.target.value)}>
                <option value="">Sin asignar</option>
                {opciones(tiposGuardia)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="brigada" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Brigada</label>
              <select id="brigada" className="input-field" value={brigadaId} onChange={(e) => setBrigadaId(e.target.value)}>
                <option value="">Sin asignar</option>
                {opciones(brigadas)}
              </select>
            </div>
            <div>
              <label htmlFor="departamento" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Departamento</label>
              <select id="departamento" className="input-field" value={departamentoId} onChange={(e) => setDepartamentoId(e.target.value)}>
                <option value="">Sin asignar</option>
                {opciones(departamentos)}
              </select>
            </div>
            <div>
              <label htmlFor="unidad" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Unidad</label>
              <select id="unidad" className="input-field" value={unidadId} onChange={(e) => setUnidadId(e.target.value)}>
                <option value="">Sin asignar</option>
                {opciones(unidades)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="fecha-de-ingreso" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de ingreso *</label>
              <input id="fecha-de-ingreso"
                className="input-field"
                type="date"
                value={fechaIngreso}
                onChange={(e) => setFechaIngreso(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="fecha-de-incorporacion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de incorporacion</label>
              <input id="fecha-de-incorporacion"
                className="input-field"
                type="date"
                value={fechaIncorporacion}
                onChange={(e) => setFechaIncorporacion(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="fecha-de-juramento" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de juramento</label>
              <input id="fecha-de-juramento"
                className="input-field"
                type="date"
                value={fechaJuramento}
                onChange={(e) => setFechaJuramento(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="estado" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
              <select id="estado" className="input-field" value={estado} onChange={(e) => setEstado(e.target.value)}>
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Disponibilidad para Guardias</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            Distinto de participar en Servicios: un bombero puede participar de servicios aunque no realice guardias.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={realizaGuardias} onChange={(e) => setRealizaGuardias(e.target.checked)} />
              Realiza guardias
            </label>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={realizaGuardiasEspeciales}
                onChange={(e) => setRealizaGuardiasEspeciales(e.target.checked)}
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
                value={frecuenciaNormalMensual}
                onChange={(e) => setFrecuenciaNormalMensual(e.target.value)}
                placeholder="Sin definir"
              />
            </div>
            <div>
              <label htmlFor="frecuencia-especial-mensual" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Frecuencia especial mensual</label>
              <input id="frecuencia-especial-mensual"
                className="input-field"
                type="number"
                min={0}
                value={frecuenciaEspecialMensual}
                onChange={(e) => setFrecuenciaEspecialMensual(e.target.value)}
                placeholder="Sin definir"
              />
            </div>
            <div>
              <label htmlFor="dia-preferente" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Dia preferente</label>
              <select id="dia-preferente" className="input-field" value={diaPreferenteGuardia} onChange={(e) => setDiaPreferenteGuardia(e.target.value)}>
                {DIAS_SEMANA_PREFERENCIA.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn-primary" disabled={guardando}>
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
