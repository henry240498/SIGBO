'use client';

import { useState } from 'react';
import { API_ORIGIN, obtenerSesion } from '@/lib/api';
import { subirFirmaDigital, eliminarFirmaDigital, cambiarAutorizacionFirma } from '@/lib/personal';
import { Aviso } from '@/app/components/Aviso';
import { Bombero } from '../expediente';

export function TabFirmaDigital({ bombero, onGuardado }: { bombero: Bombero; onGuardado: () => void }) {
  const puedeGestionar = !!obtenerSesion()?.usuario.permisos.includes('personal:gestionar_firma_digital');
  const [subiendo, setSubiendo] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [cambiandoAutorizacion, setCambiandoAutorizacion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function subirArchivo(archivo: File) {
    setError(null);
    setMensaje(null);
    setSubiendo(true);
    try {
      await subirFirmaDigital(bombero.id, archivo);
      setMensaje('Firma digital actualizada');
      onGuardado();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubiendo(false);
    }
  }

  async function eliminar() {
    setError(null);
    setMensaje(null);
    setEliminando(true);
    try {
      await eliminarFirmaDigital(bombero.id);
      setMensaje('Firma digital eliminada');
      onGuardado();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEliminando(false);
    }
  }

  async function cambiarAutorizacion(autorizado: boolean) {
    setError(null);
    setMensaje(null);
    setCambiandoAutorizacion(true);
    try {
      await cambiarAutorizacionFirma(bombero.id, autorizado);
      setMensaje(autorizado ? 'Autorizado para uso de firma digital' : 'Autorizacion de firma digital revocada');
      onGuardado();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCambiandoAutorizacion(false);
    }
  }

  if (!puedeGestionar) {
    return (
      <p style={{ color: 'var(--muted)', fontSize: 13 }}>
        Solo un usuario con el permiso <code>personal:gestionar_firma_digital</code> puede cargar, reemplazar,
        eliminar o autorizar el uso de la firma digital de este bombero.
      </p>
    );
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
      <div>
        <h3 style={{ fontSize: 14, marginBottom: 4 }}>Firma digital registrada</h3>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>
          La imagen de la firma es independiente de la autorizacion de uso. Cargar una firma no la habilita
          automaticamente para insertarse en documentos.
        </p>
      </div>

      {error && <Aviso tipo="error" texto={error} fontSize={13} />}
      {mensaje && <Aviso tipo="exito" texto={mensaje} fontSize={13} />}

      {bombero.firmaDigitalUrl ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <img
            src={`${API_ORIGIN}/api/v1/personal/bomberos/${bombero.id}/firma-digital`}
            alt="Firma digital"
            style={{ maxWidth: 260, maxHeight: 120, background: '#fff', borderRadius: 6, padding: 8 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <label className="btn-primary" style={{ background: '#475569', cursor: 'pointer' }}>
              {subiendo ? 'Subiendo...' : 'Reemplazar'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                style={{ display: 'none' }}
                disabled={subiendo}
                onChange={(e) => e.target.files?.[0] && subirArchivo(e.target.files[0])}
              />
            </label>
            <button type="button" className="btn-primary" style={{ background: '#7f1d1d' }} onClick={eliminar} disabled={eliminando}>
              {eliminando ? 'Eliminando...' : 'Eliminar firma'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <label className="btn-primary" style={{ display: 'inline-block', cursor: 'pointer' }}>
            {subiendo ? 'Subiendo...' : 'Cargar firma digital'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              style={{ display: 'none' }}
              disabled={subiendo}
              onChange={(e) => e.target.files?.[0] && subirArchivo(e.target.files[0])}
            />
          </label>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Formatos: png, jpg, webp o gif (no svg).</p>
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={bombero.autorizadoFirmaDigital}
            disabled={cambiandoAutorizacion}
            onChange={(e) => cambiarAutorizacion(e.target.checked)}
          />
          ¿Autorizado para uso de firma digital?
        </label>
        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
          Si esta activo Y hay una firma cargada, SIGBO la insertara automaticamente en los documentos que lo
          requieran. Si esta activo pero no hay firma cargada, el documento se genera igual con una advertencia y el
          espacio en blanco para firmar a mano.
        </p>
        {bombero.autorizadoFirmaDigital && !bombero.firmaDigitalUrl && (
          <p style={{ fontSize: 12, color: 'var(--warning)', marginTop: 8 }}>
            ⚠ Autorizado para uso de firma digital, pero todavia no tiene una firma cargada.
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Seguros (relacion 1:N)                                               */
/* ------------------------------------------------------------------ */
