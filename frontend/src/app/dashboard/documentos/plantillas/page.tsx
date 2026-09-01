'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { cargarCatalogo, Catalogo } from '@/lib/personal';
import { Parametro } from '@/lib/parametros';
import {
  PlantillaDocumento,
  actualizarPlantilla,
  cargarCategoriasDocumento,
  cargarPlantillas,
  cargarTiposDocumento,
  crearPlantilla,
  generarDesdePlantilla,
} from '@/lib/documentos';
import { Aviso } from '@/app/components/Aviso';

function extraerCampos(contenido: string): string[] {
  const matches = contenido.matchAll(/\{\{\s*([A-Z_0-9]+)\s*\}\}/g);
  return [...new Set([...matches].map((m) => m[1]))];
}

function ModalGenerar({ plantilla, categorias, onCerrar, onGenerado }: { plantilla: PlantillaDocumento; categorias: Parametro[]; onCerrar: () => void; onGenerado: (documentoId: string) => void }) {
  const campos = useMemo(() => extraerCampos(plantilla.contenido), [plantilla]);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [titulo, setTitulo] = useState(plantilla.nombre);
  const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().slice(0, 10));
  const [categoriaDocumentoId, setCategoriaDocumentoId] = useState('');
  const [autoNumerar, setAutoNumerar] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opcionesCategoria = useMemo(() => categorias.map((c) => ({ value: c.id, label: c.nombre })), [categorias]);

  async function generar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      const documento = await generarDesdePlantilla(plantilla.id, {
        titulo,
        fechaEmision,
        campos: valores,
        categoriaDocumentoId: categoriaDocumentoId || undefined,
        autoNumerar,
      });
      onGenerado(documento.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <form onSubmit={generar} className="card" style={{ width: 520, maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h3 style={{ fontSize: 15 }}>Generar documento desde &quot;{plantilla.nombre}&quot;</h3>
        {error && <Aviso tipo="error" texto={error} fontSize={13} />}
        <div>
          <label htmlFor="titulo-del-documento" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Titulo del documento</label>
          <input id="titulo-del-documento" className="input-field" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label htmlFor="fecha-de-emision" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha de emisión</label>
            <input id="fecha-de-emision" className="input-field" type="date" value={fechaEmision} onChange={(e) => setFechaEmision(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Categoría</label>
            <ComboBuscable ariaLabel="Categoria" opciones={opcionesCategoria} value={categoriaDocumentoId} onChange={setCategoriaDocumentoId} ningunaLabel="Sin categoria" />
          </div>
        </div>
        {campos.length === 0 && <p style={{ fontSize: 12, color: 'var(--muted)' }}>Esta plantilla no tiene campos dinamicos.</p>}
        {campos.map((campo) => (
          <div key={campo}>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>{campo}</label>
            <input aria-label={campo} className="input-field" value={valores[campo] ?? ''} onChange={(e) => setValores({ ...valores, [campo]: e.target.value })} />
          </div>
        ))}
        <label style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={autoNumerar} onChange={(e) => setAutoNumerar(e.target.checked)} />
          Numerar automaticamente
        </label>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
          <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={onCerrar}>Cancelar</button>
          <button type="button" className="btn-primary" disabled={guardando}>{guardando ? 'Generando...' : 'Generar documento'}</button>
        </div>
      </form>
    </div>
  );
}

export default function PlantillasPage() {
  const router = useRouter();
  const [plantillas, setPlantillas] = useState<PlantillaDocumento[] | null>(null);
  const [tipos, setTipos] = useState<Parametro[]>([]);
  const [categorias, setCategorias] = useState<Parametro[]>([]);
  const [cargos, setCargos] = useState<Catalogo[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [plantillaGenerar, setPlantillaGenerar] = useState<PlantillaDocumento | null>(null);

  const [nombre, setNombre] = useState('');
  const [tipoDocumentoId, setTipoDocumentoId] = useState('');
  const [contenido, setContenido] = useState('');
  const [cargoFirmanteId, setCargoFirmanteId] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeAdministrar = permisos.includes('documentos:administrar');
  const puedeCrear = permisos.includes('documentos:crear');

  const opcionesTipo = useMemo(() => tipos.map((t) => ({ value: t.id, label: t.nombre })), [tipos]);
  const opcionesCargo = useMemo(() => cargos.map((c) => ({ value: c.id, label: c.nombre })), [cargos]);
  const tipoPorId = useMemo(() => new Map(tipos.map((t) => [t.id, t.nombre])), [tipos]);

  async function cargar() {
    try {
      setPlantillas(await cargarPlantillas());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    cargarTiposDocumento().then(setTipos).catch(() => undefined);
    cargarCategoriasDocumento().then(setCategorias).catch(() => undefined);
    cargarCatalogo('/organizacion/cargos').then(setCargos).catch(() => undefined);
  }, []);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await crearPlantilla({ nombre, tipoDocumentoId: tipoDocumentoId || undefined, contenido, cargoFirmanteId: cargoFirmanteId || undefined });
      setMensaje('Plantilla creada.');
      setNombre('');
      setTipoDocumentoId('');
      setContenido('');
      setCargoFirmanteId('');
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function alternarActiva(p: PlantillaDocumento) {
    setError(null);
    try {
      await actualizarPlantilla(p.id, { activa: !p.activa });
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Plantillas ({plantillas?.length ?? 0})</h2>
        {puedeAdministrar && (
          <button type="button" className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : '+ Nueva plantilla'}
          </button>
        )}
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="nombre" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input id="nombre" className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de documento</label>
              <ComboBuscable ariaLabel="Tipo de documento" opciones={opcionesTipo} value={tipoDocumentoId} onChange={setTipoDocumentoId} ningunaLabel="Sin definir" />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cargo firmante</label>
              <ComboBuscable ariaLabel="Cargo firmante" opciones={opcionesCargo} value={cargoFirmanteId} onChange={setCargoFirmanteId} ningunaLabel="Sin firmante" />
            </div>
          </div>
          <div>
            <label htmlFor="contenido-usar-para-placeholders" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Contenido (usar {'{{CAMPO}}'} para placeholders)</label>
            <textarea id="contenido-usar-para-placeholders" className="input-field" rows={8} value={contenido} onChange={(e) => setContenido(e.target.value)} required />
          </div>
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Crear plantilla'}
          </button>
        </form>
      )}

      {plantillas && plantillas.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay plantillas cargadas.</p>}
      {plantillas && plantillas.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Nombre</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Tipo de documento</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {plantillas.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{p.nombre}</td>
                <td style={{ padding: '6px 4px' }}>{p.tipoDocumentoId ? tipoPorId.get(p.tipoDocumentoId) ?? '-' : '-'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: p.activa ? 'var(--ok-fill)' : 'var(--neutral-fill)' }}>{p.activa ? 'ACTIVA' : 'INACTIVA'}</span>
                </td>
                <td style={{ padding: '6px 4px', display: 'flex', gap: 6 }}>
                  {puedeCrear && p.activa && (
                    <button type="button" className="btn-primary" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => setPlantillaGenerar(p)}>Generar</button>
                  )}
                  {puedeAdministrar && (
                    <button type="button" className="btn-primary" style={{ padding: '3px 8px', fontSize: 11, background: '#475569' }} onClick={() => alternarActiva(p)}>
                      {p.activa ? 'Desactivar' : 'Activar'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {plantillaGenerar && (
        <ModalGenerar
          plantilla={plantillaGenerar}
          categorias={categorias}
          onCerrar={() => setPlantillaGenerar(null)}
          onGenerado={(documentoId) => {
            setPlantillaGenerar(null);
            router.push(`/dashboard/documentos/${documentoId}`);
          }}
        />
      )}
    </div>
  );
}
