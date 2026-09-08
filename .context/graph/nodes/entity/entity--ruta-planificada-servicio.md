---
id: entity--ruta-planificada-servicio
tipo: ENTITY
nombre: RutaPlanificadaServicio
nivel: L1
dominio: servicios
resumen: "Ruta que el RO dibuja sobre el mapa desde la WEB antes o durante el servicio (Seguimiento Geografico, seccion 5 del pedido). Una por servicio -- redefinirla reemplaza `puntos` entero, con auditoria de antes/despues. Independiente a proposito de la \"ruta realizada\" (HistorialServicio con tipoEvento 'GPS'): nunca se mezclan."
tabla: servicios.rutas_planificadas
archivos:
  - backend/src/shared/entities/ruta-planificada-servicio.entity.ts
edges:
  - [belongs_to, domain--servicios]
  - [persisted_in, table--servicios-rutas-planificadas]
terminos: [ruta, planificada, servicio, rutas, planificadas, servicios]
---

# RutaPlanificadaServicio

Ruta que el RO dibuja sobre el mapa desde la WEB antes o durante el servicio (Seguimiento Geografico, seccion 5 del pedido). Una por servicio -- redefinirla reemplaza `puntos` entero, con auditoria de antes/despues. Independiente a proposito de la "ruta realizada" (HistorialServicio con tipoEvento 'GPS'): nunca se mezclan.

- **Tabla:** [[table--servicios-rutas-planificadas|servicios.rutas_planificadas]]
- **Columnas mapeadas:** 6

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** SeguimientoGeograficoController
- **Servicios:** SeguimientoGeograficoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/ruta-planificada-servicio.entity.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `persisted_in` → [[table--servicios-rutas-planificadas|servicios.rutas_planificadas]]

## Referenciado por

- [[service--servicios-seguimiento-geografico|SeguimientoGeograficoService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
