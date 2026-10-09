---
id: service--incidente-nucleo-motor-fases
tipo: SERVICE
nombre: MotorFases
nivel: L2
dominio: servicios
resumen: "Aplica las transiciones de fase del incidente. Siempre dentro de la transaccion del llamador: bloquea la fila del servicio y escribe fase, fase_desde y el estado heredado derivado. Usa solo update() para no pisar columnas que el llamador haya cambiado en la misma transaccion."
capa: backend
archivos:
  - backend/src/modules/incidente-nucleo/motor-fases.service.ts
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--modulo-incidente-nucleo]
terminos: [motor, fases, incidente, nucleo]
---

# MotorFases

Aplica las transiciones de fase del incidente. Siempre dentro de la transaccion del llamador: bloquea la fila del servicio y escribe fase, fase_desde y el estado heredado derivado. Usa solo update() para no pisar columnas que el llamador haya cambiado en la misma transaccion.


## Metodos

`bloquear()` · `despachosActivos()` · `validarCierre()` · `alHecho()` · `fijar()`

## Archivos

- `backend/src/modules/incidente-nucleo/motor-fases.service.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--modulo-incidente-nucleo|incidente-nucleo (modulo NestJS)]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
