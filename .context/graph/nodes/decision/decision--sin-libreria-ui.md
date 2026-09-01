---
id: decision--sin-libreria-ui
tipo: DECISION
nombre: Sin libreria de UI ni Tailwind, clases propias en globals.css y estilos inline con tokens
nivel: L1
estado: VIGENTE
resumen: "Todo el sistema visual se resuelve con las ~116 clases de globals.css y las variables de :root, mas estilos inline que usan var(--token). Sin Tailwind, sin shadcn, sin CSS Modules."
archivos:
  - frontend/src/app/globals.css
  - docs/GUIA-DE-ESTILO.md
edges:
  - [constrains, rule--sin-clases-css-nuevas]
  - [constrains, rule--tema-claro-unico]
terminos: [css, tailwind, shadcn, estilos, inline, globals, card, badge, boton, paleta, libreria, clases, propias, tokens, todo, sistema, visual, resuelve, 116, variables, root, usan, var, token, modules]
---

# Sin libreria de UI ni Tailwind, clases propias en globals.css y estilos inline con tokens

Todo el sistema visual se resuelve con las ~116 clases de globals.css y las variables de :root, mas estilos inline que usan var(--token). Sin Tailwind, sin shadcn, sin CSS Modules.

## Decision

Las unicas clases utilitarias son `.card`, `.btn-primary`, `.input-field` y
`.badge`, definidas en `frontend/src/app/globals.css`. Todo lo demas se resuelve
con `style={{...}}` inline repitiendo los valores hex documentados en la guia.

## Motivo

Consistencia verificable sin cadena de build de CSS ni dependencia de una libreria
que despues haya que migrar. `docs/GUIA-DE-ESTILO.md` documenta **lo que ya existe
en el codigo**, no una propuesta a futuro.

## Costo aceptado

- No hay variables CSS ni custom properties: los hex se repiten literalmente en
  cada archivo. Cambiar la paleta es un find-and-replace, no un cambio de token.
- Riesgo real de deriva visual si alguien inventa un color parecido en vez de
  copiar el exacto. De ahi [[rule--sin-clases-css-nuevas]].
- Cada pantalla nueva paga el costo de reimplementar patrones (tablas, formularios,
  badges) que una libreria daria hechos. Con ~56 pantallas, el patron ya esta
  establecido: copiar de una vecina es mas rapido y mas seguro que inventar.

## Lo que costo, y lo que quedo pendiente

El costo de no tener libreria se cobro al cambiar el tema: como el color vivia como hex
literal en cada pantalla, pasar `globals.css` a claro dejo 1.563 valores oscuros
desincronizados en 121 archivos, con el texto secundario en 2,5:1 y los errores en
2,9:1. Se corrigio pasando todo a `var(--token)`, que es lo que hoy sostiene la
decision: sin libreria, pero con una capa de tokens en `:root`.

Sigue pendiente el cableado con Configuracion: el modulo define tokens de diseno **en
base de datos** (`tokens.primary` = `#0f3b70`, `tokens.background` = `#f3f7f8`, tema por
defecto `auto`) y ninguna pantalla los lee todavia -- `:root` los tiene fijos en el
archivo. Ver [[rule--tema-claro-unico]].


## Archivos

- `frontend/src/app/globals.css`
- `docs/GUIA-DE-ESTILO.md`

## Relaciones

- `constrains` → [[rule--sin-clases-css-nuevas|No traer librerias de UI, y el color sale de un token y no de un hex]]
- `constrains` → [[rule--tema-claro-unico|Hay un solo tema y es claro; el login es la unica excepcion]]

---
<sub>Nodo **curado** (editable a mano).</sub>
