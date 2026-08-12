---
id: component--modulo-guardias
tipo: COMPONENT
nombre: guardias (modulo NestJS)
nivel: L1
dominio: guardias
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de guardias.
capa: backend
archivos:
  - backend/src/modules/guardias/guardias.module.ts
edges:
  - [belongs_to, domain--guardias]
terminos: [guardias, modulo]
---

# guardias (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de guardias.


## Entidades registradas (forFeature)

Guardia, AsignacionGuardia, CambioGuardia, GrupoGuardia, GrupoGuardiaMiembro, Pernocte, InspeccionEstacion, NovedadGuardia, RequisitoRolGuardia, Bombero, MarcacionAsistencia, Parametro, VehiculoAutorizado

## Archivos

- `backend/src/modules/guardias/guardias.module.ts`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]

## Referenciado por

- [[service--guardias-elegibilidad|ElegibilidadService]] `uses` →
- [[service--guardias-grupos-guardia|GruposGuardiaService]] `uses` →
- [[service--guardias-guardias|GuardiasService]] `uses` →
- [[service--guardias-inspecciones-estacion|InspeccionesEstacionService]] `uses` →
- [[service--guardias-novedades|NovedadesService]] `uses` →
- [[service--guardias-pernoctes|PernoctesService]] `uses` →
- [[service--guardias-requisitos-rol|RequisitosRolService]] `uses` →
- [[rule--guardias-vive-en-operaciones|Guardias es un modulo propio cuyas tablas viven en el esquema operaciones]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
