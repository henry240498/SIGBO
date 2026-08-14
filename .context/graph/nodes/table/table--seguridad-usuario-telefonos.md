---
id: table--seguridad-usuario-telefonos
tipo: TABLE
nombre: seguridad.usuario_telefonos
nivel: L2
dominio: seguridad
resumen: Tabla seguridad.usuario_telefonos (5 columnas). Creada en 015_perfil_usuario.sql.
tabla: usuario_telefonos
archivos:
  - database/migrations/015_perfil_usuario.sql
edges:
  - [defined_in, file--015-perfil-usuario]
  - [belongs_to, domain--seguridad]
  - [references, table--seguridad-usuarios]
terminos: [seguridad, usuario, telefonos, numero, etiqueta, creado]
---

# seguridad.usuario_telefonos

Tabla seguridad.usuario_telefonos (5 columnas). Creada en 015_perfil_usuario.sql.

- **Esquema:** seguridad · **Columnas:** 5

## Llaves foraneas

- `usuario_id` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| usuario_id | UNIQUEIDENTIFIER |
| numero | NVARCHAR(30) |
| etiqueta | NVARCHAR(50) |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** PerfilController
- **Servicios:** PerfilService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/015_perfil_usuario.sql`

## Relaciones

- `defined_in` → [[file--015-perfil-usuario|015_perfil_usuario.sql]]
- `belongs_to` → [[domain--seguridad|Seguridad]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--usuario-telefono|UsuarioTelefono]] `persisted_in` →
- [[service--seguridad-perfil|PerfilService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
