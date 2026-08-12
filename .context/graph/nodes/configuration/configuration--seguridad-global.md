---
id: configuration--seguridad-global
tipo: CONFIGURATION
nombre: "Configuracion: Seguridad global"
nivel: L2
dominio: seguridad
resumen: "1 parametro(s) de la categoria \"Seguridad global\", niveles: GLOBAL."
archivos:
  - backend/src/modules/configuracion/configuracion.registry.ts
edges:
  - [belongs_to, domain--seguridad]
terminos: [seguridad, global, operations, session, minutes, duracion, sesion]
---

# Configuracion: Seguridad global

1 parametro(s) de la categoria "Seguridad global", niveles: GLOBAL.


## Claves

| Clave | Nivel | Tipo | Default | Permiso |
|---|---|---|---|---|
| `operations.sessionMinutes` | GLOBAL | numero | `480` | `configuracion:editar_borrador` |

## Archivos

- `backend/src/modules/configuracion/configuracion.registry.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
