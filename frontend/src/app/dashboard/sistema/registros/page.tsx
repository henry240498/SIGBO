'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { useRutasVisibles } from '@/app/components/PermisosPantallaProvider';
import { MarcaActualizacion, useActualizacionPeriodica } from '@/app/components/useActualizacionPeriodica';
import { fechaLegible, Registro } from '../tipos';

const ARCHIVOS = [
  { clave: 'backend-out', nombre: 'Servidor: salida' },
  { clave: 'backend-err', nombre: 'Servidor: errores' },
  { clave: 'arranque-automatico', nombre: 'Arranque automático' },
];
const AUDITORIAS = [
  { ruta: '/dashboard/seguridad/auditoria', nombre: 'Auditoría de seguridad' },
  { ruta: '/dashboard/seguridad/inteligencia-artificial/auditoria', nombre: 'Auditoría de IA' },
  { ruta: '/dashboard/documentos/auditoria', nombre: 'Auditoría de documentos' },
];

export default function SistemaRegistrosPage() {
  const visibles = useRutasVisibles();
  const [archivo, setArchivo] = useState('backend-err');
  const [lineas, setLineas] = useState(200);
  const [filtro, setFiltro] = useState('');
  const [nivel, setNivel] = useState<'todos' | 'ERROR' | 'WARN'>('todos');
  const [seguir, setSeguir] = useState(false);
  const [registro, setRegistro] = useState<Registro | null>(null);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    const res = await apiFetch(`/sistema/registros?archivo=${encodeURIComponent(archivo)}&lineas=${lineas}`);
    const c = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(c.message ?? 'No se pudo leer el registro.');
    setRegistro(c);
  }, [archivo, lineas]);
  const actualizacion = useActualizacionPeriodica(cargar, 5_000, seguir);

  // Sin "seguir en vivo", se lee una vez por cada cambio de archivo o de cantidad.
  useEffect(() => {
    if (seguir) return;
    setError('');
    cargar().catch((e: Error) => setError(e.message));
  }, [cargar, seguir]);

  const visiblesLineas = useMemo(() => (registro?.lineas ?? []).filter((l) =>
    (nivel === 'todos' || l.nivel === nivel) && (!filtro.trim() || l.texto.toLowerCase().includes(filtro.trim().toLowerCase()))), [registro, nivel, filtro]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="cm-cabecera">
        <p>Últimas líneas de los registros del servidor. Las contraseñas y los tokens se ocultan antes de mostrarse.</p>
        {seguir && <MarcaActualizacion {...actualizacion} />}
      </div>
      {(error || (seguir && actualizacion.error)) && <Aviso tipo="error" texto={error || actualizacion.error || ''} />}

      <section className="cm-panel" aria-labelledby="r-filtros">
        <h2 id="r-filtros" className="sr-only">Filtros</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div><label htmlFor="r-archivo">Registro</label>
            <select id="r-archivo" className="input-field" value={archivo} onChange={(e) => setArchivo(e.target.value)}>{ARCHIVOS.map((a) => <option key={a.clave} value={a.clave}>{a.nombre}</option>)}</select></div>
          <div><label htmlFor="r-lineas">Líneas</label>
            <select id="r-lineas" className="input-field" value={lineas} onChange={(e) => setLineas(Number(e.target.value))}>{[100, 200, 500].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
          <div><label htmlFor="r-nivel">Nivel</label>
            <select id="r-nivel" className="input-field" value={nivel} onChange={(e) => setNivel(e.target.value as typeof nivel)}>
              <option value="todos">Todos</option><option value="ERROR">Solo errores</option><option value="WARN">Solo avisos</option>
            </select></div>
          <div><label htmlFor="r-filtro">Contiene</label>
            <input id="r-filtro" className="input-field" value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Texto a buscar" /></div>
          <label htmlFor="r-seguir" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <input id="r-seguir" type="checkbox" checked={seguir} onChange={(e) => setSeguir(e.target.checked)} />Seguir en vivo
          </label>
          {!seguir && <button type="button" className="service-secondary" onClick={() => { setError(''); cargar().catch((e: Error) => setError(e.message)); }}>Actualizar</button>}
        </div>
      </section>

      {registro && !registro.disponible && <p className="cm-vacio">No disponible: {registro.motivo}</p>}
      {registro?.disponible && <section className="cm-panel" aria-labelledby="r-visor">
        <h2 id="r-visor"><span>{registro.archivo}</span><span className="cm-vacio">modificado {fechaLegible(registro.actualizadoEn)} · {visiblesLineas.length} línea(s)</span></h2>
        {visiblesLineas.length === 0 ? <p className="cm-vacio">Ninguna línea coincide.</p>
          : <div className="registro-visor" role="log" aria-live="off">{visiblesLineas.map((l, i) => <div key={i} className={`registro-linea ${l.nivel === 'ERROR' ? 'error' : l.nivel === 'WARN' ? 'warn' : ''}`}>{l.texto}</div>)}</div>}
      </section>}

      {AUDITORIAS.some((a) => visibles.has(a.ruta)) && <section className="cm-panel" aria-labelledby="r-auditorias">
        <h2 id="r-auditorias">Auditorías</h2>
        <div className="cm-acciones">{AUDITORIAS.filter((a) => visibles.has(a.ruta)).map((a) => <Link key={a.ruta} href={a.ruta} className="cm-acceso">{a.nombre}</Link>)}</div>
      </section>}
    </div>
  );
}
