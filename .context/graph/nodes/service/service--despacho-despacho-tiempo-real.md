---
id: service--despacho-despacho-tiempo-real
tipo: SERVICE
nombre: DespachoTiempoReal
nivel: L2
dominio: servicios
resumen: "Bus de eventos en memoria + presencia. Igual que el de alertas: sirve con UNA instancia del backend; con varias habria que reemplazar este unico punto por un broker. Presencia: una persona esta \"en linea\" si tiene un stream abierto o mostro actividad hace poco (ver estaEnLinea). Es lo que permite distinguir \"no recibio porque estaba desconectado\" de \"no recibio porque estaba en No disponible\"."
capa: backend
archivos:
  - backend/src/modules/despacho/despacho-tiempo-real.service.ts
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--modulo-despacho]
terminos: [despacho, tiempo, real]
---

# DespachoTiempoReal

Bus de eventos en memoria + presencia. Igual que el de alertas: sirve con UNA instancia del backend; con varias habria que reemplazar este unico punto por un broker. Presencia: una persona esta "en linea" si tiene un stream abierto o mostro actividad hace poco (ver estaEnLinea). Es lo que permite distinguir "no recibio porque estaba desconectado" de "no recibio porque estaba en No disponible".


## Metodos

`emitir()` · `flujoPara()` · `conectar()` · `desconectar()` · `latido()` · `conexionesAbiertas()` · `ultimaActividad()`

## Archivos

- `backend/src/modules/despacho/despacho-tiempo-real.service.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--modulo-despacho|despacho (modulo NestJS)]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
