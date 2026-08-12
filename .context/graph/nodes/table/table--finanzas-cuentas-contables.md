---
id: table--finanzas-cuentas-contables
tipo: TABLE
nombre: finanzas.cuentas_contables
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.cuentas_contables (7 columnas). Creada en 008_admin.sql.
tabla: cuentas_contables
archivos:
  - database/migrations/008_admin.sql
edges:
  - [defined_in, file--008-admin]
  - [belongs_to, domain--finanzas]
terminos: [finanzas, cuentas, contables, codigo, nombre, tipo, descripcion, activa, creado]
---

# finanzas.cuentas_contables

Tabla finanzas.cuentas_contables (7 columnas). Creada en 008_admin.sql.

- **Esquema:** finanzas · **Columnas:** 7
- **UNIQUE:** `codigo`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(20) |
| nombre | NVARCHAR(200) |
| tipo | NVARCHAR(20) |
| descripcion | NVARCHAR(MAX) |
| activa | BIT |
| creado_en | DATETIMEOFFSET(3) |

## Archivos

- `database/migrations/008_admin.sql`

## Relaciones

- `defined_in` → [[file--008-admin|008_admin.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
