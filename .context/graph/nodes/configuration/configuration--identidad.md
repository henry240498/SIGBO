---
id: configuration--identidad
tipo: CONFIGURATION
nombre: "Configuracion: Identidad"
nivel: L2
dominio: seguridad
resumen: "2 parametro(s) de la categoria \"Identidad\", niveles: GLOBAL."
archivos:
  - backend/src/modules/configuracion/configuracion.registry.ts
edges:
  - [belongs_to, domain--seguridad]
terminos: [identidad, identity, name, nombre, aplicacion, tagline, eslogan]
---

# Configuracion: Identidad

2 parametro(s) de la categoria "Identidad", niveles: GLOBAL.


## Claves

| Clave | Nivel | Tipo | Default | Permiso |
|---|---|---|---|---|
| `identity.appName` | GLOBAL | texto | `'SIGBO-CBVC'` | `configuracion:editar_borrador` |
| `identity.tagline` | GLOBAL | texto | `'Sistema integral de gestión'` | `configuracion:editar_borrador` |

## Archivos

- `backend/src/modules/configuracion/configuracion.registry.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
