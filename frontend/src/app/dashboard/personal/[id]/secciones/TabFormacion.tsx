'use client';

import { useEffect, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import Link from 'next/link';
import { apiFetch, API_ORIGIN } from '@/lib/api';
import {
  Certificacion,
  TipoCertificacion,
  cargarCertificacionesDeBombero,
  crearCertificacion,
  eliminarCertificacion,
} from '@/lib/academia';
import { Aviso } from '@/app/components/Aviso';

export function TabFormacion({ bomberoId }: { bomberoId: string }) {
  const confirmar = useConfirmacion();
  const [actividades, setActividades] = useState<FormacionAcademica[] | null>(null);
  const [certificaciones, setCertificaciones] = useState<Certificacion[] | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(CERT_VACIO);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    try {
      const [resAct, certs] = await Promise.all([
        apiFetch(`/personal/bomberos/${bomberoId}/formacion-academia`),
        cargarCertificacionesDeBombero(bomberoId),
      ]);
      setActividades(resAct.ok ? await resAct.json() : []);
      setCertificaciones(certs);
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomberoId]);

  async function agregarCertificacion(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await crearCertificacion(
        {
          bomberoId,
          tipo: form.tipo,
          nombre: form.nombre,
          institucion: form.institucion || undefined,
          fechaObtencion: form.fechaObtencion,
          fechaVencimiento: form.fechaVencimiento || undefined,
          numeroCertificado: form.numeroCertificado || undefined,
          duracionHoras: form.duracionHoras ? Number(form.duracionHoras) : undefined,
          instructor: form.instructor || undefined,
        },
        archivo ?? undefined,
      );
      setForm(CERT_VACIO);
      setArchivo(null);
      setMostrarForm(false);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function quitarCertificacion(id: string) {
    if (!await confirmar({ titulo: 'Eliminar certificación', mensaje: '¿Eliminar esta certificación?', confirmar: 'Eliminar', peligro: true })) return;
    setError(null);
    try {
      await eliminarCertificacion(id);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 10 }}>Actividades académicas ({actividades?.length ?? 0})</h3>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
          Inscripciones a cursos, capacitaciones y otras actividades del módulo Academia.
        </p>
        {actividades && actividades.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin actividades académicas registradas.</p>}
        {actividades && actividades.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                <th scope="col" style={{ padding: '6px 4px' }}>Actividad</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Período</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {actividades.map((a) => (
                <tr key={a.inscripcionId} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '6px 4px' }}>
                    <Link href={`/dashboard/academia/${a.actividadId}`} style={{ color: 'var(--signal)' }}>
                      {a.nombreActividad ?? '(actividad eliminada)'}
                    </Link>
                  </td>
                  <td style={{ padding: '6px 4px', color: 'var(--muted)' }}>
                    {a.fechaInicio} - {a.fechaFin}
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge">{a.estado}</span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>{a.resultadoFinal ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {error && <Aviso tipo="error" texto={error} />}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ fontSize: 14 }}>Certificaciones ({certificaciones?.length ?? 0})</h3>
          <button type="button" className="btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? 'Cancelar' : '+ Cargar certificado'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
          SIGBO no certifica automáticamente por participar en una actividad: el bombero (o quien tenga el permiso
          correspondiente) es responsable de registrar y adjuntar su certificado.
        </p>

        {mostrarForm && (
          <form onSubmit={agregarCertificacion} style={{ display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '1px solid var(--line)', paddingBottom: 14, marginBottom: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
              <div>
                <label htmlFor="tipo-2" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo</label>
                <select id="tipo-2" className="input-field" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoCertificacion })}>
                  {TIPOS_CERTIFICACION.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="nombre" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre</label>
                <input id="nombre" className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div>
                <label htmlFor="institucion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Institución</label>
                <input id="institucion" className="input-field" value={form.institucion} onChange={(e) => setForm({ ...form, institucion: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
              <div>
                <label htmlFor="fecha-obtencion" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Fecha obtención</label>
                <input id="fecha-obtencion" className="input-field" type="date" value={form.fechaObtencion} onChange={(e) => setForm({ ...form, fechaObtencion: e.target.value })} required />
              </div>
              <div>
                <label htmlFor="vencimiento" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Vencimiento</label>
                <input id="vencimiento" className="input-field" type="date" value={form.fechaVencimiento} onChange={(e) => setForm({ ...form, fechaVencimiento: e.target.value })} />
              </div>
              <div>
                <label htmlFor="n-certificado" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>N° certificado</label>
                <input id="n-certificado" className="input-field" value={form.numeroCertificado} onChange={(e) => setForm({ ...form, numeroCertificado: e.target.value })} />
              </div>
              <div>
                <label htmlFor="carga-horaria" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Carga horaria</label>
                <input id="carga-horaria" className="input-field" type="number" value={form.duracionHoras} onChange={(e) => setForm({ ...form, duracionHoras: e.target.value })} />
              </div>
            </div>
            <div>
              <label htmlFor="archivo-del-certificado-imagen-o-pdf" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Archivo del certificado (imagen o PDF)</label>
              <input id="archivo-del-certificado-imagen-o-pdf"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              />
            </div>
            <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar certificación'}
            </button>
          </form>
        )}

        {certificaciones && certificaciones.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin certificaciones registradas.</p>}
        {certificaciones && certificaciones.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                <th scope="col" style={{ padding: '6px 4px' }}>Nombre</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Tipo</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Institución</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Obtención</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Archivo</th>
                <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {certificaciones.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                  <td style={{ padding: '6px 4px' }}>{c.nombre}</td>
                  <td style={{ padding: '6px 4px' }}>{c.tipo}</td>
                  <td style={{ padding: '6px 4px', color: 'var(--muted)' }}>{c.institucion ?? '-'}</td>
                  <td style={{ padding: '6px 4px', color: 'var(--muted)' }}>{c.fechaObtencion}</td>
                  <td style={{ padding: '6px 4px' }}>
                    <span className="badge" style={{ background: c.estado === 'VENCIDO' ? 'var(--bad-fill)' : undefined }}>
                      {c.estado}
                    </span>
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    {c.archivoUrl ? (
                      <a href={`${API_ORIGIN}${c.archivoUrl}`} target="_blank" rel="noreferrer" style={{ color: 'var(--signal)' }}>
                        Ver
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={{ padding: '6px 4px' }}>
                    <button type="button"
                      className="btn-primary"
                      style={{ padding: '4px 8px', fontSize: 11, background: '#7f1d1d' }}
                      onClick={() => quitarCertificacion(c.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Actividad profesional                                                */
/* ------------------------------------------------------------------ */



interface FormacionAcademica {
  inscripcionId: string;
  actividadId: string;
  nombreActividad: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  estado: string;
  resultadoFinal: string | null;
}



const TIPOS_CERTIFICACION: TipoCertificacion[] = ['BASICO', 'INTERMEDIO', 'AVANZADO', 'ESPECIALIDAD', 'CURSO', 'SEMINARIO', 'TALLER', 'ENTRENAMIENTO'];



const CERT_VACIO = {
  tipo: 'CURSO' as TipoCertificacion,
  nombre: '',
  institucion: '',
  fechaObtencion: '',
  fechaVencimiento: '',
  numeroCertificado: '',
  duracionHoras: '',
  instructor: '',
};
