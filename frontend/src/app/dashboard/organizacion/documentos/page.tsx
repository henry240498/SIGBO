'use client';

import { useEffect, useState } from 'react';
import { API_ORIGIN, obtenerSesion } from '@/lib/api';
import {
  IdentidadInstitucional,
  LineaDestacada,
  actualizarIdentidadInstitucional,
  cargarIdentidadInstitucional,
  subirLogoInstitucional,
} from '@/lib/organizacion';

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
      <p style={{ color: '#94a3b8', fontSize: 13 }}>
        Solo un usuario con el permiso <code>organizacion:documentos_ver</code> puede acceder a esta seccion.
      </p>
    );
  }
  if (cargando) return <p style={{ color: '#94a3b8' }}>Cargando...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900 }}>
      <div>
        <h2 style={{ fontSize: 16 }}>Configuracion de Documentos</h2>
        <p style={{ fontSize: 13, color: '#94a3b8' }}>
          Identidad institucional (membrete, datos de contacto, pie de pagina) usada por TODOS los documentos PDF y
          Word que genere SIGBO — Orden de Guardia hoy, y cualquier modulo nuevo que genere documentos mas adelante.
          Un solo lugar, no un membrete distinto por modulo.
        </p>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

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
          <h3 style={{ fontSize: 14 }}>Datos institucionales</h3>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre de la institucion</label>
            <input className="input-field" value={nombreInstitucion} onChange={(e) => setNombreInstitucion(e.target.value)} />
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
            <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <input type="checkbox" checked={mostrarFechaFundacion} onChange={(e) => setMostrarFechaFundacion(e.target.checked)} />
              Fecha de fundacion (mostrar en documentos)
            </label>
            <input className="input-field" type="date" value={fechaFundacion} onChange={(e) => setFechaFundacion(e.target.value)} />
          </div>
        </section>

        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Subtitulos y distinciones</h3>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>
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
          <p style={{ fontSize: 12, color: '#94a3b8' }}>
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
          <button className="btn-primary" disabled={guardando} style={{ alignSelf: 'flex-start' }} onClick={guardar}>
            {guardando ? 'Guardando...' : 'Guardar configuracion'}
          </button>
        )}
      </fieldset>
    </div>
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
      <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <input type="checkbox" checked={mostrar} onChange={(e) => onMostrar(e.target.checked)} />
        {label} (mostrar en documentos)
      </label>
      <input className="input-field" value={valor} onChange={(e) => onValor(e.target.value)} />
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
          <img src={`${API_ORIGIN}${url}`} alt={etiqueta} style={{ width: 55, height: 55, objectFit: 'contain', border: '1px solid #334155', borderRadius: 6, background: '#fff' }} />
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
          style={{ fontSize: 12, color: '#94a3b8' }}
        />
        {subiendo && <span style={{ fontSize: 11, color: '#94a3b8' }}>Subiendo...</span>}
      </div>
      <p style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>png, jpg, webp o gif (no svg — se incrusta en el PDF).</p>
    </div>
  );
}
