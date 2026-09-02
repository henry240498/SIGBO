'use client';

import { useState } from 'react';

/**
 * Paginado en memoria para los listados que traen todo el conjunto de una sola consulta
 * (Personal, Articulos, Movimientos). Con un cuadro real de cientos de filas, el
 * navegador dibuja la tabla entera y hay que desplazarse sin referencia de donde uno
 * esta.
 *
 * La pagina se recorta al rango valido en cada render en vez de reiniciarse con un
 * efecto: al filtrar y achicar la lista uno queda en la ultima pagina con datos, nunca
 * en una vacia, y no hace falta acordarse de reiniciar en cada cambio de filtro.
 */
export function usePaginacion<T>(items: T[], porPagina = 25) {
  const [paginaPedida, setPagina] = useState(1);
  const paginas = Math.max(1, Math.ceil(items.length / porPagina));
  const pagina = Math.min(Math.max(1, paginaPedida), paginas);
  const desde = (pagina - 1) * porPagina;
  return {
    visibles: items.slice(desde, desde + porPagina),
    pagina,
    paginas,
    total: items.length,
    desde,
    setPagina,
  };
}

export function Paginador({
  pagina, paginas, total, desde, mostrados, setPagina, etiqueta = 'registros',
}: {
  pagina: number; paginas: number; total: number; desde: number; mostrados: number;
  setPagina: (n: number) => void; etiqueta?: string;
}) {
  // Con una sola pagina el control no aporta nada, pero el conteo si.
  const hasta = desde + mostrados;
  return (
    <nav className="paginador" aria-label={`Paginación de ${etiqueta}`}>
      <span className="paginador-conteo" role="status" aria-live="polite">
        {total === 0 ? `Sin ${etiqueta}` : `${desde + 1}–${hasta} de ${total} ${etiqueta}`}
      </span>
      {paginas > 1 && (
        <span className="paginador-controles">
          <button type="button" onClick={() => setPagina(pagina - 1)} disabled={pagina === 1}>
            ← Anterior
          </button>
          <span className="paginador-pagina">Página {pagina} de {paginas}</span>
          <button type="button" onClick={() => setPagina(pagina + 1)} disabled={pagina === paginas}>
            Siguiente →
          </button>
        </span>
      )}
    </nav>
  );
}
