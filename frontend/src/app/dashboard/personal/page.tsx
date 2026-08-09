'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, obtenerSesion } from '@/lib/api';
import { descargarArchivo } from '@/lib/exportar';

interface Bombero {
  id: string;
  cedula: string;
  nombre: string;
  apellido: string;
  rango: string;
  cargo: string | null;
  numeroBombero: string;
  estado: string;
  tipoBomberoId: string | null;
  rangoId: string | null;
  cargoPrincipalId: string | null;
}

interface TipoBombero {
  id: string;
  nombre: string;
  prefijo: string;
  orden: number;
}

interface Catalogo {
  id: string;
  nombre: string;
}

type Columna = 'codigo' | 'nombre' | 'tipo' | 'rango' | 'cargo' | 'estado';

const ESTADOS = ['ASPIRANTE', 'ACTIVO', 'SUSPENDIDO', 'LICENCIA', 'RETIRADO', 'FALLECIDO', 'HONORARIO'];

/** Extrae la parte numerica del codigo bomberil como entero real (nunca como
 * texto), quitando primero el prefijo institucional del tipo asociado. */
function extraerNumeroCodigo(numeroBombero: string, prefijo: string | undefined): number {
  const resto = prefijo && numeroBombero.startsWith(prefijo) ? numeroBombero.slice(prefijo.length) : numeroBombero;
  const match = resto.match(/\d+/);
  return match ? parseInt(match[0], 10) : Number.MAX_SAFE_INTEGER;
}

/** Orden institucional: prioridad del Tipo de Bombero (parametrizada, campo
 * `orden` de personal.tipos_bombero) y despues numero de codigo ascendente
 * real. Nunca se adivina el tipo a partir del texto del codigo. */
function compararInstitucional(a: Bombero, b: Bombero, tipoPorId: Map<string, TipoBombero>): number {
  const tipoA = a.tipoBomberoId ? tipoPorId.get(a.tipoBomberoId) : undefined;
  const tipoB = b.tipoBomberoId ? tipoPorId.get(b.tipoBomberoId) : undefined;
  const ordenA = tipoA?.orden ?? Number.MAX_SAFE_INTEGER;
  const ordenB = tipoB?.orden ?? Number.MAX_SAFE_INTEGER;
  if (ordenA !== ordenB) return ordenA - ordenB;
  const numA = extraerNumeroCodigo(a.numeroBombero, tipoA?.prefijo);
  const numB = extraerNumeroCodigo(b.numeroBombero, tipoB?.prefijo);
  if (numA !== numB) return numA - numB;
  return a.numeroBombero.localeCompare(b.numeroBombero);
}

export default function PersonalPage() {
  const router = useRouter();
  const [bomberos, setBomberos] = useState<Bombero[] | null>(null);
  const [tipos, setTipos] = useState<TipoBombero[]>([]);
  const [rangos, setRangos] = useState<Catalogo[]>([]);
  const [cargos, setCargos] = useState<Catalogo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [filtroCodigo, setFiltroCodigo] = useState('');
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroTipoId, setFiltroTipoId] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroRangoId, setFiltroRangoId] = useState('');
  const [filtroCargoId, setFiltroCargoId] = useState('');

  const [sortColumn, setSortColumn] = useState<Columna | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const puedeCrear = !!obtenerSesion()?.usuario.permisos.includes('personal:crear');
  const puedeEliminar = !!obtenerSesion()?.usuario.permisos.includes('personal:eliminar');

  async function cargar() {
    try {
      const res = await apiFetch('/personal/bomberos');
      if (!res.ok) throw new Error('No se pudo cargar el listado de bomberos');
      setBomberos(await res.json());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    apiFetch('/personal/tipos-bombero')
      .then(async (res) => (res.ok ? setTipos(await res.json()) : undefined))
      .catch(() => undefined);
    apiFetch('/organizacion/rangos?estado=ACTIVO')
      .then(async (res) => (res.ok ? setRangos(await res.json()) : undefined))
      .catch(() => undefined);
    apiFetch('/organizacion/cargos?estado=ACTIVO')
      .then(async (res) => (res.ok ? setCargos(await res.json()) : undefined))
      .catch(() => undefined);
  }, []);

  const tipoPorId = useMemo(() => {
    const mapa = new Map<string, TipoBombero>();
    tipos.forEach((t) => mapa.set(t.id, t));
    return mapa;
  }, [tipos]);

  const bomberosFiltrados = useMemo(() => {
    if (!bomberos) return null;
    const codigo = filtroCodigo.trim().toLowerCase();
    const nombreTexto = filtroNombre.trim().toLowerCase();
    return bomberos.filter((b) => {
      if (codigo && !b.numeroBombero.toLowerCase().includes(codigo)) return false;
      if (nombreTexto && !`${b.nombre} ${b.apellido}`.toLowerCase().includes(nombreTexto)) return false;
      if (filtroTipoId && b.tipoBomberoId !== filtroTipoId) return false;
      if (filtroEstado && b.estado !== filtroEstado) return false;
      if (filtroRangoId && b.rangoId !== filtroRangoId) return false;
      if (filtroCargoId && b.cargoPrincipalId !== filtroCargoId) return false;
      return true;
    });
  }, [bomberos, filtroCodigo, filtroNombre, filtroTipoId, filtroEstado, filtroRangoId, filtroCargoId]);

  const bomberosOrdenados = useMemo(() => {
    if (!bomberosFiltrados) return null;
    const copia = [...bomberosFiltrados];
    const dir = sortDirection === 'desc' ? -1 : 1;

    if (!sortColumn) {
      copia.sort((a, b) => compararInstitucional(a, b, tipoPorId));
      return copia;
    }

    copia.sort((a, b) => {
      switch (sortColumn) {
        case 'codigo':
          return dir * compararInstitucional(a, b, tipoPorId);
        case 'nombre':
          return dir * `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`);
        case 'tipo': {
          const ta = (a.tipoBomberoId ? tipoPorId.get(a.tipoBomberoId)?.prefijo : '') ?? '';
          const tb = (b.tipoBomberoId ? tipoPorId.get(b.tipoBomberoId)?.prefijo : '') ?? '';
          return dir * ta.localeCompare(tb);
        }
        case 'rango':
          return dir * (a.rango ?? '').localeCompare(b.rango ?? '');
        case 'cargo':
          return dir * (a.cargo ?? '').localeCompare(b.cargo ?? '');
        case 'estado':
          return dir * a.estado.localeCompare(b.estado);
        default:
          return 0;
      }
    });
    return copia;
  }, [bomberosFiltrados, sortColumn, sortDirection, tipoPorId]);

  function ordenarPor(columna: Columna) {
    if (sortColumn === columna) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columna);
      setSortDirection('asc');
    }
  }

  function limpiarFiltros() {
    setFiltroCodigo('');
    setFiltroNombre('');
    setFiltroTipoId('');
    setFiltroEstado('');
    setFiltroRangoId('');
    setFiltroCargoId('');
    setSortColumn(null);
    setSortDirection('asc');
  }

  function flecha(columna: Columna) {
    if (sortColumn !== columna) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  }

  async function darBaja(id: string, nombreCompleto: string) {
    const motivo = window.prompt(`Motivo de la baja de ${nombreCompleto}:`);
    if (!motivo) return;
    setError(null);
    setMensaje(null);
    const res = await apiFetch(`/personal/bomberos/${id}/baja`, {
      method: 'PATCH',
      body: JSON.stringify({ motivo }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo dar de baja al bombero');
      return;
    }
    setMensaje('Bombero dado de baja');
    await cargar();
  }

  const th = (columna: Columna, label: string) => (
    <th
      style={{ padding: '6px 4px', cursor: 'pointer', userSelect: 'none' }}
      onClick={() => ordenarPor(columna)}
      title="Ordenar"
    >
      {label}
      {flecha(columna)}
    </th>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Personal - Bomberos ({bomberosOrdenados?.length ?? 0})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn-primary"
            onClick={() => descargarArchivo(`/personal/bomberos/exportar/excel${filtroEstado ? `?estado=${filtroEstado}` : ''}`, 'personal.xlsx')}
          >
            Exportar a Excel
          </button>
          <button
            className="btn-primary"
            onClick={() => descargarArchivo(`/personal/bomberos/exportar/pdf${filtroEstado ? `?estado=${filtroEstado}` : ''}`, 'personal.pdf')}
          >
            Exportar a PDF
          </button>
          {puedeCrear && (
            <Link href="/dashboard/personal/nuevo" className="btn-primary" style={{ textDecoration: 'none' }}>
              + Agregar Bombero
            </Link>
          )}
        </div>
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Codigo</label>
          <input
            className="input-field"
            style={{ maxWidth: 160 }}
            placeholder="Ej: BCF, BC-102..."
            value={filtroCodigo}
            onChange={(e) => setFiltroCodigo(e.target.value)}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Nombre / Apellido</label>
          <input
            className="input-field"
            style={{ maxWidth: 200 }}
            placeholder="Buscar por nombre o apellido"
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Tipo de Bombero</label>
          <select className="input-field" style={{ maxWidth: 220 }} value={filtroTipoId} onChange={(e) => setFiltroTipoId(e.target.value)}>
            <option value="">NINGUNA</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.prefijo} — {t.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Estado</label>
          <select className="input-field" style={{ maxWidth: 160 }} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">NINGUNA</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Rango</label>
          <select className="input-field" style={{ maxWidth: 180 }} value={filtroRangoId} onChange={(e) => setFiltroRangoId(e.target.value)}>
            <option value="">NINGUNA</option>
            {rangos.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Cargo</label>
          <select className="input-field" style={{ maxWidth: 180 }} value={filtroCargoId} onChange={(e) => setFiltroCargoId(e.target.value)}>
            <option value="">NINGUNA</option>
            {cargos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary" style={{ background: '#475569' }} onClick={limpiarFiltros}>
          Limpiar filtros
        </button>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {bomberosOrdenados && bomberosOrdenados.length === 0 && (
        <p style={{ color: '#94a3b8', fontSize: 13 }}>No hay bomberos que coincidan con los filtros.</p>
      )}

      {bomberosOrdenados && bomberosOrdenados.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              {th('codigo', 'Codigo')}
              {th('nombre', 'Nombre')}
              {th('tipo', 'Tipo')}
              {th('rango', 'Rango')}
              {th('cargo', 'Cargo')}
              {th('estado', 'Estado')}
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {bomberosOrdenados.map((b) => {
              const nombreCompleto = `${b.nombre} ${b.apellido}`;
              const tipo = b.tipoBomberoId ? tipoPorId.get(b.tipoBomberoId) : undefined;
              return (
                <tr
                  key={b.id}
                  onClick={() => router.push(`/dashboard/personal/${b.id}`)}
                  style={{ borderBottom: '1px solid #1f2937', cursor: 'pointer' }}
                >
                  <td style={{ padding: '6px 4px' }}>{b.numeroBombero}</td>
                  <td style={{ padding: '6px 4px' }}>{nombreCompleto}</td>
                  <td style={{ padding: '6px 4px' }}>{tipo?.prefijo ?? '-'}</td>
                  <td style={{ padding: '6px 4px' }}>{b.rango}</td>
                  <td style={{ padding: '6px 4px' }}>{b.cargo ?? ''}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge">{b.estado}</span>
                  </td>
                  <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 12 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/personal/${b.id}`);
                      }}
                    >
                      Ver expediente
                    </button>
                    {puedeEliminar && b.estado !== 'RETIRADO' && (
                      <button
                        className="btn-primary"
                        style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          darBaja(b.id, nombreCompleto);
                        }}
                      >
                        Dar de baja
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
