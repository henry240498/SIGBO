'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch, obtenerSesion } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { usePuede } from '@/app/components/PermisosPantallaProvider';
import { MarcaActualizacion, useActualizacionPeriodica } from '@/app/components/useActualizacionPeriodica';
import { ESTADO_TAREA, fechaLegible, TareasYTrabajos } from '../tipos';

export default function SistemaTareasPage() {
  const confirmar = useConfirmacion();
  const puede = usePuede();
  const [permisos, setPermisos] = useState<string[]>([]);
  const [datos, setDatos] = useState<TareasYTrabajos | null>(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [enCurso, setEnCurso] = useState<string | null>(null);

  useEffect(() => { setPermisos(obtenerSesion()?.usuario.permisos ?? []); }, []);

  const cargar = useCallback(async () => {
    const res = await apiFetch('/sistema/tareas');
    if (!res.ok) { const c = await res.json().catch(() => ({})); throw new Error(c.message ?? 'No se pudieron consultar las tareas.'); }
    setDatos(await res.json());
  }, []);
  const actualizacion = useActualizacionPeriodica(cargar, 15_000);

  async function ejecutar(clave: 'avisos' | 'gre') {
    const textos = clave === 'avisos'
      ? { titulo: 'Revisar vencimientos ahora', mensaje: 'Se revisan los vencimientos y, si hay nuevos, se avisa por Telegram (sin datos médicos).' }
      : { titulo: 'Procesar una importación GRE', mensaje: 'Procesa la próxima importación pendiente. Puede tardar varios minutos; corre en segundo plano.' };
    if (!(await confirmar({ titulo: textos.titulo, mensaje: textos.mensaje, confirmar: 'Ejecutar' }))) return;
    setEnCurso(clave); setError(''); setExito('');
    try {
      const res = clave === 'avisos'
        ? await apiFetch('/sistema/tareas/avisos-vencimiento/ejecutar', { method: 'POST' })
        : await apiFetch('/matpel/administracion/importaciones/procesar', { method: 'POST' });
      const c = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(c.message ?? 'No se pudo ejecutar.');
      setExito(clave === 'avisos'
        ? (c.enviados > 0 ? `Se enviaron ${c.enviados} aviso(s).` : `Revisión hecha: ${c.motivo ?? 'no había vencimientos nuevos'}.`)
        : 'Procesamiento iniciado. El estado se actualiza solo.');
      actualizacion.refrescar();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo ejecutar.'); }
    finally { setEnCurso(null); }
  }

  if (!datos) return actualizacion.error ? <Aviso tipo="error" texto={actualizacion.error} /> : <Cargando texto="Consultando tareas…" />;
  const { gre, avisos } = datos.trabajos;
  const puedeOperar = permisos.includes('sistema:operar') && puede('crear');
  const puedeGre = permisos.includes('matpel:administrar_gre');

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="cm-cabecera"><p>Tareas programadas de Windows y trabajos internos del servidor.</p><MarcaActualizacion {...actualizacion} /></div>
      {actualizacion.error && <Aviso tipo="error" texto={`No se pudo actualizar: ${actualizacion.error}. Se muestran los últimos datos.`} />}
      {error && <Aviso tipo="error" texto={error} />}
      {exito && <Aviso tipo="exito" texto={exito} />}

      <section className="cm-panel" aria-labelledby="t-windows">
        <h2 id="t-windows">Tareas programadas de Windows</h2>
        {datos.tareas === null ? <p className="cm-vacio">No disponible: {datos.motivoTareas}</p> : <div style={{ overflowX: 'auto' }}><table className="tabla-compacta">
          <thead><tr><th scope="col">Tarea</th><th scope="col">Estado</th><th scope="col">Última ejecución</th><th scope="col">Resultado</th><th scope="col">Próxima</th></tr></thead>
          <tbody>{datos.tareas.map((t) => <tr key={t.nombre}>
            <td>{t.nombre}</td>
            <td>{t.existe && t.estado ? <span className="badge" style={{ background: ESTADO_TAREA[t.estado].fondo }}>{ESTADO_TAREA[t.estado].texto}</span> : <span className="badge" style={{ background: 'var(--bad-fill)' }}>No programada</span>}</td>
            <td>{fechaLegible(t.ultimaEjecucion)}</td>
            <td>{t.descripcionResultado ?? '—'}</td>
            <td>{fechaLegible(t.proximaEjecucion)}</td>
          </tr>)}</tbody>
        </table></div>}
        <p className="cm-vacio">El respaldo se lanza desde «Respaldos y base de datos».</p>
      </section>

      <div className="cm-grid">
        <section className="cm-panel" aria-labelledby="t-avisos">
          <h2 id="t-avisos"><span>Avisos de vencimiento</span><span className="badge" style={{ background: avisos.programado ? 'var(--ok-fill)' : 'var(--neutral-fill)' }}>{avisos.programado ? `Cada ${avisos.intervaloHoras} h` : 'Apagado'}</span></h2>
          <ul className="cm-lista">
            <li><span>Telegram</span><span>{avisos.telegramConfigurado ? 'Configurado' : 'Sin configurar'}</span></li>
            <li><span>Última revisión</span><span>{fechaLegible(avisos.ultimaEjecucion)}</span></li>
            <li><span>Resultado</span><span>{avisos.ultimoError ? `Error: ${avisos.ultimoError}` : avisos.ultimosEnviados !== null ? `${avisos.ultimosEnviados} enviado(s)${avisos.ultimoMotivo ? ` · ${avisos.ultimoMotivo}` : ''}` : '—'}</span></li>
          </ul>
          {puedeOperar && <button type="button" className="btn-primary" disabled={avisos.ocupado || enCurso === 'avisos'} onClick={() => void ejecutar('avisos')}>{avisos.ocupado || enCurso === 'avisos' ? 'Revisando…' : 'Revisar ahora'}</button>}
        </section>

        <section className="cm-panel" aria-labelledby="t-gre">
          <h2 id="t-gre"><span>Importación de la GRE</span><span className="badge" style={{ background: gre.activo ? 'var(--ok-fill)' : 'var(--neutral-fill)' }}>{gre.activo ? 'Automático' : 'Manual'}</span></h2>
          {!gre.cola.tablas ? <p className="cm-vacio">No disponible: {gre.cola.motivo}</p> : <ul className="cm-lista">
            {Object.entries(gre.cola.porEstado).map(([e, n]) => <li key={e}><span>{e}</span><strong>{n}</strong></li>)}
            {Object.keys(gre.cola.porEstado).length === 0 && <li><span className="cm-vacio">No hay importaciones.</span></li>}
            <li><span>Última corrida</span><span>{fechaLegible(gre.ultimaEjecucion)}{gre.ultimoError ? ` · error: ${gre.ultimoError}` : ''}</span></li>
          </ul>}
          {puedeGre && <button type="button" className="btn-primary" disabled={!gre.cola.tablas || gre.ocupado || enCurso === 'gre'} title={!gre.cola.tablas ? gre.cola.motivo ?? undefined : undefined} onClick={() => void ejecutar('gre')}>{gre.ocupado || enCurso === 'gre' ? 'Procesando…' : 'Procesar una importación'}</button>}
        </section>

        <section className="cm-panel cm-panel-ancho" aria-labelledby="t-arranque">
          <h2 id="t-arranque">Arranque automático (últimas líneas)</h2>
          {datos.arranque.length === 0 ? <p className="cm-vacio">Sin registro de arranque automático.</p>
            : <div className="registro-visor">{datos.arranque.map((l, i) => <div key={i} className={`registro-linea ${l.nivel === 'ERROR' ? 'error' : l.nivel === 'WARN' ? 'warn' : ''}`}>{l.texto}</div>)}</div>}
        </section>
      </div>
    </div>
  );
}
