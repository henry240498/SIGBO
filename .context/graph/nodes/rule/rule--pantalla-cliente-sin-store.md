---
id: rule--pantalla-cliente-sin-store
tipo: RULE
nombre: Cada pantalla es cliente, duena de su estado, y recarga con cargar()
nivel: L1
resumen: "Todas las paginas son 'use client' con useState/useEffect. No hay store global ni React Query. Tras cada mutacion se vuelve a invocar la funcion local cargar()."
severidad: MEDIA
archivos:
  - docs/GUIA-DE-ESTILO.md
  - frontend/src/lib/api.ts
edges:
  - [affects, component--front-api]
terminos: [cliente, estado, usestate, useeffect, store, redux, zustand, react, query, cargar, recargar, cada, pantalla, duena, recarga, todas, paginas, son, use, client, state, effect, hay, global, tras, mutacion, vuelve, invocar, funcion, local]
---

# Cada pantalla es cliente, duena de su estado, y recarga con cargar()

Todas las paginas son 'use client' con useState/useEffect. No hay store global ni React Query. Tras cada mutacion se vuelve a invocar la funcion local cargar().

## El invariante

- Toda pagina lleva `'use client'`. No hay Server Components con datos.
- El estado es local: `useState` + `useEffect`. Sin Redux, sin Zustand, sin React
  Query, sin SWR.
- Los datos se traen con una funcion local `cargar()`, que se **vuelve a invocar
  despues de cada mutacion**. No se actualiza el estado en memoria a mano.
- Todo pasa por `apiFetch(path, options)` de `@/lib/api`, que agrega el
  `Authorization: Bearer` y reintenta una vez si recibe 401, refrescando el token.

## El patron, tal como se repite en ~56 pantallas

```tsx
'use client';
const [items, setItems] = useState<Item[]>([]);
const [cargando, setCargando] = useState(true);

async function cargar() {
  const res = await apiFetch('/guardias/grupos');
  if (res.ok) setItems(await res.json());
  setCargando(false);
}
useEffect(() => { cargar(); }, []);

async function guardar() {
  const res = await apiFetch('/guardias/grupos', { method: 'POST', body: JSON.stringify(dto) });
  if (res.ok) await cargar();   // recargar, no mutar el arreglo local
}
```

## Por que recargar en vez de mutar

Porque el backend puede haber derivado campos (codigos, timestamps, estados
calculados, validaciones de elegibilidad). Mutar el arreglo local produce pantallas
que muestran algo distinto de lo que quedo guardado. Recargar es mas peticiones y es
lo correcto aca.

## No introducir un store sin necesidad real

Agregar React Query o Zustand a una sola pantalla crea dos patrones donde habia uno.
Si hiciera falta, es un cambio de todas las pantallas o de ninguna.

## Los helpers de lib son la excepcion util

`lib/asistencia.ts`, `lib/personal.ts`, `lib/parametros.ts`, `lib/configuracion.ts`,
`lib/publicaciones.ts`, `lib/exportar.ts`, `lib/texto.ts` concentran tipos y llamadas
repetidas. El grafo registra que pantalla usa cada uno (arista `uses`), asi que antes
de duplicar una funcion conviene consultar:

```bash
node .context/graph/context.mjs --archivo frontend/src/lib/personal.ts --level L2
```


## Archivos

- `docs/GUIA-DE-ESTILO.md`
- `frontend/src/lib/api.ts`

## Relaciones

- `affects` → [[component--front-api|api]]

---
<sub>Nodo **curado** (editable a mano).</sub>
