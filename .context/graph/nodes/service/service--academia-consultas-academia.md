---
id: service--academia-consultas-academia
tipo: SERVICE
nombre: ConsultasAcademiaService
nivel: L2
dominio: academia
resumen: "Capa de consulta de SOLO LECTURA sobre el modelo de Academia -- preparada para que la futura IA institucional (Snoopy) la consuma sin necesidad de tocar entidades ni servicios internos (seccion 25 del pedido). Reglas que cualquier consumidor (incluida una IA) debe respetar: 1. Ningun metodo de este servicio escribe nada -- son consultas puras. 2. Los resultados reflejan exactamente lo que esta registrado en SIGBO; nunca se infiere ni se completa informacion faltante (ej. si un bombero no cargo su certificado, este servicio no asume que lo obtuvo solo porque participo de la actividad). 3. El filtrado por permisos del usuario que consulta queda a cargo del controller (RequirePermission de cada endpoint) -- este servicio no decide autorizacion por si mismo."
capa: backend
archivos:
  - backend/src/modules/academia/consultas-academia.service.ts
edges:
  - [belongs_to, domain--academia]
  - [uses, component--modulo-academia]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--actividad-academica]
  - [reads, table--academia-actividades]
  - [uses, entity--inscripcion-actividad-academica]
  - [reads, table--academia-inscripciones]
  - [uses, entity--certificacion]
  - [reads, table--personal-certificaciones]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
terminos: [consultas, academia, bombero, actividad, academica, inscripcion, certificacion, parametro]
---

# ConsultasAcademiaService

Capa de consulta de SOLO LECTURA sobre el modelo de Academia -- preparada para que la futura IA institucional (Snoopy) la consuma sin necesidad de tocar entidades ni servicios internos (seccion 25 del pedido). Reglas que cualquier consumidor (incluida una IA) debe respetar: 1. Ningun metodo de este servicio escribe nada -- son consultas puras. 2. Los resultados reflejan exactamente lo que esta registrado en SIGBO; nunca se infiere ni se completa informacion faltante (ej. si un bombero no cargo su certificado, este servicio no asume que lo obtuvo solo porque participo de la actividad). 3. El filtrado por permisos del usuario que consulta queda a cargo del controller (RequirePermission de cada endpoint) -- este servicio no decide autorizacion por si mismo.


## Metodos

`formacionCompletaDeBombero()` · `actividadesVigentes()` · `resumenInstitucional()`

## Archivos

- `backend/src/modules/academia/consultas-academia.service.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `uses` → [[component--modulo-academia|academia (modulo NestJS)]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--actividad-academica|ActividadAcademica]]
- `reads` → [[table--academia-actividades|academia.actividades]]
- `uses` → [[entity--inscripcion-actividad-academica|InscripcionActividadAcademica]]
- `reads` → [[table--academia-inscripciones|academia.inscripciones]]
- `uses` → [[entity--certificacion|Certificacion]]
- `reads` → [[table--personal-certificaciones|personal.certificaciones]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]

## Referenciado por

- [[api--academia-consultas-academia|ConsultasAcademiaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
