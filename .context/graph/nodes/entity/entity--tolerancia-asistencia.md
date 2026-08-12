---
id: entity--tolerancia-asistencia
tipo: ENTITY
nombre: ToleranciaAsistencia
nivel: L1
dominio: asistencia
resumen: "Reglas de tolerancia de horario parametrizables por tipo de evento (NULL = regla general por defecto) -- nunca codificadas rigidamente en el backend."
tabla: operaciones.tolerancias_asistencia
archivos:
  - backend/src/shared/entities/tolerancia-asistencia.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-tolerancias-asistencia]
terminos: [tolerancia, asistencia, tolerancias, operaciones]
---

# ToleranciaAsistencia

Reglas de tolerancia de horario parametrizables por tipo de evento (NULL = regla general por defecto) -- nunca codificadas rigidamente en el backend.

- **Tabla:** [[table--operaciones-tolerancias-asistencia|operaciones.tolerancias_asistencia]]
- **Columnas mapeadas:** 5

## Archivos

- `backend/src/shared/entities/tolerancia-asistencia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-tolerancias-asistencia|operaciones.tolerancias_asistencia]]

## Referenciado por

- [[service--operaciones-tolerancias|ToleranciasService]] `uses` →
- [[decision--tolerancias-parametrizables|Las reglas de asistencia son datos parametrizables, no constantes de codigo]] `affects` →
- [[rule--tolerancia-null-es-la-general|La tolerancia con tipoEventoId NULL es la regla general por defecto]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
