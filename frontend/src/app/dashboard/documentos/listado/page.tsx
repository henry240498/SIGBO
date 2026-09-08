'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { VisorDocumento } from '@/components/VisorDocumento';
import { Parametro } from '@/lib/parametros';
import {
  Documento,
  cargarCategoriasDocumento,
  cargarDocumentos,
  cargarEstadosDocumento,
  cargarNivelesConfidencialidad,
  cargarTiposDocumento,
  crearDocumento,
  previsualizarSiguienteNumero,
} from '@/lib/documentos';
import { Aviso } from '@/app/components/Aviso';

const ORIGENES = [
  { value: 'INTERNO', label: 'Interno' },
  { value: 'EXTERNO', label: 'Externo' },
];

function badgeVigencia(documento: Documento): { texto: string; color: string } | null {
  if (!documento.fechaVencimiento) return null;
  const hoy = new Date().toISOString().slice(0, 10);
  if (documento.fechaVencimiento < hoy) return { texto: 'Vencido', color: 'var(--bad-fill)' };
  const limite = new Date();
  limite.setDate(limite.getDate() + 30);
  if (documento.fechaVencimiento <= limite.toISOString().slice(0, 10)) return { texto: 'Por vencer', color: 'var(--warn-fill)' };
  return { texto: 'Vigente', color: 'var(--ok-fill)' };
}

export default function ListadoDocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[] | null>(null);
  const [documentoParaVisor, setDocumentoParaVisor] = useState<Documento | null>(null);
  const [tipos, setTipos] = useState<Parametro[]>([]);
  const [categorias, setCategorias] = useState<Parametro[]>([]);
  const [estados, setEstados] = useState<Parametro[]>([]);
  const [niveles, setNiveles] = useState<Parametro[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [q, setQ] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroVencimiento, setFiltroVencimiento] = useState('');

  const [tipoDocumentoId, setTipoDocumentoId] = useState('');
  const [categoriaDocumentoId, setCategoriaDocumentoId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [origen, setOrigen] = useState('INTERNO');
  const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().slice(0, 10));
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [nivelConfidencialidadId, setNivelConfidencialidadId] = useState('');
  const [numeroSugerido, setNumeroSugerido] = useState<string | null>(null);
  const [numeroDocumental, setNumeroDocumental] = useState('');
  const [cargandoSugerencia, setCargandoSugerencia] = useState(false);

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCrear = permisos.includes('documentos:crear');

  const opcionesTipo = useMemo(() => tipos.map((t) => ({ value: t.id, label: t.nombre })), [tipos]);
  const opcionesCategoria = useMemo(() => categorias.map((c) => ({ value: c.id, label: c.nombre })), [categorias]);
  const opcionesEstado = useMemo(() => estados.map((e) => ({ value: e.id, label: e.nombre })), [estados]);
  const opcionesNivel = useMemo(() => niveles.map((n) => ({ value: n.id, label: n.nombre })), [niveles]);
  const tipoPorId = useMemo(() => new Map(tipos.map((t) => [t.id, t.nombre])), [tipos]);
  const estadoPorId = useMemo(() => new Map(estados.map((e) => [e.id, e.nombre])), [estados]);

  async function cargar() {
    try {
      setDocumentos(
        await cargarDocumentos({
          q: q || undefined,
          tipoDocumentoId: filtroTipo || undefined,
          estadoId: filtroEstado || undefined,
          vencimiento: (filtroVencimiento as 'PROXIMOS' | 'VENCIDOS') || undefined,
        }),
      );
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarTiposDocumento().then(setTipos).catch(() => undefined);
    cargarCategoriasDocumento().then(setCategorias).catch(() => undefined);
    cargarEstadosDocumento().then(setEstados).catch(() => undefined);
    cargarNivelesConfidencialidad().then(setNiveles).catch(() => undefined);
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroTipo, filtroEstado, filtroVencimiento]);

  /** Sugerencia de "siguiente numero" (seccion 5 del pedido): se
   * recalcula al cambiar tipo o año de emision, pero NUNCA consume el
   * contador -- solo lo hace crearDocumento() cuando el usuario acepta
   * la sugerencia sin editarla (autoNumerar: true). */
  useEffect(() => {
    if (!mostrarForm || !tipoDocumentoId) {
      setNumeroSugerido(null);
      return;
    }
    const anio = new Date(fechaEmision || Date.now()).getFullYear();
    setCargandoSugerencia(true);
    previsualizarSiguienteNumero(tipoDocumentoId, anio)
      .then((r) => {
        setNumeroSugerido(r.formato);
        setNumeroDocumental((prev) => (prev === '' || (numeroSugerido && prev === numeroSugerido) ? r.formato : prev));
      })
      .catch(() => setNumeroSugerido(null))
      .finally(() => setCargandoSugerencia(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mostrarForm, tipoDocumentoId, fechaEmision]);

  function limpiarForm() {
    setTipoDocumentoId('');
    setCategoriaDocumentoId('');
    setTitulo('');
    setDescripcion('');
    setOrigen('INTERNO');
    setFechaEmision(new Date().toISOString().slice(0, 10));
    setFechaVencimiento('');
    setNivelConfidencialidadId('');
    setNumeroSugerido(null);
    setNumeroDocumental('');
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      // Seccion 6 del pedido: aceptar la sugerencia tal cual consume el
      // numerador (autoNumerar, el backend hace el incremento atomico);
      // editarla o borrarla nunca toca el contador -- se guarda como
      // numero manual (o sin numero, si se borro).
      const aceptaSugerencia = !!numeroSugerido && numeroDocumental === numeroSugerido;
      const documento = await crearDocumento({
        tipoDocumentoId,
        categoriaDocumentoId: categoriaDocumentoId || undefined,
        titulo,
        descripcion: descripcion || undefined,
        origen: origen as 'INTERNO' | 'EXTERNO',
        fechaEmision,
        fechaVencimiento: fechaVencimiento || undefined,
        nivelConfidencialidadId: nivelConfidencialidadId || undefined,
        autoNumerar: aceptaSugerencia,
        numeroDocumental: aceptaSugerencia ? undefined : numeroDocumental || undefined,
      });
      setMensaje(`Documento creado${documento.numeroDocumental ? ` (${documento.numeroDocumental})` : ''}.`);
      limpiarForm();
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Documentos ({documentos?.length ?? 0})</h2>
        {puedeCrear && (
          <button type="button"
            className="btn-primary"
            onClick={() => {
              limpiarForm();
              setMostrarForm(!mostrarForm);
            }}
          >
            {mostrarForm ? 'Cancelar' : '+ Nuevo documento'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label htmlFor="buscar-titulo-o-numero" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Buscar (titulo o número)</label>
          <input id="buscar-titulo-o-numero" className="input-field" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && cargar()} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Tipo</label>
          <ComboBuscable ariaLabel="Tipo" opciones={opcionesTipo} value={filtroTipo} onChange={setFiltroTipo} maxWidth={200} ningunaLabel="Todos" />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Estado</label>
          <ComboBuscable ariaLabel="Estado" opciones={opcionesEstado} value={filtroEstado} onChange={setFiltroEstado} maxWidth={200} ningunaLabel="Todos" />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Vigencia</label>
          <ComboBuscable ariaLabel="Vigencia"
            opciones={[{ value: 'PROXIMOS', label: 'Proximos a vencer' }, { value: 'VENCIDOS', label: 'Vencidos' }]}
            value={filtroVencimiento}
            onChange={setFiltroVencimiento}
            maxWidth={180}
            ningunaLabel="Todos"
          />
        </div>
        <button type="button" className="btn-primary" style={{ padding: '8px 14px' }} onClick={cargar}>
          Buscar
        </button>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de documento</label>
              <ComboBuscable ariaLabel="Tipo de documento" opciones={opcionesTipo} value={tipoDocumentoId} onChange={setTipoDocumentoId} ningunaLabel="-- seleccionar --" placeholderBusqueda="Buscar tipo..." />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Categoría</label>
              <ComboBuscable ariaLabel="Categoría" opciones={opcionesCategoria} value={categoriaDocumentoId} onChange={setCategoriaDocumentoId} ningunaLabel="Sin categoria" placeholderBusqueda="Buscar categoria..." />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Origen</label>
              <ComboBuscable ariaLabel="Origen" opciones={ORIGENES} value={origen} onChange={setOrigen} ningunaLabel="Interno" />
            </div>
          </div>

          <div>
            <label htmlFor="titulo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Titulo</label>
            <input id="titulo" className="input-field" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="descripcion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripción</label>
            <textarea id="descripcion" className="input-field" rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="fecha-de-emision" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de emisión</label>
              <input id="fecha-de-emision" className="input-field" type="date" value={fechaEmision} onChange={(e) => setFechaEmision(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="fecha-de-vencimiento" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de vencimiento</label>
              <input id="fecha-de-vencimiento" className="input-field" type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Confidencialidad</label>
              <ComboBuscable ariaLabel="Confidencialidad" opciones={opcionesNivel} value={nivelConfidencialidadId} onChange={setNivelConfidencialidadId} ningunaLabel="Publico" />
            </div>
          </div>

          <div>
            <label htmlFor="numero-documental" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Número documental</label>
            <input id="numero-documental"
              className="input-field"
              value={numeroDocumental}
              onChange={(e) => setNumeroDocumental(e.target.value)}
              placeholder={cargandoSugerencia ? 'Calculando sugerencia...' : tipoDocumentoId ? 'Sin numerar' : 'Elegi un tipo de documento primero'}
            />
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              {numeroSugerido
                ? numeroDocumental === numeroSugerido
                  ? `Sugerido: ${numeroSugerido} (se asigna recien al guardar). Podes editarlo o borrarlo.`
                  : numeroDocumental
                    ? 'Numero manual -- no consume el numerador automatico.'
                    : 'Sin numero -- documento no numerado.'
                : 'Este tipo de documento aun no tiene numeracion configurada (Organizacion Institucional -> Configuracion de Documentos).'}
            </p>
          </div>

          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando || !tipoDocumentoId}>
            {guardando ? 'Guardando...' : 'Crear documento'}
          </button>
        </form>
      )}

      {documentos && documentos.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay documentos con estos filtros.</p>}
      {documentos && documentos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Número</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Titulo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Tipo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Emisión</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Vigencia</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              <th scope="col" style={{ padding: '6px 4px' }}></th>
            </tr>
          </thead>
          <tbody>
            {documentos.map((d) => {
              const vig = badgeVigencia(d);
              return (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '6px 4px' }}>
                    <Link href={`/dashboard/documentos/${d.id}`} style={{ color: 'var(--signal)', textDecoration: 'none' }}>
                      {d.numeroDocumental ?? '(sin numero)'}
                    </Link>
                  </td>
                  <td style={{ padding: '6px 4px' }}>{d.titulo}</td>
                  <td style={{ padding: '6px 4px' }}>{tipoPorId.get(d.tipoDocumentoId) ?? '-'}</td>
                  <td style={{ padding: '6px 4px' }}>{d.fechaEmision}</td>
                  <td style={{ padding: '6px 4px' }}>{vig && <span className="badge" style={{ background: vig.color }}>{vig.texto}</span>}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={{ background: 'var(--neutral-fill)' }}>{estadoPorId.get(d.estadoId) ?? '-'}</span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    {d.archivoUrl && (
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ padding: '3px 8px', fontSize: 11, background: '#475569' }}
                        onClick={() => setDocumentoParaVisor(d)}
                      >
                        👁 Ver
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {documentoParaVisor && <VisorDocumento documento={documentoParaVisor} onCerrar={() => setDocumentoParaVisor(null)} />}
    </div>
  );
}
