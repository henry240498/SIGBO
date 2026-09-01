---
id: rule--sin-clases-css-nuevas
tipo: RULE
nombre: No traer librerias de UI, y el color sale de un token y no de un hex
nivel: L1
resumen: "El sistema visual son las ~116 clases de globals.css y las variables de :root. Lo que no cubran va con style inline usando var(--token). Un hex de texto crudo en una pantalla es la falla que se limpio de 121 pantallas."
severidad: ALTA
archivos:
  - frontend/src/app/globals.css
  - frontend/scripts/audit-contraste.mjs
  - docs/GUIA-DE-ESTILO.md
edges:
  - [affects, component--front-modulos]
terminos: [css, clase, color, hex, inline, estilo, paleta, token, contraste, consistencia, tailwind, badge, traer, librerias, sale, sistema, visual, son, 116, clases, globals, variables, root, cubran, style, usando, var, texto, crudo, pantalla, falla, limpio, 121, pantallas]
---

# No traer librerias de UI, y el color sale de un token y no de un hex

El sistema visual son las ~116 clases de globals.css y las variables de :root. Lo que no cubran va con style inline usando var(--token). Un hex de texto crudo en una pantalla es la falla que se limpio de 121 pantallas.

## El invariante

Nada de Tailwind ni de libreria de componentes. El sistema visual son las ~116 clases
de `globals.css` (las cuatro base -- `.card`, `.btn-primary`, `.input-field`, `.badge`
-- mas las de cada dominio: `.service-*`, `.denuncia-*`, `.side-*`, `.croquis-*`) y las
custom properties de `:root`.

Lo que esas clases no cubran se resuelve con `style={{...}}` inline, pero **con
`var(--token)`, nunca con un hex de texto**.

## Por que no un hex

Porque ya paso. `globals.css` cambio a tema claro y las pantallas se quedaron con la
paleta oscura incrustada: 504 usos de `#94a3b8` en texto secundario a 2,5:1, 230 de
`#f87171` en mensajes de error a 2,9:1, 45 de `#e2e8f0` a 1,2:1 (invisible). Fueron
1.563 valores en 121 archivos. Un token no se puede desincronizar del tema; un hex si.

`npm run audit:contraste` falla si vuelve a entrar alguno de los colores retirados.

## La paleta, para copiar sin pensarla

| Uso | Token |
|---|---|
| Fondo de la app | `--paper` |
| Fondo de tarjeta | `--surface` |
| Fondo suave (barra de filtros, `thead`) | `--surface-soft` |
| Borde estandar | `--line` |
| Borde de fila de tabla | `--line-soft` |
| Texto principal | `--ink` |
| Texto secundario | `--muted` |
| Azul primario / enlace | `--signal` (hover `--signal-dark`) |
| Exito | `--success` |
| Error | `--danger` |
| Advertencia | `--warning` |

## Chips y botones no se pintan igual

Es la trampa que rompio ~200 badges y despues ~55 botones, en las dos direcciones:

- **`.badge` fija `color: var(--ink)`** (azul marino). Su fondo va en **tinte claro**:
  `--ok-fill`, `--bad-fill`, `--warn-fill`, `--info-fill`, `--neutral-fill`. Con un
  solido oscuro encima queda texto marino sobre oscuro, ~1,5:1.
- **`.btn-primary` fija texto blanco.** Su fondo va en **solido oscuro**: `#7f1d1d`
  peligro, `#475569` secundario, `#166534` confirmar. Con un tinte claro encima queda
  blanco sobre blanco.

Un mapa `COLOR_ESTADO` que alimenta `<span className="badge" style={{background: ...}}>`
lleva tintes, no solidos.

## Estados, sin excepcion

`ACTIVO` = verde, cualquier estado malo (`INACTIVO`, `BLOQUEADO`, `NO_OK`, denegado,
eliminar, dar de baja) = rojo, advertencia = ambar. Lo que cambia segun el elemento es
el tono, no el significado: en chip `--ok-fill` / `--bad-fill` / `--warn-fill`, en boton
`#166534` / `#7f1d1d` / `#854d0e`.

**No usar otros colores para este binario.** Es lo que hace que el sistema se lea de
un vistazo en una guardia. Aplica igual a los estados nuevos: `EstadoInspeccionEstacion`
es `OK`/`NO_OK` -- verde y rojo, como todo lo demas.

## Medidas que tambien se copian

Radio: `.card` 14px, `.input-field`/`.btn-primary` 8px, `.badge` 999px.
Padding: `.card` 22px, `.btn-primary` 9px 16px, celdas de tabla 12px 14px.
Tamanos: titulo de pagina 16px, cuerpo y tablas 13px, labels 12px, ayuda 11-12px.
Separacion entre secciones: `gap: 16` en listados, `gap: 20` en pantallas tipo
expediente.

Ver [[decision--sin-libreria-ui]] para el porque, [[rule--tema-claro-unico]] para el
estado del tema, y `docs/GUIA-DE-ESTILO.md` para el detalle con ejemplos. Con ~144
pantallas ya escritas, copiar de una vecina del mismo tipo es mas rapido y mas seguro
que inventar.


## Archivos

- `frontend/src/app/globals.css`
- `frontend/scripts/audit-contraste.mjs`
- `docs/GUIA-DE-ESTILO.md`

## Relaciones

- `affects` → [[component--front-modulos|modulos]]

## Referenciado por

- [[decision--sin-libreria-ui|Sin libreria de UI ni Tailwind, clases propias en globals.css y estilos inline con tokens]] `constrains` →

---
<sub>Nodo **curado** (editable a mano).</sub>
