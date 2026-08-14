---
id: entity--historial-contrasena
tipo: ENTITY
nombre: HistorialContrasena
nivel: L1
dominio: seguridad
resumen: Entidad HistorialContrasena, persistida en seguridad.historial_contrasenas.
tabla: seguridad.historial_contrasenas
archivos:
  - backend/src/shared/entities/historial-contrasena.entity.ts
edges:
  - [belongs_to, domain--seguridad]
  - [persisted_in, table--seguridad-historial-contrasenas]
terminos: [historial, contrasena, contrasenas, seguridad]
---

# HistorialContrasena

Entidad HistorialContrasena, persistida en seguridad.historial_contrasenas.

- **Tabla:** [[table--seguridad-historial-contrasenas|seguridad.historial_contrasenas]]
- **Columnas mapeadas:** 2

## Donde se usa

- **Pantallas:** `/dashboard/mi-perfil`, `/dashboard/seguridad/sesiones`, `/dashboard/seguridad/usuarios`, `/dashboard/seguridad/usuarios/[id]`
- **Endpoints:** MeController, UsuariosController
- **Servicios:** UsuariosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/historial-contrasena.entity.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `persisted_in` → [[table--seguridad-historial-contrasenas|seguridad.historial_contrasenas]]

## Referenciado por

- [[service--seguridad-usuarios|UsuariosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
