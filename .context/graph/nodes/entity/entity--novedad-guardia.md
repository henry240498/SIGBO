---
id: entity--novedad-guardia
tipo: ENTITY
nombre: NovedadGuardia
nivel: L1
dominio: asistencia
resumen: Entrada manual de la bitacora de una guardia (seccion 9). La bitacora completa que ve el usuario combina esto con lecturas de otras tablas (asistencia, servicios, prestamos, eventos...) sin duplicar datos -- ver BitacoraService en la Fase 4.
tabla: operaciones.novedades_guardia
archivos:
  - backend/src/shared/entities/novedad-guardia.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-novedades-guardia]
terminos: [novedad, guardia, novedades, operaciones]
---

# NovedadGuardia

Entrada manual de la bitacora de una guardia (seccion 9). La bitacora completa que ve el usuario combina esto con lecturas de otras tablas (asistencia, servicios, prestamos, eventos...) sin duplicar datos -- ver BitacoraService en la Fase 4.

- **Tabla:** [[table--operaciones-novedades-guardia|operaciones.novedades_guardia]]
- **Columnas mapeadas:** 4

## Archivos

- `backend/src/shared/entities/novedad-guardia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-novedades-guardia|operaciones.novedades_guardia]]

## Referenciado por

- [[service--guardias-novedades|NovedadesService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
