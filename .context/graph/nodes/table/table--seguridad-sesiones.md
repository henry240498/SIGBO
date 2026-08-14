---
id: table--seguridad-sesiones
tipo: TABLE
nombre: seguridad.sesiones
nivel: L2
dominio: seguridad
resumen: Tabla seguridad.sesiones (11 columnas). Creada en 002_seguridad.sql, modificada por 009_foreign_keys.sql.
tabla: sesiones
archivos:
  - database/migrations/002_seguridad.sql
  - database/migrations/009_foreign_keys.sql
edges:
  - [defined_in, file--002-seguridad]
  - [belongs_to, domain--seguridad]
terminos: [seguridad, sesiones, usuario, refresh, token, hash, user, agent, dispositivo, fecha, inicio, expiracion, ultima, actividad, activa, session, data]
---

# seguridad.sesiones

Tabla seguridad.sesiones (11 columnas). Creada en 002_seguridad.sql, modificada por 009_foreign_keys.sql.

- **Esquema:** seguridad · **Columnas:** 11

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| usuario_id | UNIQUEIDENTIFIER |
| refresh_token_hash | NVARCHAR(255) |
| ip | VARCHAR(45) |
| user_agent | NVARCHAR(MAX) |
| dispositivo | NVARCHAR(100) |
| fecha_inicio | DATETIMEOFFSET(3) |
| fecha_expiracion | DATETIMEOFFSET(3) |
| fecha_ultima_actividad | DATETIMEOFFSET(3) |
| activa | BIT |
| session_data | NVARCHAR(MAX) |

## Donde se usa

- **Pantallas:** `/dashboard/mi-perfil/seguridad`, `/dashboard/seguridad/sesiones`, `/dashboard/seguridad/usuarios/[id]`
- **Endpoints:** AuthController, SesionesController
- **Servicios:** AuthService, SesionesService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/002_seguridad.sql`
- `database/migrations/009_foreign_keys.sql`

## Relaciones

- `defined_in` → [[file--002-seguridad|002_seguridad.sql]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[entity--sesion|Sesion]] `persisted_in` →
- [[service--auth-auth|AuthService]] `reads` →
- [[service--seguridad-sesiones|SesionesService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
