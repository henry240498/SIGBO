---
id: table--finanzas-socios-protectores
tipo: TABLE
nombre: finanzas.socios_protectores
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.socios_protectores (28 columnas). Creada en 062_finanzas_socios_protectores.sql.
tabla: socios_protectores
archivos:
  - database/migrations/062_finanzas_socios_protectores.sql
edges:
  - [defined_in, file--062-finanzas-socios-protectores]
  - [belongs_to, domain--finanzas]
  - [references, table--personal-bomberos]
  - [references, table--organizacion-parametros]
  - [references, table--organizacion-parametros]
  - [references, table--organizacion-parametros]
  - [references, table--organizacion-parametros]
  - [references, table--organizacion-parametros]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
terminos: [finanzas, socios, protectores, codigo, tipo, persona, bombero, nombre, apellido, fecha, nacimiento, razon, social, ruc, comercial, representante, telefono, celular, email, direccion, pais, departamento, ciudad, barrio, estado, observaciones, institucion, creado, actualizado]
---

# finanzas.socios_protectores

Tabla finanzas.socios_protectores (28 columnas). Creada en 062_finanzas_socios_protectores.sql.

- **Esquema:** finanzas · **Columnas:** 28
- **UNIQUE:** `codigo`

## Llaves foraneas

- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]
- `pais_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `departamento_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `ciudad_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `barrio_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `estado_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `actualizado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(20) |
| tipo_persona | NVARCHAR(10) |
| bombero_id | UNIQUEIDENTIFIER |
| nombre | NVARCHAR(100) |
| apellido | NVARCHAR(100) |
| ci | NVARCHAR(20) |
| fecha_nacimiento | DATE |
| razon_social | NVARCHAR(200) |
| ruc | NVARCHAR(30) |
| nombre_comercial | NVARCHAR(200) |
| representante_nombre | NVARCHAR(150) |
| representante_ci | NVARCHAR(20) |
| telefono | NVARCHAR(20) |
| celular | NVARCHAR(20) |
| email | NVARCHAR(255) |
| direccion | NVARCHAR(300) |
| pais_id | UNIQUEIDENTIFIER |
| departamento_id | UNIQUEIDENTIFIER |
| ciudad_id | UNIQUEIDENTIFIER |
| barrio_id | UNIQUEIDENTIFIER |
| estado_id | UNIQUEIDENTIFIER |
| observaciones | NVARCHAR(MAX) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** AcuerdosAporteController, AportesController, BeneficiosSociosController, DashboardFinanzasController, InscripcionesAcademiaController, SociosProtectoresController
- **Servicios:** AcuerdosAporteService, AportesService, BeneficiosSociosService, DashboardFinanzasService, InscripcionesAcademiaService, SociosProtectoresService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/062_finanzas_socios_protectores.sql`

## Relaciones

- `defined_in` → [[file--062-finanzas-socios-protectores|062_finanzas_socios_protectores.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--finanzas-socios-historial-codigo|finanzas.socios_historial_codigo]] `references` →
- [[table--finanzas-acuerdos-aporte|finanzas.acuerdos_aporte]] `references` →
- [[table--finanzas-aportes|finanzas.aportes]] `references` →
- [[table--finanzas-aplicaciones-beneficio|finanzas.aplicaciones_beneficio]] `references` →
- [[table--finanzas-facturas|finanzas.facturas]] `references` →
- [[entity--socio-protector|SocioProtector]] `persisted_in` →
- [[service--academia-inscripciones-academia|InscripcionesAcademiaService]] `reads` →
- [[service--finanzas-acuerdos-aporte|AcuerdosAporteService]] `reads` →
- [[service--finanzas-aportes|AportesService]] `reads` →
- [[service--finanzas-beneficios-socios|BeneficiosSociosService]] `reads` →
- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `reads` →
- [[service--finanzas-socios-protectores|SociosProtectoresService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
