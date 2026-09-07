---
id: entity--equipo
tipo: ENTITY
nombre: Equipo
nivel: L1
dominio: equipos
resumen: Entidad Equipo, persistida en equipos.equipos.
tabla: equipos.equipos
archivos:
  - backend/src/shared/entities/equipo.entity.ts
edges:
  - [belongs_to, domain--equipos]
  - [persisted_in, table--equipos-equipos]
terminos: [equipo, equipos, estado, operativo, mantenimiento, daniado, baja, prestado]
---

# Equipo

Entidad Equipo, persistida en equipos.equipos.

- **Tabla:** [[table--equipos-equipos|equipos.equipos]]
- **Columnas mapeadas:** 19

## Estados y enumeraciones

- `EstadoEquipo`: `OPERATIVO` · `EN_MANTENIMIENTO` · `DANIADO` · `BAJA` · `PRESTADO`

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/registro`, `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/documentos/[id]`, `/dashboard/documentos/plantillas`, `/dashboard/equipos`, `/dashboard/equipos/[id]`, `/dashboard/equipos/categorias`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/socios-protectores`, `/dashboard/guardias/[id]`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/organizacion/ascensos`, `/dashboard/organizacion/cuarteles`, `/dashboard/organizacion/designaciones`, `/dashboard/organizacion/turnos`, `/dashboard/personal`, `/dashboard/personal/[id]`, `/dashboard/personal/nuevo`, `/dashboard/seguridad/usuarios`, `/dashboard/servicios/nuevo`, `/dashboard/vehiculos`, `/dashboard/vehiculos/[id]`, `/dashboard/vehiculos/checklist-items`
- **Endpoints:** BajasController, ConsultasDepositoController, EntradasController, EquipamientoBomberoController, EquiposController, InspeccionesMovilController, IntegracionDepositoController, MantenimientosController, MovimientosDepositoController, PrestamosController
- **Servicios:** BajasService, ConsultasDepositoService, EntradasService, EquipamientoBomberoService, EquiposService, IaToolsService, InspeccionesMovilService, IntegracionDepositoService, MantenimientosService, MovimientosDepositoService, PrestamosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/equipo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--equipos|Equipos]]
- `persisted_in` → [[table--equipos-equipos|equipos.equipos]]

## Referenciado por

- [[service--deposito-bajas|BajasService]] `uses` →
- [[service--deposito-consultas-deposito|ConsultasDepositoService]] `uses` →
- [[service--deposito-entradas|EntradasService]] `uses` →
- [[service--deposito-integracion-deposito|IntegracionDepositoService]] `uses` →
- [[service--deposito-mantenimientos|MantenimientosService]] `uses` →
- [[service--deposito-movimientos-deposito|MovimientosDepositoService]] `uses` →
- [[service--deposito-prestamos|PrestamosService]] `uses` →
- [[service--equipos-equipamiento-bombero|EquipamientoBomberoService]] `uses` →
- [[service--equipos-equipos|EquiposService]] `uses` →
- [[service--guardias-inspecciones-movil|InspeccionesMovilService]] `uses` →
- [[service--ia-ia-tools|IaToolsService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
