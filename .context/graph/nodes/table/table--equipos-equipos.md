---
id: table--equipos-equipos
tipo: TABLE
nombre: equipos.equipos
nivel: L2
dominio: equipos
resumen: Tabla equipos.equipos (22 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 009_foreign_keys.sql, 024_equipos.sql.
tabla: equipos
archivos:
  - database/migrations/006_vehiculos_equipos.sql
  - database/migrations/009_foreign_keys.sql
  - database/migrations/024_equipos.sql
edges:
  - [defined_in, file--006-vehiculos-equipos]
  - [belongs_to, domain--equipos]
terminos: [equipos, categoria, codigo, interno, nombre, descripcion, marca, modelo, numero, serie, estado, ubicacion, responsable, fecha, compra, vencimiento, vida, util, meses, code, fotos, documentos, metadata, creado, actualizado, vehiculo, asignado, tipo]
---

# equipos.equipos

Tabla equipos.equipos (22 columnas). Creada en 006_vehiculos_equipos.sql, modificada por 009_foreign_keys.sql, 024_equipos.sql.

- **Esquema:** equipos · **Columnas:** 22
- **UNIQUE:** `codigo_interno`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| categoria_id | UNIQUEIDENTIFIER |
| codigo_interno | NVARCHAR(50) |
| nombre | NVARCHAR(200) |
| descripcion | NVARCHAR(MAX) |
| marca | NVARCHAR(100) |
| modelo | NVARCHAR(100) |
| numero_serie | NVARCHAR(100) |
| estado | NVARCHAR(20) |
| ubicacion | NVARCHAR(200) |
| responsable_id | UNIQUEIDENTIFIER |
| fecha_compra | DATE |
| fecha_vencimiento | DATE |
| vida_util_meses | INT |
| qr_code | NVARCHAR(200) |
| fotos | NVARCHAR(MAX) |
| documentos | NVARCHAR(MAX) |
| metadata | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| vehiculo_asignado_id | UNIQUEIDENTIFIER |
| ubicacion_tipo | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/registro`, `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/documentos/[id]`, `/dashboard/documentos/plantillas`, `/dashboard/equipos`, `/dashboard/equipos/[id]`, `/dashboard/equipos/categorias`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/socios-protectores`, `/dashboard/guardias/[id]`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/organizacion/ascensos`, `/dashboard/organizacion/cuarteles`, `/dashboard/organizacion/designaciones`, `/dashboard/organizacion/turnos`, `/dashboard/personal`, `/dashboard/personal/[id]`, `/dashboard/personal/nuevo`, `/dashboard/seguridad/usuarios`, `/dashboard/servicios/nuevo`, `/dashboard/vehiculos`, `/dashboard/vehiculos/[id]`, `/dashboard/vehiculos/checklist-items`
- **Endpoints:** BajasController, ConsultasDepositoController, EntradasController, EquipamientoBomberoController, EquiposController, InspeccionesMovilController, IntegracionDepositoController, MantenimientosController, MovimientosDepositoController, PrestamosController
- **Servicios:** BajasService, ConsultasDepositoService, EntradasService, EquipamientoBomberoService, EquiposService, IaToolsService, InspeccionesMovilService, IntegracionDepositoService, MantenimientosService, MovimientosDepositoService, PrestamosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/006_vehiculos_equipos.sql`
- `database/migrations/009_foreign_keys.sql`
- `database/migrations/024_equipos.sql`

## Relaciones

- `defined_in` → [[file--006-vehiculos-equipos|006_vehiculos_equipos.sql]]
- `belongs_to` → [[domain--equipos|Equipos]]

## Referenciado por

- [[table--deposito-tenencias|deposito.tenencias]] `references` →
- [[table--deposito-movimientos|deposito.movimientos]] `references` →
- [[table--deposito-entrada-items|deposito.entrada_items]] `references` →
- [[table--deposito-bajas|deposito.bajas]] `references` →
- [[table--deposito-prestamo-items|deposito.prestamo_items]] `references` →
- [[table--deposito-inventario-fisico-items|deposito.inventario_fisico_items]] `references` →
- [[table--deposito-incidencias|deposito.incidencias]] `references` →
- [[table--deposito-mantenimientos|deposito.mantenimientos]] `references` →
- [[entity--equipo|Equipo]] `persisted_in` →
- [[service--deposito-bajas|BajasService]] `reads` →
- [[service--deposito-consultas-deposito|ConsultasDepositoService]] `reads` →
- [[service--deposito-entradas|EntradasService]] `reads` →
- [[service--deposito-integracion-deposito|IntegracionDepositoService]] `reads` →
- [[service--deposito-mantenimientos|MantenimientosService]] `reads` →
- [[service--deposito-movimientos-deposito|MovimientosDepositoService]] `reads` →
- [[service--deposito-prestamos|PrestamosService]] `reads` →
- [[service--equipos-equipamiento-bombero|EquipamientoBomberoService]] `reads` →
- [[service--equipos-equipos|EquiposService]] `reads` →
- [[service--guardias-inspecciones-movil|InspeccionesMovilService]] `reads` →
- [[service--ia-ia-tools|IaToolsService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
