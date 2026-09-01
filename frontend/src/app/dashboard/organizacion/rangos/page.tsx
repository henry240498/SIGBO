'use client';

import { useEffect, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { apiFetch } from '@/lib/api';
import { descargarArchivo } from '@/lib/exportar';
import { Aviso } from '@/app/components/Aviso';

interface Rango {
  id: string;
  codigo: string;
  nombre: string;
  nivelJerarquico: number;
  descripcion: string | null;
  insigniaUrl: string | null;
  color: string;
  ordenJerarquico: number;
  estado: 'ACTIVO' | 'INACTIVO';
  observaciones: string | null;
  eliminadoEn: string | null;
}

export default function RangosPage() {
  const confirmar = useConfirmacion();
  const [rangos, setRangos] = useState<Rango[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [mostrarEliminados, setMostrarEliminados] = useState(false);

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [nivelJerarquico, setNivelJerarquico] = useState(0);
  const [descripcion, setDescripcion] = useState('');
  const [insigniaUrl, setInsigniaUrl] = useState('');
  const [color, setColor] = useState('#6B7280');
  const [ordenJerarquico, setOrdenJerarquico] = useState(0);
  const [estado, setEstado] = useState<'ACTIVO' | 'INACTIVO'>('ACTIVO');
  const [observaciones, setObservaciones] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (filtroEstado) params.set('estado', filtroEstado);
      if (mostrarEliminados) params.set('incluirEliminados', 'true');

      const res = await apiFetch(`/organizacion/rangos?${params.toString()}`);
      if (!res.ok) throw new Error('No se pudo cargar los rangos');
      setRangos(await res.json());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filtroEstado, mostrarEliminados]);

  function limpiarForm() {
    setCodigo('');
    setNombre('');
    setNivelJerarquico(0);
    setDescripcion('');
    setInsigniaUrl('');
    setColor('#6B7280');
    setOrdenJerarquico(0);
    setEstado('ACTIVO');
    setObservaciones('');
    setEditandoId(null);
  }

  function abrirNuevo() {
    limpiarForm();
    setMostrarForm(true);
  }

  function cancelarForm() {
    limpiarForm();
    setMostrarForm(false);
  }

  function editar(r: Rango) {
    setEditandoId(r.id);
    setCodigo(r.codigo);
    setNombre(r.nombre);
    setNivelJerarquico(r.nivelJerarquico);
    setDescripcion(r.descripcion ?? '');
    setInsigniaUrl(r.insigniaUrl ?? '');
    setColor(r.color ?? '#6B7280');
    setOrdenJerarquico(r.ordenJerarquico);
    setEstado(r.estado);
    setObservaciones(r.observaciones ?? '');
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      const payload = {
        codigo,
        nombre,
        nivelJerarquico,
        descripcion: descripcion || undefined,
        insigniaUrl: insigniaUrl || undefined,
        color,
        ordenJerarquico,
        estado,
        observaciones: observaciones || undefined,
      };

      const res = editandoId
        ? await apiFetch(`/organizacion/rangos/${editandoId}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          })
        : await apiFetch('/organizacion/rangos', {
            method: 'POST',
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo guardar el rango',
        );
      }

      setMensaje(editandoId ? 'Rango actualizado' : 'Rango creado');
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
    setError(null);
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: 'Dar de baja este rango?', confirmar: 'Continuar', peligro: true })) return;
    const res = await apiFetch(`/organizacion/rangos/${id}/baja`, { method: 'PATCH' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo dar de baja el rango');
      return;
    }
    await cargar();
  }

  async function reactivar(id: string) {
    setError(null);
    const res = await apiFetch(`/organizacion/rangos/${id}/reactivar`, { method: 'PATCH' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo reactivar el rango');
      return;
    }
    await cargar();
  }



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Rangos ({rangos?.length ?? 0})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-primary" onClick={() => descargarArchivo('/organizacion/rangos/exportar/excel', 'rangos.xlsx')}>
            Exportar a Excel
          </button>
          <button type="button" className="btn-primary" onClick={() => descargarArchivo('/organizacion/rangos/exportar/pdf', 'rangos.pdf')}>
            Exportar a PDF
          </button>
          <button type="button" className="btn-primary" onClick={mostrarForm ? cancelarForm : abrirNuevo}>
            {mostrarForm ? 'Cancelar' : 'Nuevo rango'}
          </button>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="input-field"
          style={{ maxWidth: 260 }}
          placeholder="Buscar por codigo o nombre..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="input-field"
          style={{ maxWidth: 180 }}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVO">ACTIVO</option>
          <option value="INACTIVO">INACTIVO</option>
        </select>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            checked={mostrarEliminados}
            onChange={(e) => setMostrarEliminados(e.target.checked)}
          />
          Mostrar eliminados
        </label>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form className="card" onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="codigo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Código</label>
              <input id="codigo" className="input-field" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="nombre" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input id="nombre" className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="nivel-jerarquico" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nivel jerarquico</label>
              <input id="nivel-jerarquico"
                className="input-field"
                type="number"
                value={nivelJerarquico}
                onChange={(e) => setNivelJerarquico(Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="orden-jerarquico" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Orden jerarquico</label>
              <input id="orden-jerarquico"
                className="input-field"
                type="number"
                value={ordenJerarquico}
                onChange={(e) => setOrdenJerarquico(Number(e.target.value))}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="url-de-insignia" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>URL de insignia</label>
              <input id="url-de-insignia"
                className="input-field"
                value={insigniaUrl}
                onChange={(e) => setInsigniaUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div>
              <label htmlFor="color" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Color</label>
              <input id="color"
                className="input-field"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="estado" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
              <select id="estado"
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
            <label htmlFor="descripcion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripción</label>
            <input id="descripcion" className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <div>
            <label htmlFor="observaciones" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observaciones</label>
            <input id="observaciones" className="input-field" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn-primary" disabled={guardando} style={{ alignSelf: 'flex-start' }}>
              {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear rango'}
            </button>
            {editandoId && (
              <button
                type="button"
                className="btn-primary"
                style={{ alignSelf: 'flex-start', background: '#475569' }}
                onClick={cancelarForm}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      {rangos && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Código</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Nombre</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Nivel</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Orden</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Color</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rangos.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{r.codigo}</td>
                <td style={{ padding: '6px 4px' }}>{r.nombre}</td>
                <td style={{ padding: '6px 4px' }}>{r.nivelJerarquico}</td>
                <td style={{ padding: '6px 4px' }}>{r.ordenJerarquico}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span
                    title={r.color}
                    style={{
                      display: 'inline-block',
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      background: r.color,
                      border: '1px solid var(--line)',
                    }}
                  />
                </td>
                <td style={{ padding: '6px 4px' }}>
                  <span
                    className="badge"
                    style={{ background: r.estado === 'ACTIVO' ? 'var(--ok-fill)' : 'var(--bad-fill)' }}
                  >
                    {r.estado}
                  </span>
                </td>
                <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(r)}>
                    Editar
                  </button>
                  {r.eliminadoEn === null ? (
                    <button type="button"
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }}
                      onClick={() => darBaja(r.id)}
                    >
                      Eliminar
                    </button>
                  ) : (
                    <button type="button"
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 12, background: '#166534' }}
                      onClick={() => reactivar(r.id)}
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
    </div>
  );
}
