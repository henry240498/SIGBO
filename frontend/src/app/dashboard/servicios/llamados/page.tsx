'use client';

import { useEffect, useId, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { ServicioAbierto, cargarServiciosAbiertos } from '@/lib/flota';
import {
  EstadoLlamado,
  Llamado,
  MEDIOS_LLAMADO,
  cambiarEstadoLlamado,
  cargarLlamados,
  crearLlamado,
  vincularServicioALlamado,
} from '@/lib/llamados';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import { useEntradaConfirmada } from '@/app/components/InputProvider';

const REFRESCO_MS = 15000;

const FONDO: Record<EstadoLlamado, string> = {
  RECIBIDO: 'var(--warn-fill)',
  EN_ATENCION: 'var(--info-fill)',
  CERRADO: 'var(--neutral-fill)',
};

const ETIQUETA: Record<EstadoLlamado, string> = {
  RECIBIDO: 'Recibido',
  EN_ATENCION: 'En atención',
  CERRADO: 'Cerrado',
};

export default function LlamadosPage() {
  const id = useId();
  const pedirMotivo = useEntradaConfirmada();
  const [llamados, setLlamados] = useState<Llamado[] | null>(null);
  const [servicios, setServicios] = useState<ServicioAbierto[]>([]);
  const [vinculo, setVinculo] = useState<Record<string, string>>({});
  const [filtro, setFiltro] = useState<'ABIERTOS' | 'TODOS'>('ABIERTOS');
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [medio, setMedio] = useState(MEDIOS_LLAMADO[0]);
  const [direccion, setDireccion] = useState('');
  const [llamante, setLlamante] = useState('');
  const [telefono, setTelefono] = useState('');
  const [referencia, setReferencia] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeCrear = permisos.includes('servicios:crear');
  const puedeEditar = permisos.includes('servicios:editar');

  async function cargar() {
    try {
      const [todos, abiertos] = await Promise.all([cargarLlamados(), cargarServiciosAbiertos().catch(() => [])]);
      setLlamados(todos);
      setServicios(abiertos);
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    const timer = setInterval(cargar, REFRESCO_MS);
    return () => clearInterval(timer);
  }, []);

  async function ejecutar(accion: () => Promise<unknown>, ok: string) {
    setError(null);
    setMensaje(null);
    try {
      await accion();
      setMensaje(ok);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    await ejecutar(
      async () => {
        await crearLlamado({
          medio,
          direccion,
          llamanteNombre: llamante || undefined,
          llamanteTelefono: telefono || undefined,
          referencia: referencia || undefined,
          descripcion: descripcion || undefined,
        });
        setDireccion('');
        setLlamante('');
        setTelefono('');
        setReferencia('');
        setDescripcion('');
      },
      'Llamado registrado',
    );
    setGuardando(false);
  }

  async function cerrar(l: Llamado) {
    let motivo: string | undefined;
    if (l.estado === 'RECIBIDO') {
      const m = await pedirMotivo({
        titulo: 'Cerrar sin atender',
        mensaje: 'Este llamado nunca se atendió. Indique por qué se cierra.',
        etiqueta: 'Motivo',
        confirmar: 'Cerrar llamado',
        requerida: true,
      });
      if (!m) return;
      motivo = m;
    }
    await ejecutar(() => cambiarEstadoLlamado(l.id, 'CERRADO', motivo), 'Llamado cerrado');
  }

  const visibles = (llamados ?? []).filter((l) => filtro === 'TODOS' || l.estado !== 'CERRADO');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 16 }}>Cuadro de llamados</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Registro de cada llamada recibida. Solo anota el hecho: el servicio y el despacho de móviles los decide el mando.
        </p>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {puedeCrear && (
        <form className="card" onSubmit={registrar} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <strong style={{ fontSize: 14 }}>Nuevo llamado</strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            <div>
              <label htmlFor={`${id}-medio`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Medio</label>
              <input id={`${id}-medio`} className="input-field" list={`${id}-medios`} value={medio} onChange={(e) => setMedio(e.target.value)} required maxLength={40} />
              <datalist id={`${id}-medios`}>{MEDIOS_LLAMADO.map((m) => <option key={m} value={m} />)}</datalist>
            </div>
            <div>
              <label htmlFor={`${id}-dir`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Dirección</label>
              <input id={`${id}-dir`} className="input-field" value={direccion} onChange={(e) => setDireccion(e.target.value)} required minLength={3} maxLength={300} />
            </div>
            <div>
              <label htmlFor={`${id}-ref`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Referencia</label>
              <input id={`${id}-ref`} className="input-field" value={referencia} onChange={(e) => setReferencia(e.target.value)} maxLength={300} />
            </div>
            <div>
              <label htmlFor={`${id}-llamante`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Quién llama</label>
              <input id={`${id}-llamante`} className="input-field" value={llamante} onChange={(e) => setLlamante(e.target.value)} maxLength={150} />
            </div>
            <div>
              <label htmlFor={`${id}-tel`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Teléfono</label>
              <input id={`${id}-tel`} className="input-field" value={telefono} onChange={(e) => setTelefono(e.target.value)} maxLength={40} />
            </div>
          </div>
          <div>
            <label htmlFor={`${id}-desc`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Qué se informa</label>
            <textarea id={`${id}-desc`} className="input-field" rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={1000} />
          </div>
          <div>
            <button type="submit" className="btn-primary" disabled={guardando}>Registrar llamado</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label htmlFor={`${id}-filtro`} style={{ fontSize: 12 }}>Mostrar</label>
        <select id={`${id}-filtro`} className="input-field" style={{ width: 'auto' }} value={filtro} onChange={(e) => setFiltro(e.target.value as 'ABIERTOS' | 'TODOS')}>
          <option value="ABIERTOS">Abiertos</option>
          <option value="TODOS">Todos</option>
        </select>
      </div>

      {llamados === null ? (
        <Cargando texto="Cargando llamados…" />
      ) : visibles.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay llamados {filtro === 'ABIERTOS' ? 'abiertos' : 'registrados'}.</p>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th scope="col">Hora</th>
                <th scope="col">Llamado</th>
                <th scope="col">Estado</th>
                {puedeEditar && <th scope="col">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {visibles.map((l) => (
                <tr key={l.id}>
                  <td>{new Date(l.recibidoEn).toLocaleString('es-PY')}</td>
                  <td>
                    <strong>{l.direccion}</strong>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {l.medio}
                      {l.llamanteNombre ? ` · ${l.llamanteNombre}` : ''}
                      {l.llamanteTelefono ? ` · ${l.llamanteTelefono}` : ''}
                    </div>
                    {l.descripcion && <div style={{ fontSize: 13 }}>{l.descripcion}</div>}
                    {l.motivoCierre && <div style={{ fontSize: 12, color: 'var(--muted)' }}>Cierre: {l.motivoCierre}</div>}
                  </td>
                  <td>
                    <span className="badge" style={{ background: FONDO[l.estado] }}>{ETIQUETA[l.estado]}</span>
                    {l.servicioId && <div style={{ fontSize: 12, color: 'var(--muted)' }}>Con servicio asociado</div>}
                  </td>
                  {puedeEditar && (
                    <td>
                      {l.estado !== 'CERRADO' && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          {l.estado === 'RECIBIDO' && (
                            <button type="button" className="btn-primary" onClick={() => ejecutar(() => cambiarEstadoLlamado(l.id, 'EN_ATENCION'), 'Llamado en atención')}>
                              Atender
                            </button>
                          )}
                          {!l.servicioId && servicios.length > 0 && (
                            <>
                              <select
                                aria-label={`Servicio para vincular al llamado de ${l.direccion}`}
                                className="input-field"
                                style={{ width: 'auto', maxWidth: 220 }}
                                value={vinculo[l.id] ?? ''}
                                onChange={(e) => setVinculo((v) => ({ ...v, [l.id]: e.target.value }))}
                              >
                                <option value="">Vincular a servicio…</option>
                                {servicios.map((s) => (
                                  <option key={s.id} value={s.id}>{s.numeroServicio}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                className="btn-primary"
                                disabled={!vinculo[l.id]}
                                onClick={() => ejecutar(() => vincularServicioALlamado(l.id, vinculo[l.id]), 'Servicio vinculado')}
                              >
                                Vincular
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            style={{ background: 'var(--neutral-fill)', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 8, padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}
                            onClick={() => cerrar(l)}
                          >
                            Cerrar
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
