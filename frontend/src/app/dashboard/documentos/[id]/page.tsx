'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Parametro, resolverNombres } from '@/lib/parametros';
import { cargarBomberos, BomberoResumen, cargarCatalogo, Catalogo } from '@/lib/personal';
import { VisorDocumento } from '@/components/VisorDocumento';
import {
  Documento,
  DocumentoRelacion,
  Expediente,
  FirmaDocumento,
  RegistroAuditoria,
  VersionArchivoDocumento,
  actualizarDocumento,
  anularDocumento,
  aprobarDocumento,
  archivarDocumento,
  cambiarEstadoDocumento,
  cargarAuditoriaDocumento,
  cargarCategoriasDocumento,
  cargarDocumento,
  cargarEstadosDocumento,
  cargarExpedientes,
  cargarFirmasDocumento,
  cargarMotivosAnulacionDocumento,
  cargarNivelesConfidencialidad,
  cargarRelacionesDocumento,
  cargarVersionesDocumento,
  confirmarFirmaManual,
  crearRelacionDocumento,
  definirFirmantes,
  descargarArchivoDocumento,
  eliminarDocumento,
  eliminarRelacionDocumento,
  firmarAutomatico,
  publicarDocumento,
  reabrirDocumento,
  subirArchivoDocumento,
} from '@/lib/documentos';

function formatearFechaHora(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('es-PY');
}

function badgeVigencia(documento: Documento): { texto: string; color: string } | null {
  if (!documento.fechaVencimiento) return null;
  const hoy = new Date().toISOString().slice(0, 10);
  if (documento.fechaVencimiento < hoy) return { texto: 'Vencido', color: '#7f1d1d' };
  const limite = new Date();
  limite.setDate(limite.getDate() + 30);
  if (documento.fechaVencimiento <= limite.toISOString().slice(0, 10)) return { texto: 'Por vencer', color: '#451a03' };
  return { texto: 'Vigente', color: '#166534' };
}

export default function FichaDocumentoPage() {
  const confirmar = useConfirmacion();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [mostrarVisor, setMostrarVisor] = useState(false);

  const [documento, setDocumento] = useState<Documento | null>(null);
  const [versiones, setVersiones] = useState<VersionArchivoDocumento[] | null>(null);
  const [relaciones, setRelaciones] = useState<DocumentoRelacion[] | null>(null);
  const [firmas, setFirmas] = useState<FirmaDocumento[] | null>(null);
  const [auditoria, setAuditoria] = useState<RegistroAuditoria[] | null>(null);

  const [categorias, setCategorias] = useState<Parametro[]>([]);
  const [estados, setEstados] = useState<Parametro[]>([]);
  const [niveles, setNiveles] = useState<Parametro[]>([]);
  const [motivosAnulacion, setMotivosAnulacion] = useState<Parametro[]>([]);
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [cargos, setCargos] = useState<Catalogo[]>([]);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [nombresTipo, setNombresTipo] = useState<Map<string, string>>(new Map());

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [categoriaDocumentoId, setCategoriaDocumentoId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicioVigencia, setFechaInicioVigencia] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [nivelConfidencialidadId, setNivelConfidencialidadId] = useState('');
  const [expedienteId, setExpedienteId] = useState('');
  const [disponibleParaIa, setDisponibleParaIa] = useState(false);

  const [archivo, setArchivo] = useState<File | null>(null);
  const [motivoReemplazo, setMotivoReemplazo] = useState('');

  const [estadoDestinoId, setEstadoDestinoId] = useState('');
  const [observacionEstado, setObservacionEstado] = useState('');
  const [motivoAnulacionId, setMotivoAnulacionId] = useState('');
  const [detalleAnulacion, setDetalleAnulacion] = useState('');
  const [mostrarAnular, setMostrarAnular] = useState(false);

  const [nuevaRelModulo, setNuevaRelModulo] = useState('');
  const [nuevaRelEntidad, setNuevaRelEntidad] = useState('');
  const [nuevaRelRegistroId, setNuevaRelRegistroId] = useState('');
  const [nuevaRelEtiqueta, setNuevaRelEtiqueta] = useState('');

  const [firmanteCargoId, setFirmanteCargoId] = useState('');
  const [firmanteBomberoId, setFirmanteBomberoId] = useState('');
  const [firmanteEtiqueta, setFirmanteEtiqueta] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeEditar = permisos.includes('documentos:editar');
  const puedeSubir = permisos.includes('documentos:subir');
  const puedeDescargar = permisos.includes('documentos:descargar');
  const puedeAprobar = permisos.includes('documentos:aprobar');
  const puedeAnular = permisos.includes('documentos:anular');
  const puedeEliminar = permisos.includes('documentos:eliminar');
  const puedeAdministrar = permisos.includes('documentos:administrar');
  const puedeVerAuditoria = permisos.includes('documentos:ver_auditoria');
  const puedeFirmar = permisos.includes('documentos:firmar');

  const opcionesCategoria = useMemo(() => categorias.map((c) => ({ value: c.id, label: c.nombre })), [categorias]);
  const opcionesEstado = useMemo(() => estados.map((e) => ({ value: e.id, label: e.nombre })), [estados]);
  const opcionesNivel = useMemo(() => niveles.map((n) => ({ value: n.id, label: n.nombre })), [niveles]);
  const opcionesMotivoAnulacion = useMemo(() => motivosAnulacion.map((m) => ({ value: m.id, label: m.nombre })), [motivosAnulacion]);
  const opcionesExpediente = useMemo(() => expedientes.map((e) => ({ value: e.id, label: `${e.numero} — ${e.titulo}` })), [expedientes]);
  const opcionesCargo = useMemo(() => cargos.map((c) => ({ value: c.id, label: c.nombre })), [cargos]);
  const opcionesBombero = useMemo(() => bomberos.map((b) => ({ value: b.id, label: `${b.numeroBombero} — ${b.nombre} ${b.apellido}` })), [bomberos]);
  const estadoPorId = useMemo(() => new Map(estados.map((e) => [e.id, e.nombre])), [estados]);
  const cargoPorId = useMemo(() => new Map(cargos.map((c) => [c.id, c.nombre])), [cargos]);
  const bomberoPorId = useMemo(() => new Map(bomberos.map((b) => [b.id, `${b.nombre} ${b.apellido}`])), [bomberos]);

  async function cargar() {
    try {
      const d = await cargarDocumento(id);
      setDocumento(d);
      setCategoriaDocumentoId(d.categoriaDocumentoId ?? '');
      setTitulo(d.titulo);
      setDescripcion(d.descripcion ?? '');
      setFechaInicioVigencia(d.fechaInicioVigencia ?? '');
      setFechaVencimiento(d.fechaVencimiento ?? '');
      setNivelConfidencialidadId(d.nivelConfidencialidadId ?? '');
      setExpedienteId(d.expedienteId ?? '');
      setDisponibleParaIa(d.disponibleParaIa ?? false);
      setEstadoDestinoId(d.estadoId);

      const [vers, rels, fir] = await Promise.all([cargarVersionesDocumento(id), cargarRelacionesDocumento(id), cargarFirmasDocumento(id)]);
      setVersiones(vers);
      setRelaciones(rels);
      setFirmas(fir);
      setNombresTipo(await resolverNombres([d.tipoDocumentoId]));

      if (puedeVerAuditoria) {
        cargarAuditoriaDocumento(id)
          .then((res) => setAuditoria(res.items))
          .catch(() => undefined);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarCategoriasDocumento().then(setCategorias).catch(() => undefined);
    cargarEstadosDocumento().then(setEstados).catch(() => undefined);
    cargarNivelesConfidencialidad().then(setNiveles).catch(() => undefined);
    cargarMotivosAnulacionDocumento().then(setMotivosAnulacion).catch(() => undefined);
    cargarExpedientes('ABIERTO').then(setExpedientes).catch(() => undefined);
    cargarCatalogo('/organizacion/cargos').then(setCargos).catch(() => undefined);
    cargarBomberos().then(setBomberos).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function guardarDatos(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await actualizarDocumento(id, {
        categoriaDocumentoId: categoriaDocumentoId || null,
        titulo,
        descripcion: descripcion || null,
        fechaInicioVigencia: fechaInicioVigencia || null,
        fechaVencimiento: fechaVencimiento || null,
        nivelConfidencialidadId: nivelConfidencialidadId || null,
        expedienteId: expedienteId || null,
        disponibleParaIa,
      });
      setMensaje('Datos actualizados.');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function subir() {
    if (!archivo) return;
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await subirArchivoDocumento(id, archivo, motivoReemplazo || undefined);
      setMensaje('Archivo cargado.');
      setArchivo(null);
      setMotivoReemplazo('');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function descargar() {
    if (!documento) return;
    try {
      await descargarArchivoDocumento(id, documento.archivoNombreOriginal ?? `${documento.titulo}.${documento.archivoExtension ?? 'pdf'}`);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function cambiarEstado() {
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await cambiarEstadoDocumento(id, estadoDestinoId, observacionEstado || undefined);
      setMensaje('Estado actualizado.');
      setObservacionEstado('');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function accionSimple(fn: (id: string) => Promise<Documento>, mensajeExito: string) {
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await fn(id);
      setMensaje(mensajeExito);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!await confirmar({ titulo: 'Archivar documento', mensaje: '¿Eliminar este documento? Queda archivado y registrado en auditoría; el archivo no se borra físicamente.', confirmar: 'Archivar', peligro: true })) return;
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await eliminarDocumento(id);
      router.push('/dashboard/documentos/listado');
    } catch (err: any) {
      setError(err.message);
      setGuardando(false);
    }
  }

  async function anular(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await anularDocumento(id, motivoAnulacionId, detalleAnulacion || undefined);
      setMensaje('Documento anulado.');
      setMostrarAnular(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function agregarRelacion(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await crearRelacionDocumento(id, { modulo: nuevaRelModulo, entidad: nuevaRelEntidad, registroId: nuevaRelRegistroId, etiqueta: nuevaRelEtiqueta || undefined });
      setMensaje('Relacion creada.');
      setNuevaRelModulo('');
      setNuevaRelEntidad('');
      setNuevaRelRegistroId('');
      setNuevaRelEtiqueta('');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function quitarRelacion(relacionId: string) {
    setError(null);
    try {
      await eliminarRelacionDocumento(relacionId);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function agregarFirmante(e: React.FormEvent) {
    e.preventDefault();
    if (!firmanteCargoId && !firmanteBomberoId) return;
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await definirFirmantes(id, [{ cargoFirmanteId: firmanteCargoId || undefined, bomberoFirmanteId: firmanteBomberoId || undefined, etiquetaRol: firmanteEtiqueta || undefined }]);
      setMensaje('Firmante agregado.');
      setFirmanteCargoId('');
      setFirmanteBomberoId('');
      setFirmanteEtiqueta('');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function firmar(firmaId: string) {
    setError(null);
    setMensaje(null);
    try {
      await firmarAutomatico(firmaId);
      setMensaje('Firma digital estampada.');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function firmarManual(firmaId: string) {
    setError(null);
    setMensaje(null);
    try {
      await confirmarFirmaManual(firmaId);
      setMensaje('Firma manuscrita confirmada.');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (error && !documento) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!documento) return <p style={{ color: '#94a3b8' }}>Cargando documento...</p>;

  const vig = badgeVigencia(documento);
  const estadoActual = estadoPorId.get(documento.estadoId) ?? '';
  const esTerminal = estadoActual === 'Anulado' || estadoActual === 'Archivado';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ fontSize: 18 }}>{documento.numeroDocumental ? `${documento.numeroDocumental} — ` : ''}{documento.titulo}</h2>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
              {nombresTipo.get(documento.tipoDocumentoId) ?? ''} · {documento.origen === 'INTERNO' ? 'Interno' : 'Externo'} · Emitido {documento.fechaEmision} · v{documento.version}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: '#334155' }}>{estadoActual}</span>
            {vig && <span className="badge" style={{ background: vig.color }}>{vig.texto}</span>}
          </div>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: 13, marginTop: 10 }}>{error}</p>}
        {mensaje && <p style={{ color: '#4ade80', fontSize: 13, marginTop: 10 }}>{mensaje}</p>}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          {puedeAprobar && estadoActual === 'Pendiente' && (
            <button type="button" className="btn-primary" disabled={guardando} onClick={() => accionSimple(aprobarDocumento, 'Documento aprobado.')}>Aprobar</button>
          )}
          {puedeAprobar && (estadoActual === 'Aprobado' || estadoActual === 'Firmado' || estadoActual === 'Borrador') && (
            <button type="button" className="btn-primary" disabled={guardando} onClick={() => accionSimple(publicarDocumento, 'Documento publicado.')}>Publicar</button>
          )}
          {puedeEditar && !esTerminal && (
            <button type="button" className="btn-primary" style={{ background: '#475569' }} disabled={guardando} onClick={() => accionSimple(archivarDocumento, 'Documento archivado.')}>Archivar</button>
          )}
          {puedeAdministrar && estadoActual === 'Archivado' && (
            <button type="button" className="btn-primary" disabled={guardando} onClick={() => accionSimple(reabrirDocumento, 'Documento reabierto.')}>Reabrir</button>
          )}
          {puedeAnular && !esTerminal && (
            <button type="button" className="btn-primary" style={{ background: '#7f1d1d' }} disabled={guardando} onClick={() => setMostrarAnular(!mostrarAnular)}>
              {mostrarAnular ? 'Cancelar anulacion' : 'Anular'}
            </button>
          )}
          {documento.archivoUrl && (
            <button type="button" className="btn-primary" style={{ background: '#334155' }} onClick={() => setMostrarVisor(true)}>👁 Previsualizar</button>
          )}
          {puedeDescargar && documento.archivoUrl && (
            <button type="button" className="btn-primary" style={{ background: '#334155' }} onClick={descargar}>⬇ Descargar archivo</button>
          )}
          {puedeEliminar && !esTerminal && (
            <button type="button" className="btn-primary" style={{ background: '#7f1d1d' }} disabled={guardando} onClick={eliminar}>🗑 Eliminar</button>
          )}
        </div>

        {mostrarAnular && (
          <form onSubmit={anular} className="card" style={{ marginTop: 12, background: '#0f172a', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Motivo de anulacion</label>
              <ComboBuscable opciones={opcionesMotivoAnulacion} value={motivoAnulacionId} onChange={setMotivoAnulacionId} ningunaLabel="-- seleccionar --" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Detalle</label>
              <input className="input-field" value={detalleAnulacion} onChange={(e) => setDetalleAnulacion(e.target.value)} />
            </div>
            <button type="button" className="btn-primary" style={{ background: '#7f1d1d', alignSelf: 'flex-start' }} disabled={guardando || !motivoAnulacionId}>
              Confirmar anulacion
            </button>
          </form>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <form onSubmit={guardarDatos} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Datos generales</h3>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Titulo</label>
            <input className="input-field" value={titulo} onChange={(e) => setTitulo(e.target.value)} disabled={!puedeEditar || esTerminal} required />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripcion</label>
            <textarea className="input-field" rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} disabled={!puedeEditar || esTerminal} />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Categoria</label>
            <ComboBuscable opciones={opcionesCategoria} value={categoriaDocumentoId} onChange={setCategoriaDocumentoId} ningunaLabel="Sin categoria" disabled={!puedeEditar || esTerminal} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Inicio de vigencia</label>
              <input className="input-field" type="date" value={fechaInicioVigencia} onChange={(e) => setFechaInicioVigencia(e.target.value)} disabled={!puedeEditar || esTerminal} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Vencimiento</label>
              <input className="input-field" type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} disabled={!puedeEditar || esTerminal} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Confidencialidad</label>
            <ComboBuscable opciones={opcionesNivel} value={nivelConfidencialidadId} onChange={setNivelConfidencialidadId} ningunaLabel="Publico" disabled={!puedeEditar || esTerminal} />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Expediente</label>
            <ComboBuscable opciones={opcionesExpediente} value={expedienteId} onChange={setExpedienteId} ningunaLabel="Sin expediente" disabled={!puedeEditar || esTerminal} />
          </div>
          <label style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="checkbox" checked={disponibleParaIa} onChange={(e) => setDisponibleParaIa(e.target.checked)} disabled={!puedeEditar || esTerminal} />
            Disponible para Snoopy (Inteligencia Artificial) — la confidencialidad sigue aplicando igual
          </label>
          {puedeEditar && !esTerminal && (
            <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          )}

          <div style={{ borderTop: '1px solid #334155', marginTop: 6, paddingTop: 10 }}>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cambiar estado manualmente</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <ComboBuscable opciones={opcionesEstado.filter((o) => !['Anulado', 'Archivado'].includes(estadoPorId.get(o.value) ?? ''))} value={estadoDestinoId} onChange={setEstadoDestinoId} maxWidth={220} />
              <button type="button" className="btn-primary" style={{ padding: '6px 12px' }} disabled={guardando || esTerminal} onClick={cambiarEstado}>
                Aplicar
              </button>
            </div>
          </div>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontSize: 14, marginBottom: 10 }}>Archivo digital</h3>
            {documento.archivoUrl ? (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>
                {documento.archivoNombreOriginal} ({documento.archivoTamanoBytes ? `${Math.round(documento.archivoTamanoBytes / 1024)} KB` : '-'}) — version {documento.version}
              </p>
            ) : (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Este documento no tiene un archivo digital cargado (puede ser fisico).</p>
            )}
            {puedeSubir && !esTerminal && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
                {documento.archivoUrl && (
                  <input className="input-field" placeholder="Motivo del reemplazo (requerido)" value={motivoReemplazo} onChange={(e) => setMotivoReemplazo(e.target.value)} />
                )}
                <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={!archivo || guardando} onClick={subir}>
                  {documento.archivoUrl ? 'Cargar nueva version' : 'Subir archivo'}
                </button>
              </div>
            )}
            {versiones && versiones.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Versiones anteriores</p>
                {versiones.map((v) => (
                  <div key={v.id} style={{ fontSize: 12, padding: '4px 0', borderBottom: '1px solid #1f2937' }}>
                    v{v.numeroVersion} — {v.archivoNombreOriginal} — {formatearFechaHora(v.creadoEn)} {v.motivo ? `(${v.motivo})` : ''}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: 14, marginBottom: 10 }}>Firmas</h3>
            {firmas && firmas.length === 0 && <p style={{ fontSize: 13, color: '#94a3b8' }}>Este documento no requiere firmas.</p>}
            {firmas && firmas.map((f) => (
              <div key={f.id} style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  {f.cargoFirmanteId ? cargoPorId.get(f.cargoFirmanteId) ?? f.cargoFirmanteId : f.bomberoFirmanteId ? bomberoPorId.get(f.bomberoFirmanteId) ?? f.bomberoFirmanteId : '-'}
                  {f.etiquetaRol ? ` (${f.etiquetaRol})` : ''}
                </span>
                {f.firmado ? (
                  <span className="badge" style={{ background: '#166534' }}>Firmado</span>
                ) : puedeFirmar && !esTerminal ? (
                  <span style={{ display: 'flex', gap: 6 }}>
                    <button type="button" className="btn-primary" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => firmar(f.id)}>Firmar digital</button>
                    <button type="button" className="btn-primary" style={{ padding: '3px 8px', fontSize: 11, background: '#475569' }} onClick={() => firmarManual(f.id)}>Confirmar manuscrita</button>
                  </span>
                ) : (
                  <span className="badge" style={{ background: '#334155' }}>Pendiente</span>
                )}
              </div>
            ))}
            {puedeAdministrar && !esTerminal && (
              <form onSubmit={agregarFirmante} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, borderTop: '1px solid #334155', paddingTop: 10 }}>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>Agregar firmante requerido</p>
                <ComboBuscable opciones={opcionesCargo} value={firmanteCargoId} onChange={(v) => { setFirmanteCargoId(v); if (v) setFirmanteBomberoId(''); }} ningunaLabel="Por cargo: ninguno" />
                <ComboBuscable opciones={opcionesBombero} value={firmanteBomberoId} onChange={(v) => { setFirmanteBomberoId(v); if (v) setFirmanteCargoId(''); }} ningunaLabel="Por persona: ninguno" placeholderBusqueda="Buscar bombero..." />
                <input className="input-field" placeholder="Etiqueta del rol (opcional)" value={firmanteEtiqueta} onChange={(e) => setFirmanteEtiqueta(e.target.value)} />
                <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando || (!firmanteCargoId && !firmanteBomberoId)}>
                  Agregar firmante
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 10 }}>Documentos relacionados</h3>
        {relaciones && relaciones.length === 0 && <p style={{ fontSize: 13, color: '#94a3b8' }}>Sin relaciones con otros registros del sistema.</p>}
        {relaciones && relaciones.map((r) => (
          <div key={r.id} style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <span className="badge" style={{ background: '#475569', marginRight: 6 }}>{r.modulo}/{r.entidad}</span>
              {r.etiqueta ?? r.registroId}
            </span>
            {puedeEditar && !esTerminal && (
              <button type="button" className="btn-primary" style={{ padding: '3px 8px', fontSize: 11, background: '#7f1d1d' }} onClick={() => quitarRelacion(r.id)}>Quitar</button>
            )}
          </div>
        ))}
        {puedeEditar && !esTerminal && (
          <form onSubmit={agregarRelacion} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 8, marginTop: 10, borderTop: '1px solid #334155', paddingTop: 10, alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Modulo</label>
              <input className="input-field" placeholder="ej. personal" value={nuevaRelModulo} onChange={(e) => setNuevaRelModulo(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Entidad</label>
              <input className="input-field" placeholder="ej. bombero" value={nuevaRelEntidad} onChange={(e) => setNuevaRelEntidad(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>ID de registro</label>
              <input className="input-field" value={nuevaRelRegistroId} onChange={(e) => setNuevaRelRegistroId(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Etiqueta</label>
              <input className="input-field" value={nuevaRelEtiqueta} onChange={(e) => setNuevaRelEtiqueta(e.target.value)} />
            </div>
            <button type="button" className="btn-primary" style={{ padding: '8px 12px' }} disabled={guardando}>Relacionar</button>
          </form>
        )}
      </div>

      {puedeVerAuditoria && (
        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>Historial / auditoria</h3>
          {!auditoria && <p style={{ fontSize: 13, color: '#94a3b8' }}>Cargando historial...</p>}
          {auditoria && auditoria.length === 0 && <p style={{ fontSize: 13, color: '#94a3b8' }}>Sin eventos registrados.</p>}
          {auditoria && auditoria.map((a) => (
            <div key={a.id} style={{ fontSize: 12, padding: '5px 0', borderBottom: '1px solid #1f2937', color: '#94a3b8' }}>
              <span className="badge" style={{ background: '#334155', marginRight: 6 }}>{a.accion}</span>
              {formatearFechaHora(a.fecha)} {a.ip ? `— ${a.ip}` : ''}
            </div>
          ))}
        </div>
      )}

      {mostrarVisor && <VisorDocumento documento={documento} onCerrar={() => setMostrarVisor(false)} />}
    </div>
  );
}
