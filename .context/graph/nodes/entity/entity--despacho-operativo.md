---
id: entity--despacho-operativo
tipo: ENTITY
nombre: DisponibilidadPersonal
nivel: L1
dominio: servicios
resumen: Disponibilidad declarada de una persona (migracion 088). Una fila por usuario.
tabla: servicios.disponibilidad_personal
archivos:
  - backend/src/shared/entities/despacho-operativo.entity.ts
edges:
  - [belongs_to, domain--servicios]
  - [persisted_in, table--servicios-disponibilidad-personal]
terminos: [disponibilidad, personal, servicios, estado, disponible, llamado, base, camino, servicio, tipo, solicitud, chofer, rapida, abierta, cerrada, cancelada, entrega, enviada, conexion, fuera, horario, habilitado, destinatario, pendiente, acepto, puede, cancelo, llego]
---

# DisponibilidadPersonal

Disponibilidad declarada de una persona (migracion 088). Una fila por usuario.

- **Tabla:** [[table--servicios-disponibilidad-personal|servicios.disponibilidad_personal]]
- **Columnas mapeadas:** 58

## Estados y enumeraciones

- `EstadoPersonal`: `NO_DISPONIBLE` · `AL_LLAMADO` · `EN_BASE` · `EN_CAMINO` · `EN_SERVICIO`
- `TipoSolicitud`: `CHOFER` · `PERSONAL` · `RAPIDA`
- `EstadoSolicitud`: `ABIERTA` · `CERRADA` · `CANCELADA`
- `EntregaSolicitud`: `ENVIADA` · `SIN_CONEXION` · `NO_DISPONIBLE` · `FUERA_DE_HORARIO` · `EN_SERVICIO` · `NO_HABILITADO_CHOFER`
- `EstadoDestinatario`: `PENDIENTE` · `ACEPTO` · `NO_PUEDE` · `CANCELO` · `EN_CAMINO` · `LLEGO`

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/despacho-operativo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `persisted_in` → [[table--servicios-disponibilidad-personal|servicios.disponibilidad_personal]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
