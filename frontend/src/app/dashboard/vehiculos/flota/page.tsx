'use client';

import { useEffect, useId, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import {
  EstadoOperativoMovil,
  MovilTablero,
  ServicioAbierto,
  Disponibilidad,
  Vencimiento,
  cargarDisponibilidad,
  cargarVencimientos,
  descargarResumenPdf,
  avanzarDespacho,
  cancelarDespacho,
  cargarServiciosAbiertos,
  cargarTablero,
  despachar,
  reponerEnCuartel,
} from '@/lib/flota';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import { useEntradaConfirmada } from '@/app/components/InputProvider';

const REFRESCO_MS = 15000;

/** No hay .btn-secondary en globals.css: boton neutro armado solo con tokens. */
const ESTILO_SECUNDARIO: React.CSSProperties = {
  background: 'var(--neutral-fill)',
  color: 'var(--ink)',
  border: '1px solid var(--line)',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 13,
  cursor: 'pointer',
};

const ETIQUETA: Record<EstadoOperativoMovil, string> = {
  EN_CUARTEL: 'En cuartel',
  DESPACHADO: 'Despachado',
  EN_SERVICIO: 'En servicio',
  REGRESANDO: 'Regresando',
};

const FONDO: Record<EstadoOperativoMovil, string> = {
  EN_CUARTEL: 'var(--ok-fill)',
  DESPACHADO: 'var(--warn-fill)',
  EN_SERVICIO: 'var(--bad-fill)',
  REGRESANDO: 'var(--info-fill)',
};

/** Siguiente paso del despacho segun su estado, y como se llama el boton. */
const PASO: Record<string, { paso: 'llegada' | 'fin' | 'regreso'; texto: string }> = {
  DESPACHADO: { paso: 'llegada', texto: 'Llegó al lugar' },
  EN_SERVICIO: { paso: 'fin', texto: 'Sale del lugar' },
  REGRESANDO: { paso: 'regreso', texto: 'Llegó al cuartel' },
};

function desde(fecha: string | null) {
  if (!fecha) return '—';
  const min = Math.max(0, Math.round((Date.now() - new Date(fecha).getTime()) / 60000));
  return min < 60 ? `hace ${min} min` : `hace ${Math.floor(min / 60)} h ${min % 60} min`;
}

export default function FlotaPage() {
  const idServicio = useId();
  const pedirMotivo = useEntradaConfirmada();
  const [moviles, setMoviles] = useState<MovilTablero[] | null>(null);
  const [servicios, setServicios] = useState<ServicioAbierto[]>([]);
  const [servicioId, setServicioId] = useState('');
  const [vencimientos, setVencimientos] = useState<Vencimiento[]>([]);
  const [disp, setDisp] = useState<Disponibilidad | null>(null);
  const [diasVenc, setDiasVenc] = useState(30);
  const idDias = useId();
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeDespachar = permisos.includes('servicios:despachar');
  const puedeReponer = permisos.includes('vehiculos:estado');

  async function cargar() {
    try {
      const [tablero, abiertos] = await Promise.all([
        cargarTablero(),
        puedeDespachar ? cargarServiciosAbiertos() : Promise.resolve([] as ServicioAbierto[]),
      ]);
      setMoviles(tablero);
      setVencimientos(await cargarVencimientos(diasVenc).catch(() => []));
      setDisp(await cargarDisponibilidad().catch(() => null));
      setServicios(abiertos);
      setServicioId((actual) => (abiertos.some((s) => s.id === actual) ? actual : abiertos[0]?.id ?? ''));
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    const timer = setInterval(cargar, REFRESCO_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diasVenc]);

  async function ejecutar(accion: () => Promise<unknown>, ok: string) {
    setError(null);
    setMensaje(null);
    setOcupado(true);
    try {
      await accion();
      setMensaje(ok);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOcupado(false);
    }
  }

  async function avanzar(m: MovilTablero, paso: 'llegada' | 'fin' | 'regreso', texto: string) {
    let km: number | undefined;
    if (paso === 'regreso') {
      const entrada = await pedirMotivo({
        titulo: 'Regreso al cuartel',
        mensaje: `Kilometraje del móvil ${m.numeroInterno} al volver (puede dejarlo vacío).`,
        etiqueta: 'Kilometraje',
        confirmar: 'Registrar regreso',
        requerida: false,
      });
      if (entrada === null) return;
      if (entrada.trim()) {
        const n = Number(entrada.trim());
        if (!Number.isInteger(n) || n < 0) {
          setError('El kilometraje debe ser un número entero.');
          return;
        }
        km = n;
      }
    }
    await ejecutar(() => avanzarDespacho(m.despachoActivo!.id, paso, km), texto);
  }

  async function cancelar(m: MovilTablero) {
    const motivo = await pedirMotivo({
      titulo: 'Cancelar despacho',
      mensaje: `El móvil ${m.numeroInterno} volverá a estar en cuartel.`,
      etiqueta: 'Motivo',
      confirmar: 'Cancelar despacho',
      peligro: true,
      requerida: true,
    });
    if (motivo && m.despachoActivo) {
      await ejecutar(() => cancelarDespacho(m.despachoActivo!.id, motivo), 'Despacho cancelado');
    }
  }

  async function reponer(m: MovilTablero) {
    const motivo = await pedirMotivo({
      titulo: 'Corregir ubicación',
      mensaje: `Marcar el móvil ${m.numeroInterno} como en cuartel. Quedará registrado.`,
      etiqueta: 'Motivo',
      confirmar: 'Marcar en cuartel',
      requerida: true,
    });
    if (motivo) await ejecutar(() => reponerEnCuartel(m.id, motivo), 'Móvil repuesto en cuartel');
  }

  const conteo = (e: EstadoOperativoMovil) => moviles?.filter((m) => m.estadoOperativo === e).length ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 16 }}>Flota en vivo</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Estado de cada móvil respecto de un servicio. Se actualiza solo cada {REFRESCO_MS / 1000} segundos.
        </p>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {moviles === null ? (
        <Cargando texto="Cargando flota…" />
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(Object.keys(ETIQUETA) as EstadoOperativoMovil[]).map((e) => (
              <span key={e} className="badge" style={{ background: FONDO[e] }}>
                {ETIQUETA[e]}: {conteo(e)}
              </span>
            ))}
          </div>

          {disp && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <strong style={{ fontSize: 14 }}>Disponibilidad ahora</strong>
              <div style={{ fontSize: 13 }}>
                Móviles listos para salir: <strong>{disp.moviles.disponibles.length}</strong> de {disp.moviles.total}
                {disp.moviles.disponibles.length > 0 && ` (${disp.moviles.disponibles.map((x) => x.numeroInterno).join(', ')})`}
              </div>
              <div style={{ fontSize: 13 }}>
                Personal de guardia disponible: <strong>{disp.personalDeGuardia.personal.filter((p) => !p.ausente).length}</strong>
                {disp.personalDeGuardia.guardiasVigentes === 0 && ' (no hay guardia vigente)'}
                {disp.personalDeGuardia.personal.length > 0 && (
                  <span style={{ color: 'var(--muted)' }}> — {disp.personalDeGuardia.personal.map((p) => p.nombre + (p.rol ? ` (${p.rol})` : '') + (p.ausente ? ' — ausente' : '')).join('; ')}</span>
                )}
              </div>
              {disp.convocatorias.map((c) => (
                <div key={c.id} style={{ fontSize: 13 }}>
                  Convocatoria «{c.mensaje.slice(0, 50)}»: van {c.voy}, no pueden {c.noPuedo}
                  {c.menorEtaMinutos !== null && `, el primero llega en ${c.menorEtaMinutos} min`}
                </div>
              ))}
            </div>
          )}

          {puedeDespachar && (
            <div className="card" style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 260px' }}>
                <label htmlFor={idServicio} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  Servicio al que se envía el móvil
                </label>
                <select id={idServicio} className="input-field" value={servicioId} onChange={(e) => setServicioId(e.target.value)}>
                  {servicios.length === 0 && <option value="">No hay servicios abiertos</option>}
                  {servicios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.numeroServicio} — {s.direccion.slice(0, 60)} ({s.estado})
                    </option>
                  ))}
                </select>
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                Luego pulse «Despachar» en cada móvil disponible.
              </p>
              {servicioId && (
                <button
                  type="button"
                  style={ESTILO_SECUNDARIO}
                  onClick={() => {
                    const sel = servicios.find((x) => x.id === servicioId);
                    descargarResumenPdf(servicioId, sel?.numeroServicio ?? 'servicio').catch((err: any) => setError(err.message));
                  }}
                >
                  Resumen operativo (PDF)
                </button>
              )}
            </div>
          )}

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <strong style={{ fontSize: 14 }}>Vencimientos ({vencimientos.length})</strong>
              <div>
                <label htmlFor={idDias} style={{ fontSize: 12, marginRight: 6 }}>Próximos</label>
                <select id={idDias} className="input-field" style={{ width: 'auto', display: 'inline-block' }} value={diasVenc} onChange={(e) => setDiasVenc(Number(e.target.value))}>
                  {[15, 30, 60, 90].map((d) => <option key={d} value={d}>{d} días</option>)}
                </select>
              </div>
            </div>
            {vencimientos.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Nada vence en este plazo.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                {vencimientos.map((v) => (
                  <li key={`${v.vehiculoId}-${v.tipo}`} style={{ color: v.vencido ? 'var(--danger)' : 'var(--ink)' }}>
                    Móvil {v.numeroInterno}: {v.tipo} {v.vencido ? 'venció' : 'vence'} el {v.fecha}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {moviles.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No hay móviles registrados.</p>
          ) : (
            <div className="card" style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Móvil</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Desde</th>
                    <th scope="col">Servicio</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {moviles.map((m) => {
                    const siguiente = m.despachoActivo ? PASO[m.despachoActivo.estado] : undefined;
                    const disponible = m.estado === 'OPERATIVO' && m.estadoOperativo === 'EN_CUARTEL';
                    return (
                      <tr key={m.id}>
                        <td>
                          <strong>{m.numeroInterno}</strong>
                          {m.alias ? ` · ${m.alias}` : ''}
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.tipo}</div>
                        </td>
                        <td>
                          <span className="badge" style={{ background: FONDO[m.estadoOperativo] }}>
                            {ETIQUETA[m.estadoOperativo]}
                          </span>
                          {m.alerta && (
                            <div style={{ fontSize: 12, color: 'var(--danger)' }}>
                              Figura en el cuartel pero el GPS lo ubica a {m.distanciaCuartelM} m: revisar si salió sin despacho.
                            </div>
                          )}
                          {m.estado !== 'OPERATIVO' && (
                            <div style={{ fontSize: 12, color: 'var(--danger)' }}>{m.estado.replace('_', ' ')}</div>
                          )}
                        </td>
                        <td>{desde(m.estadoOperativoDesde)}</td>
                        <td>
                          {m.despachoActivo
                            ? `${m.despachoActivo.numeroServicio ?? ''} ${m.despachoActivo.direccion?.slice(0, 40) ?? ''}`
                            : '—'}
                        </td>
                        <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {puedeDespachar && disponible && (
                            <button
                              type="button"
                              className="btn-primary"
                              disabled={ocupado || !servicioId}
                              onClick={() => ejecutar(() => despachar(servicioId, m.id), `Móvil ${m.numeroInterno} despachado`)}
                            >
                              Despachar
                            </button>
                          )}
                          {puedeDespachar && m.despachoActivo && siguiente && (
                            <button
                              type="button"
                              className="btn-primary"
                              disabled={ocupado}
                              onClick={() => avanzar(m, siguiente.paso, siguiente.texto)}
                            >
                              {siguiente.texto}
                            </button>
                          )}
                          {puedeDespachar && m.despachoActivo && (
                            <button type="button" style={ESTILO_SECUNDARIO} disabled={ocupado} onClick={() => cancelar(m)}>
                              Cancelar
                            </button>
                          )}
                          {puedeReponer && !m.despachoActivo && m.estadoOperativo !== 'EN_CUARTEL' && (
                            <button type="button" style={ESTILO_SECUNDARIO} disabled={ocupado} onClick={() => reponer(m)}>
                              Corregir a en cuartel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
