---
id: rule--tema-oscuro-fijo
tipo: RULE
nombre: El tema oscuro esta fijo en las pantallas, aunque Configuracion prometa temas
nivel: L2
resumen: Las pantallas tienen hex oscuros hardcodeados y no hay selector de tema. El registro de configuracion define tokens claros y tema auto. Las dos cosas conviven sin integrarse.
severidad: MEDIA
archivos: [frontend/src/app/globals.css, backend/src/modules/configuracion/configuracion.registry.ts, docs/GUIA-DE-ESTILO.md]
terminos: [tema, oscuro, claro, dark, light, token, apariencia, configuracion, contradiccion]
edges:
  - [affects, configuration--apariencia]
  - [affects, configuration--tokens-de-diseno]
---

## El estado real, que es contradictorio

**Lo que hacen las pantallas:** tema oscuro fijo. `#0f172a` de fondo, `#1e293b` en
tarjetas, hex repetidos literalmente en cada archivo. Sin modo claro, sin selector.

**Lo que promete el registro de configuracion:**

| Clave | Default | Nivel |
|---|---|---|
| `appearance.theme` | `auto` (`light`/`dark`/`auto`) | VISITANTE |
| `tokens.primary` | `#0f3b70` | GLOBAL |
| `tokens.background` | `#f3f7f8` (**claro**) | GLOBAL |
| `tokens.text` | `#10263f` | GLOBAL |
| `tokens.surface` | `#ffffff` | GLOBAL |

Los tokens de `configuracion.registry.ts` describen un tema **claro** que ninguna
pantalla consume hoy.

## Por que importa antes de tocar apariencia

Quien implemente el tema claro de verdad tiene que resolver primero la contradiccion,
no elegir un lado a mitad de camino:

- **Opcion A** — el tema oscuro es el producto: los tokens de Configuracion se
  corrigen a valores oscuros y se elimina la promesa de `light`.
<<<<<<< Updated upstream
- **Opcion B** — los tokens mandan: hay que reemplazar los cientos de hex inline por
=======
- **Opcion B** — los tokens mandan: hay que reemplazar los ~cientos de hex inline por
>>>>>>> Stashed changes
  variables CSS alimentadas desde `configuracion_valores`. Es un refactor grande y
  contradice [[decision--sin-libreria-ui]] tal como esta escrita hoy.

Hacer la mitad de B deja pantallas mezcladas, que es peor que cualquiera de las dos.

## Mientras nadie decida

Al crear una pantalla nueva: **tema oscuro, hex de [[rule--sin-clases-css-nuevas]]**.
<<<<<<< Updated upstream
Es lo consistente con las ~56 pantallas que ya existen.
=======
Es lo consistente con las ~50 pantallas que ya existen.
>>>>>>> Stashed changes
