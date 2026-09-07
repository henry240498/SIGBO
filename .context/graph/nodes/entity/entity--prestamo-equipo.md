---
id: entity--prestamo-equipo
tipo: ENTITY
nombre: PrestamoEquipo
nivel: L1
dominio: equipos
resumen: Entidad PrestamoEquipo, persistida en equipos.prestamos_equipos.
tabla: equipos.prestamos_equipos
archivos:
  - backend/src/shared/entities/prestamo-equipo.entity.ts
edges:
  - [belongs_to, domain--equipos]
  - [persisted_in, table--equipos-prestamos-equipos]
terminos: [prestamo, equipo, prestamos, equipos, estado, prestado, devuelto, extraviado, daniado]
---

# PrestamoEquipo

Entidad PrestamoEquipo, persistida en equipos.prestamos_equipos.

- **Tabla:** [[table--equipos-prestamos-equipos|equipos.prestamos_equipos]]
- **Columnas mapeadas:** 9

## Estados y enumeraciones

- `EstadoPrestamoEquipo`: `PRESTADO` · `DEVUELTO` · `EXTRAVIADO` · `DANIADO`

## Donde se usa

- **Pantallas:** `/dashboard/academia`, `/dashboard/academia/[id]`, `/dashboard/academia/cursos-externos`, `/dashboard/academia/instructores-externos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/registro`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/ubicaciones`, `/dashboard/documentos/[id]`, `/dashboard/documentos/plantillas`, `/dashboard/equipos`, `/dashboard/equipos/[id]`, `/dashboard/equipos/categorias`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/socios-protectores`, `/dashboard/guardias/[id]`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/organizacion/ascensos`, `/dashboard/organizacion/cuarteles`, `/dashboard/organizacion/designaciones`, `/dashboard/organizacion/turnos`, `/dashboard/personal`, `/dashboard/personal/[id]`, `/dashboard/personal/nuevo`, `/dashboard/seguridad/usuarios`, `/dashboard/servicios/nuevo`, `/dashboard/vehiculos`, `/dashboard/vehiculos/[id]`, `/dashboard/vehiculos/checklist-items`
- **Endpoints:** BitacoraController, EquipamientoBomberoController, EquiposController
- **Servicios:** BitacoraService, EquipamientoBomberoService, EquiposService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/prestamo-equipo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--equipos|Equipos]]
- `persisted_in` → [[table--equipos-prestamos-equipos|equipos.prestamos_equipos]]

## Referenciado por

- [[service--equipos-equipamiento-bombero|EquipamientoBomberoService]] `uses` →
- [[service--equipos-equipos|EquiposService]] `uses` →
- [[service--guardias-bitacora|BitacoraService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
