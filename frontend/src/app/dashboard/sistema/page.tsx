'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { apiFetch, obtenerSesion } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { useEntradaConfirmada } from '@/app/components/InputProvider';
import { useRutasVisibles } from '@/app/components/PermisosPantallaProvider';
import { MarcaActualizacion, useActualizacionPeriodica } from '@/app/components/useActualizacionPeriodica';
import { duracion, EstadoSistema, ETIQUETA_NIVEL, FONDO_ALERTA, ResumenSistema } from './tipos';

const ESTADO_SNOOPY = {
  ACTIVA: { texto: 'Activo', fondo: 'var(--ok-fill)' },
  MANTENIMIENTO: { texto: 'En mantenimiento', fondo: 'var(--warn-fill)' },
  INACTIVA: { texto: 'Apagado', fondo: 'var(--bad-fill)' },
} as const;

/** Lo que sigue en la terminal, y por qué (spec 2026-10-09 §6.7). Texto, sin botones. */
const SOLO_TERMINAL = [
  { accion: 'Iniciar, reiniciar o detener SIGBO', motivo: 'Es el mismo servidor que atiende esta pantalla.', comando: 'iniciar-sigbo.bat -Rebuild · detener-sigbo.bat' },
  { accion: 'Aplicar migraciones', motivo: 'Cambian la estructura de la base; la 094 y la 095 esperan la decisión de la institución.', comando: 'database\\run-migrations.ps1' },
  { accion: 'Publicar una versión del APK', motivo: 'La clave privada de firma no está en el servidor, a propósito.', comando: '.movile\\scripts\\publicar-apk.ps1' },
  { accion: 'Abrir el túnel a internet', motivo: 'Expone el sistema fuera de la red del cuartel.', comando: 'tunel-sigbo.bat' },
  { accion: 'Programar o quitar tareas de Windows', motivo: 'Necesitan la sesión de Windows del servidor.', comando: 'workflows\\scripts\\programar-respaldo.ps1 · programar-arranque.ps1' },
];

const Si = ({ ok, si = 'Sí', no = 'No' }: { ok: boolean; si?: string; no?: string }) =>
  <span className="badge" style={{ background: ok ? 'var(--ok-fill)' : 'var(--bad-fill)' }}>{ok ? si : no}</span>;

export default function SistemaEstadoPage() {
  const confirmar = useConfirmacion();
  const pedir = useEntradaConfirmada();
  const visibles = useRutasVisibles();
  const [permisos, setPermisos] = useState<string[]>([]);
  const [estado, setEstado] = useState<EstadoSistema | null>(null);
  const [resumen, setResumen] = useState<ResumenSistema | null>(null);
  const [errorResumen, setErrorResumen] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [enCurso, setEnCurso] = useState<'snoopy' | 'ollama' | null>(null);
  const [prueba, setPrueba] = useState<{ conectado: boolean; version: string | null; error: string | null } | null>(null);

  useEffect(() => { setPermisos(obtenerSesion()?.usuario.permisos ?? []); }, []);

  const cargar = useCallback(async () => {
    const [e, r] = await Promise.all([apiFetch('/sistema/estado'), apiFetch('/sistema/resumen')]);
    if (!e.ok) {
      const cuerpo = await e.json().catch(() => ({}));
      throw new Error(cuerpo.message ?? 'No se pudo consultar el estado del sistema.');
    }
    setEstado(await e.json());
    if (r.ok) { setResumen(await r.json()); setErrorResumen(''); }
    else {
      const cuerpo = await r.json().catch(() => ({}));
      setErrorResumen(cuerpo.message ?? `El servidor respondió ${r.status}.`);
    }
  }, []);
  const actualizacion = useActualizacionPeriodica(cargar, 15_000);

  async function cambiarSnoopy(nuevo: 'ACTIVA' | 'INACTIVA' | 'MANTENIMIENTO') {
    let cuerpo: Record<string, string> = { estado: nuevo };
    if (nuevo === 'MANTENIMIENTO') {
      const mensaje = await pedir({ titulo: 'Poner a Snoopy en mantenimiento', mensaje: 'Las personas verán este mensaje mientras dure.', etiqueta: 'Mensaje para las personas', requerida: true, confirmar: 'Poner en mantenimiento' });
      if (mensaje === null) return;
      cuerpo = { ...cuerpo, mensajeMantenimiento: mensaje, motivo: mensaje };
    } else if (nuevo === 'INACTIVA') {
      const motivo = await pedir({ titulo: 'Apagar a Snoopy', mensaje: 'Nadie podrá usar el asistente hasta que se reactive. Queda auditado.', etiqueta: 'Motivo', requerida: true, confirmar: 'Apagar', peligro: true });
      if (motivo === null) return;
      cuerpo = { ...cuerpo, motivo };
    } else if (!(await confirmar({ titulo: 'Reactivar a Snoopy', mensaje: 'El asistente vuelve a estar disponible para todos.', confirmar: 'Reactivar' }))) {
      return;
    }
    setError(''); setExito(''); setEnCurso('snoopy');
    try {
      const res = await apiFetch('/ia/admin/estado', { method: 'PATCH', body: JSON.stringify(cuerpo) });
      const datos = await res.json().catch(() => ({}));
      if (!res.ok) { setError(datos.message ?? 'No se pudo cambiar el estado de Snoopy.'); return; }
      setExito('Estado de Snoopy actualizado y registrado en auditoría.');
      actualizacion.refrescar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cambiar el estado de Snoopy.');
    } finally { setEnCurso(null); }
  }

  async function probarOllama() {
    setPrueba(null); setError(''); setEnCurso('ollama');
    try {
      const res = await apiFetch('/ia/admin/config/ollama/probar-conexion', { method: 'POST' });
      const datos = await res.json().catch(() => ({}));
      if (!res.ok) { setError(datos.message ?? 'No se pudo probar la conexión con Ollama.'); return; }
      setPrueba(datos);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo probar la conexión con Ollama.');
    } finally { setEnCurso(null); }
  }

  if (!estado) return actualizacion.error ? <Aviso tipo="error" texto={actualizacion.error} /> : <Cargando texto="Consultando el estado del sistema…" filas={4} />;
  const ia = estado.inteligencia;
  const puedeCambiarSnoopy = permisos.includes('inteligencia:desactivar');
  const estadoSnoopy = ia.estado ? ESTADO_SNOOPY[ia.estado] : undefined;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="cm-cabecera">
        <p>Estado real de los servicios, el asistente y las tareas del sistema.</p>
        <MarcaActualizacion {...actualizacion} />
      </div>
      {actualizacion.error && <Aviso tipo="error" texto={`No se pudo actualizar: ${actualizacion.error}. Se muestran los últimos datos.`} />}
      {error && <Aviso tipo="error" texto={error} />}
      {exito && <Aviso tipo="exito" texto={exito} />}

      {errorResumen && <Aviso tipo="error" texto={`No se pudo obtener el resumen: ${errorResumen}`} />}
      {resumen && <section className="cm-panel" aria-labelledby="sis-resumen">
        <h2 id="sis-resumen"><span>Resumen</span><span className={`semaforo semaforo-${resumen.nivel}`}>{ETIQUETA_NIVEL[resumen.nivel]}</span></h2>
        {resumen.alertas.length === 0 ? <p className="cm-vacio">Sin alertas.</p> : <ul className="cm-lista">
          {resumen.alertas.map((a, i) => <li key={i}><span>{a.mensaje}</span><span className="badge" style={{ background: FONDO_ALERTA[a.nivel] }}>{a.nivel}</span></li>)}
        </ul>}
      </section>}

      <div className="cm-grid">
        <section className="cm-panel" aria-labelledby="sis-backend">
          <h2 id="sis-backend">Servidor (backend)</h2>
          <ul className="cm-lista">
            <li><span>Versión</span><span>{estado.backend.version ?? 'No disponible'}</span></li>
            <li><span>Encendido desde hace</span><span>{duracion(estado.backend.segundosEncendido)}</span></li>
            <li><span>Memoria</span><span>{estado.backend.memoriaMb} MB</span></li>
            <li><span>Node · entorno</span><span>{estado.backend.node} · {estado.backend.entorno}</span></li>
          </ul>
        </section>

        <section className="cm-panel" aria-labelledby="sis-bd">
          <h2 id="sis-bd"><span>Base de datos</span><Si ok={estado.baseDeDatos.disponible} si="Responde" no="Sin respuesta" /></h2>
          {estado.baseDeDatos.disponible ? <ul className="cm-lista">
            <li><span>Latencia</span><span>{estado.baseDeDatos.latenciaMs} ms</span></li>
            <li><span>SQL Server</span><span>{estado.baseDeDatos.version ?? 'No disponible'}</span></li>
            <li><span>Tamaño</span><span>{estado.baseDeDatos.tamanioMb !== null ? `${estado.baseDeDatos.tamanioMb} MB` : 'No disponible'}</span></li>
          </ul> : <Aviso tipo="error" texto={estado.baseDeDatos.motivo ?? 'Sin respuesta.'} fontSize={12} />}
        </section>

        <section className="cm-panel" aria-labelledby="sis-ia">
          <h2 id="sis-ia"><span>Snoopy (asistente)</span>{estadoSnoopy && <span className="badge" style={{ background: estadoSnoopy.fondo }}>{estadoSnoopy.texto}</span>}</h2>
          {!ia.disponible ? <Aviso tipo="error" texto={`No disponible: ${ia.motivo}`} fontSize={12} /> : <ul className="cm-lista">
            <li><span>Ollama{ia.ollama?.modeloConfigurado ? <small>Modelo {ia.ollama.modeloConfigurado}{ia.ollama.modeloDisponible === false ? ' (no instalado)' : ''}</small> : null}</span><Si ok={!!ia.ollama?.conectado} si="Conectado" no="Sin conexión" /></li>
            <li><span>Whisper (voz a texto)</span><Si ok={!!ia.whisper?.conectado} si="Conectado" no="Sin conexión" /></li>
            <li><span>Piper (texto a voz){ia.piper?.error ? <small>{ia.piper.error}</small> : null}</span><Si ok={!!ia.piper?.disponible} si="Listo" no="No disponible" /></li>
          </ul>}
          {prueba && <p className="cm-vacio">Prueba de Ollama: {prueba.conectado ? `conectado (versión ${prueba.version ?? '?'})` : `sin conexión: ${prueba.error ?? 'sin detalle'}`}</p>}
          <div className="cm-acciones">
            {permisos.includes('inteligencia:configurar') && <button type="button" className="service-secondary" disabled={enCurso !== null} onClick={() => void probarOllama()}>{enCurso === 'ollama' ? 'Probando…' : 'Probar Ollama'}</button>}
            {puedeCambiarSnoopy && ia.estado !== 'MANTENIMIENTO' && <button type="button" className="service-secondary" disabled={enCurso !== null} onClick={() => void cambiarSnoopy('MANTENIMIENTO')}>Mantenimiento</button>}
            {puedeCambiarSnoopy && ia.estado !== 'ACTIVA' && <button type="button" className="btn-primary" disabled={enCurso !== null} onClick={() => void cambiarSnoopy('ACTIVA')}>Reactivar</button>}
            {puedeCambiarSnoopy && ia.estado !== 'INACTIVA' && <button type="button" className="service-secondary" disabled={enCurso !== null} onClick={() => void cambiarSnoopy('INACTIVA')}>Apagar</button>}
            {visibles.has('/dashboard/seguridad/inteligencia-artificial/configuracion') && <Link href="/dashboard/seguridad/inteligencia-artificial/configuracion" style={{ fontSize: 12 }}>Configurar</Link>}
          </div>
        </section>

        <section className="cm-panel" aria-labelledby="sis-tr">
          <h2 id="sis-tr">Tiempo real y avisos</h2>
          <ul className="cm-lista">
            <li><span>Despacho: conexiones abiertas<small>{estado.tiempoReal.despacho.personas} persona(s) conectada(s)</small></span><strong>{estado.tiempoReal.despacho.conexiones}</strong></li>
            <li><span>Alertas: oyentes</span><strong>{estado.tiempoReal.alertas.suscriptores}</strong></li>
            <li><span>Telegram</span><Si ok={estado.telegram.configurado} si="Configurado" no="Sin configurar" /></li>
          </ul>
        </section>

        <section className="cm-panel" aria-labelledby="sis-matriz">
          <h2 id="sis-matriz"><span>Permisos por pantalla</span><Si ok={estado.matriz.activa && estado.matriz.sincronizada} si="Activos" no="Revisar" /></h2>
          <ul className="cm-lista">
            <li><span>Pantallas web y secciones</span><span>{estado.matriz.pantallas} + {estado.matriz.secciones}</span></li>
            <li><span>Rutas de la API leídas</span><span>{estado.matriz.rutasBackend}</span></li>
            <li><span>Llamadas sin resolver</span><span>{estado.matriz.llamadasSinResolver}</span></li>
          </ul>
          {estado.matriz.error && <Aviso tipo="error" texto={estado.matriz.error} fontSize={12} />}
          {visibles.has('/dashboard/seguridad/pantallas') && <Link href="/dashboard/seguridad/pantallas" style={{ fontSize: 12 }}>Configurar reglas</Link>}
        </section>

        <section className="cm-panel cm-panel-ancho" aria-labelledby="sis-terminal">
          <h2 id="sis-terminal">Lo que sigue en la terminal</h2>
          <div style={{ overflowX: 'auto' }}><table className="tabla-compacta">
            <thead><tr><th scope="col">Acción</th><th scope="col">Por qué no está en la web</th><th scope="col">Comando</th></tr></thead>
            <tbody>{SOLO_TERMINAL.map((t) => <tr key={t.accion}><td>{t.accion}</td><td>{t.motivo}</td><td><code>{t.comando}</code></td></tr>)}</tbody>
          </table></div>
          <p className="cm-vacio">El Centro de Control del ecosistema también arranca, detiene, compila y prueba SIGBO.</p>
        </section>
      </div>
    </div>
  );
}
