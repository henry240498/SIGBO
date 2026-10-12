---
id: service--gre-matpel-consulta
tipo: SERVICE
nombre: MatpelConsultaService
nivel: L2
dominio: matpel
resumen: Logica de negocio de matpel consulta (modulo gre).
capa: backend
archivos:
  - backend/src/modules/gre/matpel-consulta.service.ts
edges:
  - [belongs_to, domain--matpel]
  - [uses, component--modulo-gre]
  - [uses, service--gre-gre-catalogo]
  - [uses, service--gre-gre-fuentes]
  - [uses, service--gre-motor-matpel]
terminos: [matpel, consulta, gre]
---

# MatpelConsultaService

Logica de negocio de matpel consulta (modulo gre).


## Metodos

`estado()` · `version()` · `buscar()` · `leer()` · `fuentesPorCampo()` · `material()` · `guia()` · `secciones()` · `tabla()` · `fuente()` · `archivo()` · `paquete()` · `partes()`

## Archivos

- `backend/src/modules/gre/matpel-consulta.service.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|MATPEL]]
- `uses` → [[component--modulo-gre|gre (modulo NestJS)]]
- `uses` → [[service--gre-gre-catalogo|GreCatalogoService]]
- `uses` → [[service--gre-gre-fuentes|GreFuentesService]]
- `uses` → [[service--gre-motor-matpel|MotorMatpelService]]

## Referenciado por

- [[api--gre-matpel-consulta|MatpelConsultaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
