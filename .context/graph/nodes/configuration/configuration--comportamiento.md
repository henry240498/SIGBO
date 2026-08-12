---
id: configuration--comportamiento
tipo: CONFIGURATION
nombre: "Configuracion: Comportamiento"
nivel: L2
dominio: seguridad
resumen: "2 parametro(s) de la categoria \"Comportamiento\", niveles: USUARIO."
archivos:
  - backend/src/modules/configuracion/configuracion.registry.ts
edges:
  - [belongs_to, domain--seguridad]
terminos: [comportamiento, behavior, size, resultados, pagina, confirm, dangerous, confirmar, acciones, importantes]
---

# Configuracion: Comportamiento

2 parametro(s) de la categoria "Comportamiento", niveles: USUARIO.


## Claves

| Clave | Nivel | Tipo | Default | Permiso |
|---|---|---|---|---|
| `behavior.pageSize` | USUARIO | selector | `25` | — |
| `behavior.confirmDangerous` | USUARIO | booleano | `true` | — |

## Archivos

- `backend/src/modules/configuracion/configuracion.registry.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
