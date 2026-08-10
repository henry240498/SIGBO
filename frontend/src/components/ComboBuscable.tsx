'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { coincideBusqueda } from '@/lib/texto';

export interface OpcionCombo {
  value: string;
  label: string;
}

interface ComboBuscableProps {
  opciones: OpcionCombo[];
  value: string;
  onChange: (value: string) => void;
  placeholderBusqueda?: string;
  ningunaLabel?: string;
  maxWidth?: number;
  disabled?: boolean;
}

/**
 * Combo con busqueda/autocompletado: abrir -> escribir -> encontrar ->
 * seleccionar. Reutilizable en toda SIGBO para cualquier combo que pueda
 * crecer (personal, rangos, cargos, tipos, parametros, etc.) — evita listas
 * interminables donde el usuario tiene que desplazarse manualmente.
 *
 * `opciones` NO debe incluir la opcion "NINGUNA"; se agrega automaticamente
 * como primer resultado con `value: ''`.
 */
export function ComboBuscable({
  opciones,
  value,
  onChange,
  placeholderBusqueda = 'Buscar...',
  ningunaLabel = 'NINGUNA',
  maxWidth,
  disabled,
}: ComboBuscableProps) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const contenedorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const opcionActual = opciones.find((o) => o.value === value);
  const etiquetaActual = value ? opcionActual?.label ?? value : ningunaLabel;

  const opcionesFiltradas = useMemo(() => {
    const todas = [{ value: '', label: ningunaLabel }, ...opciones];
    if (!busqueda.trim()) return todas;
    return todas.filter((o) => o.value === '' || coincideBusqueda(o.label, busqueda));
  }, [opciones, busqueda, ningunaLabel]);

  useEffect(() => {
    if (!abierto) return;
    function alClicFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
        setBusqueda('');
      }
    }
    function alEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setAbierto(false);
        setBusqueda('');
      }
    }
    document.addEventListener('mousedown', alClicFuera);
    document.addEventListener('keydown', alEscape);
    return () => {
      document.removeEventListener('mousedown', alClicFuera);
      document.removeEventListener('keydown', alEscape);
    };
  }, [abierto]);

  function abrir() {
    if (disabled) return;
    setAbierto(true);
    setBusqueda('');
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function seleccionar(opcion: OpcionCombo) {
    onChange(opcion.value);
    setAbierto(false);
    setBusqueda('');
  }

  return (
    <div ref={contenedorRef} style={{ position: 'relative', maxWidth, width: maxWidth ? undefined : '100%' }}>
      <button
        type="button"
        className="input-field"
        onClick={abierto ? () => setAbierto(false) : abrir}
        disabled={disabled}
        style={{
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{etiquetaActual}</span>
        <span style={{ color: '#94a3b8', marginLeft: 6 }}>{abierto ? '▲' : '▼'}</span>
      </button>

      {abierto && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 20,
            marginTop: 4,
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}
        >
          <input
            ref={inputRef}
            className="input-field"
            style={{ border: 'none', borderBottom: '1px solid #334155', borderRadius: 0 }}
            placeholder={placeholderBusqueda}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {opcionesFiltradas.length === 0 && (
              <div style={{ padding: '10px 12px', fontSize: 13, color: '#94a3b8' }}>Sin resultados</div>
            )}
            {opcionesFiltradas.map((o) => (
              <div
                key={o.value || '(ninguna)'}
                onClick={() => seleccionar(o)}
                style={{
                  padding: '8px 12px',
                  fontSize: 13,
                  cursor: 'pointer',
                  background: o.value === value ? '#2563eb' : 'transparent',
                  color: o.value === value ? '#fff' : '#e2e8f0',
                }}
                onMouseEnter={(e) => {
                  if (o.value !== value) e.currentTarget.style.background = '#334155';
                }}
                onMouseLeave={(e) => {
                  if (o.value !== value) e.currentTarget.style.background = 'transparent';
                }}
              >
                {o.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
