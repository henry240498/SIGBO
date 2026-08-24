'use client';

import { useEffect, useMemo, useState } from 'react';
import { obtenerSesion, API_ORIGIN } from '@/lib/api';
import { ComboBuscable } from '@/components/ComboBuscable';
import { Parametro } from '@/lib/parametros';
import { EjercicioFiscal, Presupuesto, actualizarPresupuesto, cargarCategoriasEgresoFinanzas, cargarEjerciciosFiscales, cargarPresupuestos, crearPresupuesto } from '@/lib/finanzas';

function formatearGs(valor: number): string {
  return `Gs. ${Math.round(valor).toLocaleString('es-PY')}`;
}

export default function PresupuestoPage() {
  const [ejercicios, setEjercicios] = useState<EjercicioFiscal[]>([]);
  const [ejercicioId, setEjercicioId] = useState('');
  const [presupuestos, setPresupuestos] = useState<Presupuesto[] | null>(null);
  const [categorias, setCategorias] = useState<Parametro[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [categoriaEgresoId, setCategoriaEgresoId] = useState('');
  const [montoPresupuestado, setMontoPresupuestado] = useState('');
  const [observacion, setObservacion] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeAdministrar = permisos.includes('finanzas:administrar_presupuesto');
  const puedeExportar = permisos.includes('finanzas:reportes');

  const opcionesCategoria = useMemo(() => categorias.map((c) => ({ value: c.id, label: c.nombre })), [categorias]);
  const nombreCategoria = useMemo(() => new Map(categorias.map((c) => [c.id, c.nombre])), [categorias]);
  const opcionesEjercicio = useMemo(() => ejercicios.map((e) => ({ value: e.id, label: `${e.anio} (${e.estado})` })), [ejercicios]);

  async function cargar() {
    if (!ejercicioId) {
      setPresupuestos(null);
      return;
    }
    try {
      setPresupuestos(await cargarPresupuestos(ejercicioId));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarCategoriasEgresoFinanzas().then(setCategorias);
    cargarEjerciciosFiscales().then((datos) => {
      setEjercicios(datos);
      const abierto = datos.find((e) => e.estado === 'ABIERTO');
      if (abierto) setEjercicioId(abierto.id);
    });
  }, []);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ejercicioId]);

  function limpiarForm() {
    setCategoriaEgresoId('');
    setMontoPresupuestado('');
    setObservacion('');
    setEditandoId(null);
  }

  function editar(p: Presupuesto) {
    setEditandoId(p.id);
    setCategoriaEgresoId(p.categoriaEgresoId);
    setMontoPresupuestado(String(p.montoPresupuestado));
    setObservacion(p.observacion ?? '');
    setMostrarForm(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    setGuardando(true);
    try {
      if (editandoId) {
        await actualizarPresupuesto(editandoId, { montoPresupuestado: Number(montoPresupuestado), categoriaEgresoId, observacion: observacion || undefined });
        setMensaje('Presupuesto actualizado.');
      } else {
        await crearPresupuesto({ ejercicioId, categoriaEgresoId, montoPresupuestado: Number(montoPresupuestado), observacion: observacion || undefined });
        setMensaje('Presupuesto creado.');
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
        <h2 style={{ fontSize: 16 }}>Presupuesto ({presupuestos?.length ?? 0})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {puedeExportar && ejercicioId && (
            <a
              className="btn-primary"
              style={{ textDecoration: 'none', display: 'inline-block' }}
              href={`${API_ORIGIN}/api/v1/finanzas/reportes/presupuestos/exportar/excel?ejercicioId=${ejercicioId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Exportar Excel
            </a>
          )}
          {puedeAdministrar && ejercicioId && (
            <button type="button"
              className="btn-primary"
              onClick={() => {
                limpiarForm();
                setMostrarForm(!mostrarForm);
              }}
            >
              {mostrarForm ? 'Cancelar' : '+ Nueva partida'}
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Ejercicio fiscal</label>
          <ComboBuscable opciones={opcionesEjercicio} value={ejercicioId} onChange={setEjercicioId} ningunaLabel="-- seleccionar --" maxWidth={220} />
        </div>
      </div>

      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}

      {mostrarForm && (
        <form onSubmit={guardar} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Destinado a (categoria de egreso)</label>
              <ComboBuscable opciones={opcionesCategoria} value={categoriaEgresoId} onChange={setCategoriaEgresoId} ningunaLabel="-- seleccionar --" />
              {editandoId && <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Cambiar el destino no mueve lo ya ejecutado -- el ejecutado se recalcula segun la nueva categoria.</p>}
            </div>
            <div>
              <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Monto presupuestado</label>
              <input className="input-field" type="number" min={0} step="1" value={montoPresupuestado} onChange={(e) => setMontoPresupuestado(e.target.value)} required />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Observacion</label>
            <input className="input-field" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
          </div>
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
            {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear partida'}
          </button>
        </form>
      )}

      {!ejercicioId && <p style={{ color: '#94a3b8', fontSize: 13 }}>Seleccione un ejercicio fiscal.</p>}
      {presupuestos && presupuestos.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13 }}>No hay partidas presupuestadas para este ejercicio.</p>}
      {presupuestos && presupuestos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '6px 4px' }}>Destinado a</th>
              <th style={{ padding: '6px 4px' }}>Presupuestado</th>
              <th style={{ padding: '6px 4px' }}>Ejecutado</th>
              <th style={{ padding: '6px 4px' }}>Disponible</th>
              <th style={{ padding: '6px 4px' }}>% Ejecutado</th>
              <th style={{ padding: '6px 4px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {presupuestos.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '6px 4px' }}>{nombreCategoria.get(p.categoriaEgresoId) ?? '-'}</td>
                <td style={{ padding: '6px 4px' }}>{formatearGs(p.montoPresupuestado)}</td>
                <td style={{ padding: '6px 4px' }}>{formatearGs(p.ejecutado)}</td>
                <td style={{ padding: '6px 4px', color: p.disponible < 0 ? '#f87171' : undefined, fontWeight: p.disponible < 0 ? 600 : undefined }}>{formatearGs(p.disponible)}</td>
                <td style={{ padding: '6px 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 80, height: 8, background: '#334155', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(p.porcentajeEjecutado, 100)}%`,
                          height: '100%',
                          background: p.porcentajeEjecutado > 100 ? '#f87171' : p.porcentajeEjecutado > 80 ? '#fbbf24' : '#4ade80',
                        }}
                      />
                    </div>
                    <span>{p.porcentajeEjecutado}%</span>
                  </div>
                </td>
                <td style={{ padding: '6px 4px' }}>
                  {puedeAdministrar && (
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
