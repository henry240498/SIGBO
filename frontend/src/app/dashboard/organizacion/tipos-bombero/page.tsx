'use client';

import { useEffect, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { apiFetch } from '@/lib/api';
import { descargarArchivo } from '@/lib/exportar';

interface TipoBombero {
  id: string;
  nombre: string;
  prefijo: string;
  descripcion: string | null;
  orden: number;
  estado: 'ACTIVO' | 'INACTIVO';
  eliminadoEn: string | null;
}

export default function TiposBomberoPage() {
  const confirmar = useConfirmacion();
  const [tipos, setTipos] = useState<TipoBombero[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [mostrarEliminados, setMostrarEliminados] = useState(false);

  const [nombre, setNombre] = useState('');
  const [prefijo, setPrefijo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [orden, setOrden] = useState(0);
  const [estado, setEstado] = useState<'ACTIVO' | 'INACTIVO'>('ACTIVO');
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (filtroEstado) params.set('estado', filtroEstado);
      if (mostrarEliminados) params.set('incluirEliminados', 'true');

      const res = await apiFetch(`/personal/tipos-bombero?${params.toString()}`);
      if (!res.ok) throw new Error('No se pudo cargar los tipos de bombero');
      setTipos(await res.json());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filtroEstado, mostrarEliminados]);

  function limpiarForm() {
    setNombre('');
    setPrefijo('');
    setDescripcion('');
    setOrden(0);
    setEstado('ACTIVO');
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

  function editar(t: TipoBombero) {
    setEditandoId(t.id);
    setNombre(t.nombre);
    setPrefijo(t.prefijo);
    setDescripcion(t.descripcion ?? '');
    setOrden(t.orden);
    setEstado(t.estado);
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      const payload = {
        nombre,
        prefijo: prefijo.toUpperCase(),
        descripcion: descripcion || undefined,
        orden,
        estado,
      };

      const res = editandoId
        ? await apiFetch(`/personal/tipos-bombero/${editandoId}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          })
        : await apiFetch('/personal/tipos-bombero', {
            method: 'POST',
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          Array.isArray(body.message)
            ? body.message.join(', ')
            : body.message ?? 'No se pudo guardar el tipo de bombero',
        );
      }

      setMensaje(editandoId ? 'Tipo de bombero actualizado' : 'Tipo de bombero creado');
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
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: 'Dar de baja este tipo de bombero?', confirmar: 'Continuar', peligro: true })) return;
    const res = await apiFetch(`/personal/tipos-bombero/${id}/baja`, { method: 'PATCH' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo dar de baja el tipo de bombero');
      return;
    }
    await cargar();
  }

  async function reactivar(id: string) {
    setError(null);
    const res = await apiFetch(`/personal/tipos-bombero/${id}/reactivar`, { method: 'PATCH' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo reactivar el tipo de bombero');
      return;
    }
    await cargar();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Tipos de Bombero ({tipos?.length ?? 0})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button"
            className="btn-primary"
            onClick={() => descargarArchivo('/personal/tipos-bombero/exportar/excel', 'tipos-bombero.xlsx')}
          >
            Exportar a Excel
          </button>
          <button type="button"
            className="btn-primary"
            onClick={() => descargarArchivo('/personal/tipos-bombero/exportar/pdf', 'tipos-bombero.pdf')}
          >
            Exportar a PDF
          </button>
          <button type="button" className="btn-primary" onClick={mostrarForm ? cancelarForm : abrirNuevo}>
            {mostrarForm ? 'Cancelar' : 'Nuevo tipo de bombero'}
          </button>
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#94a3b8' }}>
        El prefijo gobierna el codigo bomberil de los nuevos ingresos (ej: prefijo "BC" + numero manual "045" =
        codigo "BC045"). Cambiar un prefijo aqui no modifica codigos ya asignados.
      </p>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="input-field"
          style={{ maxWidth: 260 }}
          placeholder="Buscar por nombre o prefijo..."
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

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {mostrarForm && (
        <form className="card" onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Prefijo</label>
              <input
                className="input-field"
                value={prefijo}
                onChange={(e) => setPrefijo(e.target.value)}
                maxLength={10}
                style={{ textTransform: 'uppercase' }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
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
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripcion</label>
            <input className="input-field" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn-primary" disabled={guardando} style={{ alignSelf: 'flex-start' }}>
              {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear tipo de bombero'}
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

      {tipos && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Prefijo</th>
              <th style={{ padding: '6px 4px' }}>Nombre</th>
              <th style={{ padding: '6px 4px' }}>Descripcion</th>
              <th style={{ padding: '6px 4px' }}>Orden</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tipos.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px', fontWeight: 600 }}>{t.prefijo}</td>
                <td style={{ padding: '6px 4px' }}>{t.nombre}</td>
                <td style={{ padding: '6px 4px' }}>{t.descripcion ?? ''}</td>
                <td style={{ padding: '6px 4px' }}>{t.orden}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span
                    className="badge"
                    style={{ background: t.estado === 'ACTIVO' ? '#166534' : '#7f1d1d' }}
                  >
                    {t.estado}
                  </span>
                </td>
                <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(t)}>
                    Editar
                  </button>
                  {t.eliminadoEn === null ? (
                    <button type="button"
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }}
                      onClick={() => darBaja(t.id)}
                    >
                      Eliminar
                    </button>
                  ) : (
                    <button type="button"
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 12, background: '#166534' }}
                      onClick={() => reactivar(t.id)}
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
