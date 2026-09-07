---
id: table--finanzas-socios-historial-codigo
tipo: TABLE
nombre: finanzas.socios_historial_codigo
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.socios_historial_codigo (7 columnas). Creada en 062_finanzas_socios_protectores.sql.
tabla: socios_historial_codigo
archivos:
  - database/migrations/062_finanzas_socios_protectores.sql
edges:
  - [defined_in, file--062-finanzas-socios-protectores]
  - [belongs_to, domain--finanzas]
  - [references, table--finanzas-socios-protectores]
  - [references, table--seguridad-usuarios]
terminos: [finanzas, socios, historial, codigo, socio, protector, anterior, nuevo, motivo, fecha, cambio, cambiado]
---

# finanzas.socios_historial_codigo

Tabla finanzas.socios_historial_codigo (7 columnas). Creada en 062_finanzas_socios_protectores.sql.

- **Esquema:** finanzas · **Columnas:** 7

## Llaves foraneas

- `socio_protector_id` → [[table--finanzas-socios-protectores|finanzas.socios_protectores]]
- `cambiado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| socio_protector_id | UNIQUEIDENTIFIER |
| codigo_anterior | NVARCHAR(20) |
| codigo_nuevo | NVARCHAR(20) |
| motivo | NVARCHAR(MAX) |
| fecha_cambio | DATETIMEOFFSET(3) |
| cambiado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** SociosProtectoresController
- **Servicios:** SociosProtectoresService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/062_finanzas_socios_protectores.sql`

## Relaciones

- `defined_in` → [[file--062-finanzas-socios-protectores|062_finanzas_socios_protectores.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]
- `references` → [[table--finanzas-socios-protectores|finanzas.socios_protectores]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--socio-historial-codigo|SocioHistorialCodigo]] `persisted_in` →
- [[service--finanzas-socios-protectores|SociosProtectoresService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
