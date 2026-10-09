---
id: service--gre-gre-activacion
tipo: SERVICE
nombre: GreActivacionService
nivel: L2
dominio: matpel
resumen: "Puntero de edición activa por idioma. Activar o recuperar una versión anterior es un acto humano con fundamento: exige versión VALIDADA, la revisión esperada del puntero y una clave idempotente. El historial es inmutable (triggers de 094)."
capa: backend
archivos:
  - backend/src/modules/gre/gre-activacion.service.ts
edges:
  - [belongs_to, domain--matpel]
  - [uses, component--modulo-gre]
  - [uses, service--seguridad-auditoria]
terminos: [gre, activacion]
---

# GreActivacionService

Puntero de edición activa por idioma. Activar o recuperar una versión anterior es un acto humano con fundamento: exige versión VALIDADA, la revisión esperada del puntero y una clave idempotente. El historial es inmutable (triggers de 094).


## Metodos

`estado()` · `activar()`

## Archivos

- `backend/src/modules/gre/gre-activacion.service.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `uses` → [[component--modulo-gre|gre (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--gre-gre-admin|GreAdminController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
