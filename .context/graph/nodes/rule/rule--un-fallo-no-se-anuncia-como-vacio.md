---
id: rule--un-fallo-no-se-anuncia-como-vacio
tipo: RULE
nombre: Un fallo de consulta nunca se muestra como lista vacia
nivel: L1
dominio: personal
resumen: "Caer en setItems([]) cuando la consulta falla convierte un 500 o un 403 en la afirmacion \"este bombero no tiene guardias\". El estado de error y el estado vacio son distintos y se muestran distinto."
severidad: ALTA
archivos:
  - frontend/src/app/dashboard/personal/[id]/secciones
  - frontend/src/app/components/Aviso.tsx
  - scripts/auditar-secciones-expediente.mjs
edges:
  - [affects, component--front-modulos]
  - [belongs_to, domain--personal]
terminos: [error, vacio, fetch, catch, estado, consulta, backend, 500, 403, pantalla, fallo, nunca, muestra, lista, vacia, caer, set, items, cuando, falla, convierte, afirmacion, este, bombero, tiene, guardias, son, distintos, muestran, distinto]
---

# Un fallo de consulta nunca se muestra como lista vacia

Caer en setItems([]) cuando la consulta falla convierte un 500 o un 403 en la afirmacion "este bombero no tiene guardias". El estado de error y el estado vacio son distintos y se muestran distinto.

## El invariante

Una pantalla tiene **tres** estados frente a una consulta, no dos:

| Estado | Que se muestra |
|---|---|
| Cargando | `<Cargando texto="…" />` |
| Vacio | "Sin movimientos registrados." |
| **Error** | `<Aviso tipo="error" texto="No se pudo cargar…" />` |

Un fallo que termina en `setItems([])` colapsa el tercero sobre el segundo, y el
resultado no es un hueco: es una **afirmacion falsa sobre el dato**. "Sin guardias
registradas" dice algo del bombero; un 500 no autoriza a decirlo.

## Como se veia

```tsx
// Mal: el 500, el 403 y la red caida terminan diciendo "sin movimientos".
apiFetch(`/personal/bomberos/${bomberoId}/historial`)
  .then(async (res) => (res.ok ? setItems(await res.json()) : setItems([])))
  .catch(() => setItems([]));
```

```tsx
// Bien: el fallo se muestra como fallo.
apiFetch(`/personal/bomberos/${bomberoId}/historial`)
  .then(async (res) => {
    if (!res.ok) { setError('No se pudo cargar la línea de tiempo.'); return; }
    setItems(await res.json());
  })
  .catch(() => setError('No se pudo cargar la línea de tiempo.'));
```

Estaba asi en `TabTimeline` y en `TabServicios` (dos consultas), y se corrigio.

## El otro lado del mismo error

Tampoco hay que afirmar **la causa** sin saberla. `TabAuditoria` anunciaba cualquier
fallo como falta de permiso, asi que un 500 mandaba al usuario a pedirle al
administrador un permiso que ya tenia. El mensaje especifico solo va cuando el estado lo
respalda: `401`/`403` para permisos, generico para el resto.

## Como se detecta

`node scripts/auditar-secciones-expediente.mjs` lista, por seccion del expediente, si
tiene estado de carga, vacio y error. `sinManejoDeError` tiene que quedar vacio.

Para el resto de las pantallas todavia no hay guarda automatica: al escribir un `catch`
sobre una consulta, preguntarse que va a leer el usuario si eso se dispara.


## Archivos

- `frontend/src/app/dashboard/personal/[id]/secciones`
- `frontend/src/app/components/Aviso.tsx`
- `scripts/auditar-secciones-expediente.mjs`

## Relaciones

- `affects` → [[component--front-modulos|modulos]]
- `belongs_to` → [[domain--personal|Personal]]

---
<sub>Nodo **curado** (editable a mano).</sub>
