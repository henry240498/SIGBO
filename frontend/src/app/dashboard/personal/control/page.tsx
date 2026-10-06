'use client';

import { useEffect, useId, useState } from 'react';
import QRCode from 'qrcode';
import { obtenerSesion } from '@/lib/api';
import {
  FichajeDelDia,
  LimitesHoras,
  crearAptitud,
  ORIGEN_ETIQUETA,
  PuntoFichaje,
  ResumenHoras,
  VencimientoPersonal,
  actualizarPuntoFichaje,
  cargarFichajesDelDia,
  cargarLimitesHoras,
  cargarPuntosFichaje,
  cargarResumenHoras,
  cargarVencimientosPersonal,
  crearPuntoFichaje,
  fijarLimitesHoras,
  regenerarPuntoFichaje,
  urlDeFichaje,
} from '@/lib/control-personal';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import { ComboBuscable } from '@/components/ComboBuscable';
import { BomberoResumen, cargarBomberos } from '@/lib/personal';

type Vista = 'vencimientos' | 'horas' | 'fichaje';

const BOTON_NEUTRO: React.CSSProperties = {
  background: 'var(--neutral-fill)',
  color: 'var(--ink)',
  border: '1px solid var(--line)',
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 13,
  cursor: 'pointer',
};

const hoyIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const haceDiasIso = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function ControlPersonalPage() {
  const id = useId();
  const [vista, setVista] = useState<Vista>('vencimientos');
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeVerGuardias = permisos.includes('guardias:ver');
  const puedeEditarGuardias = permisos.includes('guardias:editar');
  const puedeVerAsistencia = permisos.includes('asistencia:ver');
  const puedeEditarAsistencia = permisos.includes('asistencia:editar');

  // ---- vencimientos ----
  const [dias, setDias] = useState(30);
  const [venc, setVenc] = useState<VencimientoPersonal[] | null>(null);
  const [bomberos, setBomberos] = useState<BomberoResumen[]>([]);
  const [aptBombero, setAptBombero] = useState('');
  const [aptCategoria, setAptCategoria] = useState<'MEDICA' | 'LICENCIA' | 'OTRA'>('OTRA');
  const [aptTipo, setAptTipo] = useState('');
  const [aptVence, setAptVence] = useState('');
  const puedeEditarPersonal = permisos.includes('personal:editar');
  const puedeEditarMedico = permisos.includes('personal:editar_medico');

  // ---- horas ----
  const [desde, setDesde] = useState(haceDiasIso(30));
  const [hasta, setHasta] = useState(hoyIso());
  const [horas, setHoras] = useState<ResumenHoras | null>(null);
  const [lim, setLim] = useState<LimitesHoras>({ horasMaximasPeriodo: 0, periodoDias: 7, descansoMinimoHoras: 0 });

  // ---- fichaje ----
  const [puntos, setPuntos] = useState<PuntoFichaje[] | null>(null);
  const [fichajes, setFichajes] = useState<FichajeDelDia[]>([]);
  const [nombrePunto, setNombrePunto] = useState('');
  const [qr, setQr] = useState<{ nombre: string; imagen: string; url: string } | null>(null);

  async function ejecutar(accion: () => Promise<void>, ok?: string) {
    setError(null);
    setMensaje(null);
    try {
      await accion();
      if (ok) setMensaje(ok);
    } catch (err: any) {
      setError(err.message);
    }
  }

  const cargarVenc = () => ejecutar(async () => setVenc(await cargarVencimientosPersonal(dias)));
  const cargarHoras = () =>
    ejecutar(async () => {
      setHoras(await cargarResumenHoras(desde, hasta));
      const l = await cargarLimitesHoras();
      if (l) setLim({ horasMaximasPeriodo: l.horasMaximasPeriodo, periodoDias: l.periodoDias, descansoMinimoHoras: l.descansoMinimoHoras });
    });
  const cargarFichaje = () =>
    ejecutar(async () => {
      setPuntos(await cargarPuntosFichaje());
      setFichajes(await cargarFichajesDelDia(hoyIso()));
    });

  useEffect(() => {
    if (vista === 'vencimientos' && puedeEditarPersonal && bomberos.length === 0) {
      cargarBomberos().then(setBomberos).catch(() => undefined);
    }
    if (vista === 'vencimientos') cargarVenc();
    if (vista === 'horas' && puedeVerGuardias) cargarHoras();
    if (vista === 'fichaje' && puedeVerAsistencia) cargarFichaje();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vista, dias]);

  async function mostrarQr(nombre: string, token: string) {
    const url = urlDeFichaje(token);
    setQr({ nombre, url, imagen: await QRCode.toDataURL(url, { width: 280, margin: 2 }) });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 16 }}>Control del personal</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>Vencimientos, horas de servicio y fichaje por QR.</p>
      </div>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {([['vencimientos', 'Vencimientos'], ['horas', 'Horas de servicio'], ['fichaje', 'Fichaje por QR']] as Array<[Vista, string]>).map(([v, t]) => (
          <button key={v} type="button" className={vista === v ? 'btn-primary' : undefined} style={vista === v ? undefined : BOTON_NEUTRO} onClick={() => setVista(v)}>
            {t}
          </button>
        ))}
      </div>

      {vista === 'vencimientos' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <strong style={{ fontSize: 14 }}>Vencimientos ({venc?.length ?? 0})</strong>
            <div>
              <label htmlFor={`${id}-dias`} style={{ fontSize: 12, marginRight: 6 }}>Próximos</label>
              <select id={`${id}-dias`} className="input-field" style={{ width: 'auto', display: 'inline-block' }} value={dias} onChange={(e) => setDias(Number(e.target.value))}>
                {[15, 30, 60, 90, 180].map((d) => <option key={d} value={d}>{d} días</option>)}
              </select>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
            Reúne aptitudes, certificaciones, autorizaciones de conducción y equipos entregados. Los datos médicos solo los ve quien tiene ese permiso.
          </p>
          {puedeEditarPersonal && (
            <form
              style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap', borderTop: '1px solid var(--line)', paddingTop: 10 }}
              onSubmit={(e) => {
                e.preventDefault();
                if (!aptBombero) {
                  setError('Elija el bombero.');
                  return;
                }
                ejecutar(async () => {
                  await crearAptitud({ bomberoId: aptBombero, categoria: aptCategoria, tipo: aptTipo, venceEn: aptVence });
                  setAptTipo('');
                  setAptVence('');
                  await cargarVenc();
                }, 'Aptitud registrada');
              }}
            >
              <div style={{ minWidth: 220 }}>
                <span style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Bombero</span>
                <ComboBuscable
                  ariaLabel="Bombero de la aptitud"
                  value={aptBombero}
                  onChange={setAptBombero}
                  opciones={bomberos.map((b) => ({ value: b.id, label: `${b.apellido}, ${b.nombre} (${b.numeroBombero})` }))}
                  placeholderBusqueda="Buscar bombero…"
                />
              </div>
              <div>
                <label htmlFor={`${id}-ac`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Categoría</label>
                <select id={`${id}-ac`} className="input-field" value={aptCategoria} onChange={(e) => setAptCategoria(e.target.value as 'MEDICA' | 'LICENCIA' | 'OTRA')}>
                  <option value="OTRA">Otra</option>
                  <option value="LICENCIA">Licencia</option>
                  {puedeEditarMedico && <option value="MEDICA">Médica</option>}
                </select>
              </div>
              <div>
                <label htmlFor={`${id}-at`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Qué es</label>
                <input id={`${id}-at`} className="input-field" value={aptTipo} onChange={(e) => setAptTipo(e.target.value)} required minLength={2} maxLength={80} placeholder="Ej.: Carnet de salud" />
              </div>
              <div>
                <label htmlFor={`${id}-av`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Vence</label>
                <input id={`${id}-av`} className="input-field" type="date" value={aptVence} onChange={(e) => setAptVence(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary">Registrar aptitud</button>
            </form>
          )}
          {venc === null ? (
            <Cargando texto="Cargando vencimientos…" />
          ) : venc.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Nada vence en este plazo.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th scope="col">Bombero</th>
                  <th scope="col">Qué</th>
                  <th scope="col">Vence</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {venc.map((v, i) => (
                  <tr key={`${v.origen}-${v.bomberoId}-${v.descripcion}-${i}`}>
                    <td>{v.bombero}</td>
                    <td>{v.descripcion}<div style={{ fontSize: 12, color: 'var(--muted)' }}>{ORIGEN_ETIQUETA[v.origen]}</div></td>
                    <td>{v.fecha}</td>
                    <td>
                      <span className="badge" style={{ background: v.vencido ? 'var(--bad-fill)' : v.diasRestantes <= 15 ? 'var(--warn-fill)' : 'var(--neutral-fill)' }}>
                        {v.vencido ? `Vencido hace ${-v.diasRestantes} d` : `Vence en ${v.diasRestantes} d`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {vista === 'horas' && !puedeVerGuardias && <p style={{ fontSize: 13, color: 'var(--muted)' }}>No tiene permiso para ver las guardias.</p>}
      {vista === 'horas' && puedeVerGuardias && (
        <>
          <div className="card" style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
            <div>
              <label htmlFor={`${id}-d`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Desde</label>
              <input id={`${id}-d`} className="input-field" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </div>
            <div>
              <label htmlFor={`${id}-h`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Hasta</label>
              <input id={`${id}-h`} className="input-field" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </div>
            <button type="button" className="btn-primary" onClick={cargarHoras}>Calcular</button>
          </div>

          {puedeEditarGuardias && (
            <form
              className="card"
              style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}
              onSubmit={(e) => {
                e.preventDefault();
                ejecutar(async () => {
                  await fijarLimitesHoras(lim);
                  await cargarHoras();
                }, 'Límites guardados');
              }}
            >
              <div style={{ flex: '1 1 100%', fontSize: 13 }}>
                <strong>Límites que fija el cuartel</strong>
                <span style={{ color: 'var(--muted)' }}> — sin límites cargados no se marca ninguna alerta.</span>
              </div>
              <div>
                <label htmlFor={`${id}-hm`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Horas máximas</label>
                <input id={`${id}-hm`} className="input-field" style={{ width: 110 }} type="number" min={1} max={744} required value={lim.horasMaximasPeriodo || ''} onChange={(e) => setLim({ ...lim, horasMaximasPeriodo: Number(e.target.value) })} />
              </div>
              <div>
                <label htmlFor={`${id}-pd`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>En cuántos días</label>
                <input id={`${id}-pd`} className="input-field" style={{ width: 110 }} type="number" min={1} max={366} required value={lim.periodoDias || ''} onChange={(e) => setLim({ ...lim, periodoDias: Number(e.target.value) })} />
              </div>
              <div>
                <label htmlFor={`${id}-dm`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Descanso mínimo (h)</label>
                <input id={`${id}-dm`} className="input-field" style={{ width: 110 }} type="number" min={0} max={168} required value={lim.descansoMinimoHoras} onChange={(e) => setLim({ ...lim, descansoMinimoHoras: Number(e.target.value) })} />
              </div>
              <button type="submit" className="btn-primary">Guardar límites</button>
            </form>
          )}

          {horas === null ? (
            <Cargando texto="Calculando horas…" />
          ) : horas.bomberos.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>No hay guardias con personal asignado en ese rango.</p>
          ) : (
            <div className="card" style={{ overflowX: 'auto' }}>
              <div style={{ fontSize: 13, marginBottom: 8 }}>
                {horas.limites
                  ? <>Límite: {horas.limites.horasMaximasPeriodo} h cada {horas.limites.periodoDias} días, descanso mínimo {horas.limites.descansoMinimoHoras} h · <strong>{horas.conAlertas} con alertas</strong></>
                  : 'No hay límites configurados: se muestran solo las horas.'}
              </div>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Bombero</th>
                    <th scope="col">Guardias</th>
                    <th scope="col">Horas</th>
                    <th scope="col">Máx. en el período</th>
                    <th scope="col">Alertas</th>
                  </tr>
                </thead>
                <tbody>
                  {horas.bomberos.map((b) => (
                    <tr key={b.bomberoId}>
                      <td>{b.nombre}</td>
                      <td>{b.guardias}</td>
                      <td>{b.totalHoras}</td>
                      <td>{b.maximoEnPeriodo ?? '—'}</td>
                      <td>
                        {b.excedeLimite && <span className="badge" style={{ background: 'var(--bad-fill)' }}>Excede horas</span>}{' '}
                        {b.violacionesDescanso.length > 0 && (
                          <span className="badge" style={{ background: 'var(--warn-fill)' }}>Descanso corto ({b.violacionesDescanso.length})</span>
                        )}
                        {!b.excedeLimite && b.violacionesDescanso.length === 0 && '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {vista === 'fichaje' && !puedeVerAsistencia && <p style={{ fontSize: 13, color: 'var(--muted)' }}>No tiene permiso para ver la asistencia.</p>}
      {vista === 'fichaje' && puedeVerAsistencia && (
        <>
          {puedeEditarAsistencia && (
            <form
              className="card"
              style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}
              onSubmit={(e) => {
                e.preventDefault();
                ejecutar(async () => {
                  const p = await crearPuntoFichaje(nombrePunto);
                  setNombrePunto('');
                  await mostrarQr(p.nombre, p.token);
                  await cargarFichaje();
                }, 'Punto creado. Imprima el QR: no se vuelve a mostrar.');
              }}
            >
              <div style={{ flex: '1 1 220px' }}>
                <label htmlFor={`${id}-np`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nuevo punto de fichaje</label>
                <input id={`${id}-np`} className="input-field" value={nombrePunto} onChange={(e) => setNombrePunto(e.target.value)} required minLength={2} maxLength={100} placeholder="Ej.: Puerta principal" />
              </div>
              <button type="submit" className="btn-primary">Crear y generar QR</button>
            </form>
          )}

          {qr && (
            <section className="card" aria-label={`QR de ${qr.nombre}`} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <img src={qr.imagen} alt={`Código QR de ${qr.nombre}`} width={200} height={200} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, maxWidth: 360 }}>
                <strong>{qr.nombre}</strong>
                <span>Imprímalo y péguelo en la puerta. Cada bombero lo escanea con la cámara de su celular: el sistema registra su entrada o salida.</span>
                <span style={{ color: 'var(--muted)' }}>Este código no se vuelve a mostrar. Si se pierde, genere uno nuevo (el anterior deja de valer).</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" style={BOTON_NEUTRO} onClick={() => window.print()}>Imprimir</button>
                  <button type="button" style={BOTON_NEUTRO} onClick={() => setQr(null)}>Ocultar</button>
                </div>
              </div>
            </section>
          )}

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <strong style={{ fontSize: 14 }}>Puntos de fichaje</strong>
            {puntos === null ? (
              <Cargando texto="Cargando puntos…" />
            ) : puntos.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Todavía no hay puntos de fichaje.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th scope="col">Punto</th>
                    <th scope="col">Estado</th>
                    {puedeEditarAsistencia && <th scope="col">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {puntos.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nombre}</td>
                      <td><span className="badge" style={{ background: p.activo ? 'var(--ok-fill)' : 'var(--neutral-fill)' }}>{p.activo ? 'Activo' : 'Dado de baja'}</span></td>
                      {puedeEditarAsistencia && (
                        <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            style={BOTON_NEUTRO}
                            onClick={() =>
                              ejecutar(async () => {
                                const r = await regenerarPuntoFichaje(p.id);
                                await mostrarQr(r.nombre, r.token);
                              }, 'QR nuevo generado. El anterior ya no sirve.')
                            }
                          >
                            Generar QR nuevo
                          </button>
                          <button
                            type="button"
                            style={BOTON_NEUTRO}
                            onClick={() => ejecutar(async () => { await actualizarPuntoFichaje(p.id, { activo: !p.activo }); await cargarFichaje(); })}
                          >
                            {p.activo ? 'Dar de baja' : 'Reactivar'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <strong style={{ fontSize: 14 }}>Fichajes de hoy ({fichajes.length})</strong>
            {fichajes.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Nadie fichó todavía hoy.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th scope="col">Hora</th>
                    <th scope="col">Usuario</th>
                    <th scope="col">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {fichajes.map((f) => (
                    <tr key={f.id}>
                      <td>{new Date(f.registradoEn).toLocaleTimeString('es-PY')}</td>
                      <td>{f.usuario}</td>
                      <td>{f.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
