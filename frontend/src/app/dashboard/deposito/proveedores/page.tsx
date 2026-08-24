'use client';

import { useEffect, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { ProveedorDeposito, actualizarProveedorDeposito, cargarProveedoresDeposito, crearProveedorDeposito } from '@/lib/deposito';

export default function ProveedoresDepositoPage() {
  const [proveedores, setProveedores] = useState<ProveedorDeposito[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  const [razonSocial, setRazonSocial] = useState('');
  const [nombreComercial, setNombreComercial] = useState('');
  const [ruc, setRuc] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [contacto, setContacto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [estado, setEstado] = useState('ACTIVO');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCrear = permisos.includes('deposito:crear');
  const puedeEditar = permisos.includes('deposito:editar');

  const opcionesEstado = useMemo(() => [{ value: 'ACTIVO', label: 'ACTIVO' }, { value: 'INACTIVO', label: 'INACTIVO' }], []);

  async function cargar() {
    try {
      setProveedores(await cargarProveedoresDeposito(q || undefined, filtroEstado || undefined));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filtroEstado]);

  function limpiarForm() {
    setRazonSocial('');
    setNombreComercial('');
    setRuc('');
    setDireccion('');
    setTelefono('');
    setEmail('');
    setContacto('');
    setObservaciones('');
    setEstado('ACTIVO');
    setEditandoId(null);
  }

  function editar(p: ProveedorDeposito) {
    setEditandoId(p.id);
    setRazonSocial(p.razonSocial);
    setNombreComercial(p.nombreComercial ?? '');
    setRuc(p.ruc ?? '');
    setDireccion(p.direccion ?? '');
    setTelefono(p.telefono ?? '');
    setEmail(p.email ?? '');
    setContacto(p.contacto ?? '');
    setObservaciones(p.observaciones ?? '');
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
        razonSocial,
        nombreComercial: nombreComercial || undefined,
        ruc: ruc || undefined,
        direccion: direccion || undefined,
        telefono: telefono || undefined,
        email: email || undefined,
        contacto: contacto || undefined,
        observaciones: observaciones || undefined,
        estado,
      };
      if (editandoId) {
        await actualizarProveedorDeposito(editandoId, payload);
        setMensaje('Proveedor actualizado.');
      } else {
        await crearProveedorDeposito(payload);
        setMensaje('Proveedor creado.');
      }
      limpiarForm();
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16 }}>Proveedores ({proveedores?.length ?? 0})</h2>
        {puedeCrear && (
          <button type="button"
            className="btn-primary"
            onClick={() => {
              limpiarForm();
              setMostrarForm(!mostrarForm);
            }}
          >
            {mostrarForm ? 'Cancelar' : '+ Nuevo proveedor'}
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Buscar</label>
          <input className="input-field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Razon social, nombre comercial o RUC..." />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Estado</label>
          <ComboBuscable opciones={opcionesEstado} value={filtroEstado} onChange={setFiltroEstado} maxWidth={160} />
        </div>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {mostrarForm && (
        <form onSubmit={guardar} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Razon social</label>
              <input className="input-field" value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre comercial</label>
              <input className="input-field" value={nombreComercial} onChange={(e) => setNombreComercial(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>RUC</label>
              <input className="input-field" value={ruc} onChange={(e) => setRuc(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Direccion</label>
              <input className="input-field" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Telefono</label>
              <input className="input-field" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Email</label>
              <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Contacto</label>
              <input className="input-field" value={contacto} onChange={(e) => setContacto(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observaciones</label>
              <input className="input-field" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            </div>
            {editandoId && (
              <div>
                <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Estado</label>
                <ComboBuscable opciones={opcionesEstado} value={estado} onChange={setEstado} ningunaLabel="ACTIVO" />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
              {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear proveedor'}
            </button>
            {editandoId && (
              <button
                type="button"
                className="btn-primary"
                style={{ background: '#475569' }}
                onClick={() => {
                  limpiarForm();
                  setMostrarForm(false);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      {proveedores && proveedores.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No hay proveedores registrados.</p>}
      {proveedores && proveedores.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Razon social</th>
              <th style={{ padding: '6px 4px' }}>RUC</th>
              <th style={{ padding: '6px 4px' }}>Telefono</th>
              <th style={{ padding: '6px 4px' }}>Estado</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>
                  {p.razonSocial}
                  {p.nombreComercial && <span style={{ color: '#64748b' }}> ({p.nombreComercial})</span>}
                </td>
                <td style={{ padding: '6px 4px' }}>{p.ruc ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>{p.telefono ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: p.estado === 'ACTIVO' ? '#166534' : '#7f1d1d', color: p.estado === 'ACTIVO' ? '#4ade80' : '#f87171' }}>
                    {p.estado}
                  </span>
                </td>
                <td style={{ padding: '6px 4px' }}>
                  {puedeEditar && (
                    <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => editar(p)}>
                      Editar
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
