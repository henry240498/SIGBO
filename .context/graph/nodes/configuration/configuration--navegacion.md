---
id: configuration--navegacion
tipo: CONFIGURATION
nombre: "Configuracion: Navegación"
nivel: L2
dominio: seguridad
resumen: "1 parametro(s) de la categoria \"Navegación\", niveles: GLOBAL."
archivos:
  - backend/src/modules/configuracion/configuracion.registry.ts
edges:
  - [belongs_to, domain--seguridad]
terminos: [navegacion, navigation, default, pagina, inicial]
---

# Configuracion: Navegación

1 parametro(s) de la categoria "Navegación", niveles: GLOBAL.


## Claves

| Clave | Nivel | Tipo | Default | Permiso |
|---|---|---|---|---|
| `navigation.defaultPage` | GLOBAL | selector | `'/dashboard'` | `configuracion:editar_borrador` |

## Archivos

- `backend/src/modules/configuracion/configuracion.registry.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
