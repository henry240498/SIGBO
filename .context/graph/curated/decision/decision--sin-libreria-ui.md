---
id: decision--sin-libreria-ui
tipo: DECISION
nombre: Sin libreria de UI ni Tailwind, 4 clases utilitarias y estilos inline
nivel: L1
resumen: Todo el sistema visual se resuelve con 4 clases en globals.css mas estilos inline con hex literales. Sin Tailwind, sin shadcn, sin CSS Modules.
estado: VIGENTE
fuente: docs/GUIA-DE-ESTILO.md
archivos: [frontend/src/app/globals.css, docs/GUIA-DE-ESTILO.md]
terminos: [css, tailwind, shadcn, estilos, inline, globals, card, badge, boton, paleta]
edges:
  - [constrains, rule--sin-clases-css-nuevas]
  - [constrains, rule--tema-oscuro-fijo]
---

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

## Tension no resuelta (importante al tocar apariencia)

El modulo de Configuracion define tokens de diseno **en base de datos**
(`tokens.primary` = `#0f3b70`, `tokens.background` = `#f3f7f8`, tema por defecto
`auto`) mientras la guia de estilo describe un **tema oscuro fijo** con
`#0f172a`/`#1e293b` hardcodeados en cada pantalla.

Las dos cosas coexisten hoy. Antes de cambiar cualquiera de las dos hay que
decidir cual manda — ver [[rule--tema-oscuro-fijo]].
