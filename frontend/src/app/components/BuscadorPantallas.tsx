'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { buscarPantallas, ResultadoBusqueda } from '@/lib/navegacion';

/**
 * Buscador de pantallas. Con 15 modulos y ~97 pantallas, el menu lateral solo llega al
 * modulo: para abrir "Inventarios fisicos" habia que entrar a Deposito y encontrar la
 * pestana. Aca se escribe el nombre y se entra.
 *
 * Se abre con Ctrl+K o con el boton de la barra superior -- el boton existe porque un
 * atajo que nadie conoce no sirve de nada.
 */
export function BuscadorPantallas({ permisos, abierto, onCerrar }: { permisos: string[]; abierto: boolean; onCerrar: () => void }) {
  const router = useRouter();
  const [consulta, setConsulta] = useState('');
  const [indice, setIndice] = useState(0);
  const entradaRef = useRef<HTMLInputElement>(null);
  const listaRef = useRef<HTMLDivElement>(null);
  const focoPrevio = useRef<HTMLElement | null>(null);

  const resultados = useMemo(() => buscarPantallas(consulta, permisos), [consulta, permisos]);

  useEffect(() => {
    if (!abierto) return;
    focoPrevio.current = document.activeElement as HTMLElement;
    setConsulta('');
    setIndice(0);
    entradaRef.current?.focus();
    return () => focoPrevio.current?.focus();
  }, [abierto]);

  useEffect(() => { setIndice(0); }, [consulta]);

  // Mantener a la vista la opcion resaltada al moverse con el teclado.
  useEffect(() => {
    listaRef.current?.querySelector<HTMLElement>('[data-activo="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [indice]);

  if (!abierto) return null;

  function abrir(resultado: ResultadoBusqueda) {
    onCerrar();
    router.push(resultado.ruta);
  }

  function alTeclado(evento: React.KeyboardEvent) {
    if (evento.key === 'Escape') { evento.preventDefault(); onCerrar(); }
    else if (evento.key === 'ArrowDown') { evento.preventDefault(); setIndice((i) => Math.min(i + 1, resultados.length - 1)); }
    else if (evento.key === 'ArrowUp') { evento.preventDefault(); setIndice((i) => Math.max(i - 1, 0)); }
    else if (evento.key === 'Home') { evento.preventDefault(); setIndice(0); }
    else if (evento.key === 'End') { evento.preventDefault(); setIndice(resultados.length - 1); }
    else if (evento.key === 'Enter' && resultados[indice]) { evento.preventDefault(); abrir(resultados[indice]); }
  }

  return (
    <div className="buscador-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
      <div className="buscador-panel" role="dialog" aria-modal="true" aria-label="Buscar pantalla">
        <input
          ref={entradaRef}
          className="buscador-entrada"
          type="text"
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          onKeyDown={alTeclado}
          placeholder="Buscar una pantalla…"
          aria-label="Buscar una pantalla"
          aria-controls="buscador-resultados"
          aria-activedescendant={resultados[indice] ? `buscador-opcion-${indice}` : undefined}
          autoComplete="off"
        />
        <div className="buscador-resultados" id="buscador-resultados" role="listbox" aria-label="Pantallas" ref={listaRef}>
          {resultados.length === 0 && <p className="buscador-vacio">No hay ninguna pantalla que coincida con «{consulta}».</p>}
          {resultados.map((resultado, i) => (
            <button
              key={resultado.ruta}
              id={`buscador-opcion-${i}`}
              type="button"
              role="option"
              aria-selected={i === indice}
              data-activo={i === indice}
              className="buscador-opcion"
              onMouseEnter={() => setIndice(i)}
              onClick={() => abrir(resultado)}
            >
              <span>{resultado.nombre}</span>
              <small>{resultado.contexto}</small>
            </button>
          ))}
        </div>
        <div className="buscador-pie">
          <span><kbd>↑</kbd><kbd>↓</kbd> moverse</span>
          <span><kbd>Enter</kbd> abrir</span>
          <span><kbd>Esc</kbd> cerrar</span>
        </div>
      </div>
    </div>
  );
}
