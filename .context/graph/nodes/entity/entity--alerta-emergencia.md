---
id: entity--alerta-emergencia
tipo: ENTITY
nombre: AlertaEmergencia
nivel: L1
dominio: servicios
resumen: "Solicitud inmediata de apoyo o de chofer emitida desde la app movil. Trazabilidad normativa (docs/REGLAMENTO_GENERAL_CBVC_TRAZABILIDAD.md): - Radio y comunicaciones, Arts. 249-258: la radio operadora registra la llamada, la direccion, el despacho y el APOYO SOLICITADO. La alerta de tipo SOLICITUD_APOYO es la version movil de ese registro. - Vehiculos y conductores, Arts. 230-248: el conductor por guardia debe estar autorizado y con licencia vigente. SOLICITUD_CHOFER pide ese rol. - Servicios y mando operativo, Arts. 5-8 y 220-227: mando unico y personal habilitado; la alerta solo REGISTRA el hecho (quien, que, cuando). Atender o cancelar la registra quien corresponda y queda en auditoria; el sistema no decide por si solo consecuencias disciplinarias u operativas. Reutiliza: Usuario (solicitante), AuditoriaService (historial inmutable) y los permisos existentes servicios:crear / servicios:ver / servicios:editar, para no crear un sistema de autorizacion paralelo."
tabla: servicios.alertas_emergencia
archivos:
  - backend/src/shared/entities/alerta-emergencia.entity.ts
edges:
  - [belongs_to, domain--servicios]
  - [persisted_in, table--servicios-alertas-emergencia]
terminos: [alerta, emergencia, alertas, servicios, tipo, solicitud, apoyo, chofer, estado, pendiente, atendida, cancelada]
---

# AlertaEmergencia

Solicitud inmediata de apoyo o de chofer emitida desde la app movil. Trazabilidad normativa (docs/REGLAMENTO_GENERAL_CBVC_TRAZABILIDAD.md): - Radio y comunicaciones, Arts. 249-258: la radio operadora registra la llamada, la direccion, el despacho y el APOYO SOLICITADO. La alerta de tipo SOLICITUD_APOYO es la version movil de ese registro. - Vehiculos y conductores, Arts. 230-248: el conductor por guardia debe estar autorizado y con licencia vigente. SOLICITUD_CHOFER pide ese rol. - Servicios y mando operativo, Arts. 5-8 y 220-227: mando unico y personal habilitado; la alerta solo REGISTRA el hecho (quien, que, cuando). Atender o cancelar la registra quien corresponda y queda en auditoria; el sistema no decide por si solo consecuencias disciplinarias u operativas. Reutiliza: Usuario (solicitante), AuditoriaService (historial inmutable) y los permisos existentes servicios:crear / servicios:ver / servicios:editar, para no crear un sistema de autorizacion paralelo.

- **Tabla:** [[table--servicios-alertas-emergencia|servicios.alertas_emergencia]]
- **Columnas mapeadas:** 12

## Estados y enumeraciones

- `TipoAlertaEmergencia`: `SOLICITUD_APOYO` · `SOLICITUD_CHOFER`
- `EstadoAlertaEmergencia`: `PENDIENTE` · `ATENDIDA` · `CANCELADA`

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** AlertasController
- **Servicios:** AlertasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/alerta-emergencia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `persisted_in` → [[table--servicios-alertas-emergencia|servicios.alertas_emergencia]]

## Referenciado por

- [[service--alertas-alertas|AlertasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
