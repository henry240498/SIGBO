---
id: entity--llamado
tipo: ENTITY
nombre: Llamado
nivel: L1
dominio: servicios
resumen: "Llamada recibida por el radio operador (migracion 079). Solo registra el hecho: convertirlo en servicio y despachar es decision del mando."
tabla: servicios.llamados
archivos:
  - backend/src/shared/entities/llamado.entity.ts
edges:
  - [belongs_to, domain--servicios]
  - [persisted_in, table--servicios-llamados]
terminos: [llamado, llamados, servicios, estado, recibido, atencion, cerrado]
---

# Llamado

Llamada recibida por el radio operador (migracion 079). Solo registra el hecho: convertirlo en servicio y despachar es decision del mando.

- **Tabla:** [[table--servicios-llamados|servicios.llamados]]
- **Columnas mapeadas:** 15

## Estados y enumeraciones

- `EstadoLlamado`: `RECIBIDO` · `EN_ATENCION` · `CERRADO`

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/llamado.entity.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `persisted_in` → [[table--servicios-llamados|servicios.llamados]]

## Referenciado por

- [[rule--entrega-y-respuesta-son-ejes-distintos|En una solicitud, "se pudo enviar" y "qué respondió" son ejes distintos y no se mezclan]] `affects` →
- [[rule--hora-del-hecho-acotada|La hora que declara un dispositivo se acota antes de guardarse]] `affects` →
- [[rule--linea-de-tiempo-inmutable|La línea de tiempo de una solicitud solo se agrega: la base rechaza UPDATE y DELETE]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
