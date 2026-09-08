'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

interface EntradaOptions {
  titulo: string;
  mensaje: string;
  etiqueta: string;
  confirmar?: string;
  cancelar?: string;
  peligro?: boolean;
  valorInicial?: string;
  placeholder?: string;
  requerida?: boolean;
  tipo?: 'text' | 'password';
}

type SolicitarEntrada = (options: EntradaOptions) => Promise<string | null>;

const Context = createContext<SolicitarEntrada | null>(null);

export function InputProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<EntradaOptions | null>(null);
  const [valor, setValor] = useState('');
  const [error, setError] = useState('');
  const resolver = useRef<((resultado: string | null) => void) | null>(null);
  const panel = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const anterior = useRef<HTMLElement | null>(null);

  const solicitar = useCallback<SolicitarEntrada>((siguiente) => new Promise((resolve) => {
    resolver.current = resolve;
    setValor(siguiente.valorInicial ?? '');
    setError('');
    setOptions(siguiente);
  }), []);
  const cerrar = useCallback((resultado: string | null) => {
    resolver.current?.(resultado);
    resolver.current = null;
    setOptions(null);
    setValor('');
    setError('');
  }, []);

  useEffect(() => {
    if (!options) return;
    anterior.current = document.activeElement as HTMLElement;
    input.current?.focus();
    const tecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        cerrar(null);
        return;
      }
      if (evento.key !== 'Tab' || !panel.current) return;
      const controles = Array.from(panel.current.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'));
      const primero = controles[0];
      const ultimo = controles.at(-1);
      if (!primero || !ultimo) return;
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('keydown', tecla);
      anterior.current?.focus();
    };
  }, [options, cerrar]);

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (options?.requerida && !valor.trim()) {
      setError('Este campo es obligatorio.');
      return;
    }
    cerrar(valor);
  }

  return (
    <Context.Provider value={solicitar}>
      {children}
      {options && (
        <div className="confirm-overlay" onMouseDown={(evento) => evento.target === evento.currentTarget && cerrar(null)}>
          <section ref={panel} tabIndex={-1} className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="entrada-title" aria-describedby="entrada-message">
            <h2 id="entrada-title">{options.titulo}</h2>
            <p id="entrada-message">{options.mensaje}</p>
            <form onSubmit={enviar}>
              <label htmlFor="entrada-confirmada">{options.etiqueta}</label>
              <input ref={input} id="entrada-confirmada" className="input-field" type={options.tipo ?? 'text'} value={valor} placeholder={options.placeholder} onChange={(evento) => { setValor(evento.target.value); setError(''); }} aria-invalid={error ? 'true' : undefined} aria-describedby={error ? 'entrada-error' : undefined} />
              {error && <p id="entrada-error" role="alert">{error}</p>}
              <div>
                <button type="button" className="service-secondary" onClick={() => cerrar(null)}>{options.cancelar || 'Cancelar'}</button>
                <button type="submit" className={options.peligro ? 'confirm-danger' : 'btn-primary'}>{options.confirmar || 'Confirmar'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </Context.Provider>
  );
}

export function useEntradaConfirmada() {
  const value = useContext(Context);
  if (!value) throw new Error('useEntradaConfirmada requiere InputProvider');
  return value;
}
