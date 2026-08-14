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

## Archivos

- `backend/src/shared/entities/marcacion-asistencia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-marcaciones-asistencia|operaciones.marcaciones_asistencia]]

## Referenciado por

<<<<<<< Updated upstream
- [[service--guardias-guardias|GuardiasService]] `uses` →
=======
>>>>>>> Stashed changes
- [[service--operaciones-eventos-asistencia|EventosAsistenciaService]] `uses` →
- [[service--operaciones-importaciones|ImportacionesService]] `uses` →
- [[service--operaciones-marcaciones|MarcacionesService]] `uses` →
- [[workflow--asistencia-a-evento|Evento de asistencia, participantes y marcaciones]] `affects` →
- [[workflow--importacion-marcador|Importacion de marcaciones desde el marcador digital]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
