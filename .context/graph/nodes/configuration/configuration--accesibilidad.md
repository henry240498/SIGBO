---
id: configuration--accesibilidad
tipo: CONFIGURATION
nombre: "Configuracion: Accesibilidad"
nivel: L2
dominio: seguridad
resumen: "4 parametro(s) de la categoria \"Accesibilidad\", niveles: VISITANTE."
archivos:
  - backend/src/modules/configuracion/configuracion.registry.ts
edges:
  - [belongs_to, domain--seguridad]
terminos: [accesibilidad, accessibility, high, contrast, contraste, alto, reduced, motion, reducir, animaciones, underline, links, subrayar, enlaces, readable, font, fuente, legible]
---

# Configuracion: Accesibilidad

4 parametro(s) de la categoria "Accesibilidad", niveles: VISITANTE.


## Claves

| Clave | Nivel | Tipo | Default | Permiso |
|---|---|---|---|---|
| `accessibility.highContrast` | VISITANTE | booleano | `false` | — |
| `accessibility.reducedMotion` | VISITANTE | booleano | `false` | — |
| `accessibility.underlineLinks` | VISITANTE | booleano | `false` | — |
| `accessibility.readableFont` | VISITANTE | booleano | `false` | — |

## Archivos

- `backend/src/modules/configuracion/configuracion.registry.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
