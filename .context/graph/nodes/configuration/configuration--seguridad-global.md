---
id: configuration--seguridad-global
tipo: CONFIGURATION
nombre: "Configuracion: Seguridad global"
nivel: L2
dominio: seguridad
resumen: "2 parametro(s) de la categoria \"Seguridad global\", niveles: GLOBAL."
archivos:
  - backend/src/modules/configuracion/configuracion.registry.ts
edges:
  - [belongs_to, domain--seguridad]
terminos: [seguridad, global, operations, session, minutes, duracion, sesion, command, center, states, estados, acceso, centro, mando]
---

# Configuracion: Seguridad global

2 parametro(s) de la categoria "Seguridad global", niveles: GLOBAL.


## Claves

| Clave | Nivel | Tipo | Default | Permiso |
|---|---|---|---|---|
| `operations.sessionMinutes` | GLOBAL | numero | `480` | `configuracion:editar_borrador` |
| `operations.commandCenterStates` | GLOBAL | lista | `['ACTIVO']` | `configuracion:editar_borrador` |

## Archivos

- `backend/src/modules/configuracion/configuracion.registry.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
