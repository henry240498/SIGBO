'use client';

import { useEffect, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { apiFetch } from '@/lib/api';
import { descargarArchivo } from '@/lib/exportar';
import { Aviso } from '@/app/components/Aviso';

interface Turno {
  id: string;
  codigo: string;
  nombre: string;
  horaInicio: string | null;
  horaFin: string | null;
  responsableBomberoId: string | null;
  estado: 'ACTIVO' | 'INACTIVO';
  eliminadoEn: string | null;
}

interface Bombero {
  id: string;
  nombre: string;
  apellido: string;
}

export default function TurnosPage() {
  const confirmar = useConfirmacion();
  const [turnos, setTurnos] = useState<Turno[] | null>(null);
  const [bomberos, setBomberos] = useState<Bombero[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [incluirEliminados, setIncluirEliminados] = useState(false);

  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [responsableBomberoId, setResponsableBomberoId] = useState('');
  const [estado, setEstado] = useState<'ACTIVO' | 'INACTIVO'>('ACTIVO');

  async function cargar() {
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (estadoFiltro) params.set('estado', estadoFiltro);
      if (incluirEliminados) params.set('incluirEliminados', 'true');

      const [tRes, bRes] = await Promise.all([
        apiFetch(`/organizacion/turnos?${params.toString()}`),
        apiFetch('/personal/bomberos'),
      ]);
      if (!tRes.ok) throw new Error('No se pudo cargar el listado de turnos');
      setTurnos(await tRes.json());
      if (bRes.ok) setBomberos(await bRes.json());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, estadoFiltro, incluirEliminados]);

  function limpiarForm() {
    setEditandoId(null);
    setCodigo('');
    setNombre('');
    setHoraInicio('');
    setHoraFin('');
    setResponsableBomberoId('');
    setEstado('ACTIVO');
  }

  function editar(t: Turno) {
    setEditandoId(t.id);
    setCodigo(t.codigo);
    setNombre(t.nombre);
    setHoraInicio(t.horaInicio ? t.horaInicio.slice(0, 5) : '');
    setHoraFin(t.horaFin ? t.horaFin.slice(0, 5) : '');
    setResponsableBomberoId(t.responsableBomberoId ?? '');
    setEstado(t.estado);
    setMostrarForm(true);
  }

  function cancelar() {
    limpiarForm();
    setMostrarForm(false);
  }

  async function guardarTurno(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      codigo,
      nombre,
      horaInicio: horaInicio ? `${horaInicio}:00` : undefined,
      horaFin: horaFin ? `${horaFin}:00` : undefined,
      responsableBomberoId: responsableBomberoId || undefined,
      estado,
    };

    const res = editandoId
      ? await apiFetch(`/organizacion/turnos/${editandoId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      : await apiFetch('/organizacion/turnos', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo guardar el turno');
      return;
    }

    limpiarForm();
    setMostrarForm(false);
    await cargar();
  }

  async function darBaja(id: string) {
    setError(null);
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: 'Dar de baja este turno?', confirmar: 'Continuar', peligro: true })) return;
    const res = await apiFetch(`/organizacion/turnos/${id}/baja`, { method: 'PATCH' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo dar de baja el turno');
      return;
    }
    await cargar();
  }

  async function reactivar(id: string) {
    setError(null);
    const res = await apiFetch(`/organizacion/turnos/${id}/reactivar`, { method: 'PATCH' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo reactivar el turno');
      return;
    }
    await cargar();
  }



  function nombreResponsable(id: string | null) {
    if (!id) return '-';
    const b = bomberos.find((x) => x.id === id);
    return b ? `${b.nombre} ${b.apellido}` : '-';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontSize: 16 }}>Turnos ({turnos?.length ?? 0})</h2>
        <button type="button"
          className="btn-primary"
          onClick={() => {
            if (mostrarForm) {
              cancelar();
            } else {
              setMostrarForm(true);
            }
          }}
        >
          {mostrarForm ? 'Cancelar' : 'Nuevo turno'}
        </button>
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
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
            checked={incluirEliminados}
            onChange={(e) => setIncluirEliminados(e.target.checked)}
          />
          Mostrar eliminados
        </label>
        <button type="button" className="btn-primary" onClick={() => descargarArchivo('/organizacion/turnos/exportar/excel', 'turnos.xlsx')}>
          Exportar a Excel
        </button>
        <button type="button" className="btn-primary" onClick={() => descargarArchivo('/organizacion/turnos/exportar/pdf', 'turnos.pdf')}>
          Exportar a PDF
        </button>
      </div>

      {error && <Aviso tipo="error" texto={error} />}

      {mostrarForm && (
        <form className="card" onSubmit={guardarTurno} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="hora-inicio" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Hora inicio</label>
              <input id="hora-inicio"
                className="input-field"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="hora-fin" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Hora fin</label>
              <input id="hora-fin" className="input-field" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
            </div>
            <div>
              <label htmlFor="estado" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
              <select id="estado"
                className="input-field"
                value={estado}
                onChange={(e) => setEstado(e.target.value as 'ACTIVO' | 'INACTIVO')}
              >
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="bombero-responsable" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Bombero responsable</label>
            <select id="bombero-responsable"
              className="input-field"
              value={responsableBomberoId}
              onChange={(e) => setResponsableBomberoId(e.target.value)}
            >
              <option value="">-- sin asignar --</option>
              {bomberos.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre} {b.apellido}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
              {editandoId ? 'Guardar cambios' : 'Crear turno'}
            </button>
            <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={cancelar}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {turnos && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Codigo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Nombre</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Hora inicio</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Hora fin</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Responsable</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>{t.codigo}</td>
                <td style={{ padding: '6px 4px' }}>{t.nombre}</td>
                <td style={{ padding: '6px 4px' }}>{t.horaInicio ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>{t.horaFin ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>{nombreResponsable(t.responsableBomberoId)}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge">{t.estado}</span>
                </td>
                <td style={{ padding: '6px 4px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(t)}>
                    Editar
                  </button>
                  {t.eliminadoEn == null ? (
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
