---
id: configuration--mantenimiento
tipo: CONFIGURATION
nombre: "Configuracion: Mantenimiento"
nivel: L2
dominio: seguridad
resumen: "3 parametro(s) de la categoria \"Mantenimiento\", niveles: GLOBAL."
archivos:
  - backend/src/modules/configuracion/configuracion.registry.ts
edges:
  - [belongs_to, domain--seguridad]
terminos: [mantenimiento, maintenance, enabled, modo, title, titulo, message, mensaje]
---

# Configuracion: Mantenimiento

3 parametro(s) de la categoria "Mantenimiento", niveles: GLOBAL.


## Claves

| Clave | Nivel | Tipo | Default | Permiso |
|---|---|---|---|---|
| `maintenance.enabled` | GLOBAL | booleano | `false` | `configuracion:editar_borrador` |
| `maintenance.title` | GLOBAL | texto | `'Mantenimiento programado'` | `configuracion:editar_borrador` |
| `maintenance.message` | GLOBAL | texto | `'Volveremos a estar disponibles pronto.'` | `configuracion:editar_borrador` |

## Archivos

- `backend/src/modules/configuracion/configuracion.registry.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
