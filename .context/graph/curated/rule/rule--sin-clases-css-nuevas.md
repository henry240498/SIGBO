---
id: rule--sin-clases-css-nuevas
tipo: RULE
nombre: No inventar clases CSS ni colores parecidos
nivel: L1
resumen: Solo existen .card, .btn-primary, .input-field y .badge. Lo que no cubran se resuelve con style inline copiando el hex exacto documentado, nunca uno aproximado.
severidad: ALTA
archivos: [frontend/src/app/globals.css, docs/GUIA-DE-ESTILO.md]
<<<<<<< Updated upstream
terminos: [css, clase, color, hex, inline, estilo, paleta, consistencia, tailwind, badge]
=======
terminos: [css, clase, color, hex, inline, estilo, paleta, consistencia, tailwind]
>>>>>>> Stashed changes
edges:
  - [affects, component--front-modulos]
---

## El invariante

Las cuatro clases utilitarias son las unicas que existen. Si una pantalla nueva
necesita algo que no cubren, se resuelve con `style={{...}}` **copiando el valor hex
exacto** de la guia de estilo. No una clase nueva, no un hex parecido.

## La paleta, para copiar sin pensarla

| Uso | Hex |
|---|---|
| Fondo de la app | `#0f172a` |
| Fondo de tarjeta | `#1e293b` |
| Borde estandar | `#334155` |
| Borde de fila de tabla | `#1f2937` |
| Texto principal | `#e2e8f0` |
| Texto secundario | `#94a3b8` |
| Texto terciario | `#64748b` |
| Azul primario | `#2563eb` (hover `#1d4ed8`) |
| Link secundario | `#60a5fa` |
| Gris secundario/deshabilitado | `#475569` |

## Estados, sin excepcion

`ACTIVO` = verde: texto `#4ade80`, fondo de badge `#166534`, fondo de boton `#16a34a`.
<<<<<<< Updated upstream
Cualquier estado malo (`INACTIVO`, `BLOQUEADO`, `NO_OK`, denegado, eliminar, dar de
baja) = rojo oscuro `#7f1d1d`, texto `#f87171`. Advertencia = ambar `#b45309` borde /
`#451a03` fondo.

**No usar otros colores para este binario.** Es lo que hace que el sistema se lea de
un vistazo en una guardia. Aplica igual a los estados nuevos: `EstadoInspeccionEstacion`
es `OK`/`NO_OK` — verde y rojo, como todo lo demas.
=======
Cualquier estado malo (`INACTIVO`, `BLOQUEADO`, denegado, eliminar, dar de baja) =
rojo oscuro `#7f1d1d`, texto `#f87171`. Advertencia = ambar `#b45309` borde /
`#451a03` fondo.

**No usar otros colores para este binario.** Es lo que hace que el sistema se lea de
un vistazo en una guardia.
>>>>>>> Stashed changes

## Medidas que tambien se copian

Radio: `.card` 10px, `.input-field`/`.btn-primary` 6px, `.badge` 999px.
Padding: `.card` 24px, `.btn-primary` 10px 18px, celdas de tabla 6px 4px.
Tamanos: titulo de pagina 16px, cuerpo y tablas 13px, labels 12px, ayuda 11-12px.
Separacion entre secciones: `gap: 16` en listados, `gap: 20` en pantallas tipo
expediente.

Ver [[decision--sin-libreria-ui]] para el porque, y `docs/GUIA-DE-ESTILO.md` para el
<<<<<<< Updated upstream
detalle completo con ejemplos de codigo. Con ~56 pantallas ya escritas, copiar de una
vecina del mismo tipo es mas rapido y mas seguro que inventar.
=======
detalle completo con ejemplos de codigo.
>>>>>>> Stashed changes
