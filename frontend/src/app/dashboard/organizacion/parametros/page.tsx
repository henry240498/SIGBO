'use client';

import { useEffect, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { apiFetch } from '@/lib/api';
import { descargarArchivo } from '@/lib/exportar';
import { cargarParametros, Parametro, TipoParametro } from '@/lib/parametros';

interface Familia {
  tipo: TipoParametro;
  label: string;
  labelSingular: string;
}

const FAMILIAS: Familia[] = [
  { tipo: 'PAIS', label: 'Países', labelSingular: 'país' },
  { tipo: 'DEPARTAMENTO', label: 'Departamentos', labelSingular: 'departamento' },
  { tipo: 'CIUDAD', label: 'Ciudades', labelSingular: 'ciudad' },
  { tipo: 'BARRIO', label: 'Barrios', labelSingular: 'barrio' },
  { tipo: 'PROFESION', label: 'Profesiones', labelSingular: 'profesión' },
  { tipo: 'IDIOMA', label: 'Idiomas', labelSingular: 'idioma' },
  { tipo: 'NIVEL_IDIOMA', label: 'Niveles de Idioma', labelSingular: 'nivel de idioma' },
  { tipo: 'GRUPO_SANGUINEO', label: 'Grupos Sanguíneos', labelSingular: 'grupo sanguíneo' },
  { tipo: 'FACTOR_RH', label: 'Factores RH', labelSingular: 'factor RH' },
  { tipo: 'TIPO_SEGURO', label: 'Tipos de Seguro', labelSingular: 'tipo de seguro' },
  { tipo: 'ASEGURADORA', label: 'Aseguradoras', labelSingular: 'aseguradora' },
];

/** Cadena de ancestros que hay que elegir antes de poder listar/crear en esta
 * familia (jerarquia geografica PAIS -> DEPARTAMENTO -> CIUDAD -> BARRIO). */
const CADENA_ANCESTROS: Partial<Record<TipoParametro, { tipo: TipoParametro; label: string }[]>> = {
  DEPARTAMENTO: [{ tipo: 'PAIS', label: 'País' }],
  CIUDAD: [
    { tipo: 'PAIS', label: 'País' },
    { tipo: 'DEPARTAMENTO', label: 'Departamento' },
  ],
  BARRIO: [
    { tipo: 'PAIS', label: 'País' },
    { tipo: 'DEPARTAMENTO', label: 'Departamento' },
    { tipo: 'CIUDAD', label: 'Ciudad' },
  ],
};

export default function ParametrosPage() {
  const confirmar = useConfirmacion();
  const [familia, setFamilia] = useState<TipoParametro>('PAIS');
  const [cadena, setCadena] = useState<Record<string, string>>({});
  const [opcionesCadena, setOpcionesCadena] = useState<Record<string, Parametro[]>>({});

  const [items, setItems] = useState<Parametro[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mostrarEliminados, setMostrarEliminados] = useState(false);

  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [orden, setOrden] = useState(0);
  const [estado, setEstado] = useState<'ACTIVO' | 'INACTIVO'>('ACTIVO');
  const [guardando, setGuardando] = useState(false);

  const ancestros = CADENA_ANCESTROS[familia] ?? [];
  const familiaActual = FAMILIAS.find((f) => f.tipo === familia)!;

  // El padre efectivo es el ultimo nivel de la cadena de ancestros ya elegido.
  const padreId = ancestros.length > 0 ? cadena[ancestros[ancestros.length - 1].tipo] : undefined;
  const cadenaCompleta = ancestros.length === 0 || !!padreId;

  function cambiarFamilia(nuevaFamilia: TipoParametro) {
    setFamilia(nuevaFamilia);
    setCadena({});
    setOpcionesCadena({});
    setItems(null);
    setMostrarForm(false);
    setEditandoId(null);
  }

  // Carga el primer nivel de la cadena de ancestros cuando cambia la familia.
  useEffect(() => {
    if (ancestros.length > 0) {
      cargarParametros(ancestros[0].tipo).then((data) => setOpcionesCadena((prev) => ({ ...prev, [ancestros[0].tipo]: data })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familia]);

  function seleccionarAncestro(nivelIdx: number, id: string) {
    const nuevaCadena: Record<string, string> = {};
    for (let i = 0; i < nivelIdx; i++) nuevaCadena[ancestros[i].tipo] = cadena[ancestros[i].tipo];
    nuevaCadena[ancestros[nivelIdx].tipo] = id;
    setCadena(nuevaCadena);

    const siguiente = ancestros[nivelIdx + 1];
    if (siguiente && id) {
      cargarParametros(siguiente.tipo, id).then((data) => setOpcionesCadena((prev) => ({ ...prev, [siguiente.tipo]: data })));
    }
  }

  async function cargar() {
    if (!cadenaCompleta) {
      setItems([]);
      return;
    }
    try {
      const params = new URLSearchParams({ tipo: familia });
      if (padreId) params.set('padreId', padreId);
      if (mostrarEliminados) params.set('incluirEliminados', 'true');
      const res = await apiFetch(`/organizacion/parametros?${params.toString()}`);
      if (!res.ok) throw new Error('No se pudo cargar el listado');
      setItems(await res.json());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familia, padreId, mostrarEliminados]);

  function limpiarForm() {
    setNombre('');
    setCodigo('');
    setDescripcion('');
    setOrden(0);
    setEstado('ACTIVO');
    setEditandoId(null);
  }

  function editar(p: Parametro) {
    setEditandoId(p.id);
    setNombre(p.nombre);
    setCodigo(p.codigo ?? '');
    setDescripcion(p.descripcion ?? '');
    setOrden(p.orden);
    setEstado(p.estado);
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      const payload = {
        tipo: familia,
        padreId: padreId || undefined,
        nombre,
        codigo: codigo || undefined,
        descripcion: descripcion || undefined,
        orden,
        estado,
      };
      const res = editandoId
        ? await apiFetch(`/organizacion/parametros/${editandoId}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : await apiFetch('/organizacion/parametros', { method: 'POST', body: JSON.stringify(payload) });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo guardar');
      }
      setMensaje(editandoId ? 'Actualizado' : 'Creado');
      limpiarForm();
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function darBaja(id: string) {
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: `Dar de baja este ${familiaActual.labelSingular}?`, confirmar: 'Continuar', peligro: true })) return;
    const res = await apiFetch(`/organizacion/parametros/${id}/baja`, { method: 'PATCH' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo dar de baja');
      return;
    }
    await cargar();
  }

  async function reactivar(id: string) {
    const res = await apiFetch(`/organizacion/parametros/${id}/reactivar`, { method: 'PATCH' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo reactivar');
      return;
    }
    await cargar();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Parámetros institucionales</h2>
        <p style={{ fontSize: 13, color: '#94a3b8' }}>
          Catálogos administrables que evitan texto libre en Personal (país, ubicación, profesión,
          idiomas, salud, seguros). Los demás módulos consumen estos valores mediante combos.
        </p>
      </div>

      <div className="card" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FAMILIAS.map((f) => (
          <button type="button"
            key={f.tipo}
            onClick={() => cambiarFamilia(f.tipo)}
            className="btn-primary"
            style={{
              padding: '6px 12px',
              fontSize: 12,
              background: familia === f.tipo ? '#2563eb' : '#334155',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {ancestros.length > 0 && (
        <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {ancestros.map((a, idx) => {
            const habilitado = idx === 0 || !!cadena[ancestros[idx - 1].tipo];
            return (
              <div key={a.tipo}>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>{a.label}</label>
                <select
                  className="input-field"
                  style={{ minWidth: 180 }}
                  value={cadena[a.tipo] ?? ''}
                  disabled={!habilitado}
                  onChange={(e) => seleccionarAncestro(idx, e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {(opcionesCadena[a.tipo] ?? []).map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nombre}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}

      {!cadenaCompleta && (
        <p style={{ color: '#94a3b8', fontSize: 13 }}>
          Selecciona {ancestros[ancestros.length - 1]?.label.toLowerCase()} para ver/crear{' '}
          {familiaActual.label.toLowerCase()}.
        </p>
      )}

      {cadenaCompleta && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 14 }}>
              {familiaActual.label} ({items?.length ?? 0})
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button"
                className="btn-primary"
                onClick={() =>
                  descargarArchivo(`/organizacion/parametros/exportar/excel?tipo=${familia}`, `parametros-${familia}.xlsx`)
                }
              >
                Exportar a Excel
              </button>
              <button type="button"
                className="btn-primary"
                onClick={() =>
                  descargarArchivo(`/organizacion/parametros/exportar/pdf?tipo=${familia}`, `parametros-${familia}.pdf`)
                }
              >
                Exportar a PDF
              </button>
              <button type="button"
                className="btn-primary"
                onClick={() => {
                  if (mostrarForm) {
                    setMostrarForm(false);
                  } else {
                    limpiarForm();
                    setMostrarForm(true);
                  }
                }}
              >
                {mostrarForm ? 'Cancelar' : `Nuevo ${familiaActual.labelSingular}`}
              </button>
            </div>
          </div>

          <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={mostrarEliminados} onChange={(e) => setMostrarEliminados(e.target.checked)} />
            Mostrar eliminados
          </label>

          {error && <p style={{ color: '#f87171' }}>{error}</p>}
          {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

          {mostrarForm && (
            <form className="card" onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
                  <input className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Código (opcional)</label>
                  <input className="input-field" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Orden</label>
                  <input
                    className="input-field"
                    type="number"
                    value={orden}
                    onChange={(e) => setOrden(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
                  <select
                    className="input-field"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as 'ACTIVO' | 'INACTIVO')}
                  >
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="INACTIVO">INACTIVO</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripción</label>
                <input className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn-primary" disabled={guardando} style={{ alignSelf: 'flex-start' }}>
                  {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear'}
                </button>
              </div>
            </form>
          )}

          {items && items.length === 0 && (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Todavía no hay {familiaActual.label.toLowerCase()} cargados.</p>
          )}

          {items && items.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '6px 4px' }}>Nombre</th>
                  <th style={{ padding: '6px 4px' }}>Código</th>
                  <th style={{ padding: '6px 4px' }}>Estado</th>
                  <th style={{ padding: '6px 4px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '6px 4px' }}>{p.nombre}</td>
                    <td style={{ padding: '6px 4px' }}>{p.codigo ?? ''}</td>
                    <td style={{ padding: '6px 4px' }}>
                      <span className="badge" style={{ background: p.estado === 'ACTIVO' ? '#166534' : '#7f1d1d' }}>
                        {p.estado}
                      </span>
                    </td>
                    <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(p)}>
                        Editar
                      </button>
                      {p.eliminadoEn === null ? (
                        <button type="button"
                          className="btn-primary"
                          style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }}
                          onClick={() => darBaja(p.id)}
                        >
                          Eliminar
                        </button>
                      ) : (
                        <button type="button"
                          className="btn-primary"
                          style={{ padding: '4px 8px', fontSize: 12, background: '#166534' }}
                          onClick={() => reactivar(p.id)}
                        >
                          Reactivar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
