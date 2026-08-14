---
id: table--seguridad-historial-contrasenas
tipo: TABLE
nombre: seguridad.historial_contrasenas
nivel: L2
dominio: seguridad
resumen: Tabla seguridad.historial_contrasenas (4 columnas). Creada en 011_seguridad_fase1.sql.
tabla: historial_contrasenas
archivos:
  - database/migrations/011_seguridad_fase1.sql
edges:
  - [defined_in, file--011-seguridad-fase1]
  - [belongs_to, domain--seguridad]
  - [references, table--seguridad-usuarios]
terminos: [seguridad, historial, contrasenas, usuario, password, hash, creado]
---

# seguridad.historial_contrasenas

Tabla seguridad.historial_contrasenas (4 columnas). Creada en 011_seguridad_fase1.sql.

- **Esquema:** seguridad · **Columnas:** 4

## Llaves foraneas

- `usuario_id` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| usuario_id | UNIQUEIDENTIFIER |
| password_hash | NVARCHAR(255) |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/mi-perfil`, `/dashboard/seguridad/sesiones`, `/dashboard/seguridad/usuarios`, `/dashboard/seguridad/usuarios/[id]`
- **Endpoints:** MeController, UsuariosController
- **Servicios:** UsuariosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/011_seguridad_fase1.sql`

## Relaciones

- `defined_in` → [[file--011-seguridad-fase1|011_seguridad_fase1.sql]]
- `belongs_to` → [[domain--seguridad|Seguridad]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--historial-contrasena|HistorialContrasena]] `persisted_in` →
- [[service--seguridad-usuarios|UsuariosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
