---
id: service--academia-certificaciones-academia
tipo: SERVICE
nombre: CertificacionesAcademiaService
nivel: L2
dominio: academia
resumen: Logica de negocio de certificaciones academia (modulo academia).
capa: backend
archivos:
  - backend/src/modules/academia/certificaciones-academia.service.ts
edges:
  - [belongs_to, domain--academia]
  - [uses, component--modulo-academia]
  - [uses, entity--certificacion]
  - [reads, table--personal-certificaciones]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--usuario]
  - [reads, table--seguridad-usuarios]
  - [uses, service--seguridad-auditoria]
  - [uses, service--documentos-documentos]
terminos: [certificaciones, academia, certificacion, bombero, usuario]
---

# CertificacionesAcademiaService

Logica de negocio de certificaciones academia (modulo academia).


## Metodos

`listarPorBombero()` · `findOne()` · `create()` · `update()` · `eliminar()`

## Archivos

- `backend/src/modules/academia/certificaciones-academia.service.ts`

## Relaciones

- `belongs_to` → [[domain--academia|Academia]]
- `uses` → [[component--modulo-academia|academia (modulo NestJS)]]
- `uses` → [[entity--certificacion|Certificacion]]
- `reads` → [[table--personal-certificaciones|personal.certificaciones]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--usuario|Usuario]]
- `reads` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]
- `uses` → [[service--documentos-documentos|DocumentosService]]

## Referenciado por

- [[api--academia-certificaciones-academia|CertificacionesAcademiaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
