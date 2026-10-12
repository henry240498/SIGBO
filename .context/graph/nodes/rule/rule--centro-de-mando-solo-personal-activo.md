---
id: rule--centro-de-mando-solo-personal-activo
tipo: RULE
nombre: El Centro de mando solo lo ve el personal en un estado habilitado y cada uno ve sus emergencias
nivel: L1
dominio: servicios
resumen: "Con ficha de bombero, el estado debe estar en operations.commandCenterStates (por defecto ACTIVO); si no, GET /centro-mando no devuelve nada. Las emergencias en curso se filtran por participación salvo despacho:seguimiento o servicios:despachar."
severidad: ALTA
archivos:
  - backend/src/modules/centro-mando/centro-mando.service.ts
  - backend/src/modules/centro-mando/centro-mando.logica.ts
  - backend/src/modules/despacho/servicio-activo.service.ts
edges:
  - [belongs_to, domain--servicios]
terminos: [centro, mando, estado, activo, licencia, baja, emergencia, participacion, supervision, solo, personal, habilitado, cada, uno, sus, emergencias, ficha, bombero, debe, estar, operations, command, center, states, defecto, get, devuelve, nada, curso, filtran, salvo, despacho, seguimiento, servicios, despachar]
---

# El Centro de mando solo lo ve el personal en un estado habilitado y cada uno ve sus emergencias

Con ficha de bombero, el estado debe estar en operations.commandCenterStates (por defecto ACTIVO); si no, GET /centro-mando no devuelve nada. Las emergencias en curso se filtran por participación salvo despacho:seguimiento o servicios:despachar.

Estados del bombero (mig. 097): ACTIVO, SUSPENDIDO, LICENCIA, BAJA, FALLECIDO. Las cuentas sin ficha
de bombero se rigen por sus roles.


## Archivos

- `backend/src/modules/centro-mando/centro-mando.service.ts`
- `backend/src/modules/centro-mando/centro-mando.logica.ts`
- `backend/src/modules/despacho/servicio-activo.service.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]

---
<sub>Nodo **curado** (editable a mano).</sub>
