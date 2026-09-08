---
id: rule--tema-claro-unico
tipo: RULE
nombre: "Hay un solo tema y es claro; el login es la unica excepcion"
nivel: L2
resumen: Las pantallas usan los tokens claros de :root. No hay selector de tema ni modo oscuro. La unica pantalla oscura es el login, que es una portada sobre foto con paleta propia.
severidad: MEDIA
archivos:
  - frontend/src/app/globals.css
  - frontend/src/app/login/page.tsx
  - frontend/scripts/audit-contraste.mjs
  - backend/src/modules/configuracion/configuracion.registry.ts
  - docs/GUIA-DE-ESTILO.md
edges:
  - [affects, configuration--apariencia]
  - [affects, configuration--tokens-de-diseno]
terminos: [tema, oscuro, claro, dark, light, token, apariencia, configuracion, contraste, accesibilidad, hay, solo, login, unica, excepcion, pantallas, usan, tokens, claros, root, selector, modo, pantalla, oscura, portada, foto, paleta, propia]
---

# Hay un solo tema y es claro; el login es la unica excepcion

Las pantallas usan los tokens claros de :root. No hay selector de tema ni modo oscuro. La unica pantalla oscura es el login, que es una portada sobre foto con paleta propia.

## El estado, que antes era contradictorio y ya no

`globals.css` define el tema claro en `:root` (`--paper` `#f3f7f8`, `--surface` blanco,
`--ink` `#10263f`) y las pantallas lo consumen con `var(--token)`. No hay selector de
tema ni modo oscuro.

Los tokens de `configuracion.registry.ts` (`tokens.background` `#f3f7f8`,
`tokens.surface` `#ffffff`, `tokens.text` `#10263f`) describen ese mismo tema claro, o
sea que ya no contradicen a las pantallas. Lo que sigue sin existir es el cableado: esos
valores viven en `configuracion_valores` pero ninguna pantalla los lee todavia, y
`appearance.theme` sigue ofreciendo `light`/`dark`/`auto` cuando solo hay claro.

## Como se llego aca, que es la parte util

Durante un tiempo el sistema estuvo a mitad de camino: `globals.css` ya era claro y las
144 pantallas seguian con la paleta oscura incrustada. El resultado medido era

- 504 usos de `#94a3b8` en texto secundario, a 2,5:1 sobre tarjeta blanca;
- 230 de `#f87171` en mensajes de error, a 2,9:1 -- lo que menos se podia leer era
  justamente el error;
- 45 de `#e2e8f0` a 1,2:1, invisible;
- ~200 badges con fondo solido oscuro y `color: var(--ink)`, a ~1,5:1;
- barras de filtro `#0f172a` como franjas negras dentro de tarjetas blancas.

Se resolvio hacia el tema claro: 1.563 valores en 121 archivos. El login quedo oscuro a
proposito y esta excluido de la auditoria.

## La leccion, que es la que hay que no repetir

**Media migracion de tema es peor que cualquiera de los dos temas.** Un cambio de
paleta no termina en `globals.css`: mientras haya hex incrustados en las pantallas, el
shell y el contenido se desincronizan en silencio -- nada falla, solo deja de leerse.

De ahi que la regla sea token y no hex ([[rule--sin-clases-css-nuevas]]), y que exista
`npm run audit:contraste`, que falla si vuelve a entrar un color del tema retirado. Es
la unica red: el frontend no tiene pruebas automatizadas.

## Si algun dia se implementa el tema configurable

El camino ya esta medio hecho: las pantallas leen `var(--token)`, asi que alcanza con
alimentar `:root` desde `configuracion_valores` en vez de tenerlo fijo en el archivo.
Lo que **no** hay que hacer es volver a poner hex en las pantallas.


## Archivos

- `frontend/src/app/globals.css`
- `frontend/src/app/login/page.tsx`
- `frontend/scripts/audit-contraste.mjs`
- `backend/src/modules/configuracion/configuracion.registry.ts`
- `docs/GUIA-DE-ESTILO.md`

## Relaciones

- `affects` → [[configuration--apariencia|Configuracion: Apariencia]]
- `affects` → [[configuration--tokens-de-diseno|Configuracion: Tokens de diseño]]

## Referenciado por

- [[decision--sin-libreria-ui|Sin libreria de UI ni Tailwind, clases propias en globals.css y estilos inline con tokens]] `constrains` →

---
<sub>Nodo **curado** (editable a mano).</sub>
