/**
 * Estado de carga. Antes cada pantalla ponia un parrafo gris "Cargando..." suelto: no
 * anticipaba la forma de lo que venia y, al no tener role="status", un lector de
 * pantalla no anunciaba nada -- el usuario quedaba en silencio hasta que llegaban los
 * datos. El esqueleto ocupa el lugar del contenido y el texto viaja para quien escucha.
 */
export function Cargando({ texto = 'Cargando…', filas = 3 }: { texto?: string; filas?: number }) {
  return (
    <div className="cargando" role="status" aria-live="polite">
      <span className="sr-only">{texto}</span>
      {Array.from({ length: filas }, (_, i) => (
        <span key={i} className="esqueleto" aria-hidden="true" />
      ))}
    </div>
  );
}
