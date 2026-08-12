---
id: component--modulo-configuracion
tipo: COMPONENT
nombre: configuracion (modulo NestJS)
nivel: L1
dominio: seguridad
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de configuracion.
capa: backend
archivos:
  - backend/src/modules/configuracion/configuracion.module.ts
edges:
  - [belongs_to, domain--seguridad]
terminos: [configuracion, modulo]
---

# configuracion (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de configuracion.


## Entidades registradas (forFeature)

ConfiguracionValor, ConfiguracionVersion

## Archivos

- `backend/src/modules/configuracion/configuracion.module.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[service--configuracion-configuracion|ConfiguracionService]] `uses` →
- [[rule--migracion-nunca-se-edita|Una migracion ya aplicada nunca se edita, se agrega otra]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
