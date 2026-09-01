'use client';

import { useEffect, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { apiFetch } from '@/lib/api';
import { descargarArchivo } from '@/lib/exportar';
import { Aviso } from '@/app/components/Aviso';

interface Cuartel {
  id: string;
  codigo: string;
  nombre: string;
  companiaId: string;
  direccion: string | null;
  telefono: string | null;
  responsableBomberoId: string | null;
  estado: string;
  eliminadoEn: string | null;
}

interface Compania {
  id: string;
  nombre: string;
}

interface Bombero {
  id: string;
  numeroBombero: string;
  nombre: string;
  apellido: string;
}

export default function CuartelesPage() {
  const confirmar = useConfirmacion();
  const [cuarteles, setCuarteles] = useState<Cuartel[] | null>(null);
  const [companias, setCompanias] = useState<Compania[]>([]);
  const [bomberos, setBomberos] = useState<Bombero[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [mostrarEliminados, setMostrarEliminados] = useState(false);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [companiaId, setCompaniaId] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [responsableBomberoId, setResponsableBomberoId] = useState('');
  const [estado, setEstado] = useState('ACTIVO');

  async function cargar() {
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (estadoFiltro) params.set('estado', estadoFiltro);
      if (mostrarEliminados) params.set('incluirEliminados', 'true');

      const [cRes, compRes, bRes] = await Promise.all([
        apiFetch(`/organizacion/cuarteles?${params.toString()}`),
        apiFetch('/organizacion/companias'),
        apiFetch('/personal/bomberos'),
      ]);

      if (!cRes.ok) throw new Error('No se pudo cargar el listado de cuarteles');
      setCuarteles(await cRes.json());
      if (compRes.ok) setCompanias(await compRes.json());
      if (bRes.ok) setBomberos(await bRes.json());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, estadoFiltro, mostrarEliminados]);

  function limpiarForm() {
    setCodigo('');
    setNombre('');
    setCompaniaId('');
    setDireccion('');
    setTelefono('');
    setResponsableBomberoId('');
    setEstado('ACTIVO');
    setEditandoId(null);
  }

  function editar(c: Cuartel) {
    setEditandoId(c.id);
    setCodigo(c.codigo);
    setNombre(c.nombre);
    setCompaniaId(c.companiaId);
    setDireccion(c.direccion ?? '');
    setTelefono(c.telefono ?? '');
    setResponsableBomberoId(c.responsableBomberoId ?? '');
    setEstado(c.estado);
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      codigo,
      nombre,
      companiaId,
      direccion: direccion || undefined,
      telefono: telefono || undefined,
      responsableBomberoId: responsableBomberoId || undefined,
      estado,
    };

    const res = editandoId
      ? await apiFetch(`/organizacion/cuarteles/${editandoId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      : await apiFetch('/organizacion/cuarteles', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo guardar el cuartel');
      return;
    }

    setMensaje(editandoId ? 'Cuartel actualizado' : 'Cuartel creado');
    limpiarForm();
    setMostrarForm(false);
    await cargar();
  }

  async function darBaja(id: string) {
    setError(null);
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: 'Dar de baja este cuartel?', confirmar: 'Continuar', peligro: true })) return;
    const res = await apiFetch(`/organizacion/cuarteles/${id}/baja`, { method: 'PATCH' });
    if (!res.ok) {
      setError('No se pudo dar de baja el cuartel');
      return;
    }
    await cargar();
  }

  async function reactivar(id: string) {
    setError(null);
    const res = await apiFetch(`/organizacion/cuarteles/${id}/reactivar`, { method: 'PATCH' });
    if (!res.ok) {
      setError('No se pudo reactivar el cuartel');
      return;
    }
    await cargar();
  }



  function nombreCompania(id: string) {
    return companias.find((c) => c.id === id)?.nombre ?? id;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <h2 style={{ fontSize: 16 }}>Cuarteles ({cuarteles?.length ?? 0})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-primary" onClick={() => descargarArchivo('/organizacion/cuarteles/exportar/excel', 'cuarteles.xlsx')}>
            Exportar a Excel
          </button>
          <button type="button" className="btn-primary" onClick={() => descargarArchivo('/organizacion/cuarteles/exportar/pdf', 'cuarteles.pdf')}>
            Exportar a PDF
          </button>
          <button type="button"
            className="btn-primary"
            onClick={() => {
              if (mostrarForm) limpiarForm();
              setMostrarForm((v) => !v);
            }}
          >
            {mostrarForm ? 'Cancelar' : 'Nuevo cuartel'}
          </button>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input-field"
          style={{ maxWidth: 240 }}
          placeholder="Buscar por codigo o nombre..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="input-field"
          style={{ maxWidth: 160 }}
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <div>
              <label htmlFor="codigo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Codigo</label>
              <input id="codigo" className="input-field" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="nombre" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
              <input id="nombre" className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="compania" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Compania</label>
              <select id="compania"
                className="input-field"
                value={companiaId}
                onChange={(e) => setCompaniaId(e.target.value)}
                required
              >
                <option value="">-- seleccionar --</option>
                {companias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="responsable-bombero" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Responsable (bombero)</label>
              <select id="responsable-bombero"
                className="input-field"
                value={responsableBomberoId}
                onChange={(e) => setResponsableBomberoId(e.target.value)}
              >
                <option value="">-- sin asignar --</option>
                {bomberos.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.numeroBombero} - {b.nombre} {b.apellido}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="direccion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Direccion</label>
              <input id="direccion" className="input-field" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
            </div>
            <div>
              <label htmlFor="telefono" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Telefono</label>
              <input id="telefono" className="input-field" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="estado" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
            <select id="estado"
              className="input-field"
              style={{ maxWidth: 200 }}
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
            {editandoId ? 'Guardar cambios' : 'Crear cuartel'}
          </button>
        </form>
      )}

      {cuarteles && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Codigo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Nombre</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Compania</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Telefono</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cuarteles.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{c.codigo}</td>
                <td style={{ padding: '6px 4px' }}>{c.nombre}</td>
                <td style={{ padding: '6px 4px' }}>{nombreCompania(c.companiaId)}</td>
                <td style={{ padding: '6px 4px' }}>{c.telefono ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge">{c.estado}</span>
                </td>
                <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(c)}>
                    Editar
                  </button>
                  {c.eliminadoEn === null ? (
                    <button type="button"
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d' }}
                      onClick={() => darBaja(c.id)}
                    >
                      Eliminar
                    </button>
                  ) : (
                    <button type="button"
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 12 }}
                      onClick={() => reactivar(c.id)}
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
