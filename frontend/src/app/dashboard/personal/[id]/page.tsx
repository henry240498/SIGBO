'use client';

import { useEffect, useMemo, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, API_ORIGIN, obtenerSesion } from '@/lib/api';
import { Cargando } from '@/app/components/Cargando';
import { Aviso } from '@/app/components/Aviso';
import { seccionPedida, urlConSeccion } from '@/lib/seccion-url';
import { Bombero, Catalogo, cargarCatalogo } from './expediente';
import { TabResumen } from './secciones/TabResumen';
import { TabDatosPersonales } from './secciones/TabDatosPersonales';
import { TabInstitucional } from './secciones/TabInstitucional';
import { TabTipoBombero } from './secciones/TabTipoBombero';
import { TabRangoCargo } from './secciones/TabRangoCargo';
import { TabHistorial } from './secciones/TabHistorial';
import { TabEspecialidades } from './secciones/TabEspecialidades';
import { TabCondicion } from './secciones/TabCondicion';
import { TabFormacion } from './secciones/TabFormacion';
import { TabActividadProfesional } from './secciones/TabActividadProfesional';
import { TabIdiomas } from './secciones/TabIdiomas';
import { TabServicios } from './secciones/TabServicios';
import { TabEquipamiento } from './secciones/TabEquipamiento';
import { TabVehiculos } from './secciones/TabVehiculos';
import { TabSalud } from './secciones/TabSalud';
import { TabFirmaDigital } from './secciones/TabFirmaDigital';
import { TabDocumentos } from './secciones/TabDocumentos';
import { TabFoja } from './secciones/TabFoja';
import { TabTimeline } from './secciones/TabTimeline';
import { TabAuditoria } from './secciones/TabAuditoria';

export default function ExpedienteBomberoPage() {
  const confirmar = useConfirmacion();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [bombero, setBombero] = useState<Bombero | null>(null);
  const [tipos, setTipos] = useState<Catalogo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [seccion, setSeccion] = useState('resumen');

  // La seccion viaja en la URL. Sin esto, recargar el expediente o compartir el enlace
  // de una pestana volvia siempre a Resumen, y con 20 pestanas eso obliga a rehacer el
  // camino a mano. La resolucion vive en lib/seccion-url.ts, con pruebas propias.
  useEffect(() => {
    const pedida = seccionPedida(window.location.search, TABS.map((tab) => tab.id));
    if (pedida) setSeccion(pedida);
  }, []);

  // replaceState y no push: una entrada de historial por clic de pestana convierte el
  // boton Atras en algo inutilizable.
  function irASeccion(idSeccion: string) {
    setSeccion(idSeccion);
    window.history.replaceState(null, '', urlConSeccion(window.location.href, idSeccion));
  }

  const puedeEditar = !!obtenerSesion()?.usuario.permisos.includes('personal:editar');
  const puedeEliminarFisico = !!obtenerSesion()?.usuario.permisos.includes('personal:eliminar_fisico');

  async function cargarBombero() {
    const res = await apiFetch(`/personal/bomberos/${id}`);
    if (!res.ok) {
      setError('No se pudo cargar el expediente del bombero');
      return;
    }
    setBombero(await res.json());
  }

  useEffect(() => {
    cargarBombero();
    cargarCatalogo('/personal/tipos-bombero').then(setTipos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const tipoActual = useMemo(() => tipos.find((t) => t.id === bombero?.tipoBomberoId), [tipos, bombero]);

  async function eliminarFisico() {
    if (!bombero) return;
    if (!await confirmar({
      titulo: 'Eliminar expediente',
      mensaje: `ELIMINAR PERMANENTEMENTE a ${bombero.nombre} ${bombero.apellido}? Esta accion no se puede deshacer. Solo es posible si no tiene datos relacionados en el resto del sistema.`,
      confirmar: 'Eliminar permanentemente',
      peligro: true,
    })) return;
    const res = await apiFetch(`/personal/bomberos/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'No se pudo eliminar fisicamente al bombero');
      return;
    }
    router.push('/dashboard/personal');
  }

  if (error && !bombero) {
    return <p style={{ color: 'var(--danger)' }}>{error}</p>;
  }

  if (!bombero) {
    return <Cargando texto="Cargando expediente…" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {bombero.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${API_ORIGIN}${bombero.fotoUrl}`}
              alt="Foto"
              style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 8,
                background: 'var(--neutral-fill)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              {bombero.nombre[0]}
              {bombero.apellido[0]}
            </div>
          )}
          <div>
            <h2 style={{ fontSize: 18 }}>
              {bombero.nombre} {bombero.apellido}
            </h2>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <span className="badge">{bombero.numeroBombero}</span>
              <span className="badge" style={{ background: bombero.estado === 'ACTIVO' ? 'var(--ok-fill)' : 'var(--bad-fill)' }}>
                {bombero.estado}
              </span>
              {tipoActual && <span className="badge">{tipoActual.prefijo}</span>}
              <span className="badge" style={{ background: 'var(--neutral-fill)' }}>
                {bombero.rango}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-primary" style={{ background: '#475569' }} onClick={() => router.push('/dashboard/personal')}>
            Volver al listado
          </button>
          {puedeEliminarFisico && (
            <button type="button" className="btn-primary" style={{ background: '#7f1d1d' }} onClick={eliminarFisico}>
              Eliminar fisicamente
            </button>
          )}
        </div>
      </div>

      {error && <Aviso tipo="error" texto={error} />}

      <nav style={{ display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '1px solid var(--line)', paddingBottom: 0 }}>
        {TABS.map((tab) => (
          <button type="button"
            key={tab.id}
            onClick={() => irASeccion(tab.id)}
            style={{
              padding: '8px 12px',
              fontSize: 13,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: seccion === tab.id ? 'var(--ink)' : 'var(--muted)',
              fontWeight: seccion === tab.id ? 600 : 400,
              borderBottom: seccion === tab.id ? '2px solid #2563eb' : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div>
        {seccion === 'resumen' && <TabResumen bombero={bombero} tipo={tipoActual} />}
        {seccion === 'personales' && (
          <TabDatosPersonales bombero={bombero} puedeEditar={puedeEditar} onGuardado={cargarBombero} />
        )}
        {seccion === 'institucional' && (
          <TabInstitucional bombero={bombero} puedeEditar={puedeEditar} onGuardado={cargarBombero} />
        )}
        {seccion === 'tipo' && (
          <TabTipoBombero bombero={bombero} tipos={tipos} puedeEditar={puedeEditar} onGuardado={cargarBombero} />
        )}
        {seccion === 'rango-cargo' && <TabRangoCargo bombero={bombero} />}
        {seccion === 'historial' && <TabHistorial bomberoId={id} puedeEditar={puedeEditar} />}
        {seccion === 'especialidades' && <TabEspecialidades bomberoId={id} puedeEditar={puedeEditar} />}
        {seccion === 'condicion' && <TabCondicion bomberoId={id} puedeEditar={puedeEditar} onGuardado={cargarBombero} />}
        {seccion === 'formacion' && <TabFormacion bomberoId={id} />}
        {seccion === 'actividad' && <TabActividadProfesional bomberoId={id} puedeEditar={puedeEditar} />}
        {seccion === 'idiomas' && <TabIdiomas bomberoId={id} puedeEditar={puedeEditar} />}
        {seccion === 'servicios' && <TabServicios bomberoId={id} />}
        {seccion === 'equipamiento' && <TabEquipamiento bomberoId={id} puedeEditar={puedeEditar} />}
        {seccion === 'vehiculos' && <TabVehiculos bomberoId={id} puedeEditar={puedeEditar} />}
        {seccion === 'salud' && <TabSalud bombero={bombero} puedeEditar={puedeEditar} onGuardado={cargarBombero} />}
        {seccion === 'firma-digital' && <TabFirmaDigital bombero={bombero} onGuardado={cargarBombero} />}
        {seccion === 'documentos' && <TabDocumentos bomberoId={id} />}
        {seccion === 'foja' && <TabFoja bomberoId={id} puedeEditar={puedeEditar} />}
        {seccion === 'timeline' && <TabTimeline bomberoId={id} />}
        {seccion === 'auditoria' && <TabAuditoria bomberoId={id} />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Resumen                                                              */
/* ------------------------------------------------------------------ */



const TABS: Array<{ id: string; label: string }> = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'personales', label: 'Datos personales' },
  { id: 'institucional', label: 'Institucional' },
  { id: 'tipo', label: 'Tipo de bombero' },
  { id: 'rango-cargo', label: 'Rango y cargo' },
  { id: 'historial', label: 'Trayectoria' },
  { id: 'especialidades', label: 'Especialidades' },
  { id: 'condicion', label: 'Condición' },
  { id: 'formacion', label: 'Formación' },
  { id: 'actividad', label: 'Actividad profesional' },
  { id: 'idiomas', label: 'Idiomas' },
  { id: 'servicios', label: 'Servicios / Guardias' },
  { id: 'equipamiento', label: 'Equipamiento' },
  { id: 'vehiculos', label: 'Vehículos autorizados' },
  { id: 'salud', label: 'Salud' },
  { id: 'firma-digital', label: 'Firma digital' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'foja', label: 'Foja de servicio' },
  { id: 'timeline', label: 'Línea de tiempo' },
  { id: 'auditoria', label: 'Auditoría' },
];
