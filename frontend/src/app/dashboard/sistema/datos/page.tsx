'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch, obtenerSesion } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { usePuede } from '@/app/components/PermisosPantallaProvider';
import { MarcaActualizacion, useActualizacionPeriodica } from '@/app/components/useActualizacionPeriodica';
import { ESTADO_TAREA, fechaLegible, FONDO_ALERTA, Migraciones, Respaldos, tamanio } from '../tipos';

export default function SistemaDatosPage() {
  const confirmar = useConfirmacion();
  const puede = usePuede();
  const [permisos, setPermisos] = useState<string[]>([]);
  const [respaldos, setRespaldos] = useState<Respaldos | null>(null);
  const [migraciones, setMigraciones] = useState<Migraciones | null>(null);
  const [verificaciones, setVerificaciones] = useState<Record<string, { coincide: boolean | null; sha256: string }>>({});
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => { setPermisos(obtenerSesion()?.usuario.permisos ?? []); }, []);

  const cargar = useCallback(async () => {
    const [r, m] = await Promise.all([apiFetch('/sistema/respaldos'), apiFetch('/sistema/migraciones')]);
    if (!r.ok) { const c = await r.json().catch(() => ({})); throw new Error(c.message ?? 'No se pudieron consultar los respaldos.'); }
    setRespaldos(await r.json());
    if (m.ok) setMigraciones(await m.json());
  }, []);
  const actualizacion = useActualizacionPeriodica(cargar, 15_000);
  const puedeOperar = permisos.includes('sistema:operar') && puede('crear');

  async function respaldar() {
    if (!(await confirmar({ titulo: 'Respaldar ahora', mensaje: 'Se lanza la tarea programada SIGBO-Respaldo-Diario: respalda la base, verifica el archivo y calcula su SHA-256. Tarda uno o dos minutos.', confirmar: 'Respaldar' }))) return;
    setOcupado('respaldo'); setError(''); setExito('');
    try {
      const res = await apiFetch('/sistema/respaldos/ejecutar', { method: 'POST' });
      const c = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(c.message ?? 'No se pudo iniciar el respaldo.');
      setExito(c.mensaje ?? 'Respaldo iniciado.');
      actualizacion.refrescar();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo iniciar el respaldo.'); }
    finally { setOcupado(null); }
  }

  async function verificar(nombre: string) {
    setOcupado(nombre); setError('');
    try {
      const res = await apiFetch(`/sistema/respaldos/${encodeURIComponent(nombre)}/verificar`, { method: 'POST' });
      const c = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(c.message ?? 'No se pudo verificar el respaldo.');
      setVerificaciones((v) => ({ ...v, [nombre]: { coincide: c.coincide, sha256: c.sha256 } }));
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo verificar el respaldo.'); }
    finally { setOcupado(null); }
  }

  if (!respaldos) return actualizacion.error ? <Aviso tipo="error" texto={actualizacion.error} /> : <Cargando texto="Consultando respaldos…" />;
  const tarea = respaldos.tarea && 'nombre' in respaldos.tarea ? respaldos.tarea : null;
  const motivoTarea = respaldos.tarea && 'motivo' in respaldos.tarea ? respaldos.tarea.motivo : null;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="cm-cabecera"><p>Respaldos de la base (tarea programada) y estado de las migraciones.</p><MarcaActualizacion {...actualizacion} /></div>
      {actualizacion.error && <Aviso tipo="error" texto={`No se pudo actualizar: ${actualizacion.error}. Se muestran los últimos datos.`} />}
      {error && <Aviso tipo="error" texto={error} />}
      {exito && <Aviso tipo="exito" texto={exito} />}

      <section className="cm-panel" aria-labelledby="d-respaldos">
        <h2 id="d-respaldos">
          <span>Respaldos</span>
          {tarea?.estado && <span className="badge" style={{ background: ESTADO_TAREA[tarea.estado].fondo }}>Tarea: {ESTADO_TAREA[tarea.estado].texto}</span>}
        </h2>
        {!respaldos.disponible && <Aviso tipo="error" texto={respaldos.motivo ?? 'No disponible.'} fontSize={12} />}
        {motivoTarea && <p className="cm-vacio">Tarea programada no disponible: {motivoTarea}</p>}
        {respaldos.alertas.length > 0 && <ul className="cm-lista">{respaldos.alertas.map((a, i) => <li key={i}><span>{a.mensaje}</span><span className="badge" style={{ background: FONDO_ALERTA[a.nivel] }}>{a.nivel}</span></li>)}</ul>}
        {puedeOperar && <div className="cm-acciones">
          <button type="button" className="btn-primary" disabled={ocupado === 'respaldo' || tarea?.estado === 'EN_EJECUCION'} onClick={() => void respaldar()}>
            {ocupado === 'respaldo' ? 'Iniciando…' : tarea?.estado === 'EN_EJECUCION' ? 'Respaldo en curso…' : 'Respaldar ahora'}
          </button>
        </div>}
        {respaldos.archivos.length > 0 && <div style={{ overflowX: 'auto' }}><table className="tabla-compacta">
          <thead><tr><th scope="col">Fecha</th><th scope="col">Archivo</th><th scope="col">Tamaño</th><th scope="col">Integridad</th></tr></thead>
          <tbody>{respaldos.archivos.map((a) => {
            const v = verificaciones[a.nombre];
            return <tr key={a.nombre}>
              <td>{fechaLegible(a.fecha)}</td>
              <td><code>{a.nombre}</code></td>
              <td>{tamanio(a.tamanioBytes)}</td>
              <td>
                {v ? <span className="badge" style={{ background: v.coincide === null ? 'var(--warn-fill)' : v.coincide ? 'var(--ok-fill)' : 'var(--bad-fill)' }}>{v.coincide === null ? 'Sin .sha256 para comparar' : v.coincide ? 'Íntegro' : 'NO coincide'}</span>
                  : !a.tieneSha256 ? <span className="badge" style={{ background: 'var(--warn-fill)' }}>Sin .sha256</span>
                    : puedeOperar ? <button type="button" className="service-secondary" disabled={ocupado !== null} onClick={() => void verificar(a.nombre)}>{ocupado === a.nombre ? 'Verificando…' : 'Verificar'}</button>
                      : <span className="cm-vacio">Con .sha256</span>}
              </td>
            </tr>;
          })}</tbody>
        </table></div>}
        {respaldos.corridas.length > 0 && <>
          <h3 className="grupo-titulo">Últimas corridas registradas</h3>
          <ul className="cm-lista">{respaldos.corridas.map((c, i) => <li key={i}>
            <span>{c.archivo ?? 'Sin archivo'}{c.tamanio ? ` · ${c.tamanio}` : ''}<small>Prueba de restauración: {c.pruebaRestauracion === 'OMITIDA' ? 'omitida' : c.pruebaRestauracion === 'OK' ? `correcta (${c.detalleRestauracion ?? ''})` : c.pruebaRestauracion === 'FALLO' ? 'falló' : 'sin dato'}{c.avisos.length ? ` · ${c.avisos.join(' · ')}` : ''}</small></span>
            <span className="badge" style={{ background: c.resultado === 'OK' ? 'var(--ok-fill)' : c.resultado === 'FALLO' ? 'var(--bad-fill)' : 'var(--warn-fill)' }}>{c.resultado}</span>
          </li>)}</ul>
        </>}
      </section>

      <section className="cm-panel" aria-labelledby="d-migraciones">
        <h2 id="d-migraciones">Migraciones de la base</h2>
        {!migraciones ? <p className="cm-vacio">Consultando…</p> : !migraciones.disponible ? <p className="cm-vacio">No disponible: {migraciones.motivo}</p> : <>
          <div className="cm-cifras">
            <div className="cm-cifra"><strong>{migraciones.aplicadas}/{migraciones.total}</strong><span>Aplicadas</span></div>
            <div className="cm-cifra"><strong>{migraciones.pendientes.length}</strong><span>Pendientes</span></div>
            <div className="cm-cifra"><strong>{migraciones.alteradas.length}</strong><span>Alteradas</span></div>
          </div>
          {migraciones.alteradas.length > 0 && <Aviso tipo="error" texto={`Alteradas después de aplicarse (no se deben editar): ${migraciones.alteradas.join(', ')}`} fontSize={12} />}
          {migraciones.pendientes.length > 0 && <p className="cm-vacio">Pendientes: {migraciones.pendientes.join(', ')}. Aplicarlas cambia la estructura de la base y es una decisión de la institución: se hace desde la terminal con <code>{migraciones.comando}</code>, que aplica todas las pendientes en orden.</p>}
          {migraciones.desconocidas.length > 0 && <p className="cm-vacio">Registradas en la base pero ausentes del manifiesto: {migraciones.desconocidas.join(', ')}.</p>}
          {migraciones.ultimaAplicada && <p className="cm-vacio">Última aplicada: {migraciones.ultimaAplicada.nombre} ({fechaLegible(migraciones.ultimaAplicada.aplicadaEn)}).</p>}
        </>}
      </section>
    </div>
  );
}
