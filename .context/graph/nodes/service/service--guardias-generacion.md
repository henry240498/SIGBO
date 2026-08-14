---
id: service--guardias-generacion
tipo: SERVICE
nombre: GeneracionService
nivel: L2
dominio: guardias
resumen: "Motor de generacion automatica de la planificacion de guardias (Fase B del pedido). Es explicitamente un ASISTENTE heuristico, no un optimizador exacto (secciones 13/54): prioriza por reglas simples y deterministas (rotacion vencida, cantidad de guardias ya realizadas, dia preferente) y deja advertencias en vez de fallar toda la corrida cuando no encuentra un candidato para un rol puntual. Cada guardia generada queda inmediatamente editable/anulable con las herramientas manuales ya existentes -- nunca es un estado \"borrador\" especial que bloquee al responsable."
capa: backend
archivos:
  - backend/src/modules/guardias/generacion.service.ts
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--modulo-guardias]
  - [uses, entity--guardia]
  - [reads, table--operaciones-guardias]
  - [uses, entity--asignacion-guardia]
  - [reads, table--operaciones-asignacion-guardias]
  - [uses, entity--esquema-horario-guardia]
  - [reads, table--operaciones-esquemas-horario-guardia]
  - [uses, entity--feriado]
  - [reads, table--organizacion-feriados]
  - [uses, entity--grupo-guardia]
  - [reads, table--operaciones-grupos-guardia]
  - [uses, entity--grupo-guardia-miembro]
  - [reads, table--operaciones-grupos-guardia-miembros]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--rango]
  - [reads, table--organizacion-rangos]
  - [uses, service--seguridad-auditoria]
  - [uses, service--guardias-elegibilidad]
  - [uses, service--guardias-guardias]
terminos: [generacion, guardias, guardia, asignacion, esquema, horario, feriado, grupo, miembro, bombero, rango]
---

# GeneracionService

Motor de generacion automatica de la planificacion de guardias (Fase B del pedido). Es explicitamente un ASISTENTE heuristico, no un optimizador exacto (secciones 13/54): prioriza por reglas simples y deterministas (rotacion vencida, cantidad de guardias ya realizadas, dia preferente) y deja advertencias en vez de fallar toda la corrida cuando no encuentra un candidato para un rol puntual. Cada guardia generada queda inmediatamente editable/anulable con las herramientas manuales ya existentes -- nunca es un estado "borrador" especial que bloquee al responsable.


## Metodos

`while()` · `if()` · `generar()`

## Archivos

- `backend/src/modules/guardias/generacion.service.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--modulo-guardias|guardias (modulo NestJS)]]
- `uses` → [[entity--guardia|Guardia]]
- `reads` → [[table--operaciones-guardias|operaciones.guardias]]
- `uses` → [[entity--asignacion-guardia|AsignacionGuardia]]
- `reads` → [[table--operaciones-asignacion-guardias|operaciones.asignacion_guardias]]
- `uses` → [[entity--esquema-horario-guardia|EsquemaHorarioGuardia]]
- `reads` → [[table--operaciones-esquemas-horario-guardia|operaciones.esquemas_horario_guardia]]
- `uses` → [[entity--feriado|Feriado]]
- `reads` → [[table--organizacion-feriados|organizacion.feriados]]
- `uses` → [[entity--grupo-guardia|GrupoGuardia]]
- `reads` → [[table--operaciones-grupos-guardia|operaciones.grupos_guardia]]
- `uses` → [[entity--grupo-guardia-miembro|GrupoGuardiaMiembro]]
- `reads` → [[table--operaciones-grupos-guardia-miembros|operaciones.grupos_guardia_miembros]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--rango|Rango]]
- `reads` → [[table--organizacion-rangos|organizacion.rangos]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]
- `uses` → [[service--guardias-elegibilidad|ElegibilidadService]]
- `uses` → [[service--guardias-guardias|GuardiasService]]

## Referenciado por

- [[api--guardias-guardias|GuardiasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
