---
id: table--organizacion-identidad-institucional
tipo: TABLE
nombre: organizacion.identidad_institucional
nivel: L2
dominio: organizacion
resumen: Tabla organizacion.identidad_institucional (26 columnas). Creada en 031_identidad_institucional.sql, modificada por 065_finanzas_facturacion.sql, 070_identidad_alineacion_titulo.sql.
tabla: identidad_institucional
archivos:
  - database/migrations/031_identidad_institucional.sql
  - database/migrations/065_finanzas_facturacion.sql
  - database/migrations/070_identidad_alineacion_titulo.sql
edges:
  - [defined_in, file--031-identidad-institucional]
  - [belongs_to, domain--organizacion]
terminos: [organizacion, identidad, institucional, nombre, institucion, direccion, mostrar, telefono, email, sitio, web, personeria, juridica, fecha, fundacion, logo, izquierda, url, derecha, lineas, destacadas, texto, pie, pagina, numero, generado, sigbo, actualizado, ruc, alineacion, titulo]
---

# organizacion.identidad_institucional

Tabla organizacion.identidad_institucional (26 columnas). Creada en 031_identidad_institucional.sql, modificada por 065_finanzas_facturacion.sql, 070_identidad_alineacion_titulo.sql.

- **Esquema:** organizacion · **Columnas:** 26

## Restricciones CHECK (reglas que la BD impone)

- `alineacion_titulo IN (N'IZQUIERDA', N'CENTRO', N'DERECHA')`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| nombre_institucion | NVARCHAR(200) |
| direccion | NVARCHAR(300) |
| mostrar_direccion | BIT |
| telefono | NVARCHAR(150) |
| mostrar_telefono | BIT |
| email | NVARCHAR(255) |
| mostrar_email | BIT |
| sitio_web | NVARCHAR(255) |
| mostrar_sitio_web | BIT |
| personeria_juridica | NVARCHAR(150) |
| mostrar_personeria | BIT |
| fecha_fundacion | DATE |
| mostrar_fecha_fundacion | BIT |
| logo_izquierda_url | NVARCHAR(MAX) |
| mostrar_logo_izquierda | BIT |
| logo_derecha_url | NVARCHAR(MAX) |
| mostrar_logo_derecha | BIT |
| lineas_destacadas | NVARCHAR(MAX) |
| texto_pie_pagina | NVARCHAR(500) |
| mostrar_numero_pagina | BIT |
| mostrar_generado_sigbo | BIT |
| actualizado_en | DATETIMEOFFSET(3) |
| actualizado_por | UNIQUEIDENTIFIER |
| ruc | NVARCHAR(30) |
| alineacion_titulo | NVARCHAR(20) |

## Donde se usa

- **Pantallas:** `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`, `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/documentos`, `/dashboard/organizacion/feriados`, `/dashboard/personal/[id]`
- **Endpoints:** IdentidadInstitucionalController, OrdenesGuardiaController, PlantillasController, ReportesAcademiaController, ReportesFinanzasController
- **Servicios:** IaToolsService, IdentidadInstitucionalService, OrdenesGuardiaService, PlantillasService, ReportesAcademiaService, ReportesFinanzasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/031_identidad_institucional.sql`
- `database/migrations/065_finanzas_facturacion.sql`
- `database/migrations/070_identidad_alineacion_titulo.sql`

## Relaciones

- `defined_in` → [[file--031-identidad-institucional|031_identidad_institucional.sql]]
- `belongs_to` → [[domain--organizacion|Organización Institucional]]

## Referenciado por

- [[entity--identidad-institucional|IdentidadInstitucional]] `persisted_in` →
- [[service--academia-reportes-academia|ReportesAcademiaService]] `reads` →
- [[service--documentos-plantillas|PlantillasService]] `reads` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `reads` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `reads` →
- [[service--ia-ia-tools|IaToolsService]] `reads` →
- [[service--organizacion-identidad-institucional|IdentidadInstitucionalService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
