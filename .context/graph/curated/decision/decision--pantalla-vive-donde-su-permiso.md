---
id: decision--pantalla-vive-donde-su-permiso
tipo: DECISION
nombre: Una pantalla vive en el modulo cuyo permiso gobierna sus endpoints
nivel: L1
resumen: Ante la duda de en que modulo ubicar una pantalla, decide el prefijo de permiso de los endpoints que consume, no el parecido tematico del nombre. Resolvio la duplicacion de Guardias entre dos modulos.
estado: VIGENTE
fuente: frontend/next.config.js
archivos: [frontend/src/app/dashboard/guardias/planificacion/page.tsx, frontend/src/app/dashboard/organizacion/tipos-guardia/page.tsx, frontend/next.config.js]
terminos: [pantalla, modulo, permiso, ubicacion, ruta, guardias, organizacion, duplicacion, navegacion]
edges:
  - [affects, component--front-modulos]
  - [affects, rule--modulo-visible-por-prefijo]
---

## El criterio

Cuando no esta claro en que modulo poner una pantalla, la pregunta no es de que "habla"
sino **con que permiso se entra**: cada endpoint declara su `@RequirePermission`
([[rule--todo-endpoint-mutante-con-permiso]]), y el menu muestra un modulo si el usuario
tiene algun permiso de su prefijo ([[rule--modulo-visible-por-prefijo]]).

De ahi que ubicar una pantalla en el modulo equivocado no sea cosmetico: **deja la
pantalla fuera del alcance de quien tiene permiso para usarla.**

## El caso que lo obligo: "Guardias" aparecia dos veces

Habia pantallas de guardias en `/dashboard/guardias` (9) y en
`/dashboard/organizacion/guardias` (2), y las dos entradas se llamaban "Guardias". El
criterio las separo sin ambiguedad:

| Pantalla | Endpoints que consume | Permiso | Resolucion |
|---|---|---|---|
| `organizacion/guardias` | `/organizacion/tipos-guardia` | `organizacion:tipos_guardia_*` | Se queda en Organizacion. **No era un duplicado**: administra el catalogo de tipos de guardia. Solo estaba mal nombrada -> `organizacion/tipos-guardia`, "Tipos de guardia". |
| `organizacion/guardias/planificacion` | `/guardias/planificacion/manual` | **`guardias:editar`** | Estaba mal ubicada -> `guardias/planificacion`, y entra al submenu de Guardias. |

El segundo caso era un **defecto de acceso real**, no una molestia de orden: quien tenia
`guardias:editar` pero ningun permiso `organizacion:` no veia el modulo Organizacion en
el menu, y por lo tanto no tenia forma de llegar a la pantalla de planificacion que si
estaba autorizado a usar.

## Lo que hay que recordar al mover una pantalla

Las direcciones viejas quedan **redirigidas** en `next.config.js`, no borradas: hay
enlaces guardados y favoritos. Y despues de mover hay que correr
`npm run generar:pantallas` ([[rule--registro-de-pantallas-generado]]), o el buscador
sigue ofreciendo la ruta anterior.

## Lo que este criterio no resuelve

Que el esquema SQL no acompanie al modulo. Guardias sigue viviendo en el esquema
`operaciones` junto a Asistencia ([[rule--guardias-vive-en-operaciones]]); eso es una
decision de base de datos y no cambia por mover una pantalla.
