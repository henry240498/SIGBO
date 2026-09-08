---
id: entity--prueba-comunicacion-servicio
tipo: ENTITY
nombre: PruebaComunicacionServicio
nivel: L1
dominio: servicios
resumen: "Prueba de comunicacion/radio registrada por el RO sobre el mapa (Seguimiento Geografico, seccion 8 del pedido). Tabla propia -- no un evento mas de HistorialServicio -- porque `nivel` y `distanciaMetros` necesitan ser columnas consultables por SQL para las estadisticas futuras de la seccion 25 (promedio de nivel, distancia de degradacion, etc.), no un valor mas adentro de un JSON."
tabla: servicios.pruebas_comunicacion
archivos:
  - backend/src/shared/entities/prueba-comunicacion-servicio.entity.ts
edges:
  - [belongs_to, domain--servicios]
  - [persisted_in, table--servicios-pruebas-comunicacion]
terminos: [prueba, comunicacion, servicio, pruebas, servicios]
---

# PruebaComunicacionServicio

Prueba de comunicacion/radio registrada por el RO sobre el mapa (Seguimiento Geografico, seccion 8 del pedido). Tabla propia -- no un evento mas de HistorialServicio -- porque `nivel` y `distanciaMetros` necesitan ser columnas consultables por SQL para las estadisticas futuras de la seccion 25 (promedio de nivel, distancia de degradacion, etc.), no un valor mas adentro de un JSON.

- **Tabla:** [[table--servicios-pruebas-comunicacion|servicios.pruebas_comunicacion]]
- **Columnas mapeadas:** 9

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** SeguimientoGeograficoController
- **Servicios:** SeguimientoGeograficoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/prueba-comunicacion-servicio.entity.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `persisted_in` → [[table--servicios-pruebas-comunicacion|servicios.pruebas_comunicacion]]

## Referenciado por

- [[service--servicios-seguimiento-geografico|SeguimientoGeograficoService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
