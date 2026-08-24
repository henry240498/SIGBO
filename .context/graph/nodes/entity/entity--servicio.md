---
id: entity--servicio
tipo: ENTITY
nombre: Servicio
nivel: L1
dominio: servicios
resumen: Registro de cada servicio/intervencion (schema servicios).
tabla: servicios.servicios
archivos:
  - backend/src/shared/entities/servicio.entity.ts
edges:
  - [belongs_to, domain--servicios]
  - [persisted_in, table--servicios-servicios]
terminos: [servicio, servicios, gravedad, leve, moderada, grave, critica, estado, registrado, despachado, curso, finalizado, cancelado]
---

# Servicio

Registro de cada servicio/intervencion (schema servicios).

- **Tabla:** [[table--servicios-servicios|servicios.servicios]]
- **Columnas mapeadas:** 27

## Estados y enumeraciones

- `GravedadServicio`: `LEVE` · `MODERADA` · `GRAVE` · `CRITICA`
- `EstadoServicio`: `REGISTRADO` · `DESPACHADO` · `EN_CURSO` · `FINALIZADO` · `CANCELADO`

## Donde se usa

- **Pantallas:** `/`, `/dashboard/denuncias`, `/dashboard/denuncias/[id]`, `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/equipos/[id]`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/personal/[id]`, `/dashboard/publicaciones`, `/dashboard/servicios`, `/dashboard/servicios/nuevo`, `/dashboard/vehiculos`, `/dashboard/vehiculos/[id]`, `/dashboard/vehiculos/checklist-items`
- **Endpoints:** BitacoraController, ConsultasCruzadasController, DenunciasController, DenunciasPublicasController, IntegracionDepositoController, PublicacionesController, ServiciosController, VehiculosController
- **Servicios:** BitacoraService, ConsultasCruzadasService, DenunciasService, IaToolsService, IntegracionDepositoService, PublicacionesService, ServiciosService, VehiculosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/servicio.entity.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `persisted_in` → [[table--servicios-servicios|servicios.servicios]]

## Referenciado por

- [[service--denuncias-denuncias|DenunciasService]] `uses` →
- [[service--deposito-integracion-deposito|IntegracionDepositoService]] `uses` →
- [[service--guardias-bitacora|BitacoraService]] `uses` →
- [[service--ia-ia-tools|IaToolsService]] `uses` →
- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `uses` →
- [[service--publicaciones-publicaciones|PublicacionesService]] `uses` →
- [[service--servicios-servicios|ServiciosService]] `uses` →
- [[service--vehiculos-vehiculos|VehiculosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
