'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { Bombero, Catalogo, campoTexto } from '../expediente';

export function TabTipoBombero({
  bombero,
  tipos,
  puedeEditar,
  onGuardado,
}: {
  bombero: Bombero;
  tipos: Catalogo[];
  puedeEditar: boolean;
  onGuardado: () => void;
}) {
  const [tipoBomberoId, setTipoBomberoId] = useState(bombero.tipoBomberoId ?? '');
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [codigo, setCodigo] = useState(bombero.numeroBombero);
  const [errorCodigo, setErrorCodigo] = useState<string | null>(null);
  const [mensajeCodigo, setMensajeCodigo] = useState<string | null>(null);
  const [guardandoCodigo, setGuardandoCodigo] = useState(false);

  const tipoActual = tipos.find((t) => t.id === bombero.tipoBomberoId);

  async function guardar() {
    setGuardando(true);
    setError(null);
    setMensaje(null);
    try {
      const res = await apiFetch(`/personal/bomberos/${bombero.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ tipoBomberoId: tipoBomberoId || null }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo guardar');
      }
      setMensaje('Tipo de bombero actualizado');
      onGuardado();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function guardarCodigo() {
    setGuardandoCodigo(true);
    setErrorCodigo(null);
    setMensajeCodigo(null);
    try {
      const nuevoCodigo = codigo.trim();
      if (!nuevoCodigo) throw new Error('El codigo no puede quedar vacio');
      const res = await apiFetch(`/personal/bomberos/${bombero.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ numeroBombero: nuevoCodigo }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'No se pudo guardar');
      }
      setMensajeCodigo('Codigo bomberil actualizado');
      onGuardado();
    } catch (err: any) {
      setErrorCodigo(err.message);
    } finally {
      setGuardandoCodigo(false);
    }
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 500 }}>
      {campoTexto('Tipo de bombero actual', tipoActual ? `${tipoActual.prefijo} - ${tipoActual.nombre}` : 'Sin asignar')}

      {puedeEditar && (
        <>
          <div>
            <label htmlFor="nuevo-tipo-de-bombero" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Nuevo tipo de bombero</label>
            <select id="nuevo-tipo-de-bombero" className="input-field" value={tipoBomberoId} onChange={(e) => setTipoBomberoId(e.target.value)}>
              <option value="">Sin asignar</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.prefijo} - {t.nombre}
                </option>
              ))}
            </select>
          </div>
          {error && <Aviso tipo="error" texto={error} />}
          {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}
          <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }} disabled={guardando} onClick={guardar}>
            {guardando ? 'Guardando...' : 'Guardar tipo'}
          </button>
        </>
      )}

      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
        {campoTexto('Codigo bomberil actual', bombero.numeroBombero)}
        {puedeEditar && (
          <>
            <label htmlFor="nuevo-codigo-se-puede-tipear-libremente-" style={{ fontSize: 12, display: 'block', margin: '8px 0 4px' }}>
              Nuevo codigo (se puede tipear libremente, no depende del tipo seleccionado)
            </label>
            <input id="nuevo-codigo-se-puede-tipear-libremente-"
              className="input-field"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="BVCF-01"
            />
            {errorCodigo && <p style={{ color: 'var(--danger)', marginTop: 6 }}>{errorCodigo}</p>}
            {mensajeCodigo && <p style={{ color: 'var(--success)', fontSize: 13, marginTop: 6 }}>{mensajeCodigo}</p>}
            <button type="button"
              className="btn-primary"
              style={{ alignSelf: 'flex-start', marginTop: 8 }}
              disabled={guardandoCodigo || codigo.trim() === bombero.numeroBombero}
              onClick={guardarCodigo}
            >
              {guardandoCodigo ? 'Guardando...' : 'Guardar codigo'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Rango / Cargo                                                        */
/* ------------------------------------------------------------------ */
