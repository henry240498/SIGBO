'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { apiFetch, EVENTO_SESION_FINALIZADA } from '@/lib/api';
import { ApartadoMatpel, BloqueMatpel, CampoMatpel, campoVacio, consultaMatpel, descargarPaqueteMatpel, datoMatpel, EntradaMatpel, EvaluacionMatpel, FichaMatpel, GuiaMatpel, LecturaGuiaMatpel, SolicitudMatpel } from '@/lib/matpel';
import { Aviso } from '@/app/components/Aviso';

type Estado = { estado: string; versionGreId: string | null; edicion?: string };
type Busqueda = { items: EntradaMatpel[]; guias: GuiaMatpel[]; cursor: string | null };
type Fuente = { paginaPdf: number; etiquetasImpresas: Array<string | { valor?: string; textoOriginal?: string }>; textoOriginal: string };
type Seccion = { id: string; tituloOriginal: string; paginaDesde: number; paginaHasta: number };
const etiqueta = (v: string) => v.replaceAll('_', ' ').toLowerCase();
const boton = { minHeight: 44, padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 8, background: 'var(--neutral-fill)', color: 'var(--ink)', cursor: 'pointer' };
const MapaMatpel = dynamic(() => import('@/components/MapaMatpel'), { ssr: false });

function Campo({ nombre, campo, cambiar, opciones, unidad }: { nombre: string; campo: CampoMatpel; cambiar: (v: CampoMatpel) => void; opciones?: Array<[string, string]>; unidad?: string }) {
  return <fieldset style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 10, display: 'grid', gap: 6 }}>
    <legend>{nombre}</legend>
    <label style={{ display: 'grid', gap: 4 }}>Valor {unidad && `(${unidad})`}
      {opciones ? <select aria-label={`${nombre}, valor`} style={{ minHeight: 44 }} value={campo.valor} onChange={e => cambiar({ ...campo, valor: e.target.value })}>
        <option value="">Desconocido</option>{opciones.map(([v, texto]) => <option key={v} value={v}>{texto}</option>)}
      </select> : <input aria-label={`${nombre}, valor`} style={{ minHeight: 44 }} value={campo.valor} onChange={e => cambiar({ ...campo, valor: e.target.value })} />}
    </label>
    <label style={{ display: 'grid', gap: 4 }}>Calidad del dato
      <select aria-label={`${nombre}, calidad del dato`} style={{ minHeight: 44 }} disabled={!campo.valor} value={campo.certeza} onChange={e => cambiar({ ...campo, certeza: e.target.value as CampoMatpel['certeza'] })}>
        <option value="NO_CONFIRMADO">No confirmado</option><option value="ESTIMADO">Estimado</option><option value="CONFIRMADO">Confirmado por operador</option>
      </select>
    </label>
    {!opciones && <small>Dejar vacío si se desconoce.</small>}
  </fieldset>;
}

export default function MatpelPage() {
  const [estado, setEstado] = useState<Estado | null>(null);
  const [error, setError] = useState(''); const [ocupado, setOcupado] = useState(false);
  const [q, setQ] = useState(''); const [consulta, setConsulta] = useState('');
  const [busqueda, setBusqueda] = useState<Busqueda | null>(null);
  const [ficha, setFicha] = useState<FichaMatpel | null>(null);
  const [guia, setGuia] = useState<{ guia: GuiaMatpel; bloques: BloqueMatpel[] } | null>(null);
  const [evaluacion, setEvaluacion] = useState<EvaluacionMatpel | null>(null);
  const [solicitudes, setSolicitudes] = useState<SolicitudMatpel[]>([]);
  const [identificacion, setIdentificacion] = useState({ observacionOriginal: '', certeza: 'NO_CONFIRMADO', metodo: 'MANUAL' });
  const [ambito, setAmbito] = useState('DESCONOCIDO');
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [seccion, setSeccion] = useState<{ seccion: Seccion; bloques: BloqueMatpel[] } | null>(null);
  const [campos, setCampos] = useState<Record<string, CampoMatpel>>(() => Object.fromEntries(['evento', 'incendio', 'cantidad', 'agua', 'periodo', 'contenedor', 'capacidad', 'numero', 'viento', 'direccion', 'latitud', 'longitud', 'precision'].map(k => [k, campoVacio()])));
  const [unidadCantidad, setUnidadCantidad] = useState('L'); const [unidadCapacidad, setUnidadCapacidad] = useState('L'); const [unidadViento, setUnidadViento] = useState('km/h');
  const [fuente, setFuente] = useState<Fuente | null>(null); const [pdf, setPdf] = useState('');
  const dialogo = useRef<HTMLDialogElement>(null); const urlPdf = useRef(''); const revision = useRef(0); const revisionFuente = useRef(0);
  const version = estado?.versionGreId;
  useEffect(() => {
    let vigente = true;
    void consultaMatpel<Estado>('/matpel/estado').then(r => { if (vigente) setEstado(r); }).catch(e => { if (vigente) setError(e.message); });
    const limpiar = () => { ++revision.current; ++revisionFuente.current; setFicha(null); setBusqueda(null); setGuia(null); setEvaluacion(null); setSeccion(null); setSecciones([]); setEstado(null); setSolicitudes([]); setIdentificacion({ observacionOriginal: '', certeza: 'NO_CONFIRMADO', metodo: 'MANUAL' }); setAmbito('DESCONOCIDO'); setCampos(c => Object.fromEntries(Object.keys(c).map(k => [k, campoVacio()]))); dialogo.current?.close(); if (urlPdf.current) URL.revokeObjectURL(urlPdf.current); urlPdf.current = ''; setPdf(''); };
    window.addEventListener(EVENTO_SESION_FINALIZADA, limpiar);
    return () => { vigente = false; ++revision.current; ++revisionFuente.current; window.removeEventListener(EVENTO_SESION_FINALIZADA, limpiar); if (urlPdf.current) URL.revokeObjectURL(urlPdf.current); };
  }, []);

  async function ejecutar(accion: (vigente: () => boolean) => Promise<void>) {
    const actual = ++revision.current; const vigente = () => actual === revision.current;
    setOcupado(true); setError('');
    try { await accion(vigente); } catch (e) { if (vigente()) setError(e instanceof Error ? e.message : 'No se pudo completar la consulta.'); }
    finally { if (vigente()) setOcupado(false); }
  }
  function cambiar(k: string, v: CampoMatpel) { ++revision.current; setOcupado(false); setCampos(c => ({ ...c, [k]: v })); setEvaluacion(null); }
  async function buscar(e?: FormEvent, siguiente = false) {
    e?.preventDefault(); if (!version) return;
    const texto = siguiente ? consulta : q.trim();
    await ejecutar(async vigente => {
      if (!siguiente) { setFicha(null); setGuia(null); setEvaluacion(null); setBusqueda(null); setSolicitudes([]); }
      const params = new URLSearchParams({ q: texto, versionGreId: version, limite: '20' });
      if (siguiente && busqueda?.cursor) params.set('cursor', busqueda.cursor);
      const r = await consultaMatpel<Busqueda>(`/matpel/buscar?${params}`);
      if (vigente()) { setConsulta(texto); setBusqueda(b => siguiente && b ? { ...r, items: [...b.items, ...r.items] } : r); }
    });
  }
  async function elegir(e: EntradaMatpel) {
    if (!version) return;
    await ejecutar(async vigente => {
      setFicha(null); setGuia(null); setEvaluacion(null);
      const r = await consultaMatpel<FichaMatpel>(`/matpel/materiales/${e.id}?versionGreId=${version}`);
      if (vigente()) { setFicha(r); setSolicitudes(r.solicitudes ?? []); setIdentificacion({ observacionOriginal: '', certeza: 'NO_CONFIRMADO', metodo: 'MANUAL' }); setCampos(c => ({ ...c, contenedor: campoVacio(), capacidad: campoVacio(), numero: campoVacio() })); }
    });
  }
  async function leerGuia(numero: string) {
    if (!version) return;
    await ejecutar(async vigente => { const r = await consultaMatpel<{ guia: GuiaMatpel; bloques: BloqueMatpel[] }>(`/matpel/guias/${numero}?versionGreId=${version}`); if (vigente()) setGuia(r); });
  }
  async function verFuente(id: string | null, pagina = 1) {
    if (!version) return;
    const actual = ++revisionFuente.current;
    setError('');
    try {
      const f = id ? await consultaMatpel<Fuente>(`/matpel/fuentes/${id}?versionGreId=${version}`) : null;
      if (actual !== revisionFuente.current) return;
      // Solo el endpoint autenticado entrega bytes; el PDF privado nunca usa una URL pública.
      if (!urlPdf.current) {
        const r = await apiFetch(`/matpel/versiones/${version}/archivo`);
        if (!r.ok) throw new Error('No se pudo abrir el PDF original.');
        const blob = await r.blob(); if (actual !== revisionFuente.current) return;
        urlPdf.current = URL.createObjectURL(blob);
      }
      setFuente(f); setPdf(`${urlPdf.current}#page=${f?.paginaPdf ?? pagina}`); dialogo.current?.showModal();
    } catch (e) { if (actual === revisionFuente.current) setError(e instanceof Error ? e.message : 'No se pudo abrir la fuente.'); }
  }
  const fuenteBoton = (id: string) => <button type="button" style={boton} onClick={() => void verFuente(id)}>Ver fuente</button>;
  async function evaluar(e: FormEvent) {
    e.preventDefault(); if (!version) return;
    const numero = (k: string): number | null => {
      const v = campos[k].valor.trim(); if (!v) return null;
      if (!/^-?\d+(\.\d+)?$/.test(v) || !Number.isFinite(Number(v))) throw new Error(`Valor numérico inválido: ${k}. Usar punto decimal.`);
      return Number(v);
    };
    const d = (k: string, valor: unknown) => datoMatpel(valor, campos[k].certeza);
    const cantidad = (k: string, unidad: string) => campos[k].valor.trim() ? { valorDecimal: campos[k].valor.trim(), unidad } : null;
    const menorCerteza = (ks: string[]) => ks.filter(k => campos[k].valor.trim()).map(k => campos[k].certeza).sort((a, b) => ['NO_CONFIRMADO', 'ESTIMADO', 'CONFIRMADO'].indexOf(a) - ['NO_CONFIRMADO', 'ESTIMADO', 'CONFIRMADO'].indexOf(b))[0] ?? 'NO_CONFIRMADO';
    await ejecutar(async vigente => {
      setEvaluacion(null);
      if (!!campos.latitud.valor.trim() !== !!campos.longitud.valor.trim()) throw new Error('Completar latitud y longitud del derrame, o dejar ambas desconocidas.');
      const parametros = {
      eventos: d('evento', campos.evento.valor ? [campos.evento.valor] : null),
      incendio: d('incendio', campos.incendio.valor ? campos.incendio.valor === 'SI' : null),
      cantidad: d('cantidad', cantidad('cantidad', unidadCantidad)), contactoAgua: d('agua', campos.agua.valor || null),
      periodo: d('periodo', campos.periodo.valor || null), contenedor: d('contenedor', campos.contenedor.valor || null),
      cantidadContenedor: d('capacidad', cantidad('capacidad', unidadCapacidad)), numeroContenedores: d('numero', numero('numero')),
      viento: datoMatpel(campos.viento.valor.trim() || campos.direccion.valor.trim() ? { velocidadDecimal: campos.viento.valor.trim() || null, unidad: campos.viento.valor.trim() ? unidadViento : null, direccionDesdeGrados: numero('direccion'), proveedorId: null } : null, menorCerteza(['viento', 'direccion'])),
      ubicacion: datoMatpel(campos.latitud.valor.trim() ? { latitud: numero('latitud'), longitud: numero('longitud'), precisionM: numero('precision') } : null, menorCerteza(['latitud', 'longitud', 'precision'])),
      };
      const r = await consultaMatpel<EvaluacionMatpel>('/matpel/evaluaciones/consulta-v2', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ versionGreId: version, entradaIds: ficha ? [ficha.entrada.id] : [], parametros,
        ambito, identificaciones: ficha ? [{ ...identificacion, entradaId: ficha.entrada.id, observacionOriginal: identificacion.observacionOriginal.trim() || null, observadoEn: null, evidenciaId: null }] : [] }) });
      if (vigente()) { setEvaluacion(r); setSolicitudes(r.solicitudes ?? []); }
    });
  }
  const apartado = (nombre: string, a: ApartadoMatpel) => <section className="card" key={nombre}>
    <h3>{nombre}: {etiqueta(a.estado)}</h3>{a.fuenteResultado && a.fuenteResultado !== 'NO_DETERMINADA' && <p>Fuente: {etiqueta(a.fuenteResultado)}</p>}<p>{a.motivo}</p>
    {a.faltantes.length > 0 && <p>Falta: {a.faltantes.join(', ')}.</p>}
    <ul>{a.celdas.map(c => <li key={c.id}><strong>{c.textoOriginal}</strong>{c.unidadOriginal && ` (${c.unidadOriginal})`} · {etiqueta(c.columnaCodigo)} {fuenteBoton(c.referenciaId)}</li>)}</ul>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{a.referenciaIds.filter(id => !a.celdas.some(c => c.referenciaId === id)).map(id => <span key={id}>{fuenteBoton(id)}</span>)}</div>
  </section>;
  const lecturaGuia = (g: LecturaGuiaMatpel) => <section className="card" key={g.guiaId}>
    <h3>Distancias y condiciones de la guía {g.numero}</h3><p>{g.advertencia}</p>
    {g.distancias.map((b, i) => <div key={`${b.referenciaId}-${i}`}><p style={{ whiteSpace: 'pre-wrap' }}>{b.textoOriginal}</p>{fuenteBoton(b.referenciaId)}</div>)}
    <button type="button" style={boton} onClick={() => void leerGuia(g.numero)}>Abrir texto completo de la guía {g.numero}</button>
    {!!g.condiciones.length && <details><summary>Condiciones particulares documentadas</summary>{g.condiciones.map(c => <article key={c.id}>
      <p><strong>{c.descripcion}</strong></p><ul>{c.condicionesActivacion.map((t, i) => <li key={i}>{t}</li>)}</ul>
      {c.fuentes.map((f, i) => <div key={i}><p style={{ whiteSpace: 'pre-wrap' }}>{f.extractoLiteral}</p><button type="button" style={boton} onClick={() => void verFuente(f.referenciaIds[0] ?? null, f.paginaPdf)}>Ver fuente · PDF {f.paginaPdf} · impresa {f.paginaImpresa}</button></div>)}
      <ul>{c.limites.map((t, i) => <li key={i}>{t}</li>)}</ul></article>)}</details>}
  </section>;
  const nombresCampos: Record<string, string> = { cantidad: 'cantidad', contactoAgua: 'agua', periodo: 'periodo', contenedor: 'contenedor', cantidadContenedor: 'capacidad', numeroContenedores: 'numero', viento: 'viento', incendio: 'incendio' };
  const requeridos = new Set(solicitudes.map(s => nombresCampos[s.campo]).filter(Boolean));
  // Los campos cambian de grupo solo al consultar; escribir conserva el foco.
  const visibles = requeridos;
  const cambiarIdentificacion = (valor: typeof identificacion) => { ++revision.current; setOcupado(false); setEvaluacion(null); setIdentificacion(valor); };
  const campoConsulta = (k: string) => {
    const descripciones: Record<string, { nombre: string; opciones?: Array<[string, string]>; unidad?: string }> = {
      evento: { nombre: 'Evento', opciones: ['DERRAME', 'FUGA', 'INCENDIO', 'EXPLOSION', 'OTRO'].map(v => [v, etiqueta(v)]) },
      incendio: { nombre: 'Incendio presente', opciones: [['SI', 'Sí'], ['NO', 'No']] },
      cantidad: { nombre: 'Cantidad liberada', unidad: unidadCantidad },
      agua: { nombre: 'Medio del derrame', opciones: [['TIERRA', 'Tierra'], ['AGUA', 'Agua'], ['AMBOS', 'Ambos']] },
      periodo: { nombre: 'Periodo observado', opciones: [['DIA', 'Día'], ['NOCHE', 'Noche']] },
      viento: { nombre: 'Velocidad del viento', unidad: unidadViento },
      direccion: { nombre: 'Viento desde (0° norte, 90° este)', unidad: 'grados' },
      latitud: { nombre: 'Latitud del derrame', unidad: 'grados decimales' },
      longitud: { nombre: 'Longitud del derrame', unidad: 'grados decimales' },
      precision: { nombre: 'Precisión de ubicación', unidad: 'm' },
      contenedor: { nombre: 'Tipo de recipiente publicado', opciones: ficha?.contenedoresTabla3.map(c => [c.nombre, c.nombre]) ?? [] },
      capacidad: { nombre: 'Cantidad de referencia por recipiente', unidad: unidadCapacidad },
      numero: { nombre: 'Número de recipientes' },
    };
    const d = descripciones[k];
    const setter = k === 'cantidad' ? setUnidadCantidad : k === 'capacidad' ? setUnidadCapacidad : setUnidadViento;
    return <div key={k} style={{ display: 'grid', gap: 6 }}>
      <Campo {...d} campo={campos[k]} cambiar={v => cambiar(k, v)} />
      {['cantidad', 'capacidad', 'viento'].includes(k) && <label>Unidad de {d.nombre.toLowerCase()}<select aria-label={`Unidad de ${d.nombre.toLowerCase()}`} style={{ minHeight: 44 }} value={d.unidad} onChange={e => { setter(e.target.value); setEvaluacion(null); ++revision.current; setOcupado(false); }}>
        {(k === 'viento' ? ['km/h', 'mph', 'm/s'] : ['L', 'm3', 'kg', 't']).map(v => <option key={v}>{v}</option>)}
      </select></label>}
    </div>;
  };
  return <div style={{ display: 'grid', gap: 16 }}>
    <h2>MATPEL · Consulta GRE</h2>
    <p>Orientación inicial para materiales peligrosos. Seleccionar el nombre específico y conservar las condiciones. La consulta no emite órdenes de mando.</p>
    {error && <Aviso tipo="error" texto={error} />}
    {!estado && !error && <p role="status">Consultando disponibilidad…</p>}
    {estado && !version && <section className="card" role="status"><h3>Edición no disponible</h3><p>{estado.estado === 'CATALOGO_NO_INSTALADO' ? 'La fuente GRE todavía no está instalada.' : 'No hay una edición GRE activa. La administración debe completar su revisión y habilitación.'}</p></section>}
    {version && <>
      <p>Edición {estado?.edicion} · Fuente validada registrada en SIGBO</p>
      <section className="card"><h3>Documento completo</h3>
        <button type="button" style={boton} onClick={() => void verFuente(null)}>Abrir GRE completa</button>
        <button type="button" style={boton} disabled={ocupado} onClick={() => void ejecutar(async () => { await descargarPaqueteMatpel(version, estado?.edicion ?? 'GRE'); })}>Descargar consulta sin conexión</button>
        <p>Guardar el archivo HTML descargado y abrirlo en el navegador para consultar esa edición sin red. Incluye búsqueda, guías, tablas y PDF original. La evaluación de condiciones y las decisiones SCI requieren el servicio disponible.</p>
        <details><summary>Explorar todas las secciones</summary>
          <button type="button" style={boton} disabled={ocupado} onClick={() => void ejecutar(async vigente => { const r = await consultaMatpel<{ secciones: Seccion[] }>(`/matpel/secciones?versionGreId=${version}`); if (vigente()) setSecciones(r.secciones); })}>Cargar índice de secciones</button>
          <ul>{secciones.map(s => <li key={s.id}><button type="button" style={boton} disabled={ocupado} onClick={() => void ejecutar(async vigente => { const r = await consultaMatpel<{ bloques: BloqueMatpel[] }>(`/matpel/secciones/${s.id}?versionGreId=${version}`); if (vigente()) setSeccion({ seccion: s, bloques: r.bloques }); })}>{s.tituloOriginal} · PDF {s.paginaDesde}–{s.paginaHasta}</button></li>)}</ul>
        </details>
        {seccion && <article><h4>{seccion.seccion.tituloOriginal}</h4><button type="button" style={boton} onClick={() => void verFuente(null, seccion.seccion.paginaDesde)}>Abrir sección en el PDF original</button>
          {seccion.bloques.map(b => <div key={b.id}><h5>{b.encabezadoOriginal}</h5><p style={{ whiteSpace: 'pre-wrap' }}>{b.textoOriginal}</p>{fuenteBoton(b.referenciaId)}</div>)}
        </article>}
      </section>
      <form className="card" onSubmit={e => void buscar(e)} style={{ display: 'grid', gap: 8 }}>
        <label htmlFor="matpel-buscar">Identificador ONU/NA, nombre o número de guía</label>
        <input id="matpel-buscar" value={q} maxLength={120} required style={{ minHeight: 44 }} onChange={e => setQ(e.target.value)} />
        <button className="btn-primary" style={{ minHeight: 44 }} disabled={ocupado} type="submit">Buscar</button>
      </form>
      {ocupado && <p role="status">Consultando…</p>}
      {busqueda && <section className="card" aria-live="polite"><h3>Resultados</h3>
        {!busqueda.items.length && !busqueda.guias.length && <p>No se encontraron coincidencias. Puedes consultar como material desconocido.</p>}
        <ul style={{ display: 'grid', gap: 8 }}>{busqueda.items.map(e => <li key={e.id}><button type="button" style={boton} disabled={ocupado} onClick={() => void elegir(e)}>{e.identificador ?? 'Sin identificador'} · {e.nombreOriginal}</button></li>)}</ul>
        {busqueda.guias.map(g => <button key={g.id} type="button" style={boton} disabled={ocupado} onClick={() => void leerGuia(g.numero)}>Guía {g.numero} · {g.tituloOriginal ?? 'Consultar contenido'}</button>)}
        {busqueda.cursor && <button type="button" style={boton} disabled={ocupado} onClick={() => void buscar(undefined, true)}>Más resultados</button>}
      </section>}
      {ficha && <section className="card"><h3>{ficha.entrada.identificador} · {ficha.entrada.nombreOriginal}</h3>
        <p>Resaltado verde: {ficha.entrada.resaltadoVerde === null ? 'no determinado' : ficha.entrada.resaltadoVerde ? 'sí' : 'no'} · Sufijo P: {ficha.entrada.polimerizable === null ? 'no determinado' : ficha.entrada.polimerizable ? 'sí: polimerización bajo ciertas condiciones' : 'no'}</p>
        {fuenteBoton(ficha.entrada.referenciaId)} {ficha.guia && <button type="button" style={boton} disabled={ocupado} onClick={() => void leerGuia(ficha.guia!.numero)}>Leer guía {ficha.guia.numero} completa</button>}
      </section>}
      {(ficha?.guiasLectura ?? []).map(lecturaGuia)}
      <form className="card" onSubmit={e => void evaluar(e)} style={{ display: 'grid', gap: 12 }}>
        <h3>Condiciones de consulta {ficha ? '' : '· material desconocido'}</h3>
        <p>Registrar únicamente lo observado. Un valor vacío conserva la condición desconocida. La cantidad liberada y la cantidad de referencia del recipiente son datos separados.</p>
        <label>Ámbito observado<select aria-label="Ámbito observado" style={{ minHeight: 44 }} value={ambito} onChange={e => { ++revision.current; setOcupado(false); setEvaluacion(null); setAmbito(e.target.value); }}>
          <option value="DESCONOCIDO">Desconocido</option><option value="TRANSPORTE_TERRESTRE">Transporte terrestre</option><option value="INSTALACION_FIJA">Instalación fija</option><option value="AEREO_MARITIMO">Aéreo o marítimo</option>
        </select></label>
        {ficha && <fieldset style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 10, display: 'grid', gap: 8 }}>
          <legend>Identificación observada</legend>
          <label>Observación original<input aria-label="Observación original de identificación" maxLength={2000} style={{ minHeight: 44 }} value={identificacion.observacionOriginal} onChange={e => cambiarIdentificacion({ ...identificacion, observacionOriginal: e.target.value })} /></label>
          <label>Certeza de identificación<select aria-label="Certeza de identificación" style={{ minHeight: 44 }} value={identificacion.certeza} onChange={e => cambiarIdentificacion({ ...identificacion, certeza: e.target.value })}>
            <option value="NO_CONFIRMADO">No confirmado</option><option value="ESTIMADO">Estimado</option><option value="CONFIRMADO">Confirmado por operador</option><option value="DESCONOCIDO">Desconocido</option>
          </select></label>
          <label>Método de identificación<select aria-label="Método de identificación" style={{ minHeight: 44 }} value={identificacion.metodo} onChange={e => cambiarIdentificacion({ ...identificacion, metodo: e.target.value })}>
            <option value="MANUAL">Ingreso manual</option><option value="PLACA">Placa o etiqueta observada</option><option value="OCR">Lectura OCR previa sin confirmar</option><option value="DESCONOCIDO">Desconocido</option>
          </select></label>
        </fieldset>}
        {!!solicitudes.length && <div aria-live="polite"><p>Datos que ayudarían a resolver esta consulta:</p><ul>{solicitudes.map(s => <li key={s.campo}>{s.etiqueta}: {s.motivo}</li>)}</ul></div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 12 }}>
          {Object.keys(campos).filter(k => visibles.has(k)).map(campoConsulta)}
        </div>
        <details><summary>Otros datos observados y ubicación para representar zonas</summary><p>Pueden conservarse desconocidos. La ubicación y dirección del viento se usan para la representación geográfica.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 12 }}>
            {Object.keys(campos).filter(k => !visibles.has(k) && (!['contenedor', 'capacidad', 'numero'].includes(k) || !!ficha?.contenedoresTabla3.length)).map(campoConsulta)}
          </div>
        </details>
        <button type="submit" className="btn-primary" disabled={ocupado} style={{ minHeight: 44 }}>Consultar condiciones</button>
      </form>
      {evaluacion && <div aria-live="polite" style={{ display: 'grid', gap: 12 }}>
        {apartado('Aislamiento inicial', evaluacion.aislamiento)}{apartado('Acción protectora', evaluacion.proteccion)}
        <section className="card"><h3>Representación de zonas</h3>
          {evaluacion.geometria.motivos.map(m => <p key={m}>{m}</p>)}
          {(evaluacion.geometria.aislamiento || evaluacion.geometria.proteccion) && <MapaMatpel datos={evaluacion.geometria} />}
          {evaluacion.geometria.referenciaIds.map(id => <span key={id}>{fuenteBoton(id)}</span>)}
        </section>
        <section className="card"><h3>Condiciones y advertencias</h3>{evaluacion.avisos.map(a => <div key={a.codigo}><p>{a.motivo}</p>{a.referenciaIds.map(id => <span key={id}>{fuenteBoton(id)} </span>)}</div>)}
          {evaluacion.guias.map(g => <button type="button" key={g.id} style={boton} disabled={ocupado} onClick={() => void leerGuia(g.numero)}>Leer guía {g.numero}</button>)}
          <details><summary>Cómo se obtuvo el resultado</summary><ol>{evaluacion.traza?.map((t, i) => <li key={i}><p>{t.resultado}</p>{t.referenciaIds.map(id => <span key={id}>{fuenteBoton(id)} </span>)}</li>)}</ol><p>Interpretación: {evaluacion.versionInterpretacion}</p></details>
          <details><summary>Tablas y trazabilidad</summary>{apartado('Tabla 1', evaluacion.tabla1)}{apartado('Tabla 2 · gases producidos', evaluacion.tabla2)}{apartado('Tabla 3', evaluacion.tabla3)}<p>Motor: {evaluacion.versionMotor} · Consulta: {evaluacion.inputsHash}</p></details>
        </section>
      </div>}
      {guia && <section className="card"><h3>Guía {guia.guia.numero} · {guia.guia.tituloOriginal}</h3>
        {!guia.bloques.length && <p>Esta guía está intencionalmente vacía en la fuente. Verificar el documento original.</p>}{fuenteBoton(guia.guia.referenciaId)}
        {guia.bloques.map(b => <article key={b.id}><h4>{b.encabezadoOriginal}</h4><p style={{ whiteSpace: 'pre-wrap' }}>{b.textoOriginal}</p>{fuenteBoton(b.referenciaId)}</article>)}
      </section>}
    </>}
    <dialog ref={dialogo} aria-labelledby="matpel-fuente-titulo" style={{ width: 'min(1100px, 96vw)', maxHeight: '94vh', color: 'var(--ink)', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12 }}>
      <h3 id="matpel-fuente-titulo">Fuente GRE {estado?.edicion}</h3>
      <button type="button" style={boton} onClick={() => { ++revisionFuente.current; dialogo.current?.close(); }}>Cerrar y volver a la consulta</button>
      {fuente && <><p>Página PDF {fuente.paginaPdf} · Página impresa: {fuente.etiquetasImpresas.map(p => typeof p === 'string' ? p : p.valor ?? p.textoOriginal ?? 'sin numeración').join(', ') || 'sin numeración'}</p><p style={{ whiteSpace: 'pre-wrap' }}>{fuente.textoOriginal}</p></>}
      {!fuente && <p>Documento original completo. La numeración PDF puede diferir de la página impresa; usar ambas al citar.</p>}
      {pdf && <><a href={pdf} target="_blank" rel="noopener noreferrer">Abrir PDF en otra pestaña</a><iframe title="Página del PDF original GRE" src={pdf} style={{ width: '100%', height: '60vh', border: 0 }} /></>}
    </dialog>
  </div>;
}
