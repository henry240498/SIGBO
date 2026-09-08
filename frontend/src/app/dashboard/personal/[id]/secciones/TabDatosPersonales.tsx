'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { cargarParametros, resolverNombres, Parametro } from '@/lib/parametros';
import { Aviso } from '@/app/components/Aviso';
import { Bombero, campoTexto } from '../expediente';

export function TabDatosPersonales({
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
      {error && <Aviso tipo="error" texto={error} />}
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
              aria-label={label}
              className="input-field"
              value={form[campo]}
              onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
            />
          </div>
        ))}
        <div>
          <label htmlFor="fecha-de-nacimiento" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de nacimiento</label>
          <input id="fecha-de-nacimiento"
            className="input-field"
            type="date"
            value={form.fechaNacimiento}
            onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="sexo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Sexo</label>
          <select id="sexo" className="input-field" value={form.sexo} onChange={(e) => setForm({ ...form, sexo: e.target.value })}>
            <option value="">NINGUNA</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Ubicación</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
        <div>
          <label htmlFor="pais" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Pais</label>
          <select id="pais" className="input-field" value={form.paisId} onChange={(e) => cambiarPais(e.target.value)}>
            <option value="">NINGUNA</option>
            {paises.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="departamento" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Departamento</label>
          <select id="departamento"
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
          <label htmlFor="ciudad" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Ciudad</label>
          <select id="ciudad"
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
          <label htmlFor="barrio" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Barrio</label>
          <select id="barrio"
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
      <p style={{ fontSize: 12, color: 'var(--muted)' }}>
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
