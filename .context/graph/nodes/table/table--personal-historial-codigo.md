---
id: table--personal-historial-codigo
tipo: TABLE
nombre: personal.historial_codigo
nivel: L2
dominio: personal
resumen: Tabla personal.historial_codigo (7 columnas). Creada en 016_personal_expansion.sql.
tabla: historial_codigo
archivos:
  - database/migrations/016_personal_expansion.sql
edges:
  - [defined_in, file--016-personal-expansion]
  - [belongs_to, domain--personal]
  - [references, table--personal-bomberos]
terminos: [personal, historial, codigo, bombero, anterior, nuevo, motivo, fecha, cambio, cambiado]
---

# personal.historial_codigo

Tabla personal.historial_codigo (7 columnas). Creada en 016_personal_expansion.sql.

- **Esquema:** personal · **Columnas:** 7

## Llaves foraneas

- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| codigo_anterior | NVARCHAR(20) |
| codigo_nuevo | NVARCHAR(20) |
| motivo | NVARCHAR(MAX) |
| fecha_cambio | DATETIMEOFFSET(3) |
| cambiado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** BomberosController
- **Servicios:** BomberosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/016_personal_expansion.sql`

## Relaciones

- `defined_in` → [[file--016-personal-expansion|016_personal_expansion.sql]]
- `belongs_to` → [[domain--personal|Personal]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[entity--historial-codigo|HistorialCodigo]] `persisted_in` →
- [[service--personal-bomberos|BomberosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
