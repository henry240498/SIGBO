---
id: table--servicios-formulario-definiciones
tipo: TABLE
nombre: servicios.formulario_definiciones
nivel: L2
dominio: servicios
resumen: Tabla servicios.formulario_definiciones (14 columnas). Creada en 090_despacho_servicio_seguridad.sql.
tabla: formulario_definiciones
archivos:
  - database/migrations/090_despacho_servicio_seguridad.sql
edges:
  - [defined_in, file--090-despacho-servicio-seguridad]
  - [belongs_to, domain--servicios]
terminos: [servicios, formulario, definiciones, codigo, nombre, descripcion, campos, tipos, servicio, roles, permiso, requerido, etapa, confidencial, activo, version, creado, actualizado]
---

# servicios.formulario_definiciones

Tabla servicios.formulario_definiciones (14 columnas). Creada en 090_despacho_servicio_seguridad.sql.

- **Esquema:** servicios · **Columnas:** 14
- **UNIQUE:** `codigo`

## Restricciones CHECK (reglas que la BD impone)

- `etapa IS NULL OR etapa IN ('EN_CURSO', 'CIERRE')`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(40) |
| nombre | NVARCHAR(120) |
| descripcion | NVARCHAR(300) |
| campos | NVARCHAR(MAX) |
| tipos_servicio | NVARCHAR(MAX) |
| roles | NVARCHAR(MAX) |
| permiso_requerido | NVARCHAR(80) |
| etapa | NVARCHAR(20) |
| confidencial | BIT |
| activo | BIT |
| version | INT |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/090_despacho_servicio_seguridad.sql`

## Relaciones

- `defined_in` → [[file--090-despacho-servicio-seguridad|090_despacho_servicio_seguridad.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[table--servicios-formulario-respuestas|servicios.formulario_respuestas]] `references` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
