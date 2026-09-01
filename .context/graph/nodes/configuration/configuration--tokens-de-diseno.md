---
id: configuration--tokens-de-diseno
tipo: CONFIGURATION
nombre: "Configuracion: Tokens de diseño"
nivel: L2
dominio: seguridad
resumen: "6 parametro(s) de la categoria \"Tokens de diseño\", niveles: GLOBAL."
archivos:
  - backend/src/modules/configuracion/configuracion.registry.ts
edges:
  - [belongs_to, domain--seguridad]
terminos: [tokens, diseno, primary, color, primario, accent, acento, global, background, fondo, claro, text, texto, principal, surface, superficie, danger, error]
---

# Configuracion: Tokens de diseño

6 parametro(s) de la categoria "Tokens de diseño", niveles: GLOBAL.


## Claves

| Clave | Nivel | Tipo | Default | Permiso |
|---|---|---|---|---|
| `tokens.primary` | GLOBAL | color | `'#0f3b70'` | `configuracion:editar_borrador` |
| `tokens.accent` | GLOBAL | color | `'#2563eb'` | `configuracion:editar_borrador` |
| `tokens.background` | GLOBAL | color | `'#f3f7f8'` | `configuracion:editar_borrador` |
| `tokens.text` | GLOBAL | color | `'#10263f'` | `configuracion:editar_borrador` |
| `tokens.surface` | GLOBAL | color | `'#ffffff'` | `configuracion:editar_borrador` |
| `tokens.danger` | GLOBAL | color | `'#bd3d39'` | `configuracion:editar_borrador` |

## Archivos

- `backend/src/modules/configuracion/configuracion.registry.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[rule--tema-claro-unico|Hay un solo tema y es claro; el login es la unica excepcion]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
