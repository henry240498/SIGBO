---
id: table--seguridad-configuracion-sistema
tipo: TABLE
nombre: seguridad.configuracion_sistema
nivel: L2
dominio: seguridad
resumen: Tabla seguridad.configuracion_sistema (10 columnas). Creada en 013_apariencia_login.sql, renombrada desde seguridad.configuracion_apariencia, modificada por 013_apariencia_login.sql, 014_configuracion_sistema.sql, 015_perfil_usuario.sql.
tabla: configuracion_sistema
archivos:
  - database/migrations/013_apariencia_login.sql
  - database/migrations/014_configuracion_sistema.sql
  - database/migrations/015_perfil_usuario.sql
edges:
  - [defined_in, file--013-apariencia-login]
  - [belongs_to, domain--seguridad]
terminos: [seguridad, configuracion, sistema, apariencia, logo, login, fondo, texto, bajo, actualizado, nombre, menu, subtitulo, perfil, edicion, libre]
---

# seguridad.configuracion_sistema

Tabla seguridad.configuracion_sistema (10 columnas). Creada en 013_apariencia_login.sql, renombrada desde seguridad.configuracion_apariencia, modificada por 013_apariencia_login.sql, 014_configuracion_sistema.sql, 015_perfil_usuario.sql.

- **Esquema:** seguridad · **Columnas:** 10

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| logo_login | NVARCHAR(MAX) |
| fondo_login | NVARCHAR(MAX) |
| texto_bajo_logo | NVARCHAR(200) |
| actualizado_en | DATETIMEOFFSET(3) |
| actualizado_por | UNIQUEIDENTIFIER |
| nombre_sistema_menu | NVARCHAR(100) |
| subtitulo_menu | NVARCHAR(200) |
| logo_menu | NVARCHAR(500) |
| perfil_edicion_libre | BIT |

## Archivos

- `database/migrations/013_apariencia_login.sql`
- `database/migrations/014_configuracion_sistema.sql`
- `database/migrations/015_perfil_usuario.sql`

## Relaciones

- `defined_in` → [[file--013-apariencia-login|013_apariencia_login.sql]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[entity--configuracion-sistema|ConfiguracionSistema]] `persisted_in` →
- [[service--seguridad-apariencia|AparienciaService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
