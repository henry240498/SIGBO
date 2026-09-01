'use client';

import { useEffect, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { obtenerSesion } from '@/lib/api';
import {
  ChecklistItemVehiculo,
  actualizarChecklistItem,
  cargarChecklistItems,
  crearChecklistItem,
  eliminarChecklistItem,
} from '@/lib/vehiculos';
import { Aviso } from '@/app/components/Aviso';

const CATEGORIAS: ChecklistItemVehiculo['categoria'][] = ['MECANICA', 'EQUIPAMIENTO', 'OTRO'];

export default function ChecklistItemsPage() {
  const confirmar = useConfirmacion();
  const [items, setItems] = useState<ChecklistItemVehiculo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState<ChecklistItemVehiculo['categoria']>('MECANICA');
  const [tipoVehiculo, setTipoVehiculo] = useState('');
  const [orden, setOrden] = useState(0);
  const [guardando, setGuardando] = useState(false);

  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('vehiculos:editar');

  async function cargar() {
    try {
      setItems(await cargarChecklistItems());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await crearChecklistItem({ nombre, categoria, tipoVehiculo: tipoVehiculo || undefined, orden });
      setMensaje('Item creado');
      setNombre('');
      setTipoVehiculo('');
      setOrden(0);
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function toggleActivo(item: ChecklistItemVehiculo) {
    try {
      await actualizarChecklistItem(item.id, { activo: !item.activo });
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function eliminar(id: string) {
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: 'Eliminar este item de checklist?', confirmar: 'Continuar', peligro: true })) return;
    try {
      await eliminarChecklistItem(id);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Catalogo de checklist de moviles ({items?.length ?? 0})</h2>
        {puedeEditar && (
          <button type="button" className="btn-primary" onClick={() => setMostrarForm((v) => !v)}>
            {mostrarForm ? 'Cancelar' : 'Nuevo item'}
          </button>
        )}
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
        Items que se revisan al inspeccionar un movil durante una guardia. Dejar &quot;tipo de vehiculo&quot; vacio
        para que el item aplique a todos los tipos.
      </p>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form className="card" onSubmit={crear} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="nombre" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input id="nombre" className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="categoria" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Categoria</label>
              <select id="categoria" className="input-field" value={categoria} onChange={(e) => setCategoria(e.target.value as ChecklistItemVehiculo['categoria'])}>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="tipo-de-vehiculo-opcional" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de vehiculo (opcional)</label>
              <input id="tipo-de-vehiculo-opcional" className="input-field" value={tipoVehiculo} onChange={(e) => setTipoVehiculo(e.target.value)} placeholder="Aplica a todos si esta vacio" />
            </div>
            <div>
              <label htmlFor="orden" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Orden</label>
              <input id="orden" className="input-field" type="number" value={orden} onChange={(e) => setOrden(Number(e.target.value))} />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={guardando} style={{ alignSelf: 'flex-start' }}>
            {guardando ? 'Guardando...' : 'Crear item'}
          </button>
        </form>
      )}

      {items && items.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Orden</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Nombre</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Categoria</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Tipo de vehiculo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              {puedeEditar && <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{it.orden}</td>
                <td style={{ padding: '6px 4px' }}>{it.nombre}</td>
                <td style={{ padding: '6px 4px' }}><span className="badge">{it.categoria}</span></td>
                <td style={{ padding: '6px 4px' }}>{it.tipoVehiculo ?? 'Todos'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: it.activo ? 'var(--ok-fill)' : 'var(--bad-fill)' }}>
                    {it.activo ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </td>
                {puedeEditar && (
                  <td style={{ padding: '6px 4px', display: 'flex', gap: 6 }}>
                    <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => toggleActivo(it)}>
                      {it.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button type="button"
                      style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: 6 }}
                      onClick={() => eliminar(it.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
