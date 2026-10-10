---
id: rule--centro-de-mando-solo-personal-activo
tipo: RULE
nombre: El Centro de mando solo lo ve el personal en un estado habilitado y cada uno ve sus emergencias
nivel: L1
resumen: Con ficha de bombero, el estado debe estar en operations.commandCenterStates (por defecto ACTIVO); si no, GET /centro-mando no devuelve nada. Las emergencias en curso se filtran por participación salvo despacho:seguimiento o servicios:despachar.
severidad: ALTA
dominio: servicios
archivos: [backend/src/modules/centro-mando/centro-mando.service.ts, backend/src/modules/centro-mando/centro-mando.logica.ts, backend/src/modules/despacho/servicio-activo.service.ts]
terminos: [centro, mando, estado, activo, licencia, baja, emergencia, participacion, supervision]
---

Estados del bombero (mig. 097): ACTIVO, SUSPENDIDO, LICENCIA, BAJA, FALLECIDO. Las cuentas sin ficha
de bombero se rigen por sus roles.
