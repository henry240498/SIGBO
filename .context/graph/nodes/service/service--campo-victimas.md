---
id: service--campo-victimas
tipo: SERVICE
nombre: VictimasService
nivel: L2
dominio: servicios
resumen: Solo registra el hecho (cuantas personas, en que categoria). No es un diagnostico ni una ficha medica.
capa: backend
archivos:
  - backend/src/modules/campo/victimas.service.ts
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--modulo-campo]
  - [uses, service--seguridad-auditoria]
terminos: [victimas, campo]
---

# VictimasService

Solo registra el hecho (cuantas personas, en que categoria). No es un diagnostico ni una ficha medica.


## Metodos

`for()` · `registrar()` · `deServicio()`

## Archivos

- `backend/src/modules/campo/victimas.service.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--modulo-campo|campo (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--campo-campo|CampoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
