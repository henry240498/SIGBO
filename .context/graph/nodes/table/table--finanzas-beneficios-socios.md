---
id: table--finanzas-beneficios-socios
tipo: TABLE
nombre: finanzas.beneficios_socios
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.beneficios_socios (18 columnas). Creada en 064_finanzas_beneficios_socios.sql.
tabla: beneficios_socios
archivos:
  - database/migrations/064_finanzas_beneficios_socios.sql
edges:
  - [defined_in, file--064-finanzas-beneficios-socios]
  - [belongs_to, domain--finanzas]
  - [references, table--organizacion-parametros]
  - [references, table--academia-actividades]
  - [references, table--servicios-tipos-servicio]
  - [references, table--seguridad-usuarios]
terminos: [finanzas, beneficios, socios, nombre, tipo, porcentaje, descuento, monto, fijo, ambito, actividad, academica, servicio, fecha, inicio, fin, estado, condiciones, observaciones, institucion, creado, actualizado]
---

# finanzas.beneficios_socios

Tabla finanzas.beneficios_socios (18 columnas). Creada en 064_finanzas_beneficios_socios.sql.

- **Esquema:** finanzas · **Columnas:** 18

## Llaves foraneas

- `tipo_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `actividad_academica_id` → [[table--academia-actividades|academia.actividades]]
- `tipo_servicio_id` → [[table--servicios-tipos-servicio|servicios.tipos_servicio]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(150) |
| tipo_id | UNIQUEIDENTIFIER |
| porcentaje_descuento | DECIMAL(5,2) |
| monto_fijo_descuento | DECIMAL(15,2) |
| ambito | NVARCHAR(20) |
| actividad_academica_id | UNIQUEIDENTIFIER |
| tipo_servicio_id | UNIQUEIDENTIFIER |
| fecha_inicio | DATE |
| fecha_fin | DATE |
| estado | NVARCHAR(20) |
| condiciones | NVARCHAR(MAX) |
| observaciones | NVARCHAR(MAX) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

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
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--academia-actividades|academia.actividades]]
- `references` → [[table--servicios-tipos-servicio|servicios.tipos_servicio]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--finanzas-aplicaciones-beneficio|finanzas.aplicaciones_beneficio]] `references` →
- [[entity--beneficio-socio|BeneficioSocio]] `persisted_in` →
- [[service--finanzas-beneficios-socios|BeneficiosSociosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
