---
id: entity--historial-institucional
tipo: ENTITY
nombre: HistorialInstitucional
nivel: L1
dominio: personal
resumen: Entidad HistorialInstitucional, persistida en personal.historial_institucional.
tabla: personal.historial_institucional
archivos:
  - backend/src/shared/entities/historial-institucional.entity.ts
edges:
  - [belongs_to, domain--personal]
  - [persisted_in, table--personal-historial-institucional]
terminos: [historial, institucional, personal, tipo, movimiento, ingreso, ascenso, cambio, rango, cargo, compania, condicion, codigo, licencia, suspension, reconocimiento, sancion, retiro]
---

# HistorialInstitucional

Entidad HistorialInstitucional, persistida en personal.historial_institucional.

- **Tabla:** [[table--personal-historial-institucional|personal.historial_institucional]]
- **Columnas mapeadas:** 9

## Estados y enumeraciones

- `TipoMovimientoInstitucional`: `INGRESO` · `ASCENSO` · `CAMBIO_RANGO` · `CAMBIO_CARGO` · `CAMBIO_COMPANIA` · `CAMBIO_CONDICION` · `CAMBIO_CODIGO` · `LICENCIA` · `SUSPENSION` · `RECONOCIMIENTO` · `SANCION` · `RETIRO`

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** BomberosController, CondicionController, FojaServicioController, HistorialInstitucionalController
- **Servicios:** BomberosService, CondicionService, FojaServicioService, HistorialInstitucionalService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/historial-institucional.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-historial-institucional|personal.historial_institucional]]

## Referenciado por

- [[service--personal-bomberos|BomberosService]] `uses` →
- [[service--personal-condicion|CondicionService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →
- [[service--personal-historial-institucional|HistorialInstitucionalService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
