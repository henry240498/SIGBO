'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch, obtenerSesion } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import { usePermisosPantalla, usePuede, useRutasVisibles } from '@/app/components/PermisosPantallaProvider';
import { MarcaActualizacion, useActualizacionPeriodica } from '@/app/components/useActualizacionPeriodica';
import {
  PanelAccesos, PanelAlertas, PanelConvocatorias, PanelEmergencias, PanelGuardia, PanelMiActividad, PanelMoviles, PanelPendientes, PanelPersonal, PanelSistema,
} from './paneles';
import { PanelCentroMando } from './tipos';

const INTERVALO_MS = 10_000;

/**
 * Centro de mando (spec 2026-10-09 §5): lo que pasa ahora y lo que le toca a cada uno.
 * El backend decide que secciones vienen (estado del bombero, permiso de cada seccion y
 * reglas por pantalla); aca solo se dibujan las que llegaron.
 */
export default function CentroMandoPage() {
  const { matriz } = usePermisosPantalla();
  const puede = usePuede();
  const [permisos, setPermisos] = useState<string[]>([]);
  const [panel, setPanel] = useState<PanelCentroMando | null>(null);

  useEffect(() => { setPermisos(obtenerSesion()?.usuario.permisos ?? []); }, []);

  const cargar = useCallback(async () => {
    const res = await apiFetch('/centro-mando');
    if (!res.ok) {
      const cuerpo = await res.json().catch(() => ({}));
      throw new Error(cuerpo.message ?? 'No se pudo cargar el Centro de mando.');
    }
    setPanel(await res.json());
  }, []);
  const actualizacion = useActualizacionPeriodica(cargar, INTERVALO_MS);
  const visibles = useRutasVisibles();

  if (!panel) {
    return actualizacion.error ? <Aviso tipo="error" texto={actualizacion.error} /> : <Cargando texto="Cargando el Centro de mando…" filas={4} />;
  }
  if (panel.acceso === 'SIN_ACCESO') {
    return <section className="card" role="status" style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>Centro de mando</h2>
      <p style={{ color: 'var(--muted)' }}>{panel.motivo}</p>
    </section>;
  }

  const s = panel.secciones ?? {};
  const nada = Object.keys(s).length === 0;
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="cm-cabecera">
        <p>Lo que está pasando ahora y lo que te toca, según tu rol. Se actualiza solo.</p>
        <MarcaActualizacion {...actualizacion} />
      </div>
      {actualizacion.error && <Aviso tipo="error" texto={`No se pudo actualizar: ${actualizacion.error}. Se muestran los últimos datos.`} />}
      {nada && <p className="cm-vacio">Tu rol no tiene secciones del Centro de mando habilitadas. Si necesitás alguna, pedíselo a quien administra la seguridad.</p>}
      <div className="cm-grid">
        {s.emergencias && <PanelEmergencias seccion={s.emergencias} visibles={visibles} />}
        {s.alertas && <PanelAlertas seccion={s.alertas} puedeAtender={permisos.includes('servicios:editar') && puede('editar')} alCambiar={actualizacion.refrescar} />}
        {s.pendientes && <PanelPendientes seccion={s.pendientes} visibles={visibles} />}
        {s.moviles && <PanelMoviles seccion={s.moviles} visibles={visibles} />}
        {s.personal && <PanelPersonal seccion={s.personal} />}
        {s.guardia && <PanelGuardia seccion={s.guardia} visibles={visibles} />}
        {s.convocatorias && <PanelConvocatorias seccion={s.convocatorias} visibles={visibles} />}
        {s.mi_actividad && <PanelMiActividad seccion={s.mi_actividad} />}
        {s.sistema && <PanelSistema seccion={s.sistema} visibles={visibles} />}
        {s.accesos && <PanelAccesos permisos={permisos} matriz={matriz} />}
      </div>
    </div>
  );
}
