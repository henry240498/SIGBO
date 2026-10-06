'use client';

import dynamic from 'next/dynamic';
import { useEffect, useId, useState } from 'react';
import {
  Conteo,
  Estadistica,
  IndicadoresOperativos,
  MapaCalorDatos,
  cargarCalor,
  cargarIndicadores,
  formatoDuracion,
} from '@/lib/indicadores';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';

const MapaCalor = dynamic(() => import('@/components/MapaCalor'), {
  ssr: false,
  loading: () => <p style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando mapa…</p>,
});

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const haceDias = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
};

function Barras({ titulo, datos }: { titulo: string; datos: Conteo[] }) {
  const maximo = Math.max(1, ...datos.map((d) => d.cantidad));
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <strong style={{ fontSize: 14 }}>{titulo}</strong>
      {datos.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>Sin datos.</p>
      ) : (
        datos.map((d) => (
          <div key={d.clave} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 36px', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span>{d.clave}</span>
            <span aria-hidden="true" style={{ background: 'var(--neutral-fill)', borderRadius: 4, height: 10, display: 'block' }}>
              <span style={{ display: 'block', height: 10, borderRadius: 4, width: `${(d.cantidad / maximo) * 100}%`, background: 'var(--signal)' }} />
            </span>
            <span style={{ textAlign: 'right' }}>{d.cantidad}</span>
          </div>
        ))
      )}
    </div>
  );
}

function Tiempo({ titulo, ayuda, e }: { titulo: string; ayuda: string; e: Estadistica }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{titulo}</span>
      <strong style={{ fontSize: 22 }}>{formatoDuracion(e.mediana)}</strong>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>
        mediana · 9 de cada 10 en {formatoDuracion(e.p90)} · {e.n} dato{e.n === 1 ? '' : 's'}
      </span>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{ayuda}</span>
    </div>
  );
}

export default function IndicadoresPage() {
  const id = useId();
  const [desde, setDesde] = useState(haceDias(90));
  const [hasta, setHasta] = useState(iso(new Date()));
  const [celda, setCelda] = useState(500);
  const [datos, setDatos] = useState<IndicadoresOperativos | null>(null);
  const [calor, setCalor] = useState<MapaCalorDatos | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    setError(null);
    try {
      const [i, c] = await Promise.all([cargarIndicadores(desde, hasta), cargarCalor(desde, hasta, celda)]);
      setDatos(i);
      setCalor(c);
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 16 }}>Indicadores operativos</h2>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Calculados con los servicios y despachos registrados. Los servicios cancelados no cuentan.
        </p>
      </div>

      <form
        className="card"
        style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}
        onSubmit={(e) => {
          e.preventDefault();
          cargar();
        }}
      >
        <div>
          <label htmlFor={`${id}-d`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Desde</label>
          <input id={`${id}-d`} className="input-field" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} required />
        </div>
        <div>
          <label htmlFor={`${id}-h`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Hasta</label>
          <input id={`${id}-h`} className="input-field" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} required />
        </div>
        <div>
          <label htmlFor={`${id}-c`} style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tamaño de la zona del mapa</label>
          <select id={`${id}-c`} className="input-field" value={celda} onChange={(e) => setCelda(Number(e.target.value))}>
            {[250, 500, 1000, 2000].map((m) => <option key={m} value={m}>{m} m</option>)}
          </select>
        </div>
        <button type="submit" className="btn-primary">Actualizar</button>
      </form>

      {error && <Aviso tipo="error" texto={error} />}

      {datos === null ? (
        !error && <Cargando texto="Calculando indicadores…" />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Servicios del período</span>
              <strong style={{ fontSize: 22 }}>{datos.totalServicios}</strong>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{datos.sinDespacho} sin móvil despachado</span>
            </div>
            <Tiempo titulo="Del aviso a la salida" ayuda="Tiempo que tarda en salir el primer móvil" e={datos.tiempoDeSalida} />
            <Tiempo titulo="Del aviso a la llegada" ayuda="Tiempo de respuesta total" e={datos.tiempoDeRespuesta} />
            <Tiempo titulo="Viaje de cada móvil" ayuda="De la salida a la llegada al lugar" e={datos.tiempoDeViaje} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            <Barras titulo="Por tipo de servicio" datos={datos.porTipo} />
            <Barras titulo="Por gravedad" datos={datos.porGravedad} />
            <Barras titulo="Por franja horaria" datos={datos.porFranja} />
            <Barras titulo="Por día de la semana" datos={datos.porDiaSemana} />
          </div>

          {datos.porMovil.length > 0 && (
            <div className="card" style={{ overflowX: 'auto' }}>
              <strong style={{ fontSize: 14 }}>Por móvil</strong>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Móvil</th>
                    <th scope="col">Salidas con llegada</th>
                    <th scope="col">Viaje (mediana)</th>
                    <th scope="col">Viaje (9 de 10)</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.porMovil.map((m) => (
                    <tr key={m.movil}>
                      <td>{m.movil}</td>
                      <td>{m.salidas}</td>
                      <td>{formatoDuracion(m.viaje.mediana)}</td>
                      <td>{formatoDuracion(m.viaje.p90)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {calor && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }} aria-label="Mapa de calor">
          <strong style={{ fontSize: 14 }}>Dónde ocurren los servicios</strong>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
            {calor.serviciosConUbicacion} de {calor.serviciosEnElPeriodo} servicios tienen ubicación cargada. Cuanto más grande y oscuro el círculo, más servicios en esa zona.
          </p>
          <MapaCalor celdas={calor.celdas} celdaM={calor.celdaM} />
        </section>
      )}
    </div>
  );
}
