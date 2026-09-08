'use client';

import { useEffect, useMemo, useState } from 'react';
import { ComboBuscable } from '@/components/ComboBuscable';
import { BomberoResumen, TipoBombero, compararBomberosInstitucional, construirTipoPorId } from '@/lib/personal';
import { FUENTES_ASISTENCIA, MarcacionAsistencia, ResultadoMarcaciones, buscarMarcaciones } from '@/lib/asistencia';
import { Aviso } from '@/app/components/Aviso';

const PAGE_SIZE = 50;

interface Props {
  bomberos: BomberoResumen[];
  tipos: TipoBombero[];
}

export default function ConsultaMarcaciones({ bomberos, tipos }: Props) {
  const [bomberoId, setBomberoId] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [fuente, setFuente] = useState('');
  const [tipoMarcacion, setTipoMarcacion] = useState('');
  const [page, setPage] = useState(1);

  const [resultado, setResultado] = useState<ResultadoMarcaciones | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tipoPorId = useMemo(() => construirTipoPorId(tipos), [tipos]);
  const bomberoPorId = useMemo(() => new Map(bomberos.map((b) => [b.id, b])), [bomberos]);
  const opcionesBombero = useMemo(() => {
    const ordenados = [...bomberos].sort((a, b) => compararBomberosInstitucional(a, b, tipoPorId));
    return ordenados.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` }));
  }, [bomberos, tipoPorId]);

  async function buscar(paginaDestino: number) {
    setCargando(true);
    setError(null);
    try {
      const res = await buscarMarcaciones({
        bomberoId: bomberoId || undefined,
        desde: desde ? `${desde}T00:00:00.000Z` : undefined,
        hasta: hasta ? `${hasta}T23:59:59.999Z` : undefined,
        fuente: fuente || undefined,
        tipoMarcacion: tipoMarcacion || undefined,
        page: paginaDestino,
        pageSize: PAGE_SIZE,
      });
      setResultado(res);
      setPage(paginaDestino);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    buscar(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function limpiarFiltros() {
    setBomberoId('');
    setDesde('');
    setHasta('');
    setFuente('');
    setTipoMarcacion('');
    buscar(1);
  }

  const totalPaginas = resultado ? Math.max(1, Math.ceil(resultado.total / resultado.pageSize)) : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 10, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Bombero</label>
            <ComboBuscable ariaLabel="Bombero"
              opciones={opcionesBombero}
              value={bomberoId}
              onChange={setBomberoId}
              placeholderBusqueda="Buscar por codigo o nombre..."
              ningunaLabel="Todos"
            />
          </div>
          <div>
            <label htmlFor="desde" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Desde</label>
            <input id="desde" className="input-field" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div>
            <label htmlFor="hasta" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Hasta</label>
            <input id="hasta" className="input-field" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
          <div>
            <label htmlFor="fuente" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Fuente</label>
            <select id="fuente" className="input-field" value={fuente} onChange={(e) => setFuente(e.target.value)}>
              <option value="">Todas</option>
              {FUENTES_ASISTENCIA.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tipo" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Tipo</label>
            <select id="tipo" className="input-field" value={tipoMarcacion} onChange={(e) => setTipoMarcacion(e.target.value)}>
              <option value="">Todos</option>
              <option value="ENTRADA">ENTRADA</option>
              <option value="SALIDA">SALIDA</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn-primary" disabled={cargando} onClick={() => buscar(1)}>
            {cargando ? 'Buscando...' : 'Buscar'}
          </button>
          <button type="button"
            onClick={limpiarFiltros}
            style={{ background: 'transparent', border: '1px solid var(--line)', borderRadius: 6, padding: '8px 14px', color: 'var(--ink)' }}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {error && <Aviso tipo="error" texto={error} />}

      {resultado && (
        <>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            Mostrando {resultado.items.length} de {resultado.total} marcaciones (pagina {resultado.page} de {totalPaginas})
          </p>

          {resultado.items.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin marcaciones para los filtros seleccionados.</p>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                    <th scope="col" style={{ padding: '6px 8px' }}>Fecha/Hora</th>
                    <th scope="col" style={{ padding: '6px 8px' }}>Bombero</th>
                    <th scope="col" style={{ padding: '6px 8px' }}>Tipo</th>
                    <th scope="col" style={{ padding: '6px 8px' }}>Método</th>
                    <th scope="col" style={{ padding: '6px 8px' }}>Fuente</th>
                    <th scope="col" style={{ padding: '6px 8px' }}>Evento</th>
                    <th scope="col" style={{ padding: '6px 8px' }}>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.items.map((m: MarcacionAsistencia) => {
                    const b = bomberoPorId.get(m.bomberoId);
                    return (
                      <tr key={m.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                        <td style={{ padding: '6px 8px' }}>{new Date(m.timestampMarcacion).toLocaleString()}</td>
                        <td style={{ padding: '6px 8px' }}>{b ? `${b.numeroBombero} — ${b.nombre} ${b.apellido}` : m.bomberoId}</td>
                        <td style={{ padding: '6px 8px' }}>
                          <span className="badge" style={{ background: m.tipoMarcacion === 'ENTRADA' ? 'var(--ok-fill)' : 'var(--bad-fill)' }}>
                            {m.tipoMarcacion}
                          </span>
                        </td>
                        <td style={{ padding: '6px 8px' }}>{m.metodo}</td>
                        <td style={{ padding: '6px 8px' }}>{m.fuente}</td>
                        <td style={{ padding: '6px 8px' }}>{m.eventoId ? 'Si' : '—'}</td>
                        <td style={{ padding: '6px 8px', color: 'var(--muted)' }}>{m.observaciones ?? m.motivo ?? ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPaginas > 1 && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button type="button"
                disabled={cargando || page <= 1}
                onClick={() => buscar(page - 1)}
                style={{ background: 'transparent', border: '1px solid var(--line)', borderRadius: 6, padding: '6px 12px', color: 'var(--ink)' }}
              >
                Anterior
              </button>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Pagina {page} de {totalPaginas}</span>
              <button type="button"
                disabled={cargando || page >= totalPaginas}
                onClick={() => buscar(page + 1)}
                style={{ background: 'transparent', border: '1px solid var(--line)', borderRadius: 6, padding: '6px 12px', color: 'var(--ink)' }}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
