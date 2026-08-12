---
id: entity--certificacion
tipo: ENTITY
nombre: Certificacion
nivel: L1
dominio: personal
resumen: Entidad Certificacion, persistida en personal.certificaciones.
tabla: personal.certificaciones
archivos:
  - backend/src/shared/entities/certificacion.entity.ts
edges:
  - [belongs_to, domain--personal]
  - [persisted_in, table--personal-certificaciones]
terminos: [certificacion, certificaciones, personal, tipo, basico, intermedio, avanzado, especialidad, curso, seminario, taller, entrenamiento]
---

# Certificacion

Entidad Certificacion, persistida en personal.certificaciones.

- **Tabla:** [[table--personal-certificaciones|personal.certificaciones]]
- **Columnas mapeadas:** 11

## Estados y enumeraciones

- `TipoCertificacion`: `BASICO` · `INTERMEDIO` · `AVANZADO` · `ESPECIALIDAD` · `CURSO` · `SEMINARIO` · `TALLER` · `ENTRENAMIENTO`

## Archivos

- `backend/src/shared/entities/certificacion.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-certificaciones|personal.certificaciones]]

## Referenciado por

- [[service--personal-foja-servicio|FojaServicioService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
