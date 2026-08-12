---
id: table--seguridad-usuarios
tipo: TABLE
nombre: seguridad.usuarios
nivel: L2
dominio: seguridad
resumen: Tabla seguridad.usuarios (26 columnas). Creada en 002_seguridad.sql, modificada por 009_foreign_keys.sql, 011_seguridad_fase1.sql, 015_perfil_usuario.sql.
tabla: usuarios
archivos:
  - database/migrations/002_seguridad.sql
  - database/migrations/009_foreign_keys.sql
  - database/migrations/011_seguridad_fase1.sql
  - database/migrations/015_perfil_usuario.sql
edges:
  - [defined_in, file--002-seguridad]
  - [belongs_to, domain--seguridad]
terminos: [seguridad, usuarios, bombero, email, username, password, hash, salt, two, factor, secret, enabled, avatar, url, idioma, zona, horaria, ultimo, acceso, user, agent, intentos, fallidos, bloqueado, hasta, estado, creado, actualizado, debe, cambiar, expira, whatsapp, facebook, instagram]
---

# seguridad.usuarios

Tabla seguridad.usuarios (26 columnas). Creada en 002_seguridad.sql, modificada por 009_foreign_keys.sql, 011_seguridad_fase1.sql, 015_perfil_usuario.sql.

- **Esquema:** seguridad · **Columnas:** 26
- **UNIQUE:** `email`, `username`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| email | NVARCHAR(255) |
| username | NVARCHAR(100) |
| password_hash | NVARCHAR(255) |
| salt | NVARCHAR(64) |
| two_factor_secret | NVARCHAR(255) |
| two_factor_enabled | BIT |
| avatar_url | NVARCHAR(MAX) |
| idioma | NVARCHAR(10) |
| zona_horaria | NVARCHAR(50) |
| ultimo_acceso | DATETIMEOFFSET(3) |
| ip_ultimo_acceso | VARCHAR(45) |
| user_agent | NVARCHAR(MAX) |
| intentos_fallidos | INT |
| bloqueado_hasta | DATETIMEOFFSET(3) |
| estado | NVARCHAR(30) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| debe_cambiar_password | BIT |
| password_expira_en | DATETIMEOFFSET(3) |
| whatsapp | NVARCHAR(30) |
| facebook_url | NVARCHAR(500) |
| instagram_url | NVARCHAR(500) |
| x_url | NVARCHAR(500) |

## Archivos

- `database/migrations/002_seguridad.sql`
- `database/migrations/009_foreign_keys.sql`
- `database/migrations/011_seguridad_fase1.sql`
- `database/migrations/015_perfil_usuario.sql`

## Relaciones

- `defined_in` → [[file--002-seguridad|002_seguridad.sql]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[table--seguridad-historial-contrasenas|seguridad.historial_contrasenas]] `references` →
- [[table--seguridad-usuario-telefonos|seguridad.usuario_telefonos]] `references` →
- [[table--seguridad-usuario-correos|seguridad.usuario_correos]] `references` →
- [[table--seguridad-configuracion-valores|seguridad.configuracion_valores]] `references` →
- [[table--seguridad-configuracion-valores|seguridad.configuracion_valores]] `references` →
- [[table--seguridad-configuracion-versiones|seguridad.configuracion_versiones]] `references` →
- [[table--seguridad-configuracion-versiones|seguridad.configuracion_versiones]] `references` →
- [[entity--usuario|Usuario]] `persisted_in` →
- [[service--auth-auth|AuthService]] `reads` →
- [[service--seguridad-dashboard|DashboardService]] `reads` →
- [[service--seguridad-perfil|PerfilService]] `reads` →
- [[service--seguridad-sesiones|SesionesService]] `reads` →
- [[service--seguridad-usuarios|UsuariosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
