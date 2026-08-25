'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { apiFetch } from '@/lib/api';
import { descargarArchivo } from '@/lib/exportar';

interface TipoGuardia {
  id: string;
  codigo: string;
  nombre: string;
  duracionHoras: number | null;
  descripcion: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  creadoEn: string;
  actualizadoEn: string;
  eliminadoEn: string | null;
}

export default function TiposGuardiaPage() {
  const confirmar = useConfirmacion();
  const [tiposGuardia, setTiposGuardia] = useState<TipoGuardia[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [mostrarEliminados, setMostrarEliminados] = useState(false);

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [duracionHoras, setDuracionHoras] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState<'ACTIVO' | 'INACTIVO'>('ACTIVO');

  async function cargar() {
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (estadoFiltro) params.set('estado', estadoFiltro);
      if (mostrarEliminados) params.set('incluirEliminados', 'true');
      const res = await apiFetch(`/organizacion/tipos-guardia?${params.toString()}`);
      if (!res.ok) throw new Error('No se pudo cargar los tipos de guardia');
      setTiposGuardia(await res.json());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, estadoFiltro, mostrarEliminados]);

  function limpiarFormulario() {
    setCodigo('');
    setNombre('');
    setDuracionHoras('');
    setDescripcion('');
    setEstado('ACTIVO');
    setEditandoId(null);
  }

  function editar(tg: TipoGuardia) {
    setCodigo(tg.codigo);
    setNombre(tg.nombre);
    setDuracionHoras(tg.duracionHoras !== null ? String(tg.duracionHoras) : '');
    setDescripcion(tg.descripcion ?? '');
    setEstado(tg.estado);
    setEditandoId(tg.id);
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);

    const body = {
      codigo,
      nombre,
      duracionHoras: duracionHoras !== '' ? Number(duracionHoras) : undefined,
      descripcion: descripcion || undefined,
      estado,
    };

    const res = editandoId
      ? await apiFetch(`/organizacion/tipos-guardia/${editandoId}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        })
      : await apiFetch('/organizacion/tipos-guardia', {
          method: 'POST',
          body: JSON.stringify(body),
        });

    if (!res.ok) {
      const body2 = await res.json().catch(() => ({}));
      setError(body2.message ?? 'No se pudo guardar el tipo de guardia');
      return;
    }

    setMensaje(editandoId ? 'Tipo de guardia actualizado' : 'Tipo de guardia creado');
    limpiarFormulario();
    setMostrarForm(false);
    await cargar();
  }

  function cancelar() {
    limpiarFormulario();
    setMostrarForm(false);
  }

  async function darBaja(id: string) {
    setError(null);
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: 'Dar de baja este tipo de guardia?', confirmar: 'Continuar', peligro: true })) return;
    const res = await apiFetch(`/organizacion/tipos-guardia/${id}/baja`, { method: 'PATCH' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo dar de baja el tipo de guardia');
      return;
    }
    await cargar();
  }

  async function reactivar(id: string) {
    setError(null);
    const res = await apiFetch(`/organizacion/tipos-guardia/${id}/reactivar`, { method: 'PATCH' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo reactivar el tipo de guardia');
      return;
    }
    await cargar();
  }



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontSize: 16 }}>Tipos de Guardia ({tiposGuardia?.length ?? 0})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/dashboard/organizacion/guardias/planificacion" className="btn-primary" style={{ textDecoration: 'none', background: '#1d4ed8' }}>
            Planificar orden de guardia
          </Link>
          <button type="button" className="btn-primary" onClick={() => descargarArchivo('/organizacion/tipos-guardia/exportar/excel', 'guardias.xlsx')}>
            Exportar a Excel
          </button>
          <button type="button" className="btn-primary" onClick={() => descargarArchivo('/organizacion/tipos-guardia/exportar/pdf', 'guardias.pdf')}>
            Exportar a PDF
          </button>
          <button type="button"
            className="btn-primary"
            onClick={() => {
              if (mostrarForm) {
                cancelar();
              } else {
                limpiarFormulario();
                setMostrarForm(true);
              }
            }}
          >
            {mostrarForm ? 'Cancelar' : 'Nuevo tipo de guardia'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="input-field"
          style={{ maxWidth: 260 }}
          placeholder="Buscar por nombre o codigo..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="input-field" style={{ maxWidth: 160 }} value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={mostrarEliminados} onChange={(e) => setMostrarEliminados(e.target.checked)} />
          Mostrar eliminados
        </label>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {mostrarForm && (
        <form className="card" onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Codigo</label>
              <input className="input-field" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Duracion (horas)</label>
              <input
                className="input-field"
                type="number"
                min={0}
                value={duracionHoras}
                onChange={(e) => setDuracionHoras(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
              <select className="input-field" value={estado} onChange={(e) => setEstado(e.target.value as 'ACTIVO' | 'INACTIVO')}>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripcion</label>
            <input className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
            {editandoId ? 'Guardar cambios' : 'Crear tipo de guardia'}
          </button>
        </form>
      )}

      {tiposGuardia && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Codigo</th>
              <th style={{ padding: '6px 4px' }}>Nombre</th>
              <th style={{ padding: '6px 4px' }}>Duracion (h)</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tiposGuardia.map((tg) => (
              <tr key={tg.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{tg.codigo}</td>
                <td style={{ padding: '6px 4px' }}>{tg.nombre}</td>
                <td style={{ padding: '6px 4px', color: '#94a3b8' }}>{tg.duracionHoras ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: tg.estado === 'ACTIVO' ? '#166534' : '#7f1d1d' }}>
                    {tg.estado}
                  </span>
                </td>
                <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(tg)}>
                    Editar
                  </button>
                  {tg.eliminadoEn === null ? (
                    <button type="button"
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }}
                      onClick={() => darBaja(tg.id)}
                    >
                      Eliminar
                    </button>
                  ) : (
                    <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => reactivar(tg.id)}>
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
