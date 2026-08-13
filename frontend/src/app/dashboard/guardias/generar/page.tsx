'use client';

import { useState } from 'react';
import Link from 'next/link';
import { API_ORIGIN, descargarArchivo, obtenerSesion } from '@/lib/api';
import { OrdenGuardia, ResultadoGeneracion, crearOrdenGuardia, generarDocumentosOrden, generarPlanificacion } from '@/lib/guardias';

export default function GenerarPlanificacionPage() {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [permitirRepetirIntegrantes, setPermitirRepetirIntegrantes] = useState(false);
  const [regenerarExistentes, setRegenerarExistentes] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoGeneracion | null>(null);
  const [ordenGenerada, setOrdenGenerada] = useState<OrdenGuardia | null>(null);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const puedeGenerar = !!obtenerSesion()?.usuario.permisos.includes('guardias:crear');
  const puedeCrearOrden = !!obtenerSesion()?.usuario.permisos.includes('guardias:ordenes_crear');
  const puedeGenerarDocumentos = !!obtenerSesion()?.usuario.permisos.includes('guardias:ordenes_editar');
  const rangoEsDeUnMes = desde.length >= 7 && hasta.length >= 7 && desde.slice(0, 7) === hasta.slice(0, 7);

  async function generar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResultado(null);
    setOrdenGenerada(null);
    setGenerando(true);
    try {
      const r = await generarPlanificacion({ desde, hasta, permitirRepetirIntegrantes, regenerarExistentes });
      setResultado(r);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerando(false);
    }
  }

  async function crearOrdenYPdf() {
    if (!rangoEsDeUnMes) return;
    setError(null);
    setGenerandoPdf(true);
    try {
      const anio = Number(desde.slice(0, 4));
      const mes = Number(desde.slice(5, 7));
      const orden = await crearOrdenGuardia({
        anio,
        mes,
        periodoDesde: desde,
        periodoHasta: hasta,
        fechaEmision: new Date().toISOString().slice(0, 10),
      });
      const ordenConDocumentos = await generarDocumentosOrden(orden.id);
      setOrdenGenerada(ordenConDocumentos);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerandoPdf(false);
    }
  }

  async function descargarPdf() {
    if (!ordenGenerada?.archivoPdfUrl) return;
    try {
      await descargarArchivo(ordenGenerada.archivoPdfUrl, `orden-guardia-${ordenGenerada.numero}-${ordenGenerada.anio}.pdf`);
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (!puedeGenerar) {
    return <p style={{ color: '#94a3b8', fontSize: 13 }}>No tenes permiso para generar la planificacion de guardias.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900 }}>
      <h2 style={{ fontSize: 16 }}>Generar planificacion de guardias</h2>
      <p style={{ fontSize: 13, color: '#94a3b8' }}>
        Este generador es un <strong>asistente de planificacion, no una imposicion absoluta</strong>: propone
        guardias respetando la rotacion de grupos configurada, la frecuencia mensual y el dia preferente de cada
        persona, y las reglas de elegibilidad de oficial/chofer — pero nunca asigna a alguien no habilitado. Cada
        guardia generada queda inmediatamente visible y editable/anulable como cualquier otra; revise las
        advertencias antes de darla por definitiva.
      </p>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      <form className="card" onSubmit={generar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Desde</label>
            <input className="input-field" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Hasta</label>
            <input className="input-field" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} required />
          </div>
        </div>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={permitirRepetirIntegrantes} onChange={(e) => setPermitirRepetirIntegrantes(e.target.checked)} />
          Permitir repetir integrantes (ignora el ciclo de rotacion de los grupos)
        </label>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={regenerarExistentes} onChange={(e) => setRegenerarExistentes(e.target.checked)} />
          Regenerar guardias ya planificadas en el rango (las anteriores quedan anuladas, nunca se borran)
        </label>
        <button className="btn-primary" disabled={generando} style={{ alignSelf: 'flex-start' }}>
          {generando ? 'Generando...' : 'Generar planificacion'}
        </button>
      </form>

      {resultado && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <span className="badge" style={{ background: '#166534' }}>{resultado.guardiasCreadas} guardias creadas</span>
            <span className="badge">{resultado.personasAsignadas} personas asignadas</span>
            {resultado.advertencias.length > 0 && (
              <span className="badge" style={{ background: '#854d0e' }}>{resultado.advertencias.length} advertencias</span>
            )}
          </div>

          {resultado.advertencias.length > 0 && (
            <div>
              <h3 style={{ fontSize: 14, marginBottom: 6 }}>Advertencias</h3>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
                Ninguna advertencia bloquea la generacion: indican donde el asistente no pudo resolver algo
                automaticamente (falta de personal habilitado, grupo aun no disponible, etc.) y que requiere
                revision manual.
              </p>
              <ul style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 18 }}>
                {resultado.advertencias.map((a, i) => (
                  <li key={i} style={{ color: '#fbbf24' }}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {resultado.guardiaIds.length > 0 && (
            <div>
              <h3 style={{ fontSize: 14, marginBottom: 6 }}>Guardias generadas</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {resultado.guardiaIds.map((id) => (
                  <Link key={id} href={`/dashboard/guardias/${id}`} className="badge" style={{ textDecoration: 'none' }}>
                    Ver guardia
                  </Link>
                ))}
              </div>
            </div>
          )}

          {puedeCrearOrden && puedeGenerarDocumentos && (
            <div style={{ borderTop: '1px solid #334155', paddingTop: 12 }}>
              <h3 style={{ fontSize: 14, marginBottom: 6 }}>Orden oficial y PDF</h3>
              {rangoEsDeUnMes ? (
                <>
                  <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
                    {resultado.guardiasCreadas > 0
                      ? 'Cree la Orden de Guardia para este periodo y genere el PDF con el membrete institucional configurado.'
                      : 'Las guardias de este periodo ya estaban planificadas. Puede crear la Orden y el PDF con membrete usando esas guardias existentes.'}
                  </p>
                  {!ordenGenerada ? (
                    <button className="btn-primary" disabled={generandoPdf} onClick={crearOrdenYPdf}>
                      {generandoPdf ? 'Generando PDF...' : 'Generar orden y PDF con membrete'}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Link href={`/dashboard/guardias/ordenes/${ordenGenerada.id}`} className="btn-primary" style={{ background: '#475569', textDecoration: 'none' }}>
                        Ver orden
                      </Link>
                      {ordenGenerada.archivoPdfUrl && (
                        <a href={`${API_ORIGIN}${ordenGenerada.archivoPdfUrl}`} target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>
                          Visualizar PDF
                        </a>
                      )}
                      {ordenGenerada.archivoPdfUrl && (
                        <button className="btn-primary" style={{ background: '#475569' }} onClick={descargarPdf}>
                          Descargar PDF
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p style={{ fontSize: 12, color: '#fbbf24' }}>
                  El rango generado cubre más de un mes. Cree una Orden de Guardia por cada mes desde la sección «Ordenes de Guardia».
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
