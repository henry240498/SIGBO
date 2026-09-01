'use client';

import { useEffect, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import {
  EstadoFilaImportacion,
  ESTADOS_FILA_IMPORTACION,
  ImportacionMarcador,
  ImportacionMarcadorFila,
  analizarImportacionMarcador,
  cancelarImportacion,
  confirmarImportacion,
  listarFilasImportacion,
  listarHistorialImportaciones,
} from '@/lib/asistencia';

const COLOR_ESTADO: Record<EstadoFilaImportacion, string> = {
  RECONOCIDO: 'var(--ok-fill)',
  NO_IDENTIFICADO: 'var(--bad-fill)',
  DUPLICADO: 'var(--warn-fill)',
  YA_IMPORTADO: 'var(--neutral-fill)',
  INCONSISTENTE: 'var(--bad-fill)',
};

const COLOR_ESTADO_IMPORTACION: Record<string, string> = {
  ANALIZADO: 'var(--warn-fill)',
  CONFIRMADO: 'var(--ok-fill)',
  CANCELADO: 'var(--neutral-fill)',
};

function TarjetaResumen({ etiqueta, valor, color }: { etiqueta: string; valor: number; color?: string }) {
  return (
    <div className="card" style={{ padding: '10px 14px', minWidth: 120 }}>
      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{etiqueta}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color ?? 'var(--ink)' }}>{valor}</div>
    </div>
  );
}

export default function ImportarMarcador() {
  const puedeImportar = !!obtenerSesion()?.usuario.permisos.includes('asistencia:importar_marcador');

  const [archivo, setArchivo] = useState<File | null>(null);
  const [analizando, setAnalizando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState<ImportacionMarcador | null>(null);
  const [filas, setFilas] = useState<ImportacionMarcadorFila[] | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoFilaImportacion | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [historial, setHistorial] = useState<ImportacionMarcador[]>([]);

  async function cargarHistorial() {
    try {
      setHistorial(await listarHistorialImportaciones());
    } catch {
      // el historial es informativo; si falla, simplemente no se muestra
    }
  }

  useEffect(() => {
    cargarHistorial();
  }, []);

  const filasFiltradas = useMemo(() => {
    if (!filas) return [];
    return filtroEstado ? filas.filter((f) => f.estadoFila === filtroEstado) : filas;
  }, [filas, filtroEstado]);

  async function analizar() {
    if (!archivo) return;
    setError(null);
    setMensaje(null);
    setAnalizando(true);
    setResultado(null);
    setFilas(null);
    try {
      const res = await analizarImportacionMarcador(archivo);
      setResultado(res);
      setFilas(await listarFilasImportacion(res.id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalizando(false);
    }
  }

  async function confirmar() {
    if (!resultado) return;
    setError(null);
    setProcesando(true);
    try {
      const actualizado = await confirmarImportacion(resultado.id);
      setResultado(actualizado);
      setMensaje(`Importacion confirmada: ${actualizado.registrosImportados ?? 0} marcaciones registradas.`);
      await cargarHistorial();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  async function cancelar() {
    if (!resultado) return;
    setError(null);
    setProcesando(true);
    try {
      const actualizado = await cancelarImportacion(resultado.id);
      setResultado(actualizado);
      setMensaje('Importacion cancelada. No se registro ninguna marcacion.');
      await cargarHistorial();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  if (!puedeImportar) {
    return <p style={{ color: 'var(--muted)', fontSize: 13 }}>No tienes permiso para importar el marcador biometrico (se requiere asistencia:importar_marcador).</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Sube el Excel .xlsx exportado directamente del reloj biométrico. Se analiza la hoja "Logs" completa,
          discriminando cada marcacion individual por bombero + fecha/hora exacta, y se compara contra Personal antes
          de guardar nada. No se crea ningun bombero nuevo automaticamente: los codigos que no coincidan quedan como
          PERSONAL NO IDENTIFICADO para revision manual.
        </p>
        {error && <p role="alert" style={{ color: 'var(--danger)' }}>{error}</p>}
        {mensaje && <p role="status" aria-live="polite" style={{ color: 'var(--success)', fontSize: 13 }}>{mensaje}</p>}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(e) => {
              setArchivo(e.target.files?.[0] ?? null);
              setResultado(null);
              setFilas(null);
              setMensaje(null);
            }}
          />
          <button type="button" className="btn-primary" disabled={!archivo || analizando} onClick={analizar}>
            {analizando ? 'Analizando...' : 'Analizar archivo'}
          </button>
        </div>
      </div>

      {resultado && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              className="badge"
              style={{ background: COLOR_ESTADO_IMPORTACION[resultado.estado] ?? 'var(--neutral-fill)', fontSize: 13 }}
            >
              {resultado.estado}
            </span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              {resultado.archivoNombre} — {resultado.hojasEncontradas} hojas analizadas — subido{' '}
              {new Date(resultado.fechaImportacion).toLocaleString()}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <TarjetaResumen etiqueta="Encontrados" valor={resultado.registrosEncontrados} />
            <TarjetaResumen etiqueta="Reconocidos" valor={resultado.registrosReconocidos} color="var(--success)" />
            <TarjetaResumen etiqueta="No identificados" valor={resultado.registrosNoIdentificados} color="var(--danger)" />
            <TarjetaResumen etiqueta="Duplicados" valor={resultado.registrosDuplicados} color="var(--warning)" />
            <TarjetaResumen etiqueta="Inconsistentes" valor={resultado.registrosConInconsistencias} color="var(--danger)" />
            {resultado.registrosImportados !== null && (
              <TarjetaResumen etiqueta="Importados" valor={resultado.registrosImportados} color="var(--success)" />
            )}
          </div>

          {resultado.estado === 'ANALIZADO' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn-primary" disabled={procesando} onClick={confirmar}>
                {procesando ? 'Confirmando...' : `Confirmar e importar ${resultado.registrosReconocidos} marcaciones`}
              </button>
              <button
                type="button"
                disabled={procesando}
                onClick={cancelar}
                style={{ background: 'transparent', border: '1px solid var(--line)', borderRadius: 6, padding: '8px 14px', color: 'var(--ink)' }}
              >
                Cancelar importacion
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label htmlFor="filtrar-previsualizacion-por-estado" style={{ fontSize: 12 }}>Filtrar previsualizacion por estado:</label>
            <select id="filtrar-previsualizacion-por-estado" className="input-field" style={{ maxWidth: 220 }} value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as EstadoFilaImportacion | '')}>
              <option value="">Todas ({filas?.length ?? 0})</option>
              {ESTADOS_FILA_IMPORTACION.map((e) => (
                <option key={e} value={e}>
                  {e} ({filas?.filter((f) => f.estadoFila === e).length ?? 0})
                </option>
              ))}
            </select>
          </div>

          <div className="card" style={{ maxHeight: 480, overflowY: 'auto', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--surface-soft)' }}>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                  <th scope="col" style={{ padding: '6px 8px' }}>Codigo detectado</th>
                  <th scope="col" style={{ padding: '6px 8px' }}>Bombero</th>
                  <th scope="col" style={{ padding: '6px 8px' }}>Tipo</th>
                  <th scope="col" style={{ padding: '6px 8px' }}>Fecha/Hora</th>
                  <th scope="col" style={{ padding: '6px 8px' }}>Estado</th>
                  <th scope="col" style={{ padding: '6px 8px' }}>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {filasFiltradas.map((f) => (
                  <tr key={f.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td style={{ padding: '6px 8px' }}>{f.codigoDetectado ?? ''}</td>
                    <td style={{ padding: '6px 8px' }}>
                      {f.bomberoIdResuelto ? `${f.codigoBombero} — ${f.nombreBombero}` : (
                        <span style={{ color: 'var(--danger)' }}>PERSONAL NO IDENTIFICADO</span>
                      )}
                    </td>
                    <td style={{ padding: '6px 8px' }}>{f.tipoMarcacionDetectado ?? ''}</td>
                    <td style={{ padding: '6px 8px' }}>{f.timestampDetectado ? new Date(f.timestampDetectado).toLocaleString() : ''}</td>
                    <td style={{ padding: '6px 8px' }}>
                      <span className="badge" style={{ background: COLOR_ESTADO[f.estadoFila] }}>{f.estadoFila}</span>
                    </td>
                    <td style={{ padding: '6px 8px', color: 'var(--muted)' }}>{f.motivo ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h3 style={{ fontSize: 14, marginBottom: 8 }}>Historial de importaciones</h3>
        {historial.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Todavia no se importo ningun archivo del marcador.</p>}
        {historial.length > 0 && (
          <div className="card" style={{ padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                  <th scope="col" style={{ padding: '6px 8px' }}>Fecha</th>
                  <th scope="col" style={{ padding: '6px 8px' }}>Archivo</th>
                  <th scope="col" style={{ padding: '6px 8px' }}>Encontrados</th>
                  <th scope="col" style={{ padding: '6px 8px' }}>Reconocidos</th>
                  <th scope="col" style={{ padding: '6px 8px' }}>No identif.</th>
                  <th scope="col" style={{ padding: '6px 8px' }}>Duplicados</th>
                  <th scope="col" style={{ padding: '6px 8px' }}>Importados</th>
                  <th scope="col" style={{ padding: '6px 8px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((h) => (
                  <tr key={h.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td style={{ padding: '6px 8px' }}>{new Date(h.fechaImportacion).toLocaleString()}</td>
                    <td style={{ padding: '6px 8px' }}>{h.archivoNombre}</td>
                    <td style={{ padding: '6px 8px' }}>{h.registrosEncontrados}</td>
                    <td style={{ padding: '6px 8px' }}>{h.registrosReconocidos}</td>
                    <td style={{ padding: '6px 8px' }}>{h.registrosNoIdentificados}</td>
                    <td style={{ padding: '6px 8px' }}>{h.registrosDuplicados}</td>
                    <td style={{ padding: '6px 8px' }}>{h.registrosImportados ?? '—'}</td>
                    <td style={{ padding: '6px 8px' }}>
                      <span className="badge" style={{ background: COLOR_ESTADO_IMPORTACION[h.estado] ?? 'var(--neutral-fill)' }}>{h.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
