---
id: table--servicios-personal-servicio
tipo: TABLE
nombre: servicios.personal_servicio
nivel: L2
dominio: servicios
resumen: Tabla servicios.personal_servicio (10 columnas). Creada en 007_servicios.sql, modificada por 009_foreign_keys.sql, 093_centro_operaciones_incidentes.sql.
tabla: personal_servicio
archivos:
  - database/migrations/007_servicios.sql
  - database/migrations/009_foreign_keys.sql
  - database/migrations/093_centro_operaciones_incidentes.sql
edges:
  - [defined_in, file--007-servicios]
  - [belongs_to, domain--servicios]
terminos: [servicios, personal, servicio, bombero, rol, horas, observaciones, vehiculo, despacho, origen, zona, desde]
---

# servicios.personal_servicio

Tabla servicios.personal_servicio (10 columnas). Creada en 007_servicios.sql, modificada por 009_foreign_keys.sql, 093_centro_operaciones_incidentes.sql.

- **Esquema:** servicios · **Columnas:** 10
- **UNIQUE:** `servicio_id, bombero_id`

## Restricciones CHECK (reglas que la BD impone)

- `origen IS NULL OR origen IN ('TRIPULACION', 'AJUSTE', 'SOLICITUD')`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| servicio_id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| rol | NVARCHAR(50) |
| horas_servicio | INT |
| observaciones | NVARCHAR(MAX) |
| vehiculo_id | UNIQUEIDENTIFIER |
| despacho_id | UNIQUEIDENTIFIER |
| origen | NVARCHAR(12) |
| zona_desde | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** ConsultasCruzadasController, PerfilController
- **Servicios:** ConsultasCruzadasService, PerfilService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/007_servicios.sql`
- `database/migrations/009_foreign_keys.sql`
- `database/migrations/093_centro_operaciones_incidentes.sql`

## Relaciones

- `defined_in` → [[file--007-servicios|007_servicios.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[entity--personal-servicio|PersonalServicio]] `persisted_in` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `reads` →
- [[service--seguridad-perfil|PerfilService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
