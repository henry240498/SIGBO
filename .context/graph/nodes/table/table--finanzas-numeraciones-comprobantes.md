---
id: table--finanzas-numeraciones-comprobantes
tipo: TABLE
nombre: finanzas.numeraciones_comprobantes
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.numeraciones_comprobantes (15 columnas). Creada en 065_finanzas_facturacion.sql.
tabla: numeraciones_comprobantes
archivos:
  - database/migrations/065_finanzas_facturacion.sql
edges:
  - [defined_in, file--065-finanzas-facturacion]
  - [belongs_to, domain--finanzas]
  - [references, table--organizacion-parametros]
  - [references, table--seguridad-usuarios]
terminos: [finanzas, numeraciones, comprobantes, tipo, comprobante, establecimiento, punto, expedicion, serie, timbrado, numeracion, desde, hasta, ultimo, numero, vigencia, estado, institucion, creado]
---

# finanzas.numeraciones_comprobantes

Tabla finanzas.numeraciones_comprobantes (15 columnas). Creada en 065_finanzas_facturacion.sql.

- **Esquema:** finanzas · **Columnas:** 15

## Llaves foraneas

- `tipo_comprobante_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| tipo_comprobante_id | UNIQUEIDENTIFIER |
| establecimiento | NVARCHAR(3) |
| punto_expedicion | NVARCHAR(3) |
| serie | NVARCHAR(10) |
| timbrado | NVARCHAR(20) |
| numeracion_desde | INT |
| numeracion_hasta | INT |
| ultimo_numero | INT |
| vigencia_desde | DATE |
| vigencia_hasta | DATE |
| estado | NVARCHAR(20) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** NumeracionesComprobantesController
- **Servicios:** NumeracionesComprobantesService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/065_finanzas_facturacion.sql`

## Relaciones

- `defined_in` → [[file--065-finanzas-facturacion|065_finanzas_facturacion.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--numeracion-comprobante|NumeracionComprobante]] `persisted_in` →
- [[service--finanzas-numeraciones-comprobantes|NumeracionesComprobantesService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
