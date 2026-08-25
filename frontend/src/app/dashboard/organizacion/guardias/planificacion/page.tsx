'use client';

import { useEffect, useMemo, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { Guardia, GrupoGuardia, cargarGruposGuardia, cargarGuardias, planificarGuardias } from '@/lib/guardias';

type Celda = { guardiaId?: string; grupoGuardiaId: string; horaInicio: string; horaFin: string; turno: string };
const hoy = new Date();
const periodoInicial = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
const colorGrupo = (id: string) => {
  let valor = 0;
  for (const caracter of id) valor = (valor * 31 + caracter.charCodeAt(0)) >>> 0;
  return `hsl(${valor % 360} 62% 42%)`;
};
const diasDelPeriodo = (periodo: string) => {
  const [anio, mes] = periodo.split('-').map(Number);
  const total = new Date(anio, mes, 0).getDate();
  return Array.from({ length: total }, (_, indice) => `${periodo}-${String(indice + 1).padStart(2, '0')}`);
};
const etiquetaFecha = (fecha: string) => new Intl.DateTimeFormat('es-PY', { weekday: 'short', day: '2-digit', month: 'short' }).format(new Date(`${fecha}T12:00:00`));

export default function PlanificacionOrdenGuardiaPage() {
  const confirmar = useConfirmacion();
  const [periodo, setPeriodo] = useState(periodoInicial);
  const [grupos, setGrupos] = useState<GrupoGuardia[]>([]);
  const [celdas, setCeldas] = useState<Record<string, Celda>>({});
  const [origen, setOrigen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const dias = useMemo(() => diasDelPeriodo(periodo), [periodo]);

  async function cargar() {
    setError(null); setMensaje(null);
    const [gruposActivos, guardias] = await Promise.all([cargarGruposGuardia('ACTIVO'), cargarGuardias(dias[0], dias[dias.length - 1])]);
    setGrupos(gruposActivos);
    const siguientes: Record<string, Celda> = {};
    for (const guardia of guardias) {
      // La grilla representa la primera guardia de cada fecha. Los turnos
      // adicionales se conservan y se administran desde el detalle operativo.
      if (!siguientes[guardia.fecha]) siguientes[guardia.fecha] = {
        guardiaId: guardia.id, grupoGuardiaId: guardia.grupoGuardiaId ?? '', horaInicio: guardia.horaInicio.slice(0, 5), horaFin: guardia.horaFin.slice(0, 5), turno: guardia.turno,
      };
    }
    for (const fecha of dias) siguientes[fecha] ??= { grupoGuardiaId: '', horaInicio: '20:00', horaFin: '06:00', turno: 'NOCTURNO' };
    setCeldas(siguientes);
  }

  useEffect(() => { cargar().catch((err: Error) => setError(err.message)); }, [periodo]);

  function cambiar(fecha: string, cambio: Partial<Celda>) {
    setCeldas((actual) => ({ ...actual, [fecha]: { ...actual[fecha], ...cambio } }));
  }

  function copiarEnResto(fecha: string, incluirTodos: boolean) {
    const fuente = celdas[fecha];
    if (!fuente?.grupoGuardiaId) { setError('Elegí primero un grupo de guardia para copiar su distribución.'); return; }
    const indice = dias.indexOf(fecha);
    setCeldas((actual) => {
      const siguiente = { ...actual };
      for (const destino of dias) {
        if (destino === fecha || (!incluirTodos && dias.indexOf(destino) <= indice)) continue;
        siguiente[destino] = { ...siguiente[destino], grupoGuardiaId: fuente.grupoGuardiaId, horaInicio: fuente.horaInicio, horaFin: fuente.horaFin, turno: fuente.turno };
      }
      return siguiente;
    });
    setMensaje(incluirTodos ? 'Distribución copiada en todos los días del período.' : 'Distribución copiada desde esta fecha hasta el final del período.');
  }

  async function guardar() {
    const incompletas = dias.filter((fecha) => !celdas[fecha]?.grupoGuardiaId);
    if (incompletas.length) { setError(`Faltan ${incompletas.length} día(s) sin grupo de guardia.`); return; }
    if (!await confirmar({ titulo: 'Guardar planificación', mensaje: 'Se actualizarán sólo guardias en estado planificado; la operación quedará auditada.', confirmar: 'Guardar' })) return;
    setGuardando(true); setError(null);
    try {
      await planificarGuardias(dias.map((fecha) => ({ fecha, ...celdas[fecha] })));
      setMensaje('Planificación guardada. La Orden de Servicio todavía debe revisarse, aprobarse y publicarse por la autoridad competente.');
      await cargar();
    } catch (err: any) { setError(err.message); } finally { setGuardando(false); }
  }

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 12, flexWrap: 'wrap' }}>
      <div><p style={{ color: '#60a5fa', fontSize: 12, marginBottom: 4 }}>Organización institucional</p><h2 style={{ fontSize: 18 }}>Planificación de Orden de Guardia</h2><p style={{ color: '#94a3b8', fontSize: 13, marginTop: 5 }}>Asigná un grupo y su horario por día. El color identifica la composición reutilizable del grupo.</p></div>
      <label style={{ fontSize: 13 }}>Período<input className="input-field" type="month" value={periodo} onChange={(e) => setPeriodo(e.target.value)} style={{ marginTop: 4 }} /></label>
    </div>
    <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <span style={{ fontSize: 13, color: '#94a3b8' }}>Atajos:</span>
      <button type="button" className="btn-primary" style={{ background: '#475569' }} disabled={!origen} onClick={() => origen && copiarEnResto(origen, true)}>Pegar en todo el período</button>
      <span style={{ fontSize: 12, color: '#94a3b8' }}>{origen ? `Origen: ${etiquetaFecha(origen)}` : 'Usá “Copiar” en una fecha para seleccionar el origen.'}</span>
    </div>
    {error && <p style={{ color: '#f87171' }}>{error}</p>}{mensaje && <p style={{ color: '#4ade80', fontSize: 13 }}>{mensaje}</p>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(245px, 1fr))', gap: 10 }}>
      {dias.map((fecha) => {
        const celda = celdas[fecha] ?? { grupoGuardiaId: '', horaInicio: '20:00', horaFin: '06:00', turno: 'NOCTURNO' };
        const color = celda.grupoGuardiaId ? colorGrupo(celda.grupoGuardiaId) : '#475569';
        return <article key={fecha} className="card" style={{ borderLeft: `5px solid ${color}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <strong style={{ textTransform: 'capitalize' }}>{etiquetaFecha(fecha)}</strong>
          <select className="input-field" value={celda.grupoGuardiaId} onChange={(e) => cambiar(fecha, { grupoGuardiaId: e.target.value })} aria-label={`Grupo de guardia del ${fecha}`}>
            <option value="">Seleccionar grupo…</option>{grupos.map((grupo) => <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>)}
          </select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}><input className="input-field" type="time" aria-label={`Inicio ${fecha}`} value={celda.horaInicio} onChange={(e) => cambiar(fecha, { horaInicio: e.target.value })} /><input className="input-field" type="time" aria-label={`Fin ${fecha}`} value={celda.horaFin} onChange={(e) => cambiar(fecha, { horaFin: e.target.value })} /></div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><button type="button" className="btn-primary" style={{ padding: '5px 8px', fontSize: 12, background: '#475569' }} onClick={() => { setOrigen(fecha); setMensaje(`Distribución de ${etiquetaFecha(fecha)} lista para pegar.`); }}>Copiar</button><button type="button" className="btn-primary" style={{ padding: '5px 8px', fontSize: 12, background: '#475569' }} onClick={() => copiarEnResto(fecha, false)}>Completar resto</button></div>
        </article>;
      })}
    </div>
    <button type="button" className="btn-primary" style={{ alignSelf: 'flex-end' }} disabled={guardando || !grupos.length} onClick={guardar}>{guardando ? 'Guardando…' : 'Guardar planificación'}</button>
  </div>;
}
