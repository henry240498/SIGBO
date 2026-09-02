---
id: table--deposito-ubicaciones
tipo: TABLE
nombre: deposito.ubicaciones
nivel: L2
dominio: deposito
resumen: Tabla deposito.ubicaciones (12 columnas). Creada en 041_deposito_estructura.sql.
tabla: ubicaciones
archivos:
  - database/migrations/041_deposito_estructura.sql
edges:
  - [defined_in, file--041-deposito-estructura]
  - [belongs_to, domain--deposito]
  - [references, table--organizacion-parametros]
  - [references, table--organizacion-cuarteles]
terminos: [deposito, ubicaciones, codigo, nombre, tipo, ubicacion, padre, cuartel, estado, institucion, creado, actualizado]
---

# deposito.ubicaciones

Tabla deposito.ubicaciones (12 columnas). Creada en 041_deposito_estructura.sql.

- **Esquema:** deposito · **Columnas:** 12

## Llaves foraneas

- `tipo_ubicacion_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `padre_id` → [[table--deposito-ubicaciones|deposito.ubicaciones]]
- `cuartel_id` → [[table--organizacion-cuarteles|organizacion.cuarteles]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(50) |
| nombre | NVARCHAR(150) |
| tipo_ubicacion_id | UNIQUEIDENTIFIER |
| padre_id | UNIQUEIDENTIFIER |
| cuartel_id | UNIQUEIDENTIFIER |
| estado | NVARCHAR(20) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`
- **Endpoints:** EntradasController, IntegracionDepositoController, UbicacionesDepositoController
- **Servicios:** EntradasService, IntegracionDepositoService, UbicacionesDepositoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/041_deposito_estructura.sql`

## Relaciones

- `defined_in` → [[file--041-deposito-estructura|041_deposito_estructura.sql]]
- `belongs_to` → [[domain--deposito|Depósito]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--organizacion-cuarteles|organizacion.cuarteles]]

## Referenciado por

- [[table--deposito-tenencias|deposito.tenencias]] `references` →
- [[table--deposito-movimientos|deposito.movimientos]] `references` →
- [[table--deposito-movimientos|deposito.movimientos]] `references` →
- [[table--deposito-entradas|deposito.entradas]] `references` →
- [[table--deposito-inventarios-fisicos|deposito.inventarios_fisicos]] `references` →
- [[table--deposito-mantenimientos|deposito.mantenimientos]] `references` →
- [[entity--ubicacion-deposito|UbicacionDeposito]] `persisted_in` →
- [[service--deposito-entradas|EntradasService]] `reads` →
- [[service--deposito-integracion-deposito|IntegracionDepositoService]] `reads` →
- [[service--deposito-ubicaciones-deposito|UbicacionesDepositoService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
