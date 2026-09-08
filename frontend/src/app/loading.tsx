import { Cargando } from './components/Cargando';

/** Estado de carga entre rutas. Antes era la palabra "Cargando…" sola. */
export default function Loading() {
  return (
    <div className="error-boundary">
      <Cargando texto="Cargando la pantalla…" filas={4} />
    </div>
  );
}
