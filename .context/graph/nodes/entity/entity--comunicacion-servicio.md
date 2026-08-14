---
id: entity--comunicacion-servicio
tipo: ENTITY
nombre: ComunicacionServicio
nivel: L1
dominio: servicios
resumen: Formulario digital completo vinculado a un servicio operativo.
tabla: servicios.comunicaciones_servicio
archivos:
  - backend/src/shared/entities/comunicacion-servicio.entity.ts
edges:
  - [belongs_to, domain--servicios]
  - [persisted_in, table--servicios-comunicaciones-servicio]
terminos: [comunicacion, servicio, comunicaciones, servicios, tipo, otras, ocurrencias, incendio, estado, borrador, pendiente, revision, observado, finalizada, anulado]
---

# ComunicacionServicio

Formulario digital completo vinculado a un servicio operativo.

- **Tabla:** [[table--servicios-comunicaciones-servicio|servicios.comunicaciones_servicio]]
- **Columnas mapeadas:** 9

## Estados y enumeraciones

- `TipoComunicacionServicio`: `OTRAS_OCURRENCIAS` · `INCENDIO`
- `EstadoComunicacionServicio`: `BORRADOR` · `PENDIENTE_REVISION` · `OBSERVADO` · `FINALIZADA` · `ANULADO`

## Donde se usa

- **Pantallas:** `/dashboard/denuncias`, `/dashboard/denuncias/[id]`, `/dashboard/servicios`, `/dashboard/servicios/nuevo`
- **Endpoints:** DenunciasController, DenunciasPublicasController, ServiciosController
- **Servicios:** DenunciasService, ServiciosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/comunicacion-servicio.entity.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `persisted_in` → [[table--servicios-comunicaciones-servicio|servicios.comunicaciones_servicio]]

## Referenciado por

- [[service--denuncias-denuncias|DenunciasService]] `uses` →
- [[service--servicios-servicios|ServiciosService]] `uses` →
- [[decision--comunicacion-como-json|La comunicacion de servicio se guarda como documento JSON validado]] `affects` →
- [[rule--una-comunicacion-por-servicio|Un servicio tiene como maximo una comunicacion, y borrar el servicio la borra]] `affects` →
- [[workflow--comunicacion-de-servicio|Ciclo de vida de la comunicacion de servicio]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
