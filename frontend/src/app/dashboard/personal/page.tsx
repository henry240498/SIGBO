'use client';

import { useEffect, useMemo, useState } from 'react';
import { useEntradaConfirmada } from '@/app/components/InputProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, obtenerSesion } from '@/lib/api';
import { descargarArchivo } from '@/lib/exportar';
import { coincideBusqueda } from '@/lib/texto';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Paginador, usePaginacion } from '@/app/components/Paginador';
import {
  BomberoResumen,
  Catalogo,
  ESTADOS_BOMBERO,
  TipoBombero,
  cargarBomberos,
  cargarCatalogo,
  cargarTiposBombero,
  compararBomberosInstitucional,
  construirTipoPorId,
} from '@/lib/personal';
import { Aviso } from '@/app/components/Aviso';

type Columna = 'codigo' | 'nombre' | 'tipo' | 'rango' | 'cargo' | 'estado';

export default function PersonalPage() {
  const solicitarEntrada = useEntradaConfirmada();
  const router = useRouter();
  const [bomberos, setBomberos] = useState<BomberoResumen[] | null>(null);
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
      setBomberos(await cargarBomberos());
    } catch (err: any) {
      setError(err.message ?? 'No se pudo cargar el listado de bomberos');
    }
  }

  useEffect(() => {
    cargar();
    cargarTiposBombero().then(setTipos);
    cargarCatalogo('/organizacion/rangos').then(setRangos);
    cargarCatalogo('/organizacion/cargos').then(setCargos);
  }, []);

  const tipoPorId = useMemo(() => construirTipoPorId(tipos), [tipos]);

  const opcionesTipo = useMemo(
    () => tipos.map((t) => ({ value: t.id, label: `${t.prefijo} — ${t.nombre}` })),
    [tipos],
  );
  const opcionesEstado = useMemo(() => ESTADOS_BOMBERO.map((e) => ({ value: e, label: e })), []);
  const opcionesRango = useMemo(() => rangos.map((r) => ({ value: r.id, label: r.nombre })), [rangos]);
  const opcionesCargo = useMemo(() => cargos.map((c) => ({ value: c.id, label: c.nombre })), [cargos]);

  const bomberosFiltrados = useMemo(() => {
    if (!bomberos) return null;
    return bomberos.filter((b) => {
      if (filtroCodigo && !coincideBusqueda(b.numeroBombero, filtroCodigo)) return false;
      if (filtroNombre && !coincideBusqueda(`${b.nombre} ${b.apellido}`, filtroNombre)) return false;
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
      copia.sort((a, b) => compararBomberosInstitucional(a, b, tipoPorId));
      return copia;
    }

    copia.sort((a, b) => {
      switch (sortColumn) {
        case 'codigo':
          return dir * compararBomberosInstitucional(a, b, tipoPorId);
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

  // El listado trae el cuadro completo en una consulta: se muestra de a paginas para no
  // dibujar cientos de filas de una vez.
  const paginado = usePaginacion(bomberosOrdenados ?? []);

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
    const motivo = await solicitarEntrada({ titulo: 'Dar de baja personal', mensaje: `La baja de ${nombreCompleto} requiere un motivo.`, etiqueta: 'Motivo', confirmar: 'Continuar', peligro: true, requerida: true });
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
      scope="col"
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
          <button type="button"
            className="btn-primary"
            onClick={() => descargarArchivo(`/personal/bomberos/exportar/excel${filtroEstado ? `?estado=${filtroEstado}` : ''}`, 'personal.xlsx')}
          >
            Exportar a Excel
          </button>
          <button type="button"
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
          <label htmlFor="codigo" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Código</label>
          <input id="codigo"
            className="input-field"
            style={{ maxWidth: 160 }}
            placeholder="Ej: BCF, BC-102..."
            value={filtroCodigo}
            onChange={(e) => setFiltroCodigo(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="nombre-apellido" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Nombre / Apellido</label>
          <input id="nombre-apellido"
            className="input-field"
            style={{ maxWidth: 200 }}
            placeholder="Buscar por nombre o apellido"
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Tipo de Bombero</label>
          <ComboBuscable ariaLabel="Tipo de Bombero"
            opciones={opcionesTipo}
            value={filtroTipoId}
            onChange={setFiltroTipoId}
            placeholderBusqueda="Buscar tipo..."
            maxWidth={230}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Estado</label>
          <ComboBuscable ariaLabel="Estado"
            opciones={opcionesEstado}
            value={filtroEstado}
            onChange={setFiltroEstado}
            placeholderBusqueda="Buscar estado..."
            maxWidth={170}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Rango</label>
          <ComboBuscable ariaLabel="Rango"
            opciones={opcionesRango}
            value={filtroRangoId}
            onChange={setFiltroRangoId}
            placeholderBusqueda="Buscar rango..."
            maxWidth={190}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Cargo</label>
          <ComboBuscable ariaLabel="Cargo"
            opciones={opcionesCargo}
            value={filtroCargoId}
            onChange={setFiltroCargoId}
            placeholderBusqueda="Buscar cargo..."
            maxWidth={190}
          />
        </div>
        <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={limpiarFiltros}>
          Limpiar filtros
        </button>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {bomberosOrdenados && bomberosOrdenados.length === 0 && (
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay bomberos que coincidan con los filtros.</p>
      )}

      {bomberosOrdenados && bomberosOrdenados.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              {th('codigo', 'Codigo')}
              {th('nombre', 'Nombre')}
              {th('tipo', 'Tipo')}
              {th('rango', 'Rango')}
              {th('cargo', 'Cargo')}
              {th('estado', 'Estado')}
              <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginado.visibles.map((b) => {
              const nombreCompleto = `${b.nombre} ${b.apellido}`;
              const tipo = b.tipoBomberoId ? tipoPorId.get(b.tipoBomberoId) : undefined;
              return (
                <tr
                  key={b.id}
                  onClick={() => router.push(`/dashboard/personal/${b.id}`)}
                  style={{ borderBottom: '1px solid var(--line-soft)', cursor: 'pointer' }}
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
                    <button type="button"
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
                      <button type="button"
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
      {bomberosOrdenados && bomberosOrdenados.length > 0 && (
        <Paginador {...paginado} mostrados={paginado.visibles.length} etiqueta="bomberos" />
      )}
    </div>
  );
}
