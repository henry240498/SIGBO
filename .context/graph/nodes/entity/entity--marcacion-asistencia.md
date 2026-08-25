---
id: entity--marcacion-asistencia
tipo: ENTITY
nombre: MarcacionAsistencia
nivel: L1
dominio: asistencia
resumen: "Marcacion fisica de entrada/salida del cuartel. `eventoId` es opcional: marcar presencia es una accion general, independiente de que exista un evento puntual (la relacion con eventos se calcula por solapamiento de horarios, no se fuerza). Preserva el dato original cuando proviene de una importacion de Excel (auditoria, seccion 16 del pedido de Asistencia)."
tabla: operaciones.marcaciones_asistencia
archivos:
  - backend/src/shared/entities/marcacion-asistencia.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-marcaciones-asistencia]
terminos: [marcacion, asistencia, marcaciones, operaciones, tipo, entrada, salida, metodo, huella, pin, rfid, manual, fuente, marcador, digital, importacion, excel, evento, guardia, otro]
---

# MarcacionAsistencia

Marcacion fisica de entrada/salida del cuartel. `eventoId` es opcional: marcar presencia es una accion general, independiente de que exista un evento puntual (la relacion con eventos se calcula por solapamiento de horarios, no se fuerza). Preserva el dato original cuando proviene de una importacion de Excel (auditoria, seccion 16 del pedido de Asistencia).

- **Tabla:** [[table--operaciones-marcaciones-asistencia|operaciones.marcaciones_asistencia]]
- **Columnas mapeadas:** 20

## Estados y enumeraciones

- `TipoMarcacion`: `ENTRADA` · `SALIDA`
- `MetodoMarcacion`: `HUELLA` · `QR` · `PIN` · `RFID` · `MANUAL` · `APP`
- `FuenteAsistencia`: `MARCADOR_DIGITAL` · `MANUAL` · `IMPORTACION_EXCEL` · `EVENTO` · `GUARDIA` · `OTRO`

## Donde se usa

- **Pantallas:** `/dashboard/academia/[id]`, `/dashboard/asistencia`, `/dashboard/asistencia/eventos`, `/dashboard/asistencia/eventos/[id]`, `/dashboard/asistencia/externos`, `/dashboard/asistencia/registro`, `/dashboard/asistencia/tolerancias`, `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`, `/dashboard/organizacion/guardias/planificacion`, `/dashboard/personal/[id]`
- **Endpoints:** BitacoraController, EventosAsistenciaController, GuardiasController, ImportacionesController, MarcacionesController
- **Servicios:** BitacoraService, EventosAsistenciaService, GuardiasService, IaToolsService, ImportacionesService, MarcacionesService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/marcacion-asistencia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-marcaciones-asistencia|operaciones.marcaciones_asistencia]]

## Referenciado por

- [[service--guardias-bitacora|BitacoraService]] `uses` →
- [[service--guardias-guardias|GuardiasService]] `uses` →
- [[service--ia-ia-tools|IaToolsService]] `uses` →
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `uses` →
- [[service--operaciones-importaciones|ImportacionesService]] `uses` →
- [[service--operaciones-marcaciones|MarcacionesService]] `uses` →
- [[workflow--asistencia-a-evento|Evento de asistencia, participantes y marcaciones]] `affects` →
- [[workflow--importacion-marcador|Importacion de marcaciones desde el marcador digital]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
