'use client';

import { useEffect, useMemo, useState } from 'react';
import { API_ORIGIN, obtenerSesion } from '@/lib/api';
import {
  IdentidadInstitucional,
  LineaDestacada,
  actualizarIdentidadInstitucional,
  cargarIdentidadInstitucional,
  subirLogoInstitucional,
} from '@/lib/organizacion';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Parametro } from '@/lib/parametros';
import { NumeracionDocumento, cargarNumeraciones, cargarTiposDocumento, guardarNumeracion } from '@/lib/documentos';
import { Cargando } from '@/app/components/Cargando';
import { Aviso } from '@/app/components/Aviso';

const TIPOS_LINEA: Array<{ value: LineaDestacada['tipo']; label: string }> = [
  { value: 'SUBTITULO', label: 'Subtitulo institucional' },
  { value: 'DISTINCION', label: 'Distincion / premio' },
  { value: 'OTRO', label: 'Otro' },
];

export default function DocumentosInstitucionalesPage() {
  const puedeVer = !!obtenerSesion()?.usuario.permisos.includes('organizacion:documentos_ver');
  const puedeConfigurar = !!obtenerSesion()?.usuario.permisos.includes('organizacion:documentos_configurar');

  const [config, setConfig] = useState<IdentidadInstitucional | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState<'izquierda' | 'derecha' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [nombreInstitucion, setNombreInstitucion] = useState('');
  const [direccion, setDireccion] = useState('');
  const [mostrarDireccion, setMostrarDireccion] = useState(true);
  const [telefono, setTelefono] = useState('');
  const [mostrarTelefono, setMostrarTelefono] = useState(true);
  const [email, setEmail] = useState('');
  const [mostrarEmail, setMostrarEmail] = useState(true);
  const [sitioWeb, setSitioWeb] = useState('');
  const [mostrarSitioWeb, setMostrarSitioWeb] = useState(false);
  const [personeriaJuridica, setPersoneriaJuridica] = useState('');
  const [mostrarPersoneria, setMostrarPersoneria] = useState(true);
  const [fechaFundacion, setFechaFundacion] = useState('');
  const [mostrarFechaFundacion, setMostrarFechaFundacion] = useState(true);
  const [mostrarLogoIzquierda, setMostrarLogoIzquierda] = useState(true);
  const [mostrarLogoDerecha, setMostrarLogoDerecha] = useState(true);
  const [alineacionTitulo, setAlineacionTitulo] = useState<'IZQUIERDA' | 'CENTRO' | 'DERECHA'>('CENTRO');
  const [lineas, setLineas] = useState<LineaDestacada[]>([]);
  const [textoPiePagina, setTextoPiePagina] = useState('');
  const [mostrarNumeroPagina, setMostrarNumeroPagina] = useState(true);
  const [mostrarGeneradoSigbo, setMostrarGeneradoSigbo] = useState(true);

  function aplicarConfig(data: IdentidadInstitucional) {
    setConfig(data);
    setNombreInstitucion(data.nombreInstitucion ?? '');
    setDireccion(data.direccion ?? '');
    setMostrarDireccion(data.mostrarDireccion);
    setTelefono(data.telefono ?? '');
    setMostrarTelefono(data.mostrarTelefono);
    setEmail(data.email ?? '');
    setMostrarEmail(data.mostrarEmail);
    setSitioWeb(data.sitioWeb ?? '');
    setMostrarSitioWeb(data.mostrarSitioWeb);
    setPersoneriaJuridica(data.personeriaJuridica ?? '');
    setMostrarPersoneria(data.mostrarPersoneria);
    setFechaFundacion(data.fechaFundacion ?? '');
    setMostrarFechaFundacion(data.mostrarFechaFundacion);
    setMostrarLogoIzquierda(data.mostrarLogoIzquierda);
    setMostrarLogoDerecha(data.mostrarLogoDerecha);
    setAlineacionTitulo(data.alineacionTitulo ?? 'CENTRO');
    setTextoPiePagina(data.textoPiePagina ?? '');
    setMostrarNumeroPagina(data.mostrarNumeroPagina);
    setMostrarGeneradoSigbo(data.mostrarGeneradoSigbo);
    try {
      setLineas(JSON.parse(data.lineasDestacadas || '[]'));
    } catch {
      setLineas([]);
    }
  }

  useEffect(() => {
    if (!puedeVer) {
      setCargando(false);
      return;
    }
    cargarIdentidadInstitucional()
      .then(aplicarConfig)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function agregarLinea() {
    setLineas([...lineas, { texto: '', tipo: 'SUBTITULO', visible: true, orden: lineas.length + 1 }]);
  }

  function actualizarLinea(i: number, cambios: Partial<LineaDestacada>) {
    setLineas(lineas.map((l, idx) => (idx === i ? { ...l, ...cambios } : l)));
  }

  function quitarLinea(i: number) {
    setLineas(lineas.filter((_, idx) => idx !== i));
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      const actualizado = await actualizarIdentidadInstitucional({
        nombreInstitucion,
        direccion: direccion || undefined,
        mostrarDireccion,
        telefono: telefono || undefined,
        mostrarTelefono,
        email: email || undefined,
        mostrarEmail,
        sitioWeb: sitioWeb || undefined,
        mostrarSitioWeb,
        personeriaJuridica: personeriaJuridica || undefined,
        mostrarPersoneria,
        fechaFundacion: fechaFundacion || undefined,
        mostrarFechaFundacion,
        mostrarLogoIzquierda,
        mostrarLogoDerecha,
        alineacionTitulo,
        lineasDestacadas: lineas.map((l, i) => ({ ...l, orden: i + 1 })),
        textoPiePagina: textoPiePagina || undefined,
        mostrarNumeroPagina,
        mostrarGeneradoSigbo,
      });
      aplicarConfig(actualizado);
      setMensaje('Configuracion guardada');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  const [numeraciones, setNumeraciones] = useState<NumeracionDocumento[] | null>(null);
  const [tiposDocumento, setTiposDocumento] = useState<Parametro[]>([]);
  const opcionesTipoDocumento = useMemo(() => tiposDocumento.map((t) => ({ value: t.id, label: t.nombre })), [tiposDocumento]);
  const nombreTipoPorId = useMemo(() => new Map(tiposDocumento.map((t) => [t.id, t.nombre])), [tiposDocumento]);

  useEffect(() => {
    if (!puedeConfigurar) return;
    cargarTiposDocumento().then(setTiposDocumento).catch(() => undefined);
    cargarNumeraciones().then(setNumeraciones).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puedeConfigurar]);

  async function subirLogo(lado: 'izquierda' | 'derecha', archivo: File) {
    setError(null);
    setMensaje(null);
    setSubiendoLogo(lado);
    try {
      const actualizado = await subirLogoInstitucional(lado, archivo);
      aplicarConfig(actualizado);
      setMensaje('Logo actualizado');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubiendoLogo(null);
    }
  }

  if (!puedeVer) {
    return (
      <p style={{ color: 'var(--muted)', fontSize: 13 }}>
        Solo un usuario con el permiso <code>organizacion:documentos_ver</code> puede acceder a esta seccion.
      </p>
    );
  }
  if (cargando) return <Cargando texto="Cargando…" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900 }}>
      <div>
        <h2 style={{ fontSize: 16 }}>Configuracion de Documentos</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Identidad institucional (membrete, datos de contacto, pie de pagina) usada por TODOS los documentos PDF y
          Word que genere SIGBO — Orden de Guardia hoy, y cualquier modulo nuevo que genere documentos mas adelante.
          Un solo lugar, no un membrete distinto por modulo.
        </p>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      <fieldset disabled={!puedeConfigurar} style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ fontSize: 14 }}>Logos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <CampoLogo
              etiqueta="Logo izquierda (afiliacion)"
              url={config?.logoIzquierdaUrl ?? null}
              mostrar={mostrarLogoIzquierda}
              onMostrarChange={setMostrarLogoIzquierda}
              subiendo={subiendoLogo === 'izquierda'}
              onArchivo={(f) => subirLogo('izquierda', f)}
              disabled={!puedeConfigurar}
            />
            <CampoLogo
              etiqueta="Logo derecha (sello propio)"
              url={config?.logoDerechaUrl ?? null}
              mostrar={mostrarLogoDerecha}
              onMostrarChange={setMostrarLogoDerecha}
              subiendo={subiendoLogo === 'derecha'}
              onArchivo={(f) => subirLogo('derecha', f)}
              disabled={!puedeConfigurar}
            />
          </div>
        </section>

        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Título del documento</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            Alineación del título, número y fecha en la cabecera de cualquier documento que genere SIGBO.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            {(['IZQUIERDA', 'CENTRO', 'DERECHA'] as const).map((valor) => (
              <label key={valor} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="radio" name="alineacionTitulo" checked={alineacionTitulo === valor} onChange={() => setAlineacionTitulo(valor)} />
                {valor === 'IZQUIERDA' ? 'Izquierda' : valor === 'CENTRO' ? 'Centro' : 'Derecha'}
              </label>
            ))}
          </div>
        </section>

        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Datos institucionales</h3>
          <div>
            <label htmlFor="nombre-de-la-institucion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre de la institucion</label>
            <input id="nombre-de-la-institucion" className="input-field" value={nombreInstitucion} onChange={(e) => setNombreInstitucion(e.target.value)} />
          </div>
          <CampoConToggle label="Direccion" valor={direccion} onValor={setDireccion} mostrar={mostrarDireccion} onMostrar={setMostrarDireccion} />
          <CampoConToggle label="Telefono(s)" valor={telefono} onValor={setTelefono} mostrar={mostrarTelefono} onMostrar={setMostrarTelefono} />
          <CampoConToggle label="Email" valor={email} onValor={setEmail} mostrar={mostrarEmail} onMostrar={setMostrarEmail} />
          <CampoConToggle label="Sitio web / redes" valor={sitioWeb} onValor={setSitioWeb} mostrar={mostrarSitioWeb} onMostrar={setMostrarSitioWeb} />
          <CampoConToggle
            label="Personeria juridica"
            valor={personeriaJuridica}
            onValor={setPersoneriaJuridica}
            mostrar={mostrarPersoneria}
            onMostrar={setMostrarPersoneria}
          />
          <div>
            <label htmlFor="fecha-de-fundacion-mostrar-en-documentos" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <input type="checkbox" checked={mostrarFechaFundacion} onChange={(e) => setMostrarFechaFundacion(e.target.checked)} />
              Fecha de fundacion (mostrar en documentos)
            </label>
            <input id="fecha-de-fundacion-mostrar-en-documentos" className="input-field" type="date" value={fechaFundacion} onChange={(e) => setFechaFundacion(e.target.value)} />
          </div>
        </section>

        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Subtitulos y distinciones</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            Lineas variables que aparecen bajo el nombre institucional (membresias, medallas, reconocimientos). Cada
            una puede ocultarse sin borrarla.
          </p>
          {lineas.map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={l.visible} onChange={(e) => actualizarLinea(i, { visible: e.target.checked })} />
              <select className="input-field" style={{ maxWidth: 180 }} value={l.tipo} onChange={(e) => actualizarLinea(i, { tipo: e.target.value as LineaDestacada['tipo'] })}>
                {TIPOS_LINEA.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <input className="input-field" style={{ flex: 1 }} value={l.texto} onChange={(e) => actualizarLinea(i, { texto: e.target.value })} />
              <button type="button" className="btn-primary" style={{ background: '#7f1d1d', padding: '6px 10px' }} onClick={() => quitarLinea(i)}>
                Quitar
              </button>
            </div>
          ))}
          <button type="button" className="btn-primary" style={{ background: '#475569', alignSelf: 'flex-start' }} onClick={agregarLinea}>
            Agregar linea
          </button>
        </section>

        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Pie de pagina institucional</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            Distinto del pie de pagina propio de cada documento (ej. la nota de horarios de la Orden de Guardia) —
            este aparece al final de cada pagina de cualquier documento.
          </p>
          <textarea className="input-field" rows={2} value={textoPiePagina} onChange={(e) => setTextoPiePagina(e.target.value)} />
          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={mostrarNumeroPagina} onChange={(e) => setMostrarNumeroPagina(e.target.checked)} />
            Mostrar numero de pagina ("Pagina X de Y")
          </label>
          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={mostrarGeneradoSigbo} onChange={(e) => setMostrarGeneradoSigbo(e.target.checked)} />
            Mostrar "Documento generado por SIGBO"
          </label>
        </section>

        {puedeConfigurar && (
          <button type="button" className="btn-primary" disabled={guardando} style={{ alignSelf: 'flex-start' }} onClick={guardar}>
            {guardando ? 'Guardando...' : 'Guardar configuracion'}
          </button>
        )}
      </fieldset>

      {puedeConfigurar && (
        <SeccionNumeracion
          numeraciones={numeraciones}
          opcionesTipoDocumento={opcionesTipoDocumento}
          nombreTipoPorId={nombreTipoPorId}
          onGuardado={(actualizado) => {
            setNumeraciones((prev) => {
              const previas = prev ?? [];
              const idx = previas.findIndex((n) => n.id === actualizado.id);
              if (idx === -1) return [actualizado, ...previas];
              const copia = [...previas];
              copia[idx] = actualizado;
              return copia;
            });
          }}
        />
      )}
    </div>
  );
}

/** Numeracion de Documentos (secciones 3-13 del pedido): un numerador
 * independiente por tipo+anio, con rango declarado, posicion vigente
 * editable y vigencia por fecha. Vive en esta misma pantalla porque el
 * pedido la ubica en "Organizacion Institucional -> Configuracion de
 * Documentos -> Numeracion de Documentos", no como pantalla aparte. */
function SeccionNumeracion({
  numeraciones,
  opcionesTipoDocumento,
  nombreTipoPorId,
  onGuardado,
}: {
  numeraciones: NumeracionDocumento[] | null;
  opcionesTipoDocumento: Array<{ value: string; label: string }>;
  nombreTipoPorId: Map<string, string>;
  onGuardado: (n: NumeracionDocumento) => void;
}) {
  const anioActualDefecto = new Date().getFullYear();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [tipoDocumentoId, setTipoDocumentoId] = useState('');
  const [anio, setAnio] = useState(String(anioActualDefecto));
  const [ultimoNumero, setUltimoNumero] = useState('0');
  const [mesActual, setMesActual] = useState('');
  const [anioDesde, setAnioDesde] = useState('');
  const [mesDesde, setMesDesde] = useState('');
  const [numeroDesde, setNumeroDesde] = useState('');
  const [anioHasta, setAnioHasta] = useState('');
  const [mesHasta, setMesHasta] = useState('');
  const [numeroHasta, setNumeroHasta] = useState('');
  const [fechaVigenciaDesde, setFechaVigenciaDesde] = useState('');
  const [fechaVigenciaHasta, setFechaVigenciaHasta] = useState('');

  function editar(n: NumeracionDocumento) {
    setTipoDocumentoId(n.tipoDocumentoId);
    setAnio(String(n.anio));
    setUltimoNumero(String(n.ultimoNumero));
    setMesActual(n.mesActual != null ? String(n.mesActual) : '');
    setAnioDesde(n.anioDesde != null ? String(n.anioDesde) : '');
    setMesDesde(n.mesDesde != null ? String(n.mesDesde) : '');
    setNumeroDesde(n.numeroDesde != null ? String(n.numeroDesde) : '');
    setAnioHasta(n.anioHasta != null ? String(n.anioHasta) : '');
    setMesHasta(n.mesHasta != null ? String(n.mesHasta) : '');
    setNumeroHasta(n.numeroHasta != null ? String(n.numeroHasta) : '');
    setFechaVigenciaDesde(n.fechaVigenciaDesde ?? '');
    setFechaVigenciaHasta(n.fechaVigenciaHasta ?? '');
    setMostrarForm(true);
  }

  function nuevo() {
    setTipoDocumentoId('');
    setAnio(String(anioActualDefecto));
    setUltimoNumero('0');
    setMesActual('');
    setAnioDesde('');
    setMesDesde('');
    setNumeroDesde('');
    setAnioHasta('');
    setMesHasta('');
    setNumeroHasta('');
    setFechaVigenciaDesde('');
    setFechaVigenciaHasta('');
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      const numero = (v: string) => (v === '' ? undefined : Number(v));
      const actualizado = await guardarNumeracion({
        tipoDocumentoId,
        anio: Number(anio),
        ultimoNumero: numero(ultimoNumero),
        mesActual: numero(mesActual),
        anioDesde: numero(anioDesde),
        mesDesde: numero(mesDesde),
        numeroDesde: numero(numeroDesde),
        anioHasta: numero(anioHasta),
        mesHasta: numero(mesHasta),
        numeroHasta: numero(numeroHasta),
        fechaVigenciaDesde: fechaVigenciaDesde || undefined,
        fechaVigenciaHasta: fechaVigenciaHasta || undefined,
      });
      onGuardado(actualizado);
      setMensaje('Numeracion guardada.');
      setMostrarForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 14 }}>Numeracion de documentos</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Un numerador independiente por tipo de documento y año (ej. Resolucion 2026/47). El numero se sugiere al
            crear un documento pero solo se consume si el documento se guarda con ese numero.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={nuevo}>+ Nueva numeracion</button>
      </div>

      {error && <Aviso tipo="error" texto={error} fontSize={13} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form onSubmit={guardar} className="card" style={{ background: 'var(--surface-soft)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de documento</label>
              <ComboBuscable ariaLabel="Tipo de documento" opciones={opcionesTipoDocumento} value={tipoDocumentoId} onChange={setTipoDocumentoId} ningunaLabel="-- seleccionar --" placeholderBusqueda="Buscar tipo..." />
            </div>
            <div>
              <label htmlFor="ano" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Año</label>
              <input id="ano" className="input-field" type="number" value={anio} onChange={(e) => setAnio(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="numero-actual-ultimo-emitido" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Numero actual (ultimo emitido)</label>
              <input id="numero-actual-ultimo-emitido" className="input-field" type="number" min={0} value={ultimoNumero} onChange={(e) => setUltimoNumero(e.target.value)} />
            </div>
            <div>
              <label htmlFor="mes-actual" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Mes actual</label>
              <input id="mes-actual" className="input-field" type="number" min={1} max={12} value={mesActual} onChange={(e) => setMesActual(e.target.value)} />
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Rango declarado (informativo/de control)</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="ano-desde" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Año desde</label>
              <input id="ano-desde" className="input-field" type="number" value={anioDesde} onChange={(e) => setAnioDesde(e.target.value)} />
            </div>
            <div>
              <label htmlFor="mes-desde" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Mes desde</label>
              <input id="mes-desde" className="input-field" type="number" min={1} max={12} value={mesDesde} onChange={(e) => setMesDesde(e.target.value)} />
            </div>
            <div>
              <label htmlFor="numero-desde" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Numero desde</label>
              <input id="numero-desde" className="input-field" type="number" value={numeroDesde} onChange={(e) => setNumeroDesde(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="ano-hasta" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Año hasta</label>
              <input id="ano-hasta" className="input-field" type="number" value={anioHasta} onChange={(e) => setAnioHasta(e.target.value)} />
            </div>
            <div>
              <label htmlFor="mes-hasta" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Mes hasta</label>
              <input id="mes-hasta" className="input-field" type="number" min={1} max={12} value={mesHasta} onChange={(e) => setMesHasta(e.target.value)} />
            </div>
            <div>
              <label htmlFor="numero-hasta" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Numero hasta</label>
              <input id="numero-hasta" className="input-field" type="number" value={numeroHasta} onChange={(e) => setNumeroHasta(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="fecha-de-vigencia-desde" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de vigencia desde</label>
              <input id="fecha-de-vigencia-desde" className="input-field" type="date" value={fechaVigenciaDesde} onChange={(e) => setFechaVigenciaDesde(e.target.value)} />
            </div>
            <div>
              <label htmlFor="fecha-de-vigencia-hasta" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de vigencia hasta</label>
              <input id="fecha-de-vigencia-hasta" className="input-field" type="date" value={fechaVigenciaHasta} onChange={(e) => setFechaVigenciaHasta(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-primary" disabled={guardando || !tipoDocumentoId}>{guardando ? 'Guardando...' : 'Guardar numeracion'}</button>
            <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={() => setMostrarForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {numeraciones && numeraciones.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sin numeraciones configuradas.</p>}
      {numeraciones && numeraciones.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Tipo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Año</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Numero actual</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Proximo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Vigencia</th>
              <th scope="col" style={{ padding: '6px 4px' }}></th>
            </tr>
          </thead>
          <tbody>
            {numeraciones.map((n) => (
              <tr key={n.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{nombreTipoPorId.get(n.tipoDocumentoId) ?? n.tipoDocumentoId}</td>
                <td style={{ padding: '6px 4px' }}>{n.anio}</td>
                <td style={{ padding: '6px 4px' }}>{n.ultimoNumero}</td>
                <td style={{ padding: '6px 4px', color: 'var(--muted)' }}>{n.anio}/{String(n.ultimoNumero + 1).padStart(2, '0')}</td>
                <td style={{ padding: '6px 4px', color: 'var(--muted)' }}>
                  {n.fechaVigenciaDesde || n.fechaVigenciaHasta ? `${n.fechaVigenciaDesde ?? '...'} a ${n.fechaVigenciaHasta ?? '...'}` : '-'}
                </td>
                <td style={{ padding: '6px 4px' }}>
                  <button type="button" className="btn-primary" style={{ padding: '3px 8px', fontSize: 11, background: '#475569' }} onClick={() => editar(n)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function CampoConToggle({
  label,
  valor,
  onValor,
  mostrar,
  onMostrar,
}: {
  label: string;
  valor: string;
  onValor: (v: string) => void;
  mostrar: boolean;
  onMostrar: (v: boolean) => void;
}) {
  return (
    <div>
      <label htmlFor="mostrar-en-documentos" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <input type="checkbox" checked={mostrar} onChange={(e) => onMostrar(e.target.checked)} />
        {label} (mostrar en documentos)
      </label>
      <input id="mostrar-en-documentos" className="input-field" value={valor} onChange={(e) => onValor(e.target.value)} />
    </div>
  );
}

function CampoLogo({
  etiqueta,
  url,
  mostrar,
  onMostrarChange,
  subiendo,
  onArchivo,
  disabled,
}: {
  etiqueta: string;
  url: string | null;
  mostrar: boolean;
  onMostrarChange: (v: boolean) => void;
  subiendo: boolean;
  onArchivo: (archivo: File) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <input type="checkbox" checked={mostrar} onChange={(e) => onMostrarChange(e.target.checked)} disabled={disabled} />
        {etiqueta}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`${API_ORIGIN}${url}`} alt={etiqueta} style={{ width: 55, height: 55, objectFit: 'contain', border: '1px solid var(--line)', borderRadius: 6, background: '#fff' }} />
        )}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          disabled={subiendo || disabled}
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            if (archivo) onArchivo(archivo);
            e.target.value = '';
          }}
          style={{ fontSize: 12, color: 'var(--muted)' }}
        />
        {subiendo && <span style={{ fontSize: 11, color: 'var(--muted)' }}>Subiendo...</span>}
      </div>
      <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>png, jpg, webp o gif (no svg — se incrusta en el PDF).</p>
    </div>
  );
}
