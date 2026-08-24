---
id: entity--vehiculo
tipo: ENTITY
nombre: Vehiculo
nivel: L1
dominio: vehiculos
resumen: Entidad Vehiculo, persistida en vehiculos.vehiculos.
tabla: vehiculos.vehiculos
archivos:
  - backend/src/shared/entities/vehiculo.entity.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [persisted_in, table--vehiculos-vehiculos]
terminos: [vehiculo, vehiculos, estado, operativo, mantenimiento, fuera, servicio, baja]
---

# Vehiculo

Entidad Vehiculo, persistida en vehiculos.vehiculos.

- **Tabla:** [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- **Columnas mapeadas:** 32

## Estados y enumeraciones

- `EstadoVehiculo`: `OPERATIVO` · `EN_MANTENIMIENTO` · `FUERA_SERVICIO` · `BAJA`

## Donde se usa

- **Pantallas:** `/`, `/dashboard/denuncias`, `/dashboard/denuncias/[id]`, `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/equipos`, `/dashboard/equipos/[id]`, `/dashboard/equipos/categorias`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/personal/[id]`, `/dashboard/publicaciones`, `/dashboard/servicios`, `/dashboard/servicios/nuevo`, `/dashboard/vehiculos`, `/dashboard/vehiculos/[id]`, `/dashboard/vehiculos/checklist-items`
- **Endpoints:** DenunciasController, DenunciasPublicasController, EquiposController, InspeccionesMovilController, IntegracionDepositoController, PublicacionesController, ServiciosController, VehiculosAutorizadosController, VehiculosController
- **Servicios:** DenunciasService, EquiposService, IaToolsService, InspeccionesMovilService, IntegracionDepositoService, PublicacionesService, ServiciosService, VehiculosAutorizadosService, VehiculosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/vehiculo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `persisted_in` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]

## Referenciado por

- [[service--denuncias-denuncias|DenunciasService]] `uses` →
- [[service--deposito-integracion-deposito|IntegracionDepositoService]] `uses` →
- [[service--equipos-equipos|EquiposService]] `uses` →
- [[service--guardias-inspecciones-movil|InspeccionesMovilService]] `uses` →
- [[service--ia-ia-tools|IaToolsService]] `uses` →
- [[service--publicaciones-publicaciones|PublicacionesService]] `uses` →
- [[service--servicios-servicios|ServiciosService]] `uses` →
- [[service--vehiculos-vehiculos-autorizados|VehiculosAutorizadosService]] `uses` →
- [[service--vehiculos-vehiculos|VehiculosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
