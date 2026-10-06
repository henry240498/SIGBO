---
id: component--modulo-campo
tipo: COMPONENT
nombre: campo (modulo NestJS)
nivel: L1
dominio: servicios
resumen: Modulo NestJS que cablea controladores, servicios y repositorios de campo.
capa: backend
archivos:
  - backend/src/modules/campo/campo.module.ts
edges:
  - [belongs_to, domain--servicios]
terminos: [campo, modulo]
---

# campo (modulo NestJS)

Modulo NestJS que cablea controladores, servicios y repositorios de campo.


## Archivos

- `backend/src/modules/campo/campo.module.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[service--campo-adjuntos|AdjuntosService]] `uses` →
- [[service--campo-ausencias|AusenciasService]] `uses` →
- [[service--campo-victimas|VictimasService]] `uses` →
- [[decision--app-movil-offline-primero|La app móvil trabaja sin conexión y sincroniza después]] `constrains` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
