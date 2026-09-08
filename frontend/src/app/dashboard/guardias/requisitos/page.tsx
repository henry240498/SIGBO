'use client';

import { useEffect, useState } from 'react';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { obtenerSesion } from '@/lib/api';
import { Catalogo, TipoBombero, cargarCatalogo, cargarTiposBombero } from '@/lib/personal';
import { ROLES_GUARDIA_BASE, RequisitoRolGuardia, cargarRequisitosRol, crearRequisitoRol, eliminarRequisitoRol, toggleActivoRequisito } from '@/lib/guardias';
import { Aviso } from '@/app/components/Aviso';

export default function RequisitosRolPage() {
  const confirmar = useConfirmacion();
  const [requisitos, setRequisitos] = useState<RequisitoRolGuardia[] | null>(null);
  const [cargos, setCargos] = useState<Catalogo[]>([]);
  const [rangos, setRangos] = useState<Catalogo[]>([]);
  const [tipos, setTipos] = useState<TipoBombero[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [rol, setRol] = useState('OFICIAL_A_CARGO');
  const [rolLibre, setRolLibre] = useState('');
  const [cargoIdRequerido, setCargoIdRequerido] = useState('');
  const [rangoIdRequerido, setRangoIdRequerido] = useState('');
  const [tipoBomberoIdRequerido, setTipoBomberoIdRequerido] = useState('');

  const puedeGestionar = !!obtenerSesion()?.usuario.permisos.includes('guardias:requisitos');

  async function cargar() {
    try {
      setRequisitos(await cargarRequisitosRol());
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
    cargarCatalogo('/organizacion/cargos').then(setCargos).catch(() => undefined);
    cargarCatalogo('/organizacion/rangos').then(setRangos).catch(() => undefined);
    cargarTiposBombero().then(setTipos).catch(() => undefined);
  }, []);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    const rolFinal = rol === '__otro__' ? rolLibre.trim() : rol;
    if (!rolFinal) {
      setError('Indica el rol');
      return;
    }
    try {
      await crearRequisitoRol({
        rol: rolFinal,
        cargoIdRequerido: cargoIdRequerido || undefined,
        rangoIdRequerido: rangoIdRequerido || undefined,
        tipoBomberoIdRequerido: tipoBomberoIdRequerido || undefined,
      });
      setMensaje('Requisito creado');
      setRolLibre('');
      setCargoIdRequerido('');
      setRangoIdRequerido('');
      setTipoBomberoIdRequerido('');
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function toggle(r: RequisitoRolGuardia) {
    try {
      await toggleActivoRequisito(r.id, !r.activo);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function eliminar(id: string) {
    if (!await confirmar({ titulo: 'Confirmar acción', mensaje: 'Eliminar este requisito?', confirmar: 'Continuar', peligro: true })) return;
    try {
      await eliminarRequisitoRol(id);
      await cargar();
    } catch (err: any) {
      setError(err.message);
    }
  }

  const nombreCargo = (id: string | null) => cargos.find((c) => c.id === id)?.nombre ?? null;
  const nombreRango = (id: string | null) => rangos.find((r) => r.id === id)?.nombre ?? null;
  const nombreTipo = (id: string | null) => tipos.find((t) => t.id === id)?.nombre ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 16 }}>Requisitos de rol ({requisitos?.length ?? 0})</h2>
      <p style={{ fontSize: 13, color: 'var(--muted)' }}>
        Define quien puede desempenarse (o reemplazar a alguien) en un rol de guardia como Oficial a Cargo o Chofer.
        Un bombero califica si cumple TODAS las condiciones no vacias de al menos UNA fila configurada para ese rol.
        Si un rol no tiene ninguna fila configurada, no se restringe por esta via. El rol CHOFER ademas exige
        siempre tener una autorizacion de chofer registrada en Personal.
      </p>

      {error && <Aviso tipo="error" texto={error} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {puedeGestionar && (
        <form className="card" onSubmit={crear} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="rol" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Rol</label>
              <select id="rol" className="input-field" value={rol} onChange={(e) => setRol(e.target.value)}>
                {ROLES_GUARDIA_BASE.map((r) => <option key={r} value={r}>{r}</option>)}
                <option value="__otro__">Otro (escribir)</option>
              </select>
              {rol === '__otro__' && (
                <input className="input-field" style={{ marginTop: 6 }} value={rolLibre} onChange={(e) => setRolLibre(e.target.value)} placeholder="Nombre del rol" />
              )}
            </div>
            <div>
              <label htmlFor="cargo-requerido-opcional" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Cargo requerido (opcional)</label>
              <select id="cargo-requerido-opcional" className="input-field" value={cargoIdRequerido} onChange={(e) => setCargoIdRequerido(e.target.value)}>
                <option value="">-- ninguno --</option>
                {cargos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="rango-requerido-opcional" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Rango requerido (opcional)</label>
              <select id="rango-requerido-opcional" className="input-field" value={rangoIdRequerido} onChange={(e) => setRangoIdRequerido(e.target.value)}>
                <option value="">-- ninguno --</option>
                {rangos.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="tipo-de-bombero-requerido-opcional" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Tipo de bombero requerido (opcional)</label>
              <select id="tipo-de-bombero-requerido-opcional" className="input-field" value={tipoBomberoIdRequerido} onChange={(e) => setTipoBomberoIdRequerido(e.target.value)}>
                <option value="">-- ninguno --</option>
                {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Agregar requisito</button>
        </form>
      )}

      {requisitos && requisitos.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin requisitos configurados: por ahora ningún rol esta restringido por esta via.</p>}
      {requisitos && requisitos.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th scope="col" style={{ padding: '6px 4px' }}>Rol</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Cargo</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Rango</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Tipo de bombero</th>
              <th scope="col" style={{ padding: '6px 4px' }}>Estado</th>
              {puedeGestionar && <th scope="col" style={{ padding: '6px 4px' }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {requisitos.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={{ padding: '6px 4px' }}><span className="badge">{r.rol}</span></td>
                <td style={{ padding: '6px 4px' }}>{nombreCargo(r.cargoIdRequerido) ?? '—'}</td>
                <td style={{ padding: '6px 4px' }}>{nombreRango(r.rangoIdRequerido) ?? '—'}</td>
                <td style={{ padding: '6px 4px' }}>{nombreTipo(r.tipoBomberoIdRequerido) ?? '—'}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span className="badge" style={{ background: r.activo ? 'var(--ok-fill)' : 'var(--bad-fill)' }}>{r.activo ? 'ACTIVO' : 'INACTIVO'}</span>
                </td>
                {puedeGestionar && (
                  <td style={{ padding: '6px 4px', display: 'flex', gap: 6 }}>
                    <button type="button" className="btn-primary" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => toggle(r)}>
                      {r.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button type="button"
                      style={{ padding: '4px 8px', fontSize: 12, background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: 6 }}
                      onClick={() => eliminar(r.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
