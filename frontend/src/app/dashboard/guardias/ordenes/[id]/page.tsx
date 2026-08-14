'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_ORIGIN, descargarArchivo, obtenerSesion } from '@/lib/api';
import {
  OrdenGuardia,
  OrdenGuardiaModificacion,
  OrdenGuardiaSnapshot,
  anularOrden,
  aprobarOrden,
  cargarOrdenGuardia,
  generarDocumentosOrden,
  listarModificacionesOrden,
  publicarOrden,
  regenerarPreviewOrden,
  registrarModificacionOrden,
  revisarOrden,
  volverABorradorOrden,
} from '@/lib/guardias';

const COLOR_ESTADO: Record<string, string> = {
  BORRADOR: '#334155',
  REVISADA: '#1d4ed8',
  APROBADA: '#854d0e',
  PUBLICADA: '#166534',
  ANULADA: '#7f1d1d',
};

export default function DetalleOrdenGuardiaPage() {
  const params = useParams();
  const router = useRouter();
  const ordenId = params.id as string;

  const [orden, setOrden] = useState<OrdenGuardia | null>(null);
  const [modificaciones, setModificaciones] = useState<OrdenGuardiaModificacion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('guardias:ordenes_editar');
  const puedeAprobar = !!obtenerSesion()?.usuario.permisos.includes('guardias:ordenes_aprobar');
  const puedePublicar = !!obtenerSesion()?.usuario.permisos.includes('guardias:ordenes_publicar');
  const puedeAnular = !!obtenerSesion()?.usuario.permisos.includes('guardias:ordenes_anular');

  async function cargar() {
    try {
      const o = await cargarOrdenGuardia(ordenId);
      setOrden(o);
      if (o.estado === 'PUBLICADA') {
        setModificaciones(await listarModificacionesOrden(ordenId));
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordenId]);

  async function ejecutar(accion: () => Promise<unknown>, mensajeExito: string) {
    setError(null);
    setMensaje(null);
    setProcesando(true);
    try {
      await accion();
      setMensaje(mensajeExito);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  async function anular() {
    const motivo = window.prompt('Motivo de la anulacion:');
    if (motivo == null) return;
    if (!motivo.trim()) {
      window.alert('El motivo es obligatorio.');
      return;
    }
    await ejecutar(() => anularOrden(ordenId, motivo.trim()), 'Orden anulada');
  }

  async function descargarPdf() {
    if (!orden?.archivoPdfUrl) return;
    try {
      await descargarArchivo(orden.archivoPdfUrl, `orden-guardia-${orden.numero}-${orden.anio}.pdf`);
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (error && !orden) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!orden) return <p style={{ color: '#94a3b8' }}>Cargando orden...</p>;

  const snapshot = JSON.parse(orden.contenidoJson) as OrdenGuardiaSnapshot;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ fontSize: 18 }}>Orden de Servicio N° {orden.numero}/{orden.anio}</h2>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <span className="badge">{snapshot.nombreMes} {orden.anio}</span>
              <span className="badge">Emitida {orden.fechaEmision}</span>
              <span className="badge" style={{ background: COLOR_ESTADO[orden.estado] }}>{orden.estado}</span>
            </div>
            {orden.estado === 'ANULADA' && orden.anuladaMotivo && (
              <p style={{ fontSize: 12, color: '#f87171', marginTop: 8 }}>Motivo de anulacion: {orden.anuladaMotivo}</p>
            )}
          </div>
          <button className="btn-primary" style={{ background: '#475569' }} onClick={() => router.push('/dashboard/guardias/ordenes')}>
            Volver
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      <div className="card" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {puedeEditar && orden.estado === 'BORRADOR' && (
          <>
            <button className="btn-primary" disabled={procesando} onClick={() => ejecutar(() => regenerarPreviewOrden(ordenId), 'Vista previa regenerada')}>
              Regenerar vista previa
            </button>
            <button className="btn-primary" disabled={procesando} onClick={() => ejecutar(() => generarDocumentosOrden(ordenId), 'Documentos generados')}>
              Generar PDF/Word (borrador)
            </button>
            <button className="btn-primary" disabled={procesando} onClick={() => ejecutar(() => revisarOrden(ordenId), 'Pasada a revisada')}>
              Marcar como revisada
            </button>
          </>
        )}
        {puedeEditar && (orden.estado === 'REVISADA' || orden.estado === 'APROBADA') && (
          <button className="btn-primary" style={{ background: '#475569' }} disabled={procesando} onClick={() => ejecutar(() => volverABorradorOrden(ordenId), 'Vuelta a borrador')}>
            Volver a borrador
          </button>
        )}
        {puedeAprobar && orden.estado === 'REVISADA' && (
          <button className="btn-primary" style={{ background: '#854d0e' }} disabled={procesando} onClick={() => ejecutar(() => aprobarOrden(ordenId), 'Orden aprobada')}>
            Aprobar
          </button>
        )}
        {puedePublicar && orden.estado === 'APROBADA' && (
          <button className="btn-primary" style={{ background: '#166534' }} disabled={procesando} onClick={() => ejecutar(() => publicarOrden(ordenId), 'Orden publicada')}>
            Publicar
          </button>
        )}
        {puedeAnular && orden.estado !== 'ANULADA' && (
          <button className="btn-primary" style={{ background: '#7f1d1d' }} disabled={procesando} onClick={anular}>
            Anular
          </button>
        )}
        {orden.archivoPdfUrl && (
          <a href={`${API_ORIGIN}${orden.archivoPdfUrl}`} target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Visualizar PDF
          </a>
        )}
        {orden.archivoPdfUrl && (
          <button className="btn-primary" style={{ background: '#475569' }} onClick={descargarPdf}>
            Descargar PDF
          </button>
        )}
        {orden.archivoDocxUrl && (
          <a href={`${API_ORIGIN}${orden.archivoDocxUrl}`} target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Descargar Word
          </a>
        )}
      </div>

      <VistaPreviaOrden snapshot={snapshot} />

      {orden.estado === 'PUBLICADA' && (
        <PanelModificaciones ordenId={ordenId} modificaciones={modificaciones} puedeEditar={puedeEditar} onCambiado={cargar} />
      )}
    </div>
  );
}

function VistaPreviaOrden({ snapshot }: { snapshot: OrdenGuardiaSnapshot }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ fontSize: 15 }}>Vista previa</h3>
      <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>
        {snapshot.institucional.nombreInstitucion && (
          <p style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', marginBottom: 4 }}>{snapshot.institucional.nombreInstitucion}</p>
        )}
        {snapshot.institucional.lineasDestacadas.map((l, i) => (
          <p key={i} style={{ fontWeight: 600, margin: 0 }}>{l.texto}</p>
        ))}
        {[snapshot.institucional.direccion, snapshot.institucional.telefono, snapshot.institucional.email, snapshot.institucional.sitioWeb]
          .filter(Boolean)
          .map((linea, i) => <p key={i} style={{ margin: 0 }}>{linea}</p>)}
      </div>
      <p style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{snapshot.introduccion.textoRenderizado}</p>
      <p style={{ fontSize: 12, color: '#94a3b8' }}>{snapshot.introduccion.reglaOficialTexto}</p>
      <p style={{ fontSize: 12, color: '#94a3b8' }}>{snapshot.introduccion.reglaChoferTexto}</p>

      {snapshot.gruposRotativos.length > 0 && (
        <Seccion titulo="Grupos de guardia">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {snapshot.gruposRotativos.map((g) => (
              <div key={g.grupoId} style={{ border: '1px solid #334155', borderRadius: 6, padding: 10, fontSize: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{g.nombre}{g.diaSemana ? ` (${g.diaSemana})` : ''}</div>
                <div>Oficial a cargo: {g.oficialACargo?.nombreCompleto ?? '(sin asignar)'}</div>
                <div>Chofer: {g.chofer?.nombreCompleto ?? '(sin asignar)'}</div>
                <div style={{ marginTop: 6 }}>
                  {g.integrantes.map((i) => <div key={i.bomberoId}>- {i.nombreCompleto}</div>)}
                </div>
                <div style={{ marginTop: 6, fontWeight: 600 }}>Fechas: {g.fechasDelPeriodo.join(', ')}</div>
              </div>
            ))}
          </div>
        </Seccion>
      )}

      {snapshot.rostersIndividuales.map((r) => (
        <Seccion key={r.esquemaId} titulo={`${r.esquemaNombre} (${r.horaInicio.slice(0, 5)}-${r.horaFin.slice(0, 5)})`}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <tbody>
              {r.fechas.map((f) => (
                <tr key={f.fecha} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '4px 4px', whiteSpace: 'nowrap' }}>{f.fecha} ({f.diaSemana})</td>
                  <td style={{ padding: '4px 4px' }}>{f.asignaciones.map((a) => a.nombreCompleto).join(', ') || '(sin asignar)'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Seccion>
      ))}

      {snapshot.guardiasEspeciales.length > 0 && (
        <Seccion titulo="Guardias especiales">
          {snapshot.guardiasEspeciales.map((esp) => (
            <div key={esp.esquemaId} style={{ marginBottom: 8, fontSize: 12 }}>
              <div style={{ fontWeight: 600 }}>{esp.modalidadTexto}</div>
              {esp.ocurrencias.map((oc) => (
                <div key={oc.fecha}>&nbsp;&nbsp;{oc.fecha}: {oc.asignaciones.map((a) => a.nombreCompleto).join(', ') || '(sin asignar)'}</div>
              ))}
            </div>
          ))}
        </Seccion>
      )}

      {snapshot.conductoresDisponibles.length > 0 && (
        <Seccion titulo="Conductores disponibles al llamado">
          <p style={{ fontSize: 12 }}>
            {snapshot.conductoresDisponibles.map((c) => `${c.rango ? c.rango + ' ' : ''}${c.nombreCompleto}${c.telefono ? ` (${c.telefono})` : ''}`).join(', ')}
          </p>
        </Seccion>
      )}

      {snapshot.piePagina.texto && <p style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>{snapshot.piePagina.texto}</p>}

      {snapshot.firmantes.length > 0 && (
        <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
          {snapshot.firmantes.map((f, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 12, flex: 1 }}>
              {f.firmaDigitalUrl ? (
                <div style={{ fontSize: 10, color: '#4ade80', marginBottom: 4 }}>✓ Firma digital se insertara automaticamente</div>
              ) : (
                <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>Espacio para firma manuscrita</div>
              )}
              <div style={{ borderTop: '1px solid #94a3b8', paddingTop: 4 }}>
                {f.nombreCompleto ? `${f.rango ? f.rango + ' ' : ''}${f.nombreCompleto}` : '(cargo vacante)'}
              </div>
              <div style={{ color: '#94a3b8' }}>{f.etiquetaCargo}</div>
              {f.advertencia && <div style={{ color: '#f59e0b', fontSize: 10, marginTop: 4 }}>⚠ {f.advertencia}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, borderBottom: '1px solid #334155', paddingBottom: 4 }}>{titulo}</h4>
      {children}
    </div>
  );
}

function PanelModificaciones({
  ordenId,
  modificaciones,
  puedeEditar,
  onCambiado,
}: {
  ordenId: string;
  modificaciones: OrdenGuardiaModificacion[] | null;
  puedeEditar: boolean;
  onCambiado: () => void;
}) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [campo, setCampo] = useState('general');
  const [descripcion, setDescripcion] = useState('');
  const [valorAnterior, setValorAnterior] = useState('');
  const [valorNuevo, setValorNuevo] = useState('');
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await registrarModificacionOrden(ordenId, {
        campo,
        descripcion,
        valorAnterior: valorAnterior || undefined,
        valorNuevo: valorNuevo || undefined,
        motivo,
      });
      setDescripcion('');
      setValorAnterior('');
      setValorNuevo('');
      setMotivo('');
      setMostrarForm(false);
      onCambiado();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 15 }}>Modificaciones ({modificaciones?.length ?? 0})</h3>
        {puedeEditar && (
          <button className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setMostrarForm((v) => !v)}>
            {mostrarForm ? 'Cancelar' : 'Registrar modificacion'}
          </button>
        )}
      </div>
      <p style={{ fontSize: 12, color: '#94a3b8' }}>
        Esta orden ya fue publicada y quedo congelada. Un cambio posterior (ej. traslado de un feriado, reemplazo de
        responsable) se registra aca sin alterar el documento original.
      </p>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {mostrarForm && (
        <form className="card" onSubmit={agregar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Campo</label>
              <select className="input-field" value={campo} onChange={(e) => setCampo(e.target.value)}>
                <option value="general">General</option>
                <option value="feriado">Feriado</option>
                <option value="asignacion">Asignacion</option>
                <option value="grupo">Grupo</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripcion</label>
              <input className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Valor anterior (opcional)</label>
              <input className="input-field" value={valorAnterior} onChange={(e) => setValorAnterior(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Valor nuevo (opcional)</label>
              <input className="input-field" value={valorNuevo} onChange={(e) => setValorNuevo(e.target.value)} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo</label>
            <input className="input-field" value={motivo} onChange={(e) => setMotivo(e.target.value)} required />
          </div>
          <button className="btn-primary" disabled={guardando} style={{ alignSelf: 'flex-start' }}>
            {guardando ? 'Guardando...' : 'Registrar'}
          </button>
        </form>
      )}

      {modificaciones && modificaciones.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>Sin modificaciones registradas.</p>}
      {modificaciones && modificaciones.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Fecha</th>
              <th style={{ padding: '6px 4px' }}>Campo</th>
              <th style={{ padding: '6px 4px' }}>Descripcion</th>
              <th style={{ padding: '6px 4px' }}>Antes → Despues</th>
              <th style={{ padding: '6px 4px' }}>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {modificaciones.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{new Date(m.registradoEn).toLocaleString()}</td>
                <td style={{ padding: '6px 4px' }}><span className="badge">{m.campo}</span></td>
                <td style={{ padding: '6px 4px' }}>{m.descripcion}</td>
                <td style={{ padding: '6px 4px' }}>{m.valorAnterior ?? '—'} → {m.valorNuevo ?? '—'}</td>
                <td style={{ padding: '6px 4px' }}>{m.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
