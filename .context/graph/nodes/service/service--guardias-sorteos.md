---
id: service--guardias-sorteos
tipo: SERVICE
nombre: SorteosService
nivel: L2
dominio: guardias
resumen: "Sorteo de personal para fechas especiales (seccion 20 del pedido: 8 de diciembre, Nochebuena, Navidad, vispera de Ano Nuevo, Ano Nuevo). Regla de candidatos, explicita del pedido: `estado='ACTIVO' AND realizaGuardiasEspeciales=true`. Se persisten TODOS los elegibles (seleccionados y no) para que quede trazabilidad completa de que el sorteo respeto ese criterio."
capa: backend
archivos:
  - backend/src/modules/guardias/sorteos.service.ts
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--modulo-guardias]
  - [uses, entity--sorteo-guardia]
  - [reads, table--operaciones-sorteos-guardia]
  - [uses, entity--sorteo-participante]
  - [reads, table--operaciones-sorteo-participantes]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--esquema-horario-guardia]
  - [reads, table--operaciones-esquemas-horario-guardia]
  - [uses, service--seguridad-auditoria]
  - [uses, service--guardias-guardias]
terminos: [sorteos, guardias, sorteo, guardia, participante, bombero, esquema, horario]
---

# SorteosService

Sorteo de personal para fechas especiales (seccion 20 del pedido: 8 de diciembre, Nochebuena, Navidad, vispera de Ano Nuevo, Ano Nuevo). Regla de candidatos, explicita del pedido: `estado='ACTIVO' AND realizaGuardiasEspeciales=true`. Se persisten TODOS los elegibles (seleccionados y no) para que quede trazabilidad completa de que el sorteo respeto ese criterio.


## Metodos

`findAll()` · `findOne()` · `listarParticipantes()` · `detalle()` · `generar()` · `crearGuardiaDesdeSorteo()`

## Archivos

- `backend/src/modules/guardias/sorteos.service.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--modulo-guardias|guardias (modulo NestJS)]]
- `uses` → [[entity--sorteo-guardia|SorteoGuardia]]
- `reads` → [[table--operaciones-sorteos-guardia|operaciones.sorteos_guardia]]
- `uses` → [[entity--sorteo-participante|SorteoParticipante]]
- `reads` → [[table--operaciones-sorteo-participantes|operaciones.sorteo_participantes]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--esquema-horario-guardia|EsquemaHorarioGuardia]]
- `reads` → [[table--operaciones-esquemas-horario-guardia|operaciones.esquemas_horario_guardia]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]
- `uses` → [[service--guardias-guardias|GuardiasService]]

## Referenciado por

- [[api--guardias-sorteos|SorteosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
