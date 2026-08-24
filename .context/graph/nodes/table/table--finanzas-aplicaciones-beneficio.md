---
id: table--finanzas-aplicaciones-beneficio
tipo: TABLE
nombre: finanzas.aplicaciones_beneficio
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.aplicaciones_beneficio (10 columnas). Creada en 064_finanzas_beneficios_socios.sql.
tabla: aplicaciones_beneficio
archivos:
  - database/migrations/064_finanzas_beneficios_socios.sql
edges:
  - [defined_in, file--064-finanzas-beneficios-socios]
  - [belongs_to, domain--finanzas]
  - [references, table--finanzas-beneficios-socios]
  - [references, table--finanzas-socios-protectores]
  - [references, table--seguridad-usuarios]
terminos: [finanzas, aplicaciones, beneficio, socio, protector, ambito, referencia, monto, base, descuento, aplicado, final]
---

# finanzas.aplicaciones_beneficio

Tabla finanzas.aplicaciones_beneficio (10 columnas). Creada en 064_finanzas_beneficios_socios.sql.

- **Esquema:** finanzas · **Columnas:** 10

## Llaves foraneas

- `beneficio_id` → [[table--finanzas-beneficios-socios|finanzas.beneficios_socios]]
- `socio_protector_id` → [[table--finanzas-socios-protectores|finanzas.socios_protectores]]
- `aplicado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| beneficio_id | UNIQUEIDENTIFIER |
| socio_protector_id | UNIQUEIDENTIFIER |
| ambito | NVARCHAR(20) |
| referencia_id | UNIQUEIDENTIFIER |
| monto_base | DECIMAL(15,2) |
| descuento_aplicado | DECIMAL(15,2) |
| monto_final | DECIMAL(15,2) |
| aplicado_en | DATETIMEOFFSET(3) |
| aplicado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** BeneficiosSociosController
- **Servicios:** BeneficiosSociosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/064_finanzas_beneficios_socios.sql`

## Relaciones

- `defined_in` → [[file--064-finanzas-beneficios-socios|064_finanzas_beneficios_socios.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]
- `references` → [[table--finanzas-beneficios-socios|finanzas.beneficios_socios]]
- `references` → [[table--finanzas-socios-protectores|finanzas.socios_protectores]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--aplicacion-beneficio|AplicacionBeneficio]] `persisted_in` →
- [[service--finanzas-beneficios-socios|BeneficiosSociosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
