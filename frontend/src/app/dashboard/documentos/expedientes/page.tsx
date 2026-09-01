'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Expediente, actualizarExpediente, cargarExpedientes, crearExpediente } from '@/lib/documentos';
import { Aviso } from '@/app/components/Aviso';

export default function ExpedientesPage() {
  const [expedientes, setExpedientes] = useState<Expediente[] | null>(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [numero, setNumero] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCrear = permisos.includes('documentos:crear');
  const puedeEditar = permisos.includes('documentos:editar');

  async function cargar() {
    try {
      setExpedientes(await cargarExpedientes(filtroEstado || undefined));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado]);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      await crearExpediente({ numero, titulo, descripcion: descripcion || undefined });
      setMensaje('Expediente creado.');
      setNumero('');
      setTitulo('');
      setDescripcion('');
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function cerrar(id: string) {
    setError(null);
    try {
      await actualizarExpediente(id, { estado: 'CERRADO' });
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function reabrir(id: string) {
    setError(null);
    try {
      await actualizarExpediente(id, { estado: 'ABIERTO' });
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Expedientes ({expedientes?.length ?? 0})</h2>
        {puedeCrear && (
          <button type="button" className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : '+ Nuevo expediente'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Estado</label>
          <ComboBuscable ariaLabel="Estado"
            opciones={[{ value: 'ABIERTO', label: 'ABIERTO' }, { value: 'CERRADO', label: 'CERRADO' }]}
            value={filtroEstado}
            onChange={setFiltroEstado}
            maxWidth={180}
            ningunaLabel="Todos"
          />
        </div>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {mostrarForm && (
        <form onSubmit={crear} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <div>
              <label htmlFor="numero" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Número</label>
              <input id="numero" className="input-field" value={numero} onChange={(e) => setNumero(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="titulo" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Titulo</label>
              <input id="titulo" className="input-field" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            </div>
          </div>
          <div>
            <label htmlFor="descripcion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descripción</label>
            <textarea id="descripcion" className="input-field" rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Crear expediente'}
          </button>
        </form>
      )}

      {expedientes && expedientes.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay expedientes con estos filtros.</p>}
      {expedientes && expedientes.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Número</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Titulo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {expedientes.map((e) => (
              <tr key={e.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}>
                  <Link href={`/dashboard/documentos/expedientes/${e.id}`} style={{ color: 'var(--signal)', textDecoration: 'none' }}>{e.numero}</Link>
                </td>
                <td style={{ padding: '6px 4px' }}>{e.titulo}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: e.estado === 'ABIERTO' ? 'var(--ok-fill)' : 'var(--neutral-fill)' }}>{e.estado}</span>
                </td>
                <td style={{ padding: '6px 4px' }}>
                  {puedeEditar && e.estado === 'ABIERTO' && (
                    <button type="button" className="btn-primary" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => cerrar(e.id)}>Cerrar</button>
                  )}
                  {puedeEditar && e.estado === 'CERRADO' && (
                    <button type="button" className="btn-primary" style={{ padding: '3px 8px', fontSize: 11, background: '#475569' }} onClick={() => reabrir(e.id)}>Reabrir</button>
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
