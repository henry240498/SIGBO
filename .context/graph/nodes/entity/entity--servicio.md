---
id: entity--servicio
tipo: ENTITY
nombre: Servicio
nivel: L1
dominio: servicios
resumen: Registro de cada servicio/intervencion (schema servicios).
tabla: servicios.servicios
archivos:
  - backend/src/shared/entities/servicio.entity.ts
edges:
  - [belongs_to, domain--servicios]
  - [persisted_in, table--servicios-servicios]
terminos: [servicio, servicios, gravedad, leve, moderada, grave, critica, estado, registrado, despachado, curso, finalizado, cancelado]
---

# Servicio

Registro de cada servicio/intervencion (schema servicios).

- **Tabla:** [[table--servicios-servicios|servicios.servicios]]
- **Columnas mapeadas:** 27

## Estados y enumeraciones

- `GravedadServicio`: `LEVE` · `MODERADA` · `GRAVE` · `CRITICA`
- `EstadoServicio`: `REGISTRADO` · `DESPACHADO` · `EN_CURSO` · `FINALIZADO` · `CANCELADO`

## Archivos

- `backend/src/shared/entities/servicio.entity.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `persisted_in` → [[table--servicios-servicios|servicios.servicios]]

## Referenciado por

- [[service--personal-consultas-cruzadas|ConsultasCruzadasService]] `uses` →
- [[service--publicaciones-publicaciones|PublicacionesService]] `uses` →
- [[service--servicios-servicios|ServiciosService]] `uses` →
- [[service--vehiculos-vehiculos|VehiculosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
